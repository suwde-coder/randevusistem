import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';

// @desc    Create a new prescription
// @route   POST /api/prescriptions
// @access  Private/Doctor
export const createPrescription = async (req, res) => {
  try {
    const { appointmentId, userId, medicines, notes } = req.body;
    const doctorId = req.user.linkedDoctorId;

    // Validate if appointment belongs to this doctor
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.doctorId.toString() !== doctorId.toString()) {
      return res.status(403).json({ message: 'Not authorized to write prescription for this appointment' });
    }

    const prescription = await Prescription.create({
      doctorId,
      userId,
      appointmentId,
      medicines,
      notes,
    });

    // Notify patient
    await Notification.create({
      user: userId,
      message: `You have received a new prescription by your doctor for your appointment on ${appointment.date}.`,
      type: 'system'
    });

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get prescriptions for patient
// @route   GET /api/prescriptions/user
// @access  Private
export const getUserPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ userId: req.user._id })
      .populate('doctorId', 'name specialty image')
      .populate('appointmentId', 'date time')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get prescriptions by doctor
// @route   GET /api/prescriptions/doctor
// @access  Private/Doctor
export const getDoctorPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctorId: req.user.linkedDoctorId })
      .populate('userId', 'name email')
      .populate('appointmentId', 'date time')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
