const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// email helper (uses nodemailer under the hood)
const { sendEmail } = require('../utils/email');

const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await prisma.user.findUnique({
      where: { email },
      include: { driver: true, managedDispatchers: true },
    });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register Driver
exports.registerDriver = async (req, res) => {
  try {
    const { fullName, email, password, phone, licenseNumber, licenseExpiry } = req.body;

    if (!fullName || !email || !password || !phone || !licenseNumber || !licenseExpiry) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
      });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) return res.status(409).json({ message: 'Email already registered' });

    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) return res.status(409).json({ message: 'Phone number already registered' });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        phone,
        role: 'DRIVER',
        driver: {
          create: {
            licenseNumber,
            licenseExpiry: new Date(licenseExpiry),
          },
        },
      },
      include: { driver: true },
    });

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({ token, user: userWithoutPassword, message: 'Driver registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// General Register (for Managers, etc.)
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phone, licenseNumber, licenseExpiry } = req.body;

    if (!fullName || !email || !password || !phone || !licenseNumber || !licenseExpiry) {
      return res.status(400).json({ message: 'All fields including license are required' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
      });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] }
    });
    if (existing) return res.status(400).json({ message: 'Email or phone already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          fullName,
          email,
          password: hashedPassword,
          phone,
          role: 'DRIVER'
        }
      });

      await tx.driver.create({
        data: {
          userId: newUser.id,
          licenseNumber,
          licenseExpiry: new Date(licenseExpiry),
          status: 'On Duty',
          safetyScore: 100
        }
      });

      return newUser;
    });

    const token = generateToken(result.id);
    res.status(201).json({
      token,
      user: {
        id: result.id,
        fullName: result.fullName,
        email: result.email,
        role: result.role,
        phone: result.phone
      },
      message: 'Driver registered successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Forgot Password - send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'No account with that email' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { email, otp, expiresAt },
    });

    // attempt to send real email, fall back to console-log if transporter not configured
    try {
      await sendEmail({
        to: email,
        subject: 'FleetFlow Password Reset OTP',
        text: `Your one‑time password is ${otp}. It will expire in 10 minutes.`,
      });
    } catch (mailErr) {
      console.error('Failed to send OTP email:', mailErr);
      // don't block the response; the OTP is already stored
    }

    const msg = 'OTP sent to your email';
    if (process.env.NODE_ENV === 'development') {
      res.json({ message: msg + ' (check console if mail not configured)' });
    } else {
      res.json({ message: msg });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await prisma.passwordResetToken.findFirst({
      where: { email, otp, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) return res.status(400).json({ message: 'Invalid or expired OTP' });

    res.json({ message: 'OTP verified successfully', valid: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const record = await prisma.passwordResetToken.findFirst({
      where: { email, otp, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) return res.status(400).json({ message: 'Invalid or expired OTP' });

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { email }, data: { password: hashedPassword } });
    await prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, fullName: true, email: true, phone: true, role: true, createdAt: true,
        driver: true,
        managedDispatchers: true,
      },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
