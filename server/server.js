import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import specialtyRoutes from './routes/specialtyRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { initCronJobs } from './utils/cronJobs.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import path from 'path';

dotenv.config();

const app = express();

// Request Logger - Moved to top to capture all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Body logger (only runs if JSON parsing succeeds)
app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Basic Route
app.get('/', (req, res) => {
  res.send('Appointment Booking API is running...');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/specialties', specialtyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/upload', uploadRoutes);

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'server/uploads')));
// Serve static for dev if running from root, or standard dir
app.use('/server/uploads', express.static(path.join(__dirname, 'server/uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Initialize Background Jobs
initCronJobs();

import { MongoMemoryServer } from 'mongodb-memory-server';
import { seedDatabase } from './utils/seedData.js';

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI_ENV = process.env.MONGO_URI;

const startServer = async () => {
  let mongoUri = MONGO_URI_ENV;

  if (!mongoUri || mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
    try {
      console.log('Starting in-memory MongoDB...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log('In-memory MongoDB started at:', mongoUri);
    } catch (err) {
      console.error('Failed to start in-memory MongoDB, falling back to local:', err);
      mongoUri = mongoUri || 'mongodb://127.0.0.1:27017/randevusistem';
    }
  }

  console.log('Connecting to MongoDB...');
  mongoose.connect(mongoUri)
    .then(async () => {
      console.log('Connected to MongoDB');
      
      // Seed initial data
      await seedDatabase();

      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
    });
};

startServer();
