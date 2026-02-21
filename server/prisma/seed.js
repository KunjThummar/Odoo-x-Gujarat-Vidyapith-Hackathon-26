const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding FleetFlow database...');

  // Create Fleet Manager
  const managerPwd = await bcrypt.hash('Fleet@123', 12);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@fleetflow.com' },
    update: {},
    create: { fullName: 'Alex Johnson', email: 'manager@fleetflow.com', password: managerPwd, role: 'FLEET_MANAGER' },
  });

  // Create Dispatcher
  const dispatcherPwd = await bcrypt.hash('Fleet@123', 12);
  const dispatcher = await prisma.user.upsert({
    where: { email: 'dispatcher@fleetflow.com' },
    update: {},
    create: { fullName: 'Maria Garcia', email: 'dispatcher@fleetflow.com', password: dispatcherPwd, role: 'DISPATCHER' },
  });

  // Create Safety Officer
  const safetyPwd = await bcrypt.hash('Fleet@123', 12);
  await prisma.user.upsert({
    where: { email: 'safety@fleetflow.com' },
    update: {},
    create: { fullName: 'Robert Chen', email: 'safety@fleetflow.com', password: safetyPwd, role: 'SAFETY_OFFICER' },
  });

  // Create Financial Analyst
  const finPwd = await bcrypt.hash('Fleet@123', 12);
  await prisma.user.upsert({
    where: { email: 'finance@fleetflow.com' },
    update: {},
    create: { fullName: 'Sarah Williams', email: 'finance@fleetflow.com', password: finPwd, role: 'FINANCIAL_ANALYST' },
  });

  // Create Drivers
  const driverPwd = await bcrypt.hash('Fleet@123', 12);
  const driver1 = await prisma.user.upsert({
    where: { email: 'john@fleetflow.com' },
    update: {},
    create: {
      fullName: 'John Smith', email: 'john@fleetflow.com', password: driverPwd, role: 'DRIVER',
      driver: { create: { licenseNumber: 'DL-232223', licenseExpiry: new Date('2025-11-30'), safetyScore: 89, totalTrips: 42 } },
    },
  });
  const driver2 = await prisma.user.upsert({
    where: { email: 'mike@fleetflow.com' },
    update: {},
    create: {
      fullName: 'Mike Davis', email: 'mike@fleetflow.com', password: driverPwd, role: 'DRIVER',
      driver: { create: { licenseNumber: 'DL-232224', licenseExpiry: new Date('2026-03-15'), safetyScore: 94, totalTrips: 38 } },
    },
  });

  // Create Vehicles
  const v1 = await prisma.vehicle.upsert({
    where: { licensePlate: 'GJ-01-AA-0001' },
    update: {},
    create: { vehicleName: 'Tata Ace Gold', model: '2021', licensePlate: 'GJ-01-AA-0001', type: 'Mini Truck', maxLoadCapacity: 750, odometer: 45230, status: 'AVAILABLE' },
  });
  const v2 = await prisma.vehicle.upsert({
    where: { licensePlate: 'GJ-01-AB-0002' },
    update: {},
    create: { vehicleName: 'Mahindra Bolero', model: '2022', licensePlate: 'GJ-01-AB-0002', type: 'Truck', maxLoadCapacity: 1500, odometer: 32100, status: 'IN_USE' },
  });
  const v3 = await prisma.vehicle.upsert({
    where: { licensePlate: 'GJ-01-AC-0003' },
    update: {},
    create: { vehicleName: 'Eicher Pro 2049', model: '2020', licensePlate: 'GJ-01-AC-0003', type: 'Heavy Truck', maxLoadCapacity: 5000, odometer: 89700, status: 'IN_SHOP' },
  });

  // Create Trips
  const t1 = await prisma.trip.create({
    data: {
      tripType: 'Delivery', origin: 'Ahmedabad', destination: 'Surat',
      cargoWeight: 600, estimatedFuel: 45,
      vehicleId: v1.id, driverId: driver1.id, createdById: dispatcher.id,
      status: 'COMPLETED', startedAt: new Date('2024-12-01'), completedAt: new Date('2024-12-01'),
    },
  });

  await prisma.trip.create({
    data: {
      tripType: 'Delivery', origin: 'Surat', destination: 'Vadodara',
      cargoWeight: 1200, estimatedFuel: 30,
      vehicleId: v2.id, driverId: driver2.id, createdById: dispatcher.id,
      status: 'IN_PROGRESS', startedAt: new Date(),
    },
  });

  await prisma.trip.create({
    data: {
      tripType: 'Pickup', origin: 'Rajkot', destination: 'Ahmedabad',
      cargoWeight: 800, estimatedFuel: 55,
      createdById: dispatcher.id, status: 'DRAFT',
    },
  });

  // Fuel logs
  await prisma.fuelLog.create({
    data: { vehicleId: v1.id, driverId: driver1.id, liters: 45, costPerLiter: 95.5, totalCost: 4297.5, odometer: 45230 },
  });
  await prisma.fuelLog.create({
    data: { vehicleId: v2.id, driverId: driver2.id, liters: 30, costPerLiter: 95.5, totalCost: 2865, odometer: 32100 },
  });

  // Expenses
  await prisma.expense.create({
    data: { category: 'Fuel', amount: 4297.5, description: 'Fuel for Ahmedabad-Surat trip', createdById: manager.id },
  });
  await prisma.expense.create({
    data: { category: 'Maintenance', amount: 8500, description: 'Eicher Pro engine service', createdById: manager.id },
  });

  // Maintenance
  await prisma.maintenanceLog.create({
    data: { vehicleId: v3.id, issue: 'Engine overheating', service: 'Engine overhaul and coolant flush', cost: 8500, createdById: manager.id },
  });

  console.log('✅ Seed complete!');
  console.log('\n📋 Test Accounts (all use password: Fleet@123):');
  console.log('  Fleet Manager: manager@fleetflow.com');
  console.log('  Dispatcher:    dispatcher@fleetflow.com');
  console.log('  Safety Officer: safety@fleetflow.com');
  console.log('  Financial Analyst: finance@fleetflow.com');
  console.log('  Driver 1:      john@fleetflow.com');
  console.log('  Driver 2:      mike@fleetflow.com');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
