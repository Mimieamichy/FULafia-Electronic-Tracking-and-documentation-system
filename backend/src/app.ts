import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import lecturerRoutes from './routes/lecturer.routes';
import notificationRoutes from './routes/notification.routes';
import sessionRoutes from './routes/session.routes'
import projectRoutes from './routes/project.routes'
import studentRoutes from './routes/student.routes'
import departmentRoutes from './routes/department.routes';
import facultyRoutes from "./routes/faculty.routes";


const app = express();

app.use(cors());
app.use(express.json());
// CORRECT
app.use("/uploads", express.static(path.join(__dirname,  "../uploads")));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lecturer', lecturerRoutes)
app.use('/api/user', userRoutes)
app.use('/api', notificationRoutes)
app.use('/api/session', sessionRoutes)
app.use('/api/project', projectRoutes)
app.use('/api/student', studentRoutes)
app.use("/api/department", departmentRoutes);
app.use("/api/faculty", facultyRoutes);


export default app;
