import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

dotenv.config();

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import lecturerRoutes from './routes/lecturer.routes';
import notificationRoutes from './routes/notification.routes';
import sessionRoutes from './routes/session.routes';
import projectRoutes from './routes/project.routes';
import studentRoutes from './routes/student.routes';
import departmentRoutes from './routes/department.routes';
import facultyRoutes from './routes/faculty.routes';
import defenceRoutes from './routes/defence.routes';

const app = express();

//Security Middlewares
app.use(helmet()); // sets secure HTTP headers

app.use(cors({
  origin: process.env.CLIENT_URL || '*', // restrict to frontend domain in prod
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));

app.use(express.json({ limit: '10kb' })); // prevent huge payload attacks
//app.use(mongoSanitize()); // prevent MongoDB operator injection



app.use(hpp()); // prevent HTTP parameter pollution

//Rate limiting (apply only to auth routes, you can add per route if needed)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP
  message: 'Too many requests from this IP, please try again later',
});
app.use('/api/auth', limiter);

//Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/lecturer', lecturerRoutes);
app.use('/api/user', userRoutes);
app.use('/api', notificationRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/student', studentRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use('/api/defence', defenceRoutes);

//Global error handler (avoid exposing stack traces in prod)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    error: 'Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
});

export default app;
