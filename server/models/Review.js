import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Doctor',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    doctorReply: {
      type: String,
      default: '',
    },
    doctorReplyAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews by the same user for the same doctor
reviewSchema.index({ userId: 1, doctorId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
