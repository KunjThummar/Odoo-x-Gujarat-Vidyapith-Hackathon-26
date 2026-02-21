const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create Dispatcher
exports.createDispatcher = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const managerId = req.user.id; // From authenticate middleware

    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await prisma.dispatcher.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Dispatcher with this email already exists' });
    }

    const dispatcher = await prisma.dispatcher.create({
      data: {
        name,
        email,
        phone,
        managerId,
      },
    });

    res.status(201).json({ message: 'Dispatcher created successfully', dispatcher });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Dispatchers (optionally filtered by manager)
exports.getDispatchers = async (req, res) => {
  try {
    const { search } = req.query;
    const where = {};

    // If manager, only show their dispatchers. If admin/other, maybe show all?
    // Following prompt "Managers must be able to view dispatcher"
    if (req.user.role === 'FLEET_MANAGER') {
      where.managerId = req.user.id;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const dispatchers = await prisma.dispatcher.findMany({
      where,
      include: {
        manager: {
          select: { fullName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(dispatchers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Dispatcher
exports.updateDispatcher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const dispatcher = await prisma.dispatcher.findUnique({ where: { id: parseInt(id) } });
    if (!dispatcher) return res.status(404).json({ message: 'Dispatcher not found' });

    // Ensure only the manager who created it can update it (or admin)
    if (req.user.role === 'FLEET_MANAGER' && dispatcher.managerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updated = await prisma.dispatcher.update({
      where: { id: parseInt(id) },
      data: { name, email, phone },
    });

    res.json({ message: 'Dispatcher updated successfully', dispatcher: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Dispatcher
exports.deleteDispatcher = async (req, res) => {
  try {
    const { id } = req.params;

    const dispatcher = await prisma.dispatcher.findUnique({ where: { id: parseInt(id) } });
    if (!dispatcher) return res.status(404).json({ message: 'Dispatcher not found' });

    if (req.user.role === 'FLEET_MANAGER' && dispatcher.managerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.dispatcher.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Dispatcher deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
