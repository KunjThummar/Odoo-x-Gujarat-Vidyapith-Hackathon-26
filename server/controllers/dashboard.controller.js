const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboard = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    const [vehicles, allTrips, drivers, allFuel, allExpenses, allMaintenance] = await Promise.all([
      prisma.vehicle.findMany(),
      prisma.trip.findMany({
        include: {
          vehicle: { select: { id: true, vehicleName: true, licensePlate: true } },
          driver: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findMany({ where: { role: 'DRIVER' } }),
      prisma.fuelLog.findMany(),
      prisma.expense.findMany(),
      prisma.maintenanceLog.findMany(),
    ]);

    const currentYear = new Date().getFullYear();
    const fuelLogs = allFuel.filter(f => new Date(f.date).getFullYear() === currentYear);
    const expenses = allExpenses.filter(e => new Date(e.date).getFullYear() === currentYear);
    const maintenanceLogs = allMaintenance.filter(l => new Date(l.date).getFullYear() === currentYear);

    const yearFuel = fuelLogs.reduce((sum, l) => sum + l.totalCost, 0) +
      expenses.filter(e => e.category === 'Fuel').reduce((sum, e) => sum + e.amount, 0);

    const yearMaintenance = maintenanceLogs.reduce((sum, l) => sum + l.cost, 0) +
      expenses.filter(e => e.category === 'Maintenance').reduce((sum, e) => sum + e.amount, 0);

    const yearOther = expenses.filter(e => !['Fuel', 'Maintenance'].includes(e.category)).reduce((sum, e) => sum + e.amount, 0);

    const kpis = {
      activeFleet: vehicles.filter(v => v.status !== 'IN_SHOP').length,
      inMaintenance: vehicles.filter(v => v.status === 'IN_SHOP').length,
      utilizationRate: vehicles.length
        ? Math.round((vehicles.filter(v => v.status === 'IN_USE').length / vehicles.length) * 100)
        : 0,
      pendingShipments: allTrips.filter(t => ['DRAFT', 'DISPATCHED'].includes(t.status)).length,
      operationalCost: yearFuel + yearMaintenance + yearOther,
      totalDrivers: drivers.length,
      totalVehicles: vehicles.length,
    };

    // Recent trips (take 10)
    let recentTrips = allTrips;
    if (role === 'DRIVER') {
      recentTrips = allTrips.filter(t => t.driverId === userId || t.driverId === null);
    }

    res.json({ kpis, recentTrips: recentTrips.slice(0, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
