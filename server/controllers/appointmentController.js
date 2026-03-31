import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import Doctor from '../models/Doctor.js';

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, note } = req.body;

    // Validate if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check for double booking
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $ne: 'cancelled' }, // Ignore cancelled appointments for the slot
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Time slot is already booked.' });
    }

    const appointment = await Appointment.create({
      userId: req.user._id,
      doctorId,
      date,
      time,
      note,
      status: 'confirmed',
    });

    await Notification.create({
      user: req.user._id,
      message: `Your appointment with ${doctor.name} on ${date} at ${time} has been successfully booked.`,
      type: 'booking'
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user appointments
// @route   GET /api/appointments
// @access  Private
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id })
      .populate('doctorId', 'name specialty location image rating')
      .sort({ date: 1, time: 1 });
      
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in doctor's appointments
// @route   GET /api/appointments/doctor
// @access  Private/Doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    if (!req.user.linkedDoctorId) {
       return res.status(400).json({ message: 'No doctor profile linked' });
    }
    const appointments = await Appointment.find({ doctorId: req.user.linkedDoctorId })
      .populate('userId', 'name email')
      .sort({ date: 1, time: 1 });
      
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment (Reschedule)
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = async (req, res) => {
  try {
    const { date, time } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Security check: ensure user owns the appointment
    if (appointment.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Prevent double booking on update
    if (date && time) {
      const conflict = await Appointment.findOne({
        doctorId: appointment.doctorId,
        date,
        time,
        status: { $ne: 'cancelled' },
        _id: { $ne: appointment._id } // Ignore self
      });

      if (conflict) {
        return res.status(400).json({ message: 'New time slot is already booked.' });
      }
    }

    appointment.date = date || appointment.date;
    appointment.time = time || appointment.time;
    
    // Auto-confirm if they reschedule a cancelled one? Usually keep existing or 'confirmed'
    appointment.status = 'confirmed';

    const updatedAppointment = await appointment.save();
    
    // Re-populate to send back comprehensive data
    await updatedAppointment.populate('doctorId', 'name specialty location');

    await Notification.create({
      user: req.user._id,
      message: `Your appointment with ${updatedAppointment.doctorId.name} was rescheduled to ${updatedAppointment.date} at ${updatedAppointment.time}.`,
      type: 'system'
    });

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete/Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Security check: ensure user owns the appointment
    if (appointment.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Soft delete by updating status
    appointment.status = 'cancelled';
    await appointment.save();

    await Notification.create({
      user: req.user._id,
      message: `Your appointment on ${appointment.date} at ${appointment.time} has been cancelled.`,
      type: 'system'
    });

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
