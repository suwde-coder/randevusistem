import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import { User, Activity, HeartPulse, PhoneCall, MapPin, Save, Loader2, Upload, Camera, AlertTriangle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user, login } = useContext(AuthContext); // update context user if needed
  const { theme } = useContext(ThemeContext);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    image: '',
    name: '',
    email: '',
    age: '',
    gender: 'Prefer not to say',
    height: '',
    weight: '',
    bloodType: 'Unknown',
    chronicDiseases: '',
    allergies: '',
    medications: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    address: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('/api/users/profile', config);
        
        setFormData({
          image: data.image || '',
          name: data.name || '',
          email: data.email || '',
          age: data.age || '',
          gender: data.gender || 'Prefer not to say',
          height: data.height || '',
          weight: data.weight || '',
          bloodType: data.bloodType || 'Unknown',
          chronicDiseases: data.chronicDiseases ? data.chronicDiseases.join(', ') : '',
          allergies: data.allergies ? data.allergies.join(', ') : '',
          medications: data.medications ? data.medications.join(', ') : '',
          emergencyContactName: data.emergencyContact?.name || '',
          emergencyContactPhone: data.emergencyContact?.phone || '',
          address: data.address || ''
        });
      } catch (error) {
        toast.error('Failed to load profile data');
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataObj = new FormData();
    formDataObj.append('image', file);
    setUploadingImage(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post('/api/upload', formDataObj, config);
      setFormData(prev => ({ ...prev, image: data }));
      toast.success('Profile photo uploaded');
    } catch (err) {
      toast.error('Image upload failed');
    }
    setUploadingImage(false);
  };

  const calculateBMI = () => {
    if (!formData.weight || !formData.height) return null;
    const heightInMeters = formData.height / 100;
    const bmi = (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);
    
    let status = '';
    let colorClass = '';
    let risk = '';
    
    if (bmi < 18.5) { status = 'Underweight'; colorClass = 'text-yellow-500'; risk = 'Low to Moderate'; }
    else if (bmi >= 18.5 && bmi <= 24.9) { status = 'Normal Weight'; colorClass = 'text-emerald-500'; risk = 'Low'; }
    else if (bmi >= 25 && bmi <= 29.9) { status = 'Overweight'; colorClass = 'text-orange-500'; risk = 'Moderate'; }
    else { status = 'Obese'; colorClass = 'text-red-500'; risk = 'High'; }

    return { value: bmi, status, colorClass, risk };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const updateData = {
        image: formData.image || '',
        name: formData.name || '',
        age: formData.age !== '' && formData.age !== null ? Number(formData.age) : null,
        gender: formData.gender || 'Prefer not to say',
        height: formData.height !== '' && formData.height !== null ? Number(formData.height) : null,
        weight: formData.weight !== '' && formData.weight !== null ? Number(formData.weight) : null,
        bloodType: formData.bloodType || 'Unknown',
        chronicDiseases: formData.chronicDiseases ? formData.chronicDiseases.split(',').map(s => s.trim()).filter(Boolean) : [],
        allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
        medications: formData.medications ? formData.medications.split(',').map(s => s.trim()).filter(Boolean) : [],
        emergencyContact: {
          name: formData.emergencyContactName || '',
          phone: formData.emergencyContactPhone || ''
        },
        address: formData.address || ''
      };

      const { data } = await axios.put('/api/users/profile', updateData, config);
      toast.success('Profile updated successfully');
      
      // Update local storage user name if it changed
      if (data.name !== user.name) {
        const updatedUser = { ...user, name: data.name };
        login(updatedUser);
      }
      
    } catch (error) {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className={`min-h-screen py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 text-slate-200' : 'bg-gray-50 text-gray-800'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-extrabold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <User className={`w-8 h-8 mr-3 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
            My Profile
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Update your personal and medical information here automatically.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Personal Info */}
          <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <h2 className="text-xl font-bold mb-6 flex items-center border-b pb-2 border-slate-700/50">
              <User className="w-5 h-5 mr-2 text-blue-500" /> Personal Info
            </h2>
            
            <div className="flex flex-col md:flex-row gap-8 mb-6">
              <div className="flex flex-col items-center justify-start shrink-0">
                <div className="relative group">
                  <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500/20 shadow-lg flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}`}>
                    {formData.image ? (
                      <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className={`w-12 h-12 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`} />
                    )}
                    <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                      {uploadingImage ? <Loader2 className="w-6 h-6 animate-spin mb-1" /> : <Camera className="w-6 h-6 mb-1" />}
                      <span className="text-xs font-bold">{uploadingImage ? 'Uploading...' : 'Change Photo'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <div>
                  <label className="block text-sm font-bold opacity-80 mb-1">Full Name</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full rounded-lg p-3 ${theme === 'dark' ? 'bg-slate-900 border border-slate-700 focus:ring-indigo-500' : 'bg-gray-50 border border-gray-300 focus:ring-indigo-400'}`} />
                </div>
                <div>
                  <label className="block text-sm font-bold opacity-80 mb-1">Email <span className="opacity-50 text-xs">(Read Only)</span></label>
                  <input disabled type="email" value={formData.email} className={`w-full rounded-lg p-3 opacity-60 cursor-not-allowed ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-gray-50 border border-gray-300'}`} />
                </div>
                <div>
                  <label className="block text-sm font-bold opacity-80 mb-1">Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} min="0" max="150" className={`w-full rounded-lg p-3 ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-gray-50 border border-gray-300'}`} />
                </div>
                <div>
                  <label className="block text-sm font-bold opacity-80 mb-1">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className={`w-full rounded-lg p-3 ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-gray-50 border border-gray-300'}`}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Physical Info */}
          <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <h2 className="text-xl font-bold mb-4 flex items-center border-b pb-2 border-slate-700/50">
              <Activity className="w-5 h-5 mr-2 text-emerald-500" /> Physical Info
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold opacity-80 mb-1">Height (cm)</label>
                <input type="number" name="height" value={formData.height} onChange={handleChange} min="0" max="300" placeholder="e.g. 175" className={`w-full rounded-lg p-3 ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-gray-50 border border-gray-300'}`} />
              </div>
              <div>
                <label className="block text-sm font-bold opacity-80 mb-1">Weight (kg)</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} min="0" max="500" placeholder="e.g. 70" className={`w-full rounded-lg p-3 ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-gray-50 border border-gray-300'}`} />
              </div>
              <div>
                <label className="block text-sm font-bold opacity-80 mb-1">Blood Type</label>
                <select name="bloodType" value={formData.bloodType} onChange={handleChange} className={`w-full rounded-lg p-3 ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-gray-50 border border-gray-300'}`}>
                  <option value="Unknown">Unknown</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Health Info */}
          <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <h2 className="text-xl font-bold mb-4 flex items-center border-b pb-2 border-slate-700/50">
              <HeartPulse className="w-5 h-5 mr-2 text-rose-500" /> Health Info (Comma Separated)
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-bold opacity-80 mb-1">Chronic Diseases</label>
                <input type="text" name="chronicDiseases" value={formData.chronicDiseases} onChange={handleChange} placeholder="Asthma, Diabetes..." className={`w-full rounded-lg p-3 ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-gray-50 border border-gray-300'}`} />
              </div>
              <div>
                <label className="block text-sm font-bold opacity-80 mb-1">Allergies</label>
                <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="Penicillin, Peanuts..." className={`w-full rounded-lg p-3 ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-gray-50 border border-gray-300'}`} />
              </div>
              <div>
                <label className="block text-sm font-bold opacity-80 mb-1">Current Medications</label>
                <input type="text" name="medications" value={formData.medications} onChange={handleChange} placeholder="Lisinopril 10mg, Aspirin..." className={`w-full rounded-lg p-3 ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-gray-50 border border-gray-300'}`} />
              </div>
            </div>
          </div>

          {/* Health Summary Analytics */}
          {calculateBMI() && (
            <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-gradient-to-br from-indigo-900/40 to-slate-800 border-indigo-500/30' : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-200'}`}>
              <h2 className="text-xl font-bold mb-4 flex items-center border-b pb-2 border-indigo-500/20">
                <Activity className="w-5 h-5 mr-2 text-indigo-500" /> Health Summary
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="flex items-center space-x-4">
                   <div className="w-20 h-20 rounded-full border-4 border-indigo-500/30 flex flex-col items-center justify-center bg-indigo-500/10 shadow-inner">
                     <span className="text-2xl font-black">{calculateBMI().value}</span>
                     <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">BMI</span>
                   </div>
                   <div>
                     <p className={`text-lg font-bold ${calculateBMI().colorClass}`}>{calculateBMI().status}</p>
                     <p className="text-sm opacity-70">Calculated from Height and Weight</p>
                   </div>
                 </div>

                 <div className="flex items-start space-x-3 bg-white/5 p-4 rounded-xl border border-white/10 shadow-sm">
                    {calculateBMI().risk === 'Low' && formData.chronicDiseases.length === 0 ? (
                       <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
                    ) : (
                       <AlertTriangle className={`w-8 h-8 shrink-0 ${calculateBMI().risk === 'High' || formData.chronicDiseases.length > 5 ? 'text-red-500' : 'text-yellow-500'}`} />
                    )}
                    <div>
                      <p className="font-bold text-sm mb-1">Health Risk Assessment</p>
                      <p className="text-xs opacity-80 leading-relaxed">
                        Based on your profile, your baseline physical risk is <strong>{calculateBMI().risk}</strong>. 
                        {formData.chronicDiseases.length > 0 && ` You have specified chronic diseases which require ongoing monitoring.`}
                      </p>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* Emergency & Address */}
          <div className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <h2 className="text-xl font-bold mb-4 flex items-center border-b pb-2 border-slate-700/50">
              <PhoneCall className="w-5 h-5 mr-2 text-orange-500" /> Contact & Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold opacity-80 mb-1">Emergency Contact Name</label>
                <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} className={`w-full rounded-lg p-3 ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-gray-50 border border-gray-300'}`} />
              </div>
              <div>
                <label className="block text-sm font-bold opacity-80 mb-1">Emergency Phone</label>
                <input type="text" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} className={`w-full rounded-lg p-3 ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-gray-50 border border-gray-300'}`} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold opacity-80 mb-1 flex items-center"><MapPin className="w-4 h-4 mr-1"/> Full Address</label>
                <textarea name="address" rows="3" value={formData.address} onChange={handleChange} className={`w-full rounded-lg p-3 resize-none ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-gray-50 border border-gray-300'}`}></textarea>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={saving}
              className={`flex items-center px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${saving ? 'opacity-70 bg-indigo-500' : 'bg-indigo-600 hover:bg-indigo-500 hover:-translate-y-1 shadow-indigo-500/30'}`}
            >
              {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
