const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Student = require('../models/Student');
const { authenticateToken, requireRole } = require('../middleware/auth');
const validateStudent = require('../middleware/validateStudent');
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStats,
} = require('../controllers/studentController');

const router = express.Router();

// Multer for document uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Stats — must be BEFORE /:id to avoid conflict
router.get('/stats', authenticateToken, getStats);

// CRUD
router.get('/', authenticateToken, getAllStudents);
router.get('/:id', authenticateToken, getStudentById);
router.post('/', authenticateToken, requireRole(['admin']), validateStudent, createStudent);
router.put('/:id', authenticateToken, requireRole(['admin']), validateStudent, updateStudent);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteStudent);

// Document upload for a student
router.post('/:id/documents', authenticateToken, requireRole(['admin']), upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const documentInfo = {
      name: req.body.documentName || req.file.originalname,
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      uploadedAt: new Date(),
    };

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $push: { documents: documentInfo } },
      { new: true }
    );

    if (!student) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(201).json({ message: 'Document uploaded successfully', document: documentInfo });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
