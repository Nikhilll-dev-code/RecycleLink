const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const Driver  = require('../models/Driver');

const JWT_SECRET = process.env.JWT_SECRET || 'recyclelink_secret';

// POST /api/register
router.post('/register', async (req, res) => {
  const { name, email, phone, password, role, address, licenseNumber } = req.body;

  if (!['Resident', 'Driver'].includes(role)) {
    return res.status(400).json({ error: 'Role must be Resident or Driver' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, password: hash, role, address });

    // Create companion Driver document for Driver accounts
    if (role === 'Driver') {
      await Driver.create({
        userId: user._id,
        licenseNumber: licenseNumber || 'PENDING',
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: err.message });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
