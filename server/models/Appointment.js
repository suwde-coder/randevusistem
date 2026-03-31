import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
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
  date: {
    type: String, // String format like YYYY-MM-DD
    required: [true, 'Please provide an appointment date'],
  },
  time: {
    type: String, // e.g., '10:30 AM'
    required: [true, 'Please provide an appointment time'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'confirmed',
  },
  note: {
    type: String,
    trim: true,
    maxLength: [500, 'Note cannot exceed 500 characters'],
  },
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
