import express from 'express';
import { protect, doctorAuth } from '../middleware/authMiddleware.js';
import { 
  createPrescription, 
  getUserPrescriptions, 
  getDoctorPrescriptions 
} from '../controllers/prescriptionController.js';

const router = express.Router();

router.route('/')
  .post(protect, doctorAuth, createPrescription);

router.route('/user')
  .get(protect, getUserPrescriptions);

router.route('/doctor')
  .get(protect, doctorAuth, getDoctorPrescriptions);

export default router;
