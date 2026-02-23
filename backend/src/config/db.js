const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not set in environment');
  }

  await mongoose.connect(mongoUri);
  return mongoose.connection;
};

module.exports = { connectDB };
