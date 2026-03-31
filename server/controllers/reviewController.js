import Review from '../models/Review.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';

// @desc    Add doctor review
// @route   POST /api/reviews
// @access  Private
export const addReview = async (req, res) => {
  try {
    const { doctorId, rating, comment } = req.body;
    
    // Check if user has a non-cancelled appointment with this doctor
    const hasAppointment = await Appointment.findOne({
      userId: req.user._id,
      doctorId,
      status: { $ne: 'cancelled' }
    });

    if (!hasAppointment) {
      return res.status(400).json({ message: 'You can only review doctors you have visited' });
    }

    // Check if already reviewed
    const alreadyReviewed = await Review.findOne({
      userId: req.user._id,
      doctorId
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this doctor' });
    }

    const review = await Review.create({
      userId: req.user._id,
      doctorId,
      rating,
      comment
    });

    // Calculate new average rating
    const reviews = await Review.find({ doctorId });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    // Update doctor
    await Doctor.findByIdAndUpdate(doctorId, {
      rating: parseFloat(avgRating.toFixed(1))
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor reviews
// @route   GET /api/reviews/:doctorId
// @access  Public
export const getDoctorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ doctorId: req.params.doctorId })
      .populate('userId', 'name image') 
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to doctor review
// @route   PUT /api/reviews/:id/reply
// @access  Private/Doctor
export const replyToReview = async (req, res) => {
  try {
    const { doctorReply } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the current doctor is the one being reviewed
    if (!req.user.linkedDoctorId || review.doctorId.toString() !== req.user.linkedDoctorId.toString()) {
      return res.status(403).json({ message: 'Not authorized to reply to this review' });
    }

    review.doctorReply = doctorReply;
    review.doctorReplyAt = Date.now();

    const updatedReview = await review.save();
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
