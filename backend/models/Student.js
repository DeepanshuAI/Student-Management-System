const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [150, 'Full name cannot exceed 150 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[+]?[\d\s\-().]{7,20}$/, 'Please provide a valid phone number'],
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [1, 'Age must be at least 1'],
      max: [120, 'Age cannot exceed 120'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: 'Gender must be Male, Female, or Other',
      },
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
    },
    year: {
      type: String,
      trim: true,
    },
    enrollmentDate: {
      type: Date,
      required: [true, 'Enrollment date is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Inactive', 'Graduated', 'Suspended'],
        message: 'Status must be Active, Inactive, Graduated, or Suspended',
      },
      default: 'Active',
    },
    guardianName: {
      type: String,
      trim: true,
    },
    guardianPhone: {
      type: String,
    },
    documents: [
      {
        name: String,
        filename: String,
        path: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Auto-generate studentId before saving if not set
studentSchema.pre('save', async function (next) {
  if (!this.studentId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Student').countDocuments();
    this.studentId = `SMS-${year}-${1000 + count}`;
  }
  next();
});

// Indexes for search performance
studentSchema.index({ fullName: 'text', email: 'text', studentId: 'text' });
studentSchema.index({ course: 1 });
studentSchema.index({ enrollmentDate: 1 });
studentSchema.index({ status: 1 });

module.exports = mongoose.model('Student', studentSchema);
