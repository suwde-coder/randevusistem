import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Star, Calendar, Clock, ChevronLeft, CalendarPlus, CheckCircle, Heart, CalendarDays, Users, Briefcase, GraduationCap, Award, ShieldCheck, Globe, Building, FileText, BadgeCheck } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import toast from 'react-hot-toast';

const DoctorDetail = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [note, setNote] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null); // 'success', 'error'
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !id) return;
      setFetchingSlots(true);
      try {
        const { data } = await axios.get(`/api/doctors/${id}/slots?date=${selectedDate}`);
        setAvailableSlots(data.availableSlots || []);
        setSelectedTime(null); // Reset time when date changes
      } catch (err) {
        console.error('Failed to fetch slots', err);
      }
      setFetchingSlots(false);
    };

    fetchSlots();
  }, [selectedDate, id]);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await axios.get(`/api/doctors/${id}`);
        setDoctor(data);
        // Also fetch reviews
        try {
          const { data: revData } = await axios.get(`/api/reviews/${id}`);
          setReviews(revData);
        } catch (err) {
          console.error('Failed to fetch reviews', err);
        }
      } catch (err) {
        setError('Failed to fetch doctor details.');
      }
      setLoading(false);
    };

    fetchDoctor();
  }, [id]);

  const handleBookAppointment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    setBookingLoading(true);
    setBookingStatus(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.post(
        '/api/appointments',
        {
          doctorId: doctor._id,
          date: selectedDate,
          time: selectedTime,
          note: note,
        },
        config
      );

      setBookingStatus('success');
      setBookingMessage(`Appointment confirmed for ${selectedDate} at ${selectedTime}!`);
    } catch (err) {
      setBookingStatus('error');
      setBookingMessage(err.response?.data?.message || 'Failed to book appointment');
    }
    setBookingLoading(false);
  };

  const toggleFavorite = async (e) => {
    if (!user) {
      toast.error('Please login to favorite a doctor');
      navigate('/login');
      return;
    }
    
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`/api/auth/favorites/${doctor._id}`, {}, config);
      
      const updatedUser = { ...user, favorites: data.favorites };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success(data.message);
    } catch (err) {
      toast.error('Could not modify favorites');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewRating || !reviewComment) return;

    setReviewLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/reviews', {
        doctorId: doctor._id,
        rating: reviewRating,
        comment: reviewComment
      }, config);
      
      setReviews([data, ...reviews]);
      setReviewComment('');
      setReviewRating(5);
      toast.success('Review submitted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setReviewLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );
  
  if (error || !doctor) return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <h2 className="text-2xl font-bold text-white mb-4">{error}</h2>
      <button onClick={() => navigate('/doctors')} className="text-indigo-400 hover:text-indigo-300">
        Back to Doctors
      </button>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-73px)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate('/doctors')} 
          className="flex items-center text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to specialists
        </button>
        
        <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="h-64 md:h-full relative">
              <img 
                src={doctor.image} 
                alt={doctor.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent md:bg-gradient-to-r md:from-transparent md:to-slate-800"></div>
            </div>
            
            <div className="p-8 md:p-12 pl-8 md:pl-0">
              <div className="flex justify-between items-start">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{doctor.name}</h1>
                  {doctor.isVerified !== false && (
                    <div className="flex items-center bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/20 shadow-sm mt-1">
                      <BadgeCheck className="w-5 h-5 mr-1" />
                      <span className="text-xs font-bold uppercase tracking-wider">Verified</span>
                    </div>
                  )}
                  <button onClick={toggleFavorite} className="p-2 transition-transform hover:scale-110 -mt-1 ml-auto sm:ml-2">
                    <Heart className={`w-8 h-8 drop-shadow-lg transition-colors ${
                      user?.favorites?.includes(doctor._id) 
                        ? 'text-rose-500 fill-current' 
                        : 'text-slate-500 hover:text-rose-400'
                    }`} />
                  </button>
                </div>
                <div className="bg-slate-900 px-3 py-2 flex items-center gap-1 rounded-lg text-lg font-bold text-yellow-500 shadow-inner">
                  <Star className="w-5 h-5 fill-current" /> {doctor.rating}
                </div>
              </div>
              
              {/* Doctor Details Grid */}
              <div className="space-y-6 mb-8">
                {/* Location & Bio */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center text-slate-300">
                    <MapPin className="w-6 h-6 mr-3 text-indigo-400 shrink-0" /> 
                    <span className="text-lg">{doctor.location}</span>
                  </div>
                  <div className="flex items-start text-slate-300">
                    <FileText className="w-6 h-6 mr-3 text-indigo-400 shrink-0 mt-0.5" /> 
                    <span className="text-lg leading-relaxed">{doctor.bio}</span>
                  </div>
                </div>

                {/* Extended Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                  {/* Professional Info */}
                  <div className="bg-slate-900/60 rounded-xl p-6 border border-slate-700/50 shadow-inner flex flex-col justify-between">
                    <div>
                      <h3 className="text-slate-200 font-bold mb-4 flex items-center text-lg">
                        <Briefcase className="w-5 h-5 mr-2 text-emerald-400" />
                        Professional Info
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                           <span className="text-slate-400 text-sm w-28 shrink-0 flex items-center"><Building className="w-4 h-4 mr-2" />Hospital:</span>
                           <span className="text-slate-200 text-sm font-medium">{doctor.hospital || 'Not specified'}</span>
                        </div>
                        <div className="flex items-start">
                           <span className="text-slate-400 text-sm w-28 shrink-0 flex items-center"><Globe className="w-4 h-4 mr-2" />Languages:</span>
                           <span className="text-slate-200 text-sm font-medium leading-relaxed">{(Array.isArray(doctor.languages) && doctor.languages.length > 0) ? doctor.languages.join(', ') : 'Not specified'}</span>
                        </div>
                      </div>
                    </div>
                    {/* Visual Experience Indicator */}
                    {doctor.experience && (
                      <div className="mt-5 pt-4 border-t border-slate-700/50 flex items-center">
                        <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 font-black text-xl shadow-[0_0_15px_rgba(52,211,153,0.3)] shrink-0">
                          {doctor.experience.replace(/[^0-9+]/g, '') || <Award className="w-6 h-6" />}
                        </div>
                        <div className="ml-4">
                          <p className="text-slate-300 font-bold text-lg leading-tight">Years</p>
                          <p className="text-emerald-400 text-xs font-bold uppercase tracking-wide">Experience</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Education & Certs */}
                  <div className="bg-slate-900/60 rounded-xl p-6 border border-slate-700/50 shadow-inner">
                    <h3 className="text-slate-200 font-bold mb-4 flex items-center text-lg">
                      <GraduationCap className="w-5 h-5 mr-2 text-indigo-400" />
                      Education & Certs
                    </h3>
                    <div className="space-y-3">
                       {(Array.isArray(doctor.education) && doctor.education.length > 0) ? (
                         <div className="text-slate-200 text-sm space-y-2">
                           {doctor.education.map((edu, idx) => (
                             <div key={idx} className="flex items-start">
                               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 mr-3 shrink-0"></div>
                               <span className="leading-relaxed">{edu}</span>
                             </div>
                           ))}
                         </div>
                       ) : (
                         <p className="text-slate-500 text-sm">No education history available.</p>
                       )}
                       
                       {(Array.isArray(doctor.certifications) && doctor.certifications.length > 0) && (
                         <div className="text-slate-200 text-sm border-t border-slate-700/50 pt-3 mt-3 space-y-2">
                           {doctor.certifications.map((cert, idx) => (
                             <div key={idx} className="flex items-start text-slate-300">
                               <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 mr-2 shrink-0" />
                               <span className="leading-relaxed">{cert}</span>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                  </div>
                  
                  {/* Achievements */}
                  {(Array.isArray(doctor.achievements) && doctor.achievements.length > 0) && (
                    <div className="bg-slate-900/60 rounded-xl p-6 border border-slate-700/50 shadow-inner md:col-span-2">
                      <h3 className="text-slate-200 font-bold mb-5 flex items-center text-lg">
                        <Award className="w-5 h-5 mr-2 text-yellow-500" />
                        Key Achievements
                      </h3>
                      
                      {/* Highlighted Top Achievement */}
                      <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-400/5 border border-yellow-500/30 rounded-xl p-4 mb-4 flex items-center shadow-lg shadow-yellow-900/10">
                        <div className="bg-yellow-500/20 p-2 rounded-lg mr-4 shrink-0">
                          <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                        </div>
                        <div>
                          <p className="text-yellow-500 text-xs font-bold uppercase tracking-wider mb-0.5">Top Achievement</p>
                          <p className="text-yellow-50 font-medium text-sm sm:text-base">{doctor.achievements[0]}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {doctor.achievements.slice(1).map((ach, idx) => (
                           <div key={idx} className="flex items-center bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-700/30 text-sm text-slate-200 shadow-sm transition-transform hover:-translate-y-0.5">
                             <Award className="w-4 h-4 text-emerald-500/70 mr-3 shrink-0" />
                             {ach}
                           </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-slate-700 pt-8 mb-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <CalendarDays className="w-6 h-6 mr-2 text-indigo-500" />
                  Select Date
                </h3>
                <div className="relative max-w-sm">
                  <input 
                    type="date" 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-indigo-500" />
                  Available Appointments
                </h3>
                
                {fetchingSlots ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                    {availableSlots.map((time, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 px-4 rounded-lg text-center font-medium transition-all ${
                          selectedTime === time 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 border border-indigo-500' 
                            : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-indigo-400 hover:bg-slate-800'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                   <div className={`p-6 rounded-xl border mb-8 text-center ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                      <AlertCircle className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-amber-500' : 'text-amber-600'}`} />
                      <p className={`text-sm italic font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                        {selectedDate && !availableSlots.length ? (
                          fetchingSlots ? 'Loading slots...' : `No available slots. ${doctor.name} may not be working on the selected day.`
                        ) : 'Select a date to see available slots.'}
                      </p>
                   </div>
                )}
                
                {selectedTime && !bookingStatus && (
                  <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <Users className="w-6 h-6 mr-2 text-indigo-500" />
                      Add a note for the doctor (Optional)
                    </h3>
                    <textarea 
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[100px] resize-none"
                      placeholder="Symptoms, previous records, or specific concerns..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    ></textarea>
                  </div>
                )}
                
                {bookingStatus === 'success' ? (
                  <div className="bg-emerald-900/40 border border-emerald-500/50 rounded-xl p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <h4 className="text-emerald-400 font-bold text-lg mb-1">{bookingMessage}</h4>
                    <button 
                      onClick={() => navigate('/appointments')}
                      className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      View My Appointments
                    </button>
                  </div>
                ) : (
                  <>
                    {bookingStatus === 'error' && (
                      <div className="bg-red-900/40 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4 text-center text-sm font-medium">
                        {bookingMessage}
                      </div>
                    )}
                    <button 
                      disabled={!selectedTime || bookingLoading}
                      onClick={handleBookAppointment}
                      className={`w-full py-4 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${
                        selectedTime 
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transform hover:-translate-y-1' 
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600'
                      }`}
                    >
                      <CalendarPlus className="w-6 h-6 mr-2" />
                      {bookingLoading ? 'Booking...' : `Book Appointment ${selectedTime ? `at ${selectedTime}` : ''}`}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className={`mt-12 rounded-2xl shadow-xl overflow-hidden mb-8 border transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
          <div className="p-8">
            <h3 className={`text-2xl font-bold mb-8 flex items-center transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <Star className="w-6 h-6 mr-3 text-yellow-500 fill-yellow-500" />
              Patient Reviews ({reviews.length})
            </h3>

            {/* Write a Review */}
            {user && (
              <div className={`mb-10 p-6 rounded-xl border transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`text-lg font-bold mb-4 transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Write a Review</h4>
                <form onSubmit={submitReview}>
                  <div className="mb-4">
                    <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setReviewRating(num)}
                          className="focus:outline-none"
                        >
                          <Star className={`w-8 h-8 ${reviewRating >= num ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>Comment</label>
                    <textarea 
                      required
                      rows="3"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:ring-indigo-500' : 'bg-white border-gray-300 focus:ring-emerald-500'}`}
                      placeholder="Share your experience with this doctor..."
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={reviewLoading}
                    className={`font-semibold py-3 px-8 rounded-lg shadow-lg flex items-center transition-colors duration-300 ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30'} ${reviewLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}

            {/* List Reviews */}
            {reviews.length === 0 ? (
              <p className={`text-center py-8 italic transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>No reviews yet for this doctor.</p>
            ) : (
              <div className="space-y-6">
                {reviews.map((rev) => (
                  <div key={rev._id} className={`p-6 rounded-xl border transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100 hover:shadow-md'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <img 
                           src={rev.userId?.image || `https://ui-avatars.com/api/?name=${rev.userId?.name || 'User'}&background=random`} 
                           alt="User" 
                           className="w-10 h-10 rounded-full" 
                        />
                        <div>
                          <p className={`font-bold transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{rev.userId?.name || 'Anonymous Patient'}</p>
                          <p className={`text-xs transition-colors duration-300 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{new Date(rev.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(num => (
                          <Star key={num} className={`w-4 h-4 ${rev.rating >= num ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className={`transition-colors duration-300 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DoctorDetail;
