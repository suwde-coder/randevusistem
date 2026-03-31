import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import { Calendar, Clock, FileText, Plus, X, Activity, Edit, Upload, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Prescription Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', usage: '' }]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const [editingProfile, setEditingProfile] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('/api/appointments/doctor', config);
        setAppointments(data);
      } catch (err) {
        setError('Failed to load your appointments.');
      }
      setLoading(false);
    };

    fetchAppointments();
    
    if (user?.linkedDoctorId) {
      const fetchReviews = async () => {
        try {
          const { data } = await axios.get(`/api/reviews/${user.linkedDoctorId}`);
          setReviews(data);
        } catch (err) {
          console.error('Failed to load reviews');
        }
      };
      fetchReviews();
    }
  }, [user]);

  const openPrescriptionModal = (apt) => {
    setSelectedApt(apt);
    setMedicines([{ name: '', dosage: '', usage: '' }]);
    setNotes('');
    setShowModal(true);
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value;
    setMedicines(newMedicines);
  };

  const addMedicineRow = () => {
    setMedicines([...medicines, { name: '', dosage: '', usage: '' }]);
  };

  const removeMedicineRow = (index) => {
    const newMedicines = [...medicines];
    newMedicines.splice(index, 1);
    setMedicines(newMedicines);
  };

  const submitPrescription = async (e) => {
    e.preventDefault();
    const validMedicines = medicines.filter(m => m.name.trim() && m.dosage.trim() && m.usage.trim());
    if (validMedicines.length === 0) {
      toast.error('Please add at least one complete medicine entry');
      return;
    }

    setSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/prescriptions', {
        appointmentId: selectedApt._id,
        userId: selectedApt.userId._id,
        medicines: validMedicines,
        notes
      }, config);
      
      toast.success('Prescription created successfully');
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create prescription');
    }
    setSubmitting(false);
  };

  const openProfileEdit = async () => {
    if (!user?.linkedDoctorId) {
      toast.error('No professional profile linked to this account.');
      return;
    }
    try {
      const { data } = await axios.get(`/api/doctors/${user.linkedDoctorId}`);
      setDoctorProfile(data);
      setEditingProfile(true);
    } catch (err) {
      toast.error('Could not load profile');
    }
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post('/api/upload', formData, config);
      setDoctorProfile({ ...doctorProfile, image: data });
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error('Image upload failed');
    }
    setUploadingImage(false);
  };

  const handleReplySubmit = async (reviewId) => {
    if (!reviewId || !replyText[reviewId]) return;
    setReplyLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/reviews/${reviewId}/reply`, { doctorReply: replyText[reviewId] }, config);
      
      const updatedReviews = reviews.map(r => r._id === reviewId ? { ...r, ...data } : r);
      setReviews(updatedReviews);
      setReplyText({ ...replyText, [reviewId]: '' });
      toast.success('Reply sent successfully');
    } catch (err) {
      toast.error('Failed to send reply');
    }
    setReplyLoading(false);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/doctors/${doctorProfile._id}`, doctorProfile, config);
      setEditingProfile(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  if (loading) return (
    <div className="min-h-[calc(100vh-73px)] py-20 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className={`min-h-[calc(100vh-73px)] py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-extrabold tracking-tight flex items-center transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Activity className={`w-8 h-8 mr-3 transition-colors duration-300 ${theme === 'dark' ? 'text-indigo-500' : 'text-indigo-600'}`} />
            Doctor Dashboard
          </h1>
          <button 
            onClick={openProfileEdit}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm'}`}
          >
            <Edit className="w-4 h-4 mr-2" /> Edit Mesai & Profile
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg mb-8">
            {error}
          </div>
        )}

        <section className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Calendar className="w-6 h-6 mr-2 text-indigo-500" /> Appointments
          </h2>
          {appointments.length === 0 ? (
            <div className={`p-10 rounded-2xl border text-center ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
              <p className="text-slate-500 italic">No appointments found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.map((apt) => (
                <div key={apt._id} className={`p-6 rounded-xl border shadow-sm transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-indigo-500/50' : 'bg-white border-gray-200 hover:shadow-lg'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{apt.userId?.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${apt.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {apt.status}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4 text-sm opacity-80">
                    <p className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> {apt.date}</p>
                    <p className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {apt.time}</p>
                  </div>
                  {apt.status !== 'cancelled' && (
                    <button 
                      onClick={() => openPrescriptionModal(apt)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors text-sm"
                    >
                      Write Prescription
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-12 bg-slate-800/10 p-8 rounded-2xl border border-slate-700/20">
          <h2 className={`text-2xl font-bold mb-6 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
             <Edit className="w-6 h-6 mr-2 text-yellow-500" /> Patient Reviews
          </h2>
          {reviews.length === 0 ? (
            <p className="text-slate-500 italic">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(rev => (
                <div key={rev._id} className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                       <img src={rev.userId?.image || `https://ui-avatars.com/api/?name=${rev.userId?.name}&background=random`} alt="User" className="w-10 h-10 rounded-full" />
                       <div>
                         <p className="font-bold">{rev.userId?.name}</p>
                         <p className="text-xs opacity-50">{new Date(rev.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <div className="text-yellow-500 font-bold">★ {rev.rating}</div>
                  </div>
                  <p className="mb-4 text-sm">"{rev.comment}"</p>
                  
                  {rev.doctorReply ? (
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Your Response:</p>
                      <p className="text-sm italic">"{rev.doctorReply}"</p>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={replyText[rev._id] || ''} 
                        onChange={e => setReplyText({...replyText, [rev._id]: e.target.value})}
                        className={`flex-1 rounded p-2 text-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-gray-100 border-gray-300'}`}
                        placeholder="Reply to patient..."
                      />
                      <button 
                        onClick={() => handleReplySubmit(rev._id)} 
                        disabled={replyLoading || !replyText[rev._id]}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- Modals --- */}

        {showModal && selectedApt && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
           <div className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
             <div className={`p-6 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
               <h2 className="text-xl font-bold">Prescription for {selectedApt.userId?.name}</h2>
               <button onClick={() => setShowModal(false)}><X className="w-6 h-6" /></button>
             </div>
             <div className="p-6 overflow-y-auto flex-1">
               <form id="p-form" onSubmit={submitPrescription}>
                 {medicines.map((med, idx) => (
                   <div key={idx} className="mb-4 p-4 border rounded-xl relative">
                     {medicines.length > 1 && <button type="button" onClick={() => removeMedicineRow(idx)} className="absolute top-2 right-2 text-red-500"><X className="w-4 h-4" /></button>}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       <div className="md:col-span-2">
                         <label className="text-xs font-bold block mb-1">Medicine</label>
                         <input required value={med.name} onChange={e => handleMedicineChange(idx, 'name', e.target.value)} className="w-full bg-transparent border rounded p-2" />
                       </div>
                       <div>
                         <label className="text-xs font-bold block mb-1">Dosage</label>
                         <input required value={med.dosage} onChange={e => handleMedicineChange(idx, 'dosage', e.target.value)} className="w-full bg-transparent border rounded p-2" />
                       </div>
                       <div>
                         <label className="text-xs font-bold block mb-1">Usage</label>
                         <input required value={med.usage} onChange={e => handleMedicineChange(idx, 'usage', e.target.value)} className="w-full bg-transparent border rounded p-2" />
                       </div>
                     </div>
                   </div>
                 ))}
                 <button type="button" onClick={addMedicineRow} className="text-indigo-500 text-sm font-bold mb-4">+ Add Item</button>
                 <div>
                    <label className="text-xs font-bold block mb-1">Notes</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-transparent border rounded p-2" rows="2"></textarea>
                 </div>
               </form>
             </div>
             <div className="p-6 border-t flex justify-end gap-3">
               <button onClick={() => setShowModal(false)} className="px-4 py-2">Cancel</button>
               <button form="p-form" type="submit" className="bg-indigo-600 px-6 py-2 rounded-lg text-white font-bold">Save</button>
             </div>
           </div>
         </div>
        )}

        {editingProfile && doctorProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Settings & Mesai</h2>
                <button onClick={() => setEditingProfile(false)}><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={saveProfile} className="p-6 space-y-4">
                <div className="flex flex-col items-center mb-4">
                   <div className="relative group">
                     <img src={doctorProfile.image} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500" />
                     <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <Camera className="text-white w-6 h-6" />
                        <input type="file" className="hidden" onChange={handleProfileImageUpload} />
                     </label>
                   </div>
                </div>
                <div>
                   <label className="text-xs font-bold block mb-1">Bio</label>
                   <textarea value={doctorProfile.bio} onChange={e => setDoctorProfile({...doctorProfile, bio: e.target.value})} className="w-full bg-transparent border rounded p-2 text-sm" rows="2"></textarea>
                </div>
                <div>
                   <label className="text-xs font-bold block mb-1">Working Days</label>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <label key={day} className={`flex items-center p-2 rounded border text-[10px] font-bold cursor-pointer transition-colors ${doctorProfile.workingDays?.includes(day) ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 opacity-60'}`}>
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={doctorProfile.workingDays?.includes(day)}
                            onChange={e => {
                               const days = doctorProfile.workingDays || [];
                               setDoctorProfile({...doctorProfile, workingDays: e.target.checked ? [...days, day] : days.filter(d => d !== day)});
                            }}
                          />
                          {day}
                        </label>
                      ))}
                   </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                   <button type="button" onClick={() => setEditingProfile(false)}>Cancel</button>
                   <button type="submit" className="bg-indigo-600 px-6 py-2 rounded-lg text-white font-bold">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
