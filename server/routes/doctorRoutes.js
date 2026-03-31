import express from 'express';
import { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor, getRecommendedDoctors, getDoctorsBySymptoms, getAvailableSlots, getSymptomKeywords, getNearbyDoctors } from '../controllers/doctorController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getDoctors)
  .post(protect, admin, createDoctor);

router.route('/recommendations')
  .get(protect, getRecommendedDoctors);

router.route('/nearby')
  .get(getNearbyDoctors);

router.route('/symptoms')
  .post(getDoctorsBySymptoms);

router.route('/symptom-keywords')
  .get(getSymptomKeywords);

router.route('/:id/slots')
  .get(getAvailableSlots);

router.route('/:id')
  .get(getDoctorById)
  .put(protect, admin, updateDoctor)
  .delete(protect, admin, deleteDoctor);

export default router;
