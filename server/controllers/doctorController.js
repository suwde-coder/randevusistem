import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { getLevenshteinDistance } from '../utils/stringUtils.js';
import { calculateDistance } from '../utils/geoUtils.js';

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

export const getSymptomKeywords = (req, res) => {
  const allKeywords = new Set();
  Object.values(symptomSpecialtyMapping).forEach(keywords => {
    keywords.forEach(kw => allKeywords.add(kw));
  });
  res.json(Array.from(allKeywords).sort());
};

// @desc    Fetch all doctors
// @route   GET /api/doctors
// @access  Public
export const getDoctors = async (req, res) => {
  try {
    const { specialty, location } = req.query;
    
    // Build query object
    let query = {};
    
    if (specialty) {
      query.specialty = { $regex: specialty, $options: 'i' };
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const doctors = await Doctor.find(query);
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single doctor
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (doctor) {
      res.json(doctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Invalid doctor ID' });
  }
};

// @desc    Create a doctor
// @route   POST /api/doctors
// @access  Private/Admin
export const createDoctor = async (req, res) => {
  try {
    const { name, specialty, location, image, bio, availableTimes, workingDays } = req.body;

    const doctor = new Doctor({
      name: name || 'Sample Name',
      specialty: specialty || 'General',
      location: location || 'Sample Location',
      image: image || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d',
      bio: bio || 'Sample bio',
      availableTimes: availableTimes || ["09:00 AM", "10:00 AM", "11:00 AM"],
      workingDays: workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    });

    const createdDoctor = await doctor.save();
    res.status(201).json(createdDoctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a doctor
// @route   PUT /api/doctors/:id
// @access  Private/Admin
export const updateDoctor = async (req, res) => {
  try {
    const { name, specialty, location, image, bio, availableTimes, workingDays } = req.body;

    const doctor = await Doctor.findById(req.params.id);

    if (doctor) {
      doctor.name = name || doctor.name;
      doctor.specialty = specialty || doctor.specialty;
      doctor.location = location || doctor.location;
      doctor.image = image || doctor.image;
      doctor.bio = bio || doctor.bio;
      doctor.availableTimes = availableTimes || doctor.availableTimes;
      doctor.workingDays = workingDays || doctor.workingDays;

      const updatedDoctor = await doctor.save();
      res.json(updatedDoctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a doctor
// @route   DELETE /api/doctors/:id
// @access  Private/Admin
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (doctor) {
      await Doctor.deleteOne({ _id: doctor._id });
      res.json({ message: 'Doctor removed' });
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recommended doctors based on user history & selection
// @route   GET /api/doctors/recommendations
// @access  Private
export const getRecommendedDoctors = async (req, res) => {
  try {
    const { specialty } = req.query;
    let targetSpecialties = [];

    if (specialty) {
      targetSpecialties.push(new RegExp(specialty, 'i'));
    } else if (req.user) {
      // Analyze user's past appointments
      const appointments = await Appointment.find({ userId: req.user._id }).populate('doctorId');
      const specCounts = {};
      
      appointments.forEach(apt => {
        if (apt.doctorId && apt.doctorId.specialty) {
          specCounts[apt.doctorId.specialty] = (specCounts[apt.doctorId.specialty] || 0) + 1;
        }
      });
      
      targetSpecialties = Object.keys(specCounts).sort((a,b) => specCounts[b] - specCounts[a]);
    }

    let recommended = [];
    if (targetSpecialties.length > 0) {
      // Find matches for top favored specialties
      recommended = await Doctor.find({ specialty: { $in: targetSpecialties } })
        .sort({ rating: -1 })
        .limit(3);
    } 
    
    if (recommended.length === 0) {
      // Fallback: Global top rated
      recommended = await Doctor.find({}).sort({ rating: -1 }).limit(3);
    }

    res.json(recommended);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctors by symptoms
// @route   POST /api/doctors/symptoms
// @access  Public
export const getDoctorsBySymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms) {
      return res.json({ specialties: [], doctors: [] });
    }

    // 1. Parse multiple symptoms
    const inputSymptoms = symptoms.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    if (inputSymptoms.length === 0) return res.json({ specialties: [], doctors: [] });

    const specialtyScores = {};

    // 2. Calculate scores with fuzzy matching
    for (const inputSymptom of inputSymptoms) {
      for (const [specialty, keywords] of Object.entries(symptomSpecialtyMapping)) {
        let matched = false;
        
        for (const keyword of keywords) {
          // Exact sub-match
          if (inputSymptom.includes(keyword) || keyword.includes(inputSymptom)) {
             matched = true;
          } else {
             // Fuzzy match (Levenshtein distance)
             if (inputSymptom.length > 3 && keyword.length > 3) {
                const distance = getLevenshteinDistance(inputSymptom, keyword);
                if (distance <= 2 || (distance <= 1 && keyword.length <= 5)) {
                   matched = true;
                }
             }
          }

          if (matched) {
            specialtyScores[specialty] = (specialtyScores[specialty] || 0) + 1;
            break; // matched this specialty for the current symptom, move to next specialty
          }
        }
      }
    }

    // 3. Sort specialties by score and determine confidence
    let scoredSpecialties = Object.entries(specialtyScores)
      .map(([name, score]) => {
         let confidence = 'Low Match';
         let rawRatio = score / inputSymptoms.length;
         if (rawRatio >= 0.8) confidence = 'High Match';
         else if (rawRatio >= 0.4) confidence = 'Medium Match';
         
         return { name, score, confidence };
      })
      .sort((a, b) => b.score - a.score);

    if (scoredSpecialties.length === 0) {
      scoredSpecialties.push({ name: 'General', score: 0, confidence: 'Fallback' });
    }

    const targetSpecialties = scoredSpecialties.map(s => new RegExp(s.name, 'i'));

    // Find doctors with matched specialties
    const recommendedDoctors = await Doctor.find({ specialty: { $in: targetSpecialties } })
      .sort({ rating: -1 })
      .limit(6);

    res.json({
      specialties: scoredSpecialties,
      doctors: recommendedDoctors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available slots for a doctor on a specific date
// @route   GET /api/doctors/:id/slots
// @access  Public
export const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if the requested date is one of the doctor's working days
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    
    if (!doctor.workingDays.includes(dayOfWeek)) {
      return res.json({ date, availableSlots: [], isWorkingDay: false, message: `Doctor does not work on ${dayOfWeek}s` });
    }

    // Find booked appointments for this doctor on this date
    const bookedAppointments = await Appointment.find({
      doctorId: doctor._id,
      date,
      status: { $ne: 'cancelled' }
    });

    const bookedTimes = bookedAppointments.map(app => app.time);

    // Filter available times
    let availableSlots = doctor.availableTimes.filter(time => !bookedTimes.includes(time));

    // If the date is today, filter out past slots
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      availableSlots = availableSlots.filter(slot => {
        // Parse "HH:MM AM/PM"
        const [time, period] = slot.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        const slotMinutes = hours * 60 + minutes;
        return slotMinutes > currentMinutes + 30; // 30 minutes buffer
      });
    }

    res.json({ date, availableSlots, isWorkingDay: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get nearby doctors
// @route   GET /api/doctors/nearby
// @access  Public
export const getNearbyDoctors = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query; // radius in km, default 50km

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const doctors = await Doctor.find({});

    const nearbyDoctors = doctors
      .map(doctor => {
        const distance = calculateDistance(
          userLat,
          userLng,
          doctor.coordinates.latitude,
          doctor.coordinates.longitude
        );
        return { ...doctor._doc, distance };
      })
      .filter(doctor => doctor.distance <= parseFloat(radius))
      .sort((a, b) => a.distance - b.distance);

    res.json(nearbyDoctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

