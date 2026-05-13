const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Explicitly select password field (excluded by default in schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const payload = {
      _id:   user._id,
      email: user.email,
      role:  user.role,
      name:  user.name,
    };

    // Token valid for 7 days — long enough for normal workflows
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: payload,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login' });
  }
});

// ── GET /api/auth/me — verify token & return fresh profile ───────────────────
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ── POST /api/auth/logout — client-side only (stateless JWT), just acknowledge
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out. Please clear your token on the client.' });
});

module.exports = router;
