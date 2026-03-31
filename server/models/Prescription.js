import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required']
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required']
  },
  usage: {
    type: String,
    required: [true, 'Usage instructions are required']
  }
});

const prescriptionSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Doctor',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Appointment',
    },
    medicines: [medicineSchema],
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
