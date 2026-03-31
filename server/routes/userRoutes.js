import express from 'express';
import { getUsers, deleteUser, makeAdmin, getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getUsers);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);


router.route('/:id')
  .delete(protect, admin, deleteUser);

router.route('/:id/admin')
  .put(protect, admin, makeAdmin);

export default router;
