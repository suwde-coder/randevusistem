import express from 'express';
import { addReview, getDoctorReviews, replyToReview } from '../controllers/reviewController.js';
import { protect, doctorAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, addReview);

router.route('/:doctorId')
  .get(getDoctorReviews);

router.route('/:id/reply')
  .put(protect, doctorAuth, replyToReview);

export default router;
