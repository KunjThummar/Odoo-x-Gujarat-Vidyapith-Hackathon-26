const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const { search } = req.query;
    let trips;

    const where = {};
    if (role === 'DRIVER') {
      where.OR = [{ driverId: userId }, { status: 'DRAFT', driverId: null }];
    }

    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { tripType: { contains: search, mode: 'insensitive' } },
            { origin: { contains: search, mode: 'insensitive' } },
            { destination: { contains: search, mode: 'insensitive' } },
            { status: { contains: search, mode: 'insensitive' } },
            { vehicle: { vehicleName: { contains: search, mode: 'insensitive' } } },
            { vehicle: { licensePlate: { contains: search, mode: 'insensitive' } } },
            { driver: { fullName: { contains: search, mode: 'insensitive' } } },
          ]
        }
      ];
    }

    const [tripsRaw, fuelLogs, maintenanceLogs] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: {
          vehicle: true,
          driver: { select: { id: true, fullName: true, phone: true } },
          createdBy: { select: { id: true, fullName: true } },
          expenses: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.fuelLog.findMany(),
      prisma.maintenanceLog.findMany()
    ]);

    trips = tripsRaw.map(t => {
      const tripExpenses = t.expenses.reduce((sum, e) => sum + e.amount, 0);
      let tripFuel = 0;
      let tripMaintenance = 0;

      if (t.vehicleId && t.startedAt) {
        const start = new Date(t.startedAt);
        const end = t.completedAt ? new Date(t.completedAt) : new Date();

        tripFuel = fuelLogs
          .filter(f => f.vehicleId === t.vehicleId && new Date(f.date) >= start && new Date(f.date) <= end)
          .reduce((sum, f) => sum + f.totalCost, 0);

        tripMaintenance = maintenanceLogs
          .filter(m => m.vehicleId === t.vehicleId && new Date(m.date) >= start && new Date(m.date) <= end)
          .reduce((sum, m) => sum + m.cost, 0);
      }
      return {
        ...t,
        totalExpense: tripExpenses + tripFuel + tripMaintenance
      };
    });

    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const [trip, fuelLogs, maintenanceLogs] = await Promise.all([
      prisma.trip.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          vehicle: true,
          driver: { select: { id: true, fullName: true } },
          createdBy: { select: { id: true, fullName: true } },
          expenses: true
        },
      }),
      prisma.fuelLog.findMany(),
      prisma.maintenanceLog.findMany()
    ]);

    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const tripExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
    let tripFuel = 0;
    let tripMaintenance = 0;

    if (trip.vehicleId && trip.startedAt) {
      const start = new Date(trip.startedAt);
      const end = trip.completedAt ? new Date(trip.completedAt) : new Date();

      tripFuel = fuelLogs
        .filter(f => f.vehicleId === trip.vehicleId && new Date(f.date) >= start && new Date(f.date) <= end)
        .reduce((sum, f) => sum + f.totalCost, 0);

      tripMaintenance = maintenanceLogs
        .filter(m => m.vehicleId === trip.vehicleId && new Date(m.date) >= start && new Date(m.date) <= end)
        .reduce((sum, m) => sum + m.cost, 0);
    }

    res.json({ ...trip, totalExpense: tripExpenses + tripFuel + tripMaintenance });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { tripType, origin, destination, cargoWeight, vehicleId, driverId, estimatedFuel } = req.body;

    if (!origin || !destination || !cargoWeight) {
      return res.status(400).json({ message: 'Origin, destination, and cargo weight required' });
    }

    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: parseInt(vehicleId) } });
      if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
      if (parseFloat(cargoWeight) > vehicle.maxLoadCapacity) {
        return res.status(400).json({
          message: `Cargo weight (${cargoWeight} kg) exceeds vehicle max load capacity (${vehicle.maxLoadCapacity} kg)`,
        });
      }
    }

    const trip = await prisma.trip.create({
      data: {
        tripType: tripType || 'Delivery',
        origin,
        destination,
        cargoWeight: parseFloat(cargoWeight),
        estimatedFuel: estimatedFuel ? parseFloat(estimatedFuel) : null,
        vehicleId: vehicleId ? parseInt(vehicleId) : null,
        driverId: driverId ? parseInt(driverId) : null,
        createdById: req.user.id,
        status: driverId && vehicleId ? 'DISPATCHED' : 'DRAFT',
      },
      include: { vehicle: true, driver: { select: { id: true, fullName: true } } },
    });

    // Update vehicle status to IN_USE
    if (vehicleId) {
      await prisma.vehicle.update({ where: { id: parseInt(vehicleId) }, data: { status: 'IN_USE' } });
    }

    res.status(201).json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const tripId = parseInt(req.params.id);
    const { role, id: userId } = req.user;
    const { status, vehicleId, driverId, origin, destination, cargoWeight, estimatedFuel, tripType } = req.body;

    const trip = await prisma.trip.findUnique({ where: { id: tripId }, include: { vehicle: true } });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    let updateData = {};

    if (role === 'DRIVER') {
      // Driver can only accept, start, or complete
      if (status === 'IN_PROGRESS') {
        if (trip.driverId !== userId && trip.driverId !== null) {
          return res.status(403).json({ message: 'Not your trip' });
        }
        updateData = { status: 'IN_PROGRESS', driverId: userId, startedAt: new Date() };
        if (trip.vehicleId) {
          await prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'IN_USE' } });
        }
      } else if (status === 'COMPLETED') {
        if (trip.driverId !== userId) return res.status(403).json({ message: 'Not your trip' });
        updateData = { status: 'COMPLETED', completedAt: new Date() };
        if (trip.vehicleId) {
          await prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'AVAILABLE' } });
        }
        // Update driver stats
        await prisma.driver.updateMany({
          where: { userId },
          data: { totalTrips: { increment: 1 } },
        });
      }
    } else {
      // Manager/Dispatcher can update all fields
      if (vehicleId) {
        const vehicle = await prisma.vehicle.findUnique({ where: { id: parseInt(vehicleId) } });
        const weight = cargoWeight || trip.cargoWeight;
        if (parseFloat(weight) > vehicle.maxLoadCapacity) {
          return res.status(400).json({ message: `Cargo exceeds vehicle capacity (${vehicle.maxLoadCapacity} kg)` });
        }
      }

      updateData = {
        ...(status && { status }),
        ...(vehicleId !== undefined && { vehicleId: vehicleId ? parseInt(vehicleId) : null }),
        ...(driverId !== undefined && { driverId: driverId ? parseInt(driverId) : null }),
        ...(origin && { origin }),
        ...(destination && { destination }),
        ...(cargoWeight && { cargoWeight: parseFloat(cargoWeight) }),
        ...(estimatedFuel && { estimatedFuel: parseFloat(estimatedFuel) }),
        ...(tripType && { tripType }),
      };

      if (status === 'DISPATCHED' && vehicleId) {
        await prisma.vehicle.update({ where: { id: parseInt(vehicleId) }, data: { status: 'IN_USE' } });
      }
    }

    const updated = await prisma.trip.update({
      where: { id: tripId },
      data: updateData,
      include: { vehicle: true, driver: { select: { id: true, fullName: true } } },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    await prisma.trip.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
