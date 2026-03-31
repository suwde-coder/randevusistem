import express from 'express';
import { protect, doctorAuth } from '../middleware/authMiddleware.js';
import {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointmentController.js';

const router = express.Router();

router.route('/')
  .post(protect, createAppointment)
  .get(protect, getMyAppointments);

router.route('/doctor')
  .get(protect, doctorAuth, getDoctorAppointments);

router.route('/:id')
  .put(protect, updateAppointment)
  .delete(protect, deleteAppointment);

export default router;
