const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
  try {
    const logs = await prisma.maintenanceLog.findMany({
      include: { vehicle: true, createdBy: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { vehicleId, issue, service, cost, date } = req.body;
    if (!vehicleId || !issue || !service) {
      return res.status(400).json({ message: 'Vehicle, issue, and service required' });
    }

    const log = await prisma.maintenanceLog.create({
      data: {
        vehicleId: parseInt(vehicleId),
        issue,
        service,
        cost: parseFloat(cost || 0),
        date: date ? new Date(date) : new Date(),
        createdById: req.user.id,
      },
      include: { vehicle: true },
    });

    // Set vehicle to IN_SHOP
    await prisma.vehicle.update({ where: { id: parseInt(vehicleId) }, data: { status: 'IN_SHOP' } });

    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.complete = async (req, res) => {
  try {
    const log = await prisma.maintenanceLog.update({
      where: { id: parseInt(req.params.id) },
      data: { completed: true },
      include: { vehicle: true },
    });

    // Set vehicle back to AVAILABLE
    await prisma.vehicle.update({ where: { id: log.vehicleId }, data: { status: 'AVAILABLE' } });

    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { vehicleId, issue, service, cost, date } = req.body;
    const log = await prisma.maintenanceLog.update({
      where: { id: parseInt(req.params.id) },
      data: {
        vehicleId: parseInt(vehicleId),
        issue,
        service,
        cost: parseFloat(cost || 0),
        date: date ? new Date(date) : new Date(),
      },
      include: { vehicle: true },
    });
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    await prisma.maintenanceLog.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Maintenance log deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
