// src/config/database.ts
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/etds';

/**
 * Connect to MongoDB using mongoose
 */
export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    throw err;
  }
}
