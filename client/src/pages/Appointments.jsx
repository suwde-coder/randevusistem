import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import { Calendar, Clock, MapPin, XCircle, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // stores the id of appointment being modified

  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get('/api/appointments', config);
      setAppointments(data);
    } catch (err) {
      setError('Failed to load your appointments.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchAppointments();
    }
  }, [user, navigate]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    setActionLoading(id);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/appointments/${id}`, config);
      
      // Update state
      setAppointments(appointments.map(app => 
        app._id === id ? { ...app, status: 'cancelled' } : app
      ));
    } catch (err) {
      alert('Failed to cancel appointment');
    }
    setActionLoading(null);
  };

  const openRescheduleForm = (apt) => {
    setReschedulingId(apt._id);
    setRescheduleDate(apt.date || '');
    setRescheduleTime(apt.time || '');
    setAvailableSlots([]);
  };

  useEffect(() => {
    const fetchSlots = async () => {
      if (!reschedulingId || !rescheduleDate) return;
      
      const apt = appointments.find(a => a._id === reschedulingId);
      if (!apt || !apt.doctorId) return;

      setFetchingSlots(true);
      try {
        const { data } = await axios.get(`/api/doctors/${apt.doctorId._id}/slots?date=${rescheduleDate}`);
        
        // Include current time if the date hasn't changed
        let slots = data.availableSlots || [];
        if (rescheduleDate === apt.date && apt.time && !slots.includes(apt.time)) {
           slots.push(apt.time);
           // simple string sort is usually fine for these times (e.g. 09:00 AM, 10:00 AM)
           slots.sort(); 
        }
        setAvailableSlots(slots);
        
        if (rescheduleDate !== apt.date) {
           setRescheduleTime(null);
        }
      } catch (err) {
        console.error('Failed to fetch available slots for rescheduling');
      }
      setFetchingSlots(false);
    };
    fetchSlots();
  }, [rescheduleDate, reschedulingId, appointments]);

  const submitReschedule = async (id) => {
    if (!rescheduleDate || !rescheduleTime) return;

    setActionLoading(id);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/appointments/${id}`, {
        date: rescheduleDate,
        time: rescheduleTime
      }, config);
      
      setAppointments(appointments.map(app => 
        app._id === id ? data : app
      ));
      setReschedulingId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule appointment');
    }
    setActionLoading(null);
  };

  if (loading) return (
    <div className="min-h-[calc(100vh-73px)] py-20 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className={`min-h-[calc(100vh-73px)] py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
      <div className="max-w-5xl mx-auto w-full">
        <h1 className={`text-3xl font-extrabold tracking-tight mb-8 flex items-center transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <Calendar className={`w-8 h-8 mr-3 transition-colors duration-300 ${theme === 'dark' ? 'text-indigo-500' : 'text-emerald-500'}`} />
          My Appointments
        </h1>

        {error && (
          <div className={`p-4 rounded-lg flex items-center mb-8 border transition-colors duration-300 ${theme === 'dark' ? 'bg-red-900/40 border-red-500/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
            <AlertCircle className={`w-5 h-5 mr-3 ${theme === 'dark' ? '' : 'text-red-400'}`} />
            <p>{error}</p>
          </div>
        )}

        {appointments.length === 0 ? (
          <div className={`rounded-2xl p-10 text-center border shadow-xl transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
            <Calendar className={`w-16 h-16 mx-auto mb-4 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-600' : 'text-emerald-300'}`} />
            <h3 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>No appointments yet</h3>
            <p className={`mb-6 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Looks like you haven't booked any sessions.</p>
            <button 
              onClick={() => navigate('/doctors')}
              className={`font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg duration-300 ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'}`}
            >
              Find a Doctor
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {appointments.map((apt) => (
              <div 
                key={apt._id} 
                className={`bg-slate-800 rounded-xl overflow-hidden shadow-lg border transition-colors ${
                  apt.status === 'cancelled' ? 'border-red-900/50 opacity-75' : 'border-slate-700 hover:border-indigo-500/50'
                }`}
              >
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 h-48 md:h-auto shrink-0 bg-slate-900">
                    {apt.doctorId && (
                      <img 
                        src={apt.doctorId.image} 
                        alt={apt.doctorId.name} 
                        className={`w-full h-full object-cover ${apt.status === 'cancelled' && 'grayscale'}`}
                      />
                    )}
                  </div>
                  
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-1">
                            {apt.doctorId?.name || 'Unknown Doctor'}
                          </h2>
                          <p className="text-indigo-400 font-medium">{apt.doctorId?.specialty}</p>
                        </div>
                        
                        <div className={`px-3 py-1 rounded-full text-sm font-bold w-max flex items-center ${
                          apt.status === 'confirmed' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/30' : 
                          apt.status === 'pending' ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-500/30' : 
                          'bg-red-900/40 text-red-400 border border-red-500/30'
                        }`}>
                          {apt.status === 'confirmed' && <CheckCircle className="w-4 h-4 mr-1.5" />}
                          {apt.status === 'cancelled' && <XCircle className="w-4 h-4 mr-1.5" />}
                          {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className={`flex items-center transition-colors duration-300 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                          <Calendar className={`w-5 h-5 mr-3 shrink-0 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500' : 'text-emerald-400'}`} />
                          <span>{apt.date}</span>
                        </div>
                        <div className={`flex items-center transition-colors duration-300 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                          <Clock className={`w-5 h-5 mr-3 shrink-0 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500' : 'text-emerald-400'}`} />
                          <span className={`font-semibold transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-emerald-700'}`}>{apt.time}</span>
                        </div>
                        <div className={`flex items-center sm:col-span-2 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                          <MapPin className={`w-5 h-5 mr-3 shrink-0 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500' : 'text-emerald-400'}`} />
                          <span>{apt.doctorId?.location || 'Unknown Location'}</span>
                        </div>
                      </div>

                      {apt.note && (
                        <div className={`rounded-lg p-4 border mb-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-emerald-50 border-emerald-100'}`}>
                          <p className={`text-xs font-bold uppercase tracking-widest mb-1 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500' : 'text-emerald-700'}`}>Your Note:</p>
                          <p className={`italic transition-colors duration-300 ${theme === 'dark' ? 'text-slate-300' : 'text-emerald-900'}`}>"{apt.note}"</p>
                        </div>
                      )}
                    </div>

                    {apt.status !== 'cancelled' && reschedulingId !== apt._id && (
                      <div className={`flex flex-wrap gap-3 pt-4 border-t transition-colors duration-300 ${theme === 'dark' ? 'border-slate-700' : 'border-emerald-100'}`}>
                        <button 
                          disabled={actionLoading === apt._id}
                          onClick={() => openRescheduleForm(apt)}
                          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors text-sm duration-300 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'}`}
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${actionLoading === apt._id && !reschedulingId ? 'animate-spin' : ''}`} />
                          Reschedule
                        </button>
                        <button 
                          disabled={actionLoading === apt._id}
                          onClick={() => handleCancel(apt._id)}
                          className={`flex items-center px-4 py-2 border rounded-lg font-medium transition-colors text-sm duration-300 ${theme === 'dark' ? 'bg-red-900/40 hover:bg-red-800/40 text-red-400 border-red-500/30' : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'}`}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel Booking
                        </button>
                      </div>
                    )}

                    {reschedulingId === apt._id && (
                      <div className={`mt-4 pt-4 border-t transition-colors duration-300 ${theme === 'dark' ? 'border-slate-700' : 'border-emerald-100'} animate-in fade-in slide-in-from-top-2`}>
                        <div className="flex justify-between items-center mb-4">
                          <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Reschedule Appointment</h4>
                          <button onClick={() => setReschedulingId(null)} className="text-slate-400 hover:text-slate-300">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                          <div className="flex-1">
                            <label className={`block text-xs font-bold mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>New Date</label>
                            <input 
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                              value={rescheduleDate}
                              onChange={(e) => setRescheduleDate(e.target.value)}
                              className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-1 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white focus:ring-indigo-500' : 'bg-white border-emerald-200 focus:ring-emerald-500'}`}
                            />
                          </div>
                        </div>

                        {fetchingSlots ? (
                          <div className="text-center py-2"><div className="animate-spin inline-block rounded-full h-5 w-5 border-b-2 border-indigo-500"></div></div>
                        ) : availableSlots.length > 0 ? (
                          <div className="mb-4">
                            <label className={`block text-xs font-bold mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>New Time</label>
                            <div className="grid grid-cols-3 gap-2">
                              {availableSlots.map((time, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setRescheduleTime(time)}
                                  className={`py-2 text-sm rounded border transition-colors ${rescheduleTime === time ? 'bg-indigo-600 text-white border-indigo-500' : theme === 'dark' ? 'bg-slate-900 text-slate-300 border-slate-700 hover:border-indigo-400' : 'bg-white border-emerald-200 text-emerald-800 hover:border-emerald-400'}`}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-red-400 mb-4">No available times for the selected date.</p>
                        )}

                        <button
                          onClick={() => submitReschedule(apt._id)}
                          disabled={!rescheduleTime || actionLoading === apt._id}
                          className={`w-full py-2 rounded font-bold transition-colors ${(!rescheduleTime || actionLoading === apt._id) ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                        >
                          {actionLoading === apt._id ? 'Saving...' : 'Confirm Reschedule'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
