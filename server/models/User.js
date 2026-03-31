import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
  }],
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  isDoctor: {
    type: Boolean,
    default: false,
  },
  linkedDoctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    default: null,
  },
  // --- Extended Profile Info ---
  image: { type: String, default: '' },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
  height: { type: Number }, // in cm
  weight: { type: Number }, // in kg
  bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'], default: 'Unknown' },
  chronicDiseases: [{ type: String }],
  allergies: [{ type: String }],
  medications: [{ type: String }],
  emergencyContact: {
    name: { type: String },
    phone: { type: String }
  },
  address: { type: String }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return;
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
