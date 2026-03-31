import express from 'express';
import { getSpecialties, createSpecialty, deleteSpecialty } from '../controllers/specialtyController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getSpecialties)
  .post(protect, admin, createSpecialty);

router.route('/:id')
  .delete(protect, admin, deleteSpecialty);

export default router;
