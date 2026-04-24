require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const gradesRoutes = require('./routes/grades');

// ── App Setup ─────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

// ── Connect MongoDB ───────────────────────────────────────────────────────────
connectDB();

// ── Security Headers (Helmet) ─────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ── Request Logger ────────────────────────────────────────────────────────────
app.use(morgan(isDev ? 'dev' : 'combined'));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 100,  // Relaxed in dev, strict in production
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Strict limit on login attempts
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
});

app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);

// ── Body Parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static Files ──────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradesRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    message: 'Student Management API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// ── Root ──────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Student Management System API v2.0',
    docs: '/api/health',
  });
});

// ── Error Handlers (must be last) ─────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
const mongoose = require('mongoose');
process.on('SIGTERM', async () => {
  console.log('⏳ SIGTERM received. Closing server gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════╗');
  console.log(`║  🚀 Server running on port ${PORT}          ║`);
  console.log(`║  🌍 Environment: ${(process.env.NODE_ENV || 'development').padEnd(24)}║`);
  console.log(`║  📚 API Base: http://localhost:${PORT}/api  ║`);
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');
});
