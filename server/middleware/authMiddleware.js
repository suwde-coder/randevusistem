import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  console.log('🔐 Protect middleware called');
  console.log('Auth header:', req.headers.authorization ? 'EXISTS' : 'MISSING');

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Incoming Token:', token);

      if (!token || token === 'undefined' || token === 'null') {
        throw new Error('Invalid or missing token string');
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      console.log('Token verified, user id:', decoded.id);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        throw new Error('User not found in database');
      }
      console.log('User found:', req.user._id);

      return next();
    } catch (error) {
      console.error('🔴 Token error:', error.message);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Not authorized, token expired', type: 'expired' });
      }
      return res.status(401).json({ message: `Not authorized, token failed: ${error.message}` });
    }
  }

  if (!token) {
    console.log('🔴 No token provided');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

export const doctorAuth = (req, res, next) => {
  if (req.user && req.user.isDoctor && req.user.linkedDoctorId) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a doctor' });
  }
};
