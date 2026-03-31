import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Specialty from '../models/Specialty.js';

export const seedDatabase = async () => {
  try {
    // Check if data already exists (though it shouldn't in memory server on first start)
    const userCount = await User.countDocuments();
    if (userCount > 0) return;

    console.log('Seeding database...');

    // Seed Admin User
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      isAdmin: true,
    });

    // Seed Normal User
    await User.create({
      name: 'Test User',
      email: 'user@example.com',
      password: 'password123',
      isAdmin: false,
    });

    // Seed Specialties
    const specialtiesData = [
      { name: 'Cardiology', description: 'Heart and blood vessel specialists' },
      { name: 'Dermatology', description: 'Skin, hair, and nail specialists' },
      { name: 'Neurology', description: 'Brain and nervous system specialists' },
      { name: 'Pediatrics', description: 'Medical care for infants, children, and adolescents' },
      { name: 'Orthopedics', description: 'Bone and joint specialists' },
      { name: 'Psychiatry', description: 'Mental health specialists' },
      { name: 'Ophthalmology', description: 'Eye and vision specialists' },
      { name: 'Dentistry', description: 'Tooth and mouth specialists' },
      { name: 'General Medicine', description: 'General health and wellness' }
    ];
    await Specialty.create(specialtiesData);

    // Data for random generation
    const firstNames = ['Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Hüseyin', 'Ayşe', 'Fatma', 'Emine', 'Hatice', 'Zeynep', 'Can', 'Murat', 'Selin', 'Deniz', 'Elif', 'Oğuz', 'Burak', 'Merve', 'Gamze', 'Hakan'];
    const lastNames = ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Yıldırım', 'Öztürk', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek', 'Polat', 'Özcan'];
    const cities = [
      { name: 'Istanbul', lat: 41.0082, lng: 28.9784 },
      { name: 'Ankara', lat: 39.9334, lng: 32.8597 },
      { name: 'Izmir', lat: 38.4237, lng: 27.1428 },
      { name: 'Bursa', lat: 40.1826, lng: 29.0660 },
      { name: 'Antalya', lat: 36.8841, longitude: 30.7056 },
      { name: 'Adana', lat: 37.0000, lng: 35.3213 },
      { name: 'Konya', lat: 37.8714, lng: 32.4921 },
      { name: 'Gaziantep', lat: 37.0662, lng: 37.3833 },
      { name: 'Mersin', lat: 36.8121, lng: 34.6415 },
      { name: 'Kayseri', lat: 38.7205, lng: 35.4826 }
    ];
    const times = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

    const doctorsToCreate = [];
    for (let i = 0; i < 50; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const specialty = specialtiesData[Math.floor(Math.random() * specialtiesData.length)].name;
      
      // Randomize coordinates slightly around city center
      const lat = city.lat + (Math.random() - 0.5) * 0.1;
      const lng = (city.lng || city.longitude) + (Math.random() - 0.5) * 0.1;

      // Random availability
      const availableTimes = times.filter(() => Math.random() > 0.3);
      if (availableTimes.length === 0) availableTimes.push('10:00 AM');

      const expYears = Math.floor(Math.random() * 25) + 3;
      const educations = [`Medical Degree - ${city.name} University`, `Specialization in ${specialty} - National Medical Institute`];
      const allAchievements = ["Outstanding Patient Care Award 2023", "Chief Resident Recognition", "Medical Excellence Certificate", "Published 10+ Research Papers"];
      const docAchievements = allAchievements.sort(() => 0.5 - Math.random()).slice(0, 2);
      const allCertifications = ["Board Certified Specialist", "Advanced Life Support (ALS)", "Fellowship Trained", "Robotic Surgery Certification"];
      const docCertifications = allCertifications.sort(() => 0.5 - Math.random()).slice(0, 2);
      const languages = Math.random() > 0.5 ? ["Turkish", "English"] : ["Turkish", "English", "German"];

      doctorsToCreate.push({
        name: `Dr. ${firstName} ${lastName}`,
        specialty,
        location: `${city.name}, Turkey`,
        coordinates: { latitude: lat, longitude: lng },
        availableTimes,
        bio: `Experienced ${specialty} specialist dedicated to providing the best medical care for patients in ${city.name}.`,
        rating: +(4.0 + Math.random() * 1.0).toFixed(1),
        image: `/doctors/doctor_${(i % 10) + 1}.png`,
        experience: `${expYears} Years`,
        education: educations,
        achievements: docAchievements,
        certifications: docCertifications,
        hospital: `${city.name} Central Hospital`,
        languages
      });
    }

    await Doctor.create(doctorsToCreate);

    // Seed Doctor User
    const firstDoctor = await Doctor.findOne();
    if (firstDoctor) {
      await User.create({
        name: 'Doctor User',
        email: 'doctor@example.com',
        password: 'password123',
        isAdmin: false,
        isDoctor: true,
        linkedDoctorId: firstDoctor._id
      });
    }

    console.log(`Database seeded successfully with ${doctorsToCreate.length} doctors!`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
