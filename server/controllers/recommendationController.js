import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { calculateDistance } from '../utils/geoUtils.js';

// Existing symptom mapping for reference
const symptomSpecialtyMapping = {
  'Cardiologist': ['heart', 'chest pain', 'blood pressure', 'palpitation', 'pulse', 'cardiac'],
  'Dermatologist': ['skin', 'rash', 'acne', 'mole', 'itch', 'hair', 'nail'],
  'Neurologist': ['headache', 'migraine', 'dizzy', 'dizziness', 'numb', 'seizure', 'memory'],
  'Orthopedist': ['bone', 'joint', 'back pain', 'knee', 'spine', 'fracture', 'muscle', 'arthritis'],
  'Pediatrician': ['child', 'baby', 'kid', 'toddler', 'infant'],
  'Psychiatrist': ['anxiety', 'depress', 'stress', 'mental', 'sleep', 'mood'],
  'Ophthalmologist': ['eye', 'vision', 'sight', 'blind', 'blur'],
  'Dentist': ['tooth', 'teeth', 'gum', 'jaw', 'mouth', 'dental', 'cavity'],
  'General': ['fever', 'cold', 'cough', 'flu', 'tired', 'fatigue', 'weak']
};

// @desc    Get personalized smart recommendations
// @route   GET /api/recommendations/personalized
// @access  Private
export const getPersonalizedRecommendations = async (req, res) => {
  try {
    const { lat, lng, symptoms } = req.query;
    const userId = req.user._id;

    // 1. Gather User History
    const user = await User.findById(userId).populate('favorites');
    const pastAppointments = await Appointment.find({ userId }).populate('doctorId');
    
    const pastDoctorIds = new Set(pastAppointments.map(a => a.doctorId?._id?.toString()).filter(Boolean));
    const pastSpecialties = pastAppointments.map(a => a.doctorId?.specialty).filter(Boolean);
    const favoriteIds = new Set(user.favorites.map(f => f._id.toString()));

    // 2. Symptom Analysis (if provided)
    let symptomMatchedSpecialties = new Set();
    if (symptoms) {
      const inputSymptoms = symptoms.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
      for (const input of inputSymptoms) {
        for (const [spec, keywords] of Object.entries(symptomSpecialtyMapping)) {
          if (keywords.some(kw => input.includes(kw) || kw.includes(input))) {
            symptomMatchedSpecialties.add(spec);
          }
        }
      }
    }

    // 3. Fetch Candidate Doctors
    const allDoctors = await Doctor.find({});

    // 4. Scoring Algorithm
    const scoredDoctors = allDoctors.map(doctor => {
      let score = 0;
      const docIdStr = doctor._id.toString();

      // Factor 1: Rating (0-5 points)
      score += (doctor.rating || 0);

      // Factor 2: Proximity (up to 5 points)
      if (lat && lng && doctor.coordinates) {
        const dist = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          doctor.coordinates.latitude,
          doctor.coordinates.longitude
        );
        // Scores higher if closer: 5 / (1 + distance_km/5)
        score += 5 / (1 + dist / 5);
      }

      // Factor 3: User Favorites (large boost)
      if (favoriteIds.has(docIdStr)) {
        score += 10;
      }

      // Factor 4: Past Interactions
      if (pastDoctorIds.has(docIdStr)) {
        score += 5;
      }
      
      // Factor 5: Specialty Preference/Matches
      if (pastSpecialties.includes(doctor.specialty)) {
        score += 3;
      }

      // Factor 6: Symptom Match (highest priority)
      if (symptomMatchedSpecialties.has(doctor.specialty)) {
        score += 15;
      }

      return { ...doctor._doc, score };
    });

    // 5. Sort by score and return top results
    const recommendations = scoredDoctors
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
