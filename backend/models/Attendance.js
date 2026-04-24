const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['Present', 'Absent', 'Late'],
        message: 'Status must be Present, Absent, or Late',
      },
    },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
    },
    date: {
      type: String, // Stored as YYYY-MM-DD string for easy filtering
      required: [true, 'Date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    records: {
      type: [attendanceRecordSchema],
      default: [],
    },
    updatedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint: one attendance record per course per date
attendanceSchema.index({ course: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
