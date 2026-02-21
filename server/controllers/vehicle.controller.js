const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
  try {
    const { search } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { vehicleName: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { licensePlate: { contains: search, mode: 'insensitive' } },
      ];
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(vehicles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { vehicleName, model, licensePlate, type, maxLoadCapacity, odometer } = req.body;
    if (!vehicleName || !model || !licensePlate || !maxLoadCapacity) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
    const vehicle = await prisma.vehicle.create({
      data: { vehicleName, model, licensePlate, type: type || 'Truck', maxLoadCapacity: parseFloat(maxLoadCapacity), odometer: parseFloat(odometer || 0) },
    });
    res.status(201).json(vehicle);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'License plate already exists' });
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { vehicleName, model, licensePlate, type, maxLoadCapacity, odometer, status } = req.body;
    const vehicle = await prisma.vehicle.update({
      where: { id: parseInt(req.params.id) },
      data: { vehicleName, model, licensePlate, type, maxLoadCapacity: parseFloat(maxLoadCapacity), odometer: parseFloat(odometer), status },
    });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    await prisma.vehicle.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
