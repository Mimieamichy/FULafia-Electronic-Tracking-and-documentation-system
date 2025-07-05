// src/server.ts
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    process.exit(1);
  }
}

startServer();
