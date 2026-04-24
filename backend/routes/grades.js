const express = require('express');
const Grade = require('../models/Grade');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/grades/batch?semester=X&subject=Y
router.get('/batch', authenticateToken, async (req, res) => {
  try {
    const { semester, subject } = req.query;
    const query = {};
    if (semester) query.semester = semester;
    if (subject) query.subject = subject;

    const grades = await Grade.find(query).sort({ createdAt: -1 }).lean();
    res.json(grades);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/grades/batch  — Bulk upsert grades
router.post('/batch', authenticateToken, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { semester, subject, records } = req.body;
    if (!semester || !subject || !records) {
      return res.status(400).json({ message: 'Semester, subject, and records are required' });
    }

    const ops = records.map((r) => ({
      updateOne: {
        filter: { studentId: r.studentId, subject, semester },
        update: {
          $set: {
            grade: r.grade,
            marks: r.marks,
            comments: r.comments || '',
            createdBy: req.user.email,
          },
        },
        upsert: true,
      },
    }));

    const result = await Grade.bulkWrite(ops);
    res.json({
      message: 'Batch grades synchronized successfully',
      count: result.upsertedCount + result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/grades/:studentId  — All grades for a student
router.get('/:studentId', authenticateToken, async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.params.studentId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(grades);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/grades/:studentId  — Add single grade
router.post('/:studentId', authenticateToken, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { subject, grade, semester, comments, marks } = req.body;
    if (!subject || !grade || !semester) {
      return res.status(400).json({ message: 'Subject, grade, and semester are required' });
    }

    const newGrade = await Grade.create({
      studentId: req.params.studentId,
      subject,
      grade,
      semester,
      marks,
      comments: comments || '',
      createdBy: req.user.email,
    });

    res.status(201).json(newGrade);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/grades/:gradeId  — Delete single grade
router.delete('/:gradeId', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.gradeId);
    if (!grade) return res.status(404).json({ message: 'Grade not found' });
    res.json({ message: 'Grade deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid grade ID format' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
