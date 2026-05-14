const Student = require('../models/Student');

const generateStudentId = async () => {
  const year = new Date().getFullYear();
  const lastStudent = await Student.findOne({ studentId: new RegExp(`^SMS-${year}-`) }).sort({ studentId: -1 });
  if (!lastStudent) return `SMS-${year}-1000`;
  const lastIdNum = parseInt(lastStudent.studentId.split('-')[2], 10);
  return `SMS-${year}-${lastIdNum + 1}`;
};

// GET /api/students
const getAllStudents = async (req, res) => {
  try {
    const {
      search,
      course,
      year,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Text search across fullName, email, studentId
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    if (course && course !== 'all') {
      query.course = course;
    }

    if (year && year !== 'all') {
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${year}-12-31`);
      query.enrollmentDate = { $gte: start, $lte: end };
    }

    const sortObj = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [students, total] = await Promise.all([
      Student.find(query).sort(sortObj).skip(skip).limit(parseInt(limit)).lean(),
      Student.countDocuments(query),
    ]);

    res.json({
      students,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/students/stats
const getStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const Attendance = require('../models/Attendance');

    const [total, courseAgg, yearAgg, recent, todayAttendance] = await Promise.all([
      Student.countDocuments(),
      Student.aggregate([{ $group: { _id: '$course', count: { $sum: 1 } } }]),
      Student.aggregate([
        // Filter out docs where enrollmentDate is missing/null
        { $match: { enrollmentDate: { $exists: true, $ne: null } } },
        {
          $group: {
            // $toDate safely converts both ISO strings and Date objects
            _id: { $year: { $toDate: '$enrollmentDate' } },
            count: { $sum: 1 },
          },
        },
      ]),
      Student.find().sort({ createdAt: -1 }).limit(5).lean(),
      Attendance.find({ date: todayStr }),
    ]);

    const byCourse = {};
    courseAgg.forEach((c) => { byCourse[c._id] = c.count; });

    const byYear = {};
    yearAgg.forEach((y) => { if (y._id) byYear[y._id] = y.count; });

    let presentToday = 0;
    if (todayAttendance && todayAttendance.length > 0) {
      todayAttendance.forEach(attendanceDoc => {
        if (attendanceDoc.records) {
          presentToday += attendanceDoc.records.filter((r) => r.status === 'Present').length;
        }
      });
    }

    res.json({ total, byCourse, byYear, recent, presentToday });
  } catch (err) {
    console.error('getStats error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/students/:id
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).lean();
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid student ID format' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/students
const createStudent = async (req, res) => {
  try {
    const studentId = await generateStudentId();
    const student = await Student.create({ studentId, ...req.body });
    res.status(201).json(student);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(409).json({
        message: `A student with this ${field} already exists`,
      });
    }
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/students/:id
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(409).json({ message: `A student with this ${field} already exists` });
    }
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid student ID format' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/students/:id
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully', student });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid student ID format' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStats,
};
