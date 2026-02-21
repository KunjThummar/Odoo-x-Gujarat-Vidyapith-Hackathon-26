const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Fuel Logs
exports.getAllFuel = async (req, res) => {
  try {
    const logs = await prisma.fuelLog.findMany({
      include: {
        vehicle: { select: { id: true, vehicleName: true, licensePlate: true } },
        driver: { select: { id: true, fullName: true } },
      },
      orderBy: { date: 'desc' },
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createFuel = async (req, res) => {
  try {
    const { vehicleId, driverId, liters, costPerLiter, odometer, date } = req.body;
    if (!vehicleId || !liters || !costPerLiter) {
      return res.status(400).json({ message: 'Vehicle, liters, and cost per liter required' });
    }
    const totalCost = parseFloat(liters) * parseFloat(costPerLiter);
    const log = await prisma.fuelLog.create({
      data: {
        vehicleId: parseInt(vehicleId),
        driverId: driverId ? parseInt(driverId) : null,
        liters: parseFloat(liters),
        costPerLiter: parseFloat(costPerLiter),
        totalCost,
        odometer: parseFloat(odometer || 0),
        date: date ? new Date(date) : new Date(),
      },
      include: { vehicle: true },
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const [expenses, fuelLogs] = await Promise.all([
      prisma.expense.findMany({
        include: {
          trip: { select: { id: true, origin: true, destination: true } },
          createdBy: { select: { id: true, fullName: true } },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.fuelLog.findMany({
        include: {
          vehicle: { select: { id: true, vehicleName: true } },
          driver: { select: { id: true, fullName: true } },
        },
        orderBy: { date: 'desc' },
      })
    ]);

    // Map fuel logs to expense format with pseudo-IDs
    const fuelAsExpenses = fuelLogs.map(f => ({
      ...f,
      id: `fuel-${f.id}`,
      category: 'Fuel',
      amount: f.totalCost,
      description: `Fuel fill: ${f.liters}L for ${f.vehicle?.vehicleName || 'Vehicle'}`,
      isFuelLog: true,
      trip: null, // Fuel logs aren't directly linked to trips in schema yet
    }));

    const combined = [...expenses, ...fuelAsExpenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(combined);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { tripId, category, amount, description, date } = req.body;
    if (!category || !amount) return res.status(400).json({ message: 'Category and amount required' });

    const expense = await prisma.expense.create({
      data: {
        tripId: tripId ? parseInt(tripId) : null,
        category,
        amount: parseFloat(amount),
        description,
        date: date ? new Date(date) : new Date(),
        createdById: req.user.id,
      },
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    await prisma.expense.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { tripId, category, amount, description, date } = req.body;
    const expense = await prisma.expense.update({
      where: { id: parseInt(req.params.id) },
      data: {
        tripId: tripId ? parseInt(tripId) : null,
        category,
        amount: parseFloat(amount),
        description,
        date: date ? new Date(date) : new Date(),
      },
    });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Fuel Log Updates
exports.updateFuel = async (req, res) => {
  try {
    const { vehicleId, driverId, liters, costPerLiter, odometer, date } = req.body;
    const totalCost = parseFloat(liters) * parseFloat(costPerLiter);
    const log = await prisma.fuelLog.update({
      where: { id: parseInt(req.params.id) },
      data: {
        vehicleId: parseInt(vehicleId),
        driverId: driverId ? parseInt(driverId) : null,
        liters: parseFloat(liters),
        costPerLiter: parseFloat(costPerLiter),
        totalCost,
        odometer: parseFloat(odometer || 0),
        date: date ? new Date(date) : new Date(),
      }
    });
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteFuel = async (req, res) => {
  try {
    await prisma.fuelLog.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Fuel log deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
