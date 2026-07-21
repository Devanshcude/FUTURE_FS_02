const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`\x1b[32m✓ MongoDB Connected: ${conn.connection.host}\x1b[0m`);
  } catch (error) {
    console.error(`\x1b[31m✗ MongoDB Connection Error: ${error.message}\x1b[0m`);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('\x1b[33mMongoDB connection closed on app termination\x1b[0m');
  process.exit(0);
});

mongoose.connection.on('disconnected', () => {
  console.log('\x1b[33m⚠ MongoDB disconnected\x1b[0m');
});

module.exports = connectDB;
