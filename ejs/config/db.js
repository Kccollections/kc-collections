const mongoose = require('mongoose');

// Correctly URL-encoded password
const dbUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/kc-collection';

const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl, {
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit process if connection fails
  }

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
    mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).catch((error) => console.error('Reconnection error:', error));
  });
};

module.exports = connectDB;
