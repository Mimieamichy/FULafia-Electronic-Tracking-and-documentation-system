import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import userRoutes from './routes/user';




const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes)
app.use('/api/user', userRoutes)


export default app;
