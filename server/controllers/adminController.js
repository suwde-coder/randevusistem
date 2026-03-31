import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

// @desc    Get admin analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();

    // Group appointments by date (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Aggregate appointments by date string
    const appointmentsByDay = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          date: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    // Top rated doctors
    const topDoctors = await Doctor.find({})
      .sort({ rating: -1 })
      .limit(5)
      .select('name specialty rating');

    res.json({
      stats: {
        totalUsers,
        totalDoctors,
        totalAppointments,
      },
      appointmentsByDay,
      topDoctors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
