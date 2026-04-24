const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // Fail fast if Atlas unreachable
      socketTimeoutMS: 45000,
      maxPoolSize: 10,                 // Connection pool for production
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    // Graceful reconnection events
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('⚠️  MongoDB disconnected — will reconnect on next request');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      console.log('✅ MongoDB reconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB runtime error:', err.message);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('');
    console.error('📋 Troubleshooting:');
    console.error('  1. Verify MONGO_URI in your .env file');
    console.error('  2. Add 0.0.0.0/0 to MongoDB Atlas → Network Access → IP Whitelist');
    console.error('  3. Confirm your Atlas username and password are correct');
    console.error('  4. Check cluster is not paused on Atlas dashboard');
    process.exit(1);
  }
};

module.exports = connectDB;
