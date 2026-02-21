const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
  try {
    const { search } = req.query;
    const where = { role: 'DRIVER' };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { driver: { licenseNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const drivers = await prisma.user.findMany({
      where,
      select: {
        id: true, fullName: true, email: true, phone: true, role: true, createdAt: true,
        driver: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(drivers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { driver: true },
      select: { id: true, fullName: true, email: true, role: true, driver: true },
    });
    if (!user) return res.status(404).json({ message: 'Driver not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateDriver = async (req, res) => {
  try {
    const { licenseNumber, licenseExpiry, safetyScore, status } = req.body;
    const updated = await prisma.driver.updateMany({
      where: { userId: parseInt(req.params.id) },
      data: {
        ...(licenseNumber && { licenseNumber }),
        ...(licenseExpiry && { licenseExpiry: new Date(licenseExpiry) }),
        ...(safetyScore !== undefined && { safetyScore: parseFloat(safetyScore) }),
        ...(status && { status }),
      },
    });
    res.json({ message: 'Driver updated', updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeDriver = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Driver removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { driver: true },
      select: { id: true, fullName: true, email: true, role: true, driver: true },
    });
    const trips = await prisma.trip.findMany({
      where: { driverId: req.user.id },
      select: { id: true, status: true, origin: true, destination: true },
    });
    res.json({ ...user, trips });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
