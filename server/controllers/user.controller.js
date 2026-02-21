const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get Users (General Search)
exports.getUsers = async (req, res) => {
    try {
        const { search, role } = req.query;
        const where = {};

        if (role) {
            where.role = role;
        }

        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Managers
exports.getManagers = async (req, res) => {
    req.query.role = 'FLEET_MANAGER';
    return exports.getUsers(req, res);
};
