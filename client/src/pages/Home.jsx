import { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import { Calendar as CalendarIcon, Clock, Users, MapPin, ChevronRight, Sun, Moon, Star } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [appointments, setAppointments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (user) {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.get('/api/appointments', config);
          setAppointments(data.slice(0, 3)); // Show only the next 3
        } catch (error) {
          console.error('Failed to fetch appointments', error);
        }
      }
    };

    const fetchRecommendations = async (lat, lng) => {
      if (user) {
        setRecLoading(true);
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          let url = '/api/recommendations/personalized';
          if (lat && lng) url += `?lat=${lat}&lng=${lng}`;
          const { data } = await axios.get(url, config);
          setRecommendations(data);
        } catch (error) {
          console.error('Failed to fetch recommendations', error);
        }
        setRecLoading(false);
      }
    };

    const loadData = async () => {
      setLoading(true);
      await fetchAppointments();
      
      // Try to get location for better recommendations
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchRecommendations(pos.coords.latitude, pos.coords.longitude),
          () => fetchRecommendations() // Fallback if blocked
        );
      } else {
        fetchRecommendations();
      }
      setLoading(false);
    };

    loadData();
  }, [user]);

  return (
    <div className={`min-h-[calc(100vh-73px)] flex flex-col py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto w-full">
        {/* Tema geçiş butonu */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow border transition-colors text-sm font-medium
              ${theme === 'dark' ? 'bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}
            aria-label="Tema değiştir"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {theme === 'dark' ? 'Açık Tema' : 'Karanlık Tema'}
          </button>
        </div>
        {/* Welcome Banner */}
        <div className={`rounded-2xl shadow-xl overflow-hidden mb-8 transition-colors duration-300
          ${theme === 'dark' ? 'bg-slate-800' : 'bg-white border border-gray-100'}`}>
          <div className="px-8 py-12 md:p-16 text-center lg:text-left">
            <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-4 transition-colors duration-300
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              {user ? `Welcome back, ${user.name}!` : 'Manage your appointments with ease'}
            </h1>
            <p className={`text-lg md:text-xl max-w-3xl mb-8 transition-colors duration-300
              ${theme === 'dark' ? 'text-indigo-100' : 'text-gray-700'}`}
            >
              RandeVu provides a seamless booking experience for all your scheduling needs.
              {user ? ' View your upcoming sessions or schedule a new one today.' : ' Sign up today to start booking without any hassle!'}
            </p>
            {user ? (
              <Link to="/doctors" className={`inline-block font-semibold px-8 py-3 rounded-lg shadow transition-colors duration-300
                ${theme === 'dark' ? 'bg-white text-indigo-600 hover:bg-gray-50' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-50'}`}
              >
                Book a New Appointment
              </Link>
            ) : (
              <Link to="/register" className={`inline-block font-semibold px-8 py-3 rounded-lg shadow transition-colors duration-300
                ${theme === 'dark' ? 'bg-white text-indigo-600 hover:bg-gray-50' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-50'}`}
              >
                Get Started
              </Link>
            )}
          </div>
        </div>

        {/* Dashboard for Logged-In Users */}
        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`lg:col-span-2 p-8 rounded-xl shadow-sm border transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Upcoming Appointments</h2>
                <Link to="/appointments" className={`text-sm font-medium flex items-center transition-colors duration-300 ${theme === 'dark' ? 'text-indigo-300 hover:text-indigo-100' : 'text-gray-700 hover:text-gray-900'}`}> 
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                </div>
              ) : appointments.length === 0 ? (
                <div className={`text-center py-12 border-2 border-dashed rounded-lg transition-colors duration-300 ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-gray-50'}`}>
                  <CalendarIcon className={`w-12 h-12 mx-auto mb-4 transition-colors duration-300 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-300'}`} />
                  <p className={`text-lg transition-colors duration-300 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>You have no upcoming appointments.</p>
                  <Link to="/doctors" className={`mt-4 inline-block font-medium transition-colors duration-300 ${theme === 'dark' ? 'text-indigo-300 hover:text-indigo-100' : 'text-gray-700 hover:text-gray-900'}`}>
                    Search for doctors
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div key={apt._id} className={`flex items-center p-4 rounded-xl border group transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-700 border-slate-600 hover:border-indigo-900' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}> 
                      <div className="h-14 w-14 rounded-full overflow-hidden mr-4 border-2 border-white shadow-sm">
                        <img src={apt.doctorId?.image} alt={apt.doctorId?.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold transition-colors duration-300 group-hover:text-gray-900 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{apt.doctorId?.name}</h4>
                        <div className={`flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm transition-colors duration-300 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                          <span className="flex items-center"><CalendarIcon className={`w-4 h-4 mr-1 ${theme === 'dark' ? 'text-indigo-400' : 'text-gray-400'}`} /> {apt.date}</span>
                          <span className="flex items-center"><Clock className={`w-4 h-4 mr-1 ${theme === 'dark' ? 'text-indigo-400' : 'text-gray-400'}`} /> {apt.time}</span>
                          <span className="flex items-center"><MapPin className={`w-4 h-4 mr-1 ${theme === 'dark' ? 'text-indigo-400' : 'text-gray-400'}`} /> {apt.doctorId?.location}</span>
                        </div>
                        {apt.note && (
                          <p className={`mt-2 text-sm italic line-clamp-1 transition-colors duration-300 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Note: {apt.note}</p>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                        apt.status === 'confirmed'
                          ? theme === 'dark'
                            ? 'bg-green-900 text-green-200'
                            : 'bg-green-50 text-green-800'
                          : theme === 'dark'
                            ? 'bg-red-900 text-red-200'
                            : 'bg-red-50 text-red-800'
                      }`}>
                        {apt.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions / Stats */}
            <div className="space-y-6">
              {/* Recommended Section */}
              <div className={`p-6 rounded-xl shadow-sm border transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-bold flex items-center transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Star className="w-5 h-5 mr-2 text-yellow-500 fill-yellow-500" /> Recommended for You
                  </h3>
                  <Link to="/doctors" className={`text-xs font-medium transition-colors duration-300 ${theme === 'dark' ? 'text-indigo-300' : 'text-emerald-600'}`}>View More</Link>
                </div>
                
                {recLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.slice(0, 3).map((doc) => (
                      <Link to={`/doctors/${doc._id}`} key={doc._id} className="block group">
                        <div className={`flex items-center p-3 rounded-xl border transition-all duration-300 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 hover:border-indigo-500' : 'bg-gray-50 border-gray-100 hover:border-emerald-200'}`}>
                          <img src={doc.image} alt={doc.name} className="h-10 w-10 rounded-full object-cover mr-3" />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{doc.name}</p>
                            <p className="text-xs text-slate-400">{doc.specialty}</p>
                          </div>
                          <div className="flex items-center text-yellow-500">
                            <Star className="w-3 h-3 fill-yellow-500 mr-1" />
                            <span className="text-xs font-bold">{doc.rating}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4 italic">No recommendations yet. Start by booking an appointment!</p>
                )}
              </div>

              <div className={`p-6 rounded-xl shadow-sm border transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                <h3 className={`text-lg font-bold mb-4 transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/doctors"
                    className={`flex items-center p-3 rounded-lg transition-colors font-medium duration-300
                      ${theme === 'dark' ? 'bg-indigo-900 text-indigo-200 hover:bg-indigo-800' : 'bg-gray-50 text-gray-900 hover:bg-gray-100'}`}
                  >
                    <Users className="w-5 h-5 mr-3" />
                    <span>Browse Doctors</span>
                  </Link>
                  <Link to="/favorites" className={`flex items-center p-3 rounded-lg transition-colors font-medium duration-300
                    ${theme === 'dark' ? 'bg-rose-900 text-rose-200 hover:bg-rose-800' : 'bg-gray-50 text-gray-900 hover:bg-gray-100'}`}
                  >
                    <Clock className="w-5 h-5 mr-3" />
                    <span>My Favorites</span>
                  </Link>
                  <Link to="/notifications" className={`flex items-center p-3 rounded-lg transition-colors font-medium duration-300
                    ${theme === 'dark' ? 'bg-blue-900 text-blue-200 hover:bg-blue-800' : 'bg-gray-50 text-gray-900 hover:bg-gray-100'}`}
                  >
                    <CalendarIcon className="w-5 h-5 mr-3" />
                    <span>Notifications</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guest Features Highlights */}
        {!user && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { title: 'Easy Scheduling', desc: 'Pick a date and time that works perfectly for you.', icon: <CalendarIcon className="w-8 h-8 text-indigo-500 mb-4" /> },
              { title: 'Reminders', desc: 'Get automated notifications so you never miss a slot.', icon: <Clock className="w-8 h-8 text-indigo-500 mb-4" /> },
              { title: 'Any Device', desc: 'Access your appointments on the go via any browser.', icon: <Users className="w-8 h-8 text-indigo-500 mb-4" /> },
            ].map((feature, i) => (
              <div key={i} className={`p-8 rounded-xl shadow-sm border transform transition-all hover:scale-105 duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                {feature.icon}
                <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                <p className={`transition-colors duration-300 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>{feature.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
