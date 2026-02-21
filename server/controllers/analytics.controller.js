const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAnalytics = async (req, res) => {
  try {
    const [vehicles, trips, fuelLogs, expenses, drivers, maintenanceLogs] = await Promise.all([
      prisma.vehicle.findMany(),
      prisma.trip.findMany({ include: { vehicle: true } }),
      prisma.fuelLog.findMany({ include: { vehicle: true } }),
      prisma.expense.findMany({ include: { trip: true } }), // Include trip to link expenses to vehicles
      prisma.user.findMany({ where: { role: 'DRIVER' }, include: { driver: true } }),
      prisma.maintenanceLog.findMany({ include: { vehicle: true } }), // Include vehicle for maintenance logs
    ]);

    const currentYear = new Date().getFullYear();

    // Grouping Categorization logic (not directly used in final output but good for clarity)
    const getFuelCost = (f) => f.totalCost || 0;
    const getMaintenanceCost = (m) => m.cost || 0;
    const getExpenseAmount = (e) => e.amount || 0;

    // Fuel per vehicle calculation (Current Year)
    const vehicleCosts = {};
    vehicles.forEach(v => {
      vehicleCosts[v.id] = { name: v.vehicleName, fuel: 0, maintenance: 0, other: 0, total: 0 };
    });

    fuelLogs.forEach(l => {
      if (new Date(l.date).getFullYear() === currentYear) {
        if (vehicleCosts[l.vehicleId]) {
          vehicleCosts[l.vehicleId].fuel += l.totalCost;
          vehicleCosts[l.vehicleId].total += l.totalCost;
        }
      }
    });

    maintenanceLogs.forEach(l => {
      if (new Date(l.date).getFullYear() === currentYear) {
        if (vehicleCosts[l.vehicleId]) {
          vehicleCosts[l.vehicleId].maintenance += l.cost;
          vehicleCosts[l.vehicleId].total += l.cost;
        }
      }
    });

    expenses.forEach(e => {
      if (new Date(e.date).getFullYear() === currentYear) {
        const vId = e.trip?.vehicleId; // Link expense to vehicle via trip
        if (vId && vehicleCosts[vId]) {
          if (e.category === 'Fuel') vehicleCosts[vId].fuel += e.amount;
          else if (e.category === 'Maintenance') vehicleCosts[vId].maintenance += e.amount;
          else vehicleCosts[vId].other += e.amount;
          vehicleCosts[vId].total += e.amount;
        } else if (!vId) { // Expenses not linked to a specific vehicle (e.g., general office expenses)
          // For now, these are not added to vehicle-specific costs, but will be included in monthly totals
          // If needed, could add a 'general' category or distribute
        }
      }
    });

    const fuelEfficiency = Object.values(vehicleCosts)
      .filter(v => v.total > 0)
      .map(v => ({
        vehicle: v.name,
        cost: v.fuel, // The chart expects 'cost' as fuel cost
        totalCost: v.total
      }))
      .sort((a, b) => b.totalCost - a.totalCost);

    // Monthly summary calculation
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let yearFuel = 0;
    let yearMaintenance = 0;
    let yearOther = 0;
    let yearRevenue = 0;

    const monthlySummary = months.map((month, index) => {
      const mExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === index && d.getFullYear() === currentYear;
      });
      const mFuelLogs = fuelLogs.filter(f => {
        const d = new Date(f.date);
        return d.getMonth() === index && d.getFullYear() === currentYear;
      });
      const mMaintenanceLogs = maintenanceLogs.filter(l => {
        const d = new Date(l.date);
        return d.getMonth() === index && d.getFullYear() === currentYear;
      });
      const mTrips = trips.filter(t => {
        const d = new Date(t.createdAt);
        return d.getMonth() === index && d.getFullYear() === currentYear && t.status === 'COMPLETED';
      });

      const revenue = mTrips.reduce((sum, t) => sum + (t.cargoWeight * 10), 0);
      const fuelTotal = mFuelLogs.reduce((s, f) => s + f.totalCost, 0) +
        mExpenses.filter(e => e.category === 'Fuel').reduce((s, e) => s + e.amount, 0);
      const maintenanceTotal = mMaintenanceLogs.reduce((s, l) => s + l.cost, 0) +
        mExpenses.filter(e => e.category === 'Maintenance').reduce((s, e) => s + e.amount, 0);
      const otherTotal = mExpenses.filter(e => !['Fuel', 'Maintenance'].includes(e.category)).reduce((s, e) => s + e.amount, 0);

      yearFuel += fuelTotal;
      yearMaintenance += maintenanceTotal;
      yearOther += otherTotal;
      yearRevenue += revenue;

      return {
        month,
        revenue,
        fuelCost: fuelTotal,
        maintenance: maintenanceTotal,
        otherExpenses: otherTotal,
        netProfit: revenue - fuelTotal - maintenanceTotal - otherTotal
      };
    });

    const utilizationRate = vehicles.length
      ? Math.round((vehicles.filter(v => v.status === 'IN_USE').length / vehicles.length) * 100)
      : 0;

    res.json({
      summary: {
        totalVehicles: vehicles.length,
        activeVehicles: vehicles.filter(v => v.status === 'IN_USE').length,
        inShop: vehicles.filter(v => v.status === 'IN_SHOP').length,
        totalDrivers: drivers.length,
        totalTrips: trips.filter(t => new Date(t.createdAt).getFullYear() === currentYear).length,
        completedTrips: trips.filter(t => t.status === 'COMPLETED' && new Date(t.createdAt).getFullYear() === currentYear).length,
        totalFuelCost: yearFuel,
        totalMaintenanceCost: yearMaintenance,
        totalOtherExpenses: yearOther,
        operationalCost: yearFuel + yearMaintenance + yearOther,
        totalRevenue: yearRevenue,
        netProfit: yearRevenue - (yearFuel + yearMaintenance + yearOther),
        totalLiters: fuelLogs.filter(f => new Date(f.date).getFullYear() === currentYear).reduce((sum, l) => sum + l.liters, 0),
        utilizationRate,
      },
      fuelEfficiency,
      monthlySummary,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
