import mongoose from 'mongoose';

const specialtySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: '',
  },
}, { timestamps: true });

const Specialty = mongoose.model('Specialty', specialtySchema);
export default Specialty;
