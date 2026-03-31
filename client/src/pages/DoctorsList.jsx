import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, UserSquare, Star, Heart, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import DoctorMap from '../components/DoctorMap';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [symptomLoading, setSymptomLoading] = useState(false);
  const [symptomSpecialties, setSymptomSpecialties] = useState([]);
  const [availableKeywords, setAvailableKeywords] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([41.0082, 28.9784]); // Default to Istanbul
  const [nearbyLoading, setNearbyLoading] = useState(false);

  const { user, setUser } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const fetchDoctors = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/doctors?specialty=${specialty}&location=${location}`);
      setDoctors(data);

      if (user) {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const recUrl = specialty ? `/api/doctors/recommendations?specialty=${specialty}` : `/api/doctors/recommendations`;
        const { data: recData } = await axios.get(recUrl, config);
        setRecommended(recData);
      }
    } catch (error) {
      console.error('Failed to fetch doctors', error);
    }
    setLoading(false);
  };

  const checkSymptoms = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    
    setSymptomLoading(true);
    try {
      const { data } = await axios.post('/api/doctors/symptoms', { symptoms });
      setSymptomSpecialties(data.specialties || []);
      setDoctors(data.doctors || []);
      if (data.specialties && data.specialties.length > 0 && data.specialties[0].name !== 'General') {
        toast.success(`Found ${data.specialties.length} matching specialties`);
      } else {
        toast.error('Could not match symptoms highly. Try different keywords.');
      }
    } catch (error) {
      toast.error('Failed to analyze symptoms');
    }
    setSymptomLoading(false);
  };

  const findNearbyDoctors = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setNearbyLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ latitude, longitude });
      setMapCenter([latitude, longitude]);

      try {
        const { data } = await axios.get(`/api/doctors/nearby?lat=${latitude}&lng=${longitude}&radius=500`);
        setDoctors(data);
        if (data.length > 0) {
          toast.success(`Found ${data.length} doctors near you!`);
        } else {
          toast.error('No doctors found near your location.');
        }
      } catch (error) {
        toast.error('Failed to fetch nearby doctors');
      }
      setNearbyLoading(false);
    }, (error) => {
      toast.error('Unable to retrieve your location');
      setNearbyLoading(false);
    });
  };

  useEffect(() => {
    fetchDoctors();
    const fetchKeywords = async () => {
      try {
        const { data } = await axios.get('/api/doctors/symptom-keywords');
        setAvailableKeywords(data || []);
      } catch (err) {
        console.error('Failed to fetch keywords', err);
      }
    };
    fetchKeywords();
  }, []);

  // Autocomplete logic
  const currentWord = symptoms.split(',').pop()?.trim().toLowerCase() || '';
  const filteredKeywords = currentWord.length >= 2 
    ? availableKeywords.filter(kw => kw.toLowerCase().includes(currentWord) && kw.toLowerCase() !== currentWord)
    : [];

  const handleAutocompleteSelect = (keyword) => {
    const parts = symptoms.split(',');
    parts.pop(); // remove the partial word
    const newSymptoms = parts.length > 0 
      ? parts.join(', ') + ', ' + keyword + ', ' 
      : keyword + ', ';
    setSymptoms(newSymptoms);
    setShowAutocomplete(false);
  };

  const toggleFavorite = async (e, doctorId) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to favorite a doctor');
      navigate('/login');
      return;
    }
    
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`/api/auth/favorites/${doctorId}`, {}, config);
      
      const updatedUser = { ...user, favorites: data.favorites };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success(data.message);
    } catch (err) {
      toast.error('Could not modify favorites');
    }
  };

  return (
    <div className={`min-h-[calc(100vh-73px)] py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}> 
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Search Header */}
        <div className={`rounded-2xl shadow-xl overflow-hidden mb-8 p-8 border transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}> 
          <h1 className={`text-3xl font-extrabold tracking-tight mb-6 transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}> 
            Find Your Specialist
          </h1>
          <form onSubmit={fetchDoctors} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`h-5 w-5 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-400' : 'text-emerald-400'}`} />
              </div>
              <input
                type="text"
                placeholder="Search specialty (e.g. Cardiologist)"
                className={`block w-full pl-10 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300
                  ${theme === 'dark' ? 'bg-slate-900 border border-slate-700 text-slate-50 placeholder-slate-400 focus:ring-indigo-500' : 'bg-white border border-emerald-200 text-emerald-900 placeholder-emerald-400 focus:ring-emerald-300'}`}
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </div>
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className={`h-5 w-5 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-400' : 'text-emerald-400'}`} />
              </div>
              <input
                type="text"
                placeholder="Search location (e.g. New York)"
                className={`block w-full pl-10 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300
                  ${theme === 'dark' ? 'bg-slate-900 border border-slate-700 text-slate-50 placeholder-slate-400 focus:ring-indigo-500' : 'bg-white border border-emerald-200 text-emerald-900 placeholder-emerald-400 focus:ring-emerald-300'}`}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className={`font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg duration-300
                ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 shadow-emerald-200/30'}`}
            >
              Search
            </button>
            <button
              type="button"
              onClick={findNearbyDoctors}
              disabled={nearbyLoading}
              className={`font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg duration-300 flex items-center justify-center
                ${theme === 'dark' ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/30' : 'bg-rose-100 hover:bg-rose-200 text-rose-900 shadow-rose-200/30'}
                ${nearbyLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <MapPin className="w-5 h-5 mr-2" />
              {nearbyLoading ? 'Locating...' : 'Find Near Me'}
            </button>
          </form>
        </div>

        {/* Map Section */}
        <DoctorMap doctors={doctors} center={mapCenter} theme={theme} />

        {/* Symptom Checker */}
        <div className={`rounded-2xl shadow-xl overflow-hidden mb-8 p-8 border transition-colors duration-300 ${theme === 'dark' ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
          <h2 className={`text-2xl font-bold tracking-tight mb-4 flex items-center transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-indigo-900'}`}> 
            <Activity className="w-6 h-6 mr-2 text-indigo-500" /> Not sure what you need? Describe your symptoms
          </h2>
          <form onSubmit={checkSymptoms} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="e.g. chest pain, severe headache, skin rash, fever..."
                className={`block w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300
                  ${theme === 'dark' ? 'bg-slate-800 border border-slate-700 text-slate-50 placeholder-slate-400 focus:ring-indigo-500' : 'bg-white border border-indigo-200 text-indigo-900 placeholder-indigo-400 focus:ring-indigo-300'}`}
                value={symptoms}
                onChange={(e) => {
                  setSymptoms(e.target.value);
                  setShowAutocomplete(true);
                }}
                onFocus={() => setShowAutocomplete(true)}
                onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
              />
              
              {/* Autocomplete Dropdown */}
              {showAutocomplete && filteredKeywords.length > 0 && (
                <div className={`absolute z-20 w-full mt-1 rounded-md shadow-lg border max-h-60 overflow-y-auto ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                  {filteredKeywords.map((kw, idx) => (
                    <div 
                      key={idx}
                      className={`px-4 py-2 cursor-pointer transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-indigo-50 text-indigo-900'}`}
                      onClick={() => handleAutocompleteSelect(kw)}
                    >
                      {kw}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={symptomLoading}
              className={`font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg duration-300 flex items-center justify-center
                ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30' : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-200/30'}
                ${symptomLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Activity className={`w-5 h-5 mr-2 ${symptomLoading ? 'animate-pulse' : ''}`} />
              {symptomLoading ? 'Analyzing...' : 'Analyze Symptoms'}
            </button>
          </form>

          {/* Symptom Results */}
          {symptomSpecialties.length > 0 && symptomSpecialties[0].name !== 'General' && (
             <div className="mt-8 animate-in fade-in slide-in-from-top-2 duration-500">
                <h3 className={`text-lg font-bold mb-4 flex items-center ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-800'}`}>
                  <Activity className="w-5 h-5 mr-2" /> Top Recommended Specialties
                </h3>
                <div className="flex flex-wrap gap-4">
                  {symptomSpecialties.map((spec, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-800/80 border-indigo-500/30' : 'bg-white border-indigo-100 shadow-sm'} w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.33%-1rem)]`}>
                      <div>
                         <p className={`font-bold text-lg leading-tight ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>{spec.name}</p>
                         <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Relevance Score: {spec.score}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-bold ${
                        spec.confidence === 'High Match' ? 'bg-emerald-500/20 text-emerald-500' :
                        spec.confidence === 'Medium Match' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-slate-500/20 text-slate-500'
                      }`}>
                         {spec.confidence}
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          )}
        </div>

        {/* Recommended Grid */}
        {recommended.length > 0 && (
          <div className="mb-12">
            <h2 className={`text-2xl font-bold mb-6 flex items-center transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <Star className="w-6 h-6 text-yellow-500 mr-2" /> Recommended For You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommended.map(doctor => (
                <Link to={`/doctors/${doctor._id}`} key={`rec-${doctor._id}`}>
                  <div className={`rounded-xl overflow-hidden shadow-lg border transform transition-all duration-300 hover:-translate-y-1 group relative cursor-pointer pt-8 ${theme === 'dark' ? 'bg-slate-800 border-indigo-500/30 hover:shadow-indigo-500/20' : 'bg-white border-emerald-100 hover:shadow-emerald-200/20'}`}>
                    <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded shadow-md z-10 transition-colors duration-300 ${theme === 'dark' ? 'bg-indigo-600/90 text-white' : 'bg-emerald-100 text-emerald-900'}`}>Top Match</div>
                    <div className="absolute top-14 right-2 z-10">
                      <button 
                        onClick={(e) => toggleFavorite(e, doctor._id)}
                        className="p-2 transition-transform hover:scale-110"
                      >
                        <Heart className={`w-6 h-6 drop-shadow-lg transition-colors ${
                          user?.favorites?.includes(doctor._id) 
                            ? 'text-rose-500 fill-current' 
                            : theme === 'dark' ? 'text-white hover:text-rose-400' : 'text-emerald-400 hover:text-rose-400'
                        }`} />
                      </button>
                    </div>
                    <div className="flex p-4 gap-4 items-center">
                      <img src={doctor.image} alt={doctor.name} className={`w-16 h-16 rounded-full object-cover border-2 transition-colors duration-300 ${theme === 'dark' ? 'border-slate-700' : 'border-emerald-200'}`} />
                      <div>
                        <h4 className={`text-lg font-bold group-hover:text-emerald-600 transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{doctor.name}</h4>
                        <p className={`text-sm font-medium transition-colors duration-300 ${theme === 'dark' ? 'text-indigo-400' : 'text-emerald-500'}`}>{doctor.specialty}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Doctor Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : doctors.length === 0 ? (
          <div className={`text-center py-20 rounded-2xl border transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
            <UserSquare className={`mx-auto h-16 w-16 mb-4 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500' : 'text-emerald-300'}`} />
            <h3 className={`text-xl font-medium transition-colors duration-300 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>No doctors found</h3>
            <p className={`mt-2 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map(doctor => (
              <Link to={`/doctors/${doctor._id}`} key={doctor._id}>
                <div className={`rounded-xl overflow-hidden shadow-lg border transform transition-all duration-300 hover:-translate-y-1 group relative cursor-pointer ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:shadow-indigo-500/20' : 'bg-white border-emerald-100 hover:shadow-emerald-200/20'}`}> 
                  
                  <div className="absolute top-4 right-4 z-10">
                    <button 
                      onClick={(e) => toggleFavorite(e, doctor._id)}
                      className="p-2 transition-transform hover:scale-110"
                    >
                      <Heart className={`w-7 h-7 drop-shadow-lg transition-colors ${
                        user?.favorites?.includes(doctor._id) 
                          ? 'text-rose-500 fill-current' 
                          : 'text-white hover:text-rose-400'
                      }`} />
                    </button>
                  </div>

                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={doctor.image} 
                      alt={doctor.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className={`absolute top-4 right-4 px-2 py-1 flex items-center gap-1 rounded text-sm font-semibold transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900/80 text-yellow-400' : 'bg-emerald-50 text-yellow-600'}`}>
                      <Star className="w-4 h-4 fill-current" /> {doctor.rating}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className={`text-xl font-bold mb-1 group-hover:text-emerald-600 transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{doctor.name}</h3>
                    <p className={`font-medium mb-4 transition-colors duration-300 ${theme === 'dark' ? 'text-indigo-400' : 'text-emerald-500'}`}>{doctor.specialty}</p>
                    <div className={`flex items-center mb-2 text-sm transition-colors duration-300 ${theme === 'dark' ? 'text-slate-400' : 'text-emerald-700'}`}>
                      <MapPin className={`w-4 h-4 mr-2 transition-colors duration-300 ${theme === 'dark' ? '' : 'text-emerald-400'}`} /> {doctor.location}
                      {doctor.distance !== undefined && (
                        <span className="ml-2 font-bold text-indigo-500">
                          ({doctor.distance.toFixed(1)} km away)
                        </span>
                      )}
                    </div>
                    <div className={`mt-4 pt-4 border-t transition-colors duration-300 ${theme === 'dark' ? 'border-slate-700' : 'border-emerald-100'}`}>
                      <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-300' : 'text-emerald-700'}`}>Available Slots:</p>
                      <div className="flex flex-wrap gap-2">
                        {doctor.availableTimes.slice(0, 3).map((time, idx) => (
                          <span key={idx} className={`text-xs px-2 py-1 rounded transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-700 text-slate-200' : 'bg-emerald-50 text-emerald-900'}`}>
                            {time}
                          </span>
                        ))}
                        {doctor.availableTimes.length > 3 && (
                          <span className={`text-xs px-2 py-1 rounded transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-700 text-slate-200' : 'bg-emerald-50 text-emerald-900'}`}>+{doctor.availableTimes.length - 3}</span>
                        )}
                        {doctor.availableTimes.length === 0 && (
                          <span className={`text-xs transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500' : 'text-emerald-300'}`}>None available</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsList;
