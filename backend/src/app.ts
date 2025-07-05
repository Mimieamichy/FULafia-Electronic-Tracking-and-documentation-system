import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';




const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);


export default app;
