import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide doctor name'],
  },
  specialty: {
    type: String,
    required: [true, 'Please provide doctor specialty'],
  },
  location: {
    type: String,
    required: [true, 'Please provide doctor location'],
  },
  availableTimes: {
    type: [String], // e.g. ["09:00 AM", "10:30 AM", "02:00 PM"]
    default: [],
  },
  workingDays: {
    type: [String], // e.g. ["Mon", "Tue", "Wed", "Thu", "Fri"]
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  bio: {
    type: String,
    default: 'Experienced medical professional dedicated to patient care.',
  },
  experience: {
    type: String,
    default: '10+ Years',
  },
  education: {
    type: [String],
    default: [],
  },
  achievements: {
    type: [String],
    default: [],
  },
  certifications: {
    type: [String],
    default: [],
  },
  hospital: {
    type: String,
    default: 'City Central Hospital',
  },
  languages: {
    type: [String],
    default: ['Turkish', 'English'],
  },
  rating: {
    type: Number,
    default: 5.0,
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop',
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  coordinates: {
    latitude: { type: Number, default: 41.0082 }, // Default to Istanbul
    longitude: { type: Number, default: 28.9784 },
  }
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
