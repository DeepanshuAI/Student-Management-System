const express = require('express');
const Attendance = require('../models/Attendance');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/attendance?course=X&date=YYYY-MM-DD
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { course, date } = req.query;
    if (!course || !date) {
      return res.status(400).json({ message: 'Course and date are required' });
    }

    const record = await Attendance.findOne({ course, date }).lean();
    res.json(record || { course, date, records: [] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/attendance  — Save or update attendance for a course+date
router.post('/', authenticateToken, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { course, date, records } = req.body;
    if (!course || !date || !records) {
      return res.status(400).json({ message: 'Course, date, and records are required' });
    }

    // Upsert: update if exists, insert if not
    const attendance = await Attendance.findOneAndUpdate(
      { course, date },
      {
        $set: {
          records,
          updatedBy: req.user.email,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ message: 'Attendance saved successfully', attendance });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
