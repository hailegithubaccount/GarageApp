const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(uri, {
      autoSelectFamily: false, // Fix for some Windows environments
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (error.code === 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR') {
      console.error('💡 Tip: This often means your IP address is not whitelisted in MongoDB Atlas.');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
