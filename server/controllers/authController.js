import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isDoctor: user.isDoctor,
        linkedDoctorId: user.linkedDoctorId,
        favorites: user.favorites || [],
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isDoctor: user.isDoctor,
        linkedDoctorId: user.linkedDoctorId,
        favorites: user.favorites || [],
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isDoctor: user.isDoctor,
        linkedDoctorId: user.linkedDoctorId,
        favorites: user.favorites,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle favorite doctor
// @route   POST /api/auth/favorites/:doctorId
// @access  Private
export const toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const doctorId = req.params.doctorId;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.favorites) user.favorites = [];
    const index = user.favorites.findIndex(favId => favId && favId.toString() === doctorId);
    let message = '';
    
    if (index === -1) {
      // Add to favorites
      user.favorites.push(doctorId);
      message = 'Doctor added to favorites';
    } else {
      // Remove from favorites
      user.favorites.splice(index, 1);
      message = 'Doctor removed from favorites';
    }

    await user.save();
    res.json({ message, favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's favorite doctors
// @route   GET /api/auth/favorites
// @access  Private
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

