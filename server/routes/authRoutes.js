import express from 'express';
import { registerUser, loginUser, getUserProfile, toggleFavorite, getFavorites } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.post('/favorites/:doctorId', protect, toggleFavorite);
router.get('/favorites', protect, getFavorites);

export default router;
