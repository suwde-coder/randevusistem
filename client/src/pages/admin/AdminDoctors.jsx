import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { Plus, Trash2, Edit, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDoc, setEditingDoc] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchDoctors = async () => {
    try {
      const { data } = await axios.get('/api/doctors');
      setDoctors(data);
    } catch (err) {
      toast.error('Failed to fetch doctors');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const createDoctor = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/doctors', {}, config);
      setDoctors([...doctors, data]);
      toast.success('Doctor created (sample data)');
    } catch (err) {
      toast.error('Could not create doctor');
    }
  };

  const deleteDoctor = async (id) => {
    if (!window.confirm('Delete this doctor?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/doctors/${id}`, config);
      setDoctors(doctors.filter(d => d._id !== id));
      toast.success('Doctor removed');
    } catch (err) {
      toast.error('Could not delete doctor');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post('/api/upload', formData, config);
      setEditingDoc({ ...editingDoc, image: data });
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error('Image upload failed');
    }
    setUploadingImage(false);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/doctors/${editingDoc._id}`, editingDoc, config);
      setDoctors(doctors.map(d => d._id === data._id ? data : d));
      setEditingDoc(null);
      toast.success('Doctor updated successfully');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-white">Manage Doctors</h1>
        <button onClick={createDoctor} className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus className="w-5 h-5 mr-2" /> Add Doctor
        </button>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">ID / Name</th>
                <th className="px-6 py-4">Specialty</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-8">Loading...</td></tr>
              ) : doctors.map((doc) => (
                <tr key={doc._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center space-x-3">
                    <img src={doc.image} className="w-10 h-10 rounded-full object-cover border border-slate-600" alt="" />
                    <span>{doc.name}</span>
                  </td>
                  <td className="px-6 py-4 text-indigo-400">{doc.specialty}</td>
                  <td className="px-6 py-4">{doc.location}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setEditingDoc(doc)} className="text-slate-400 hover:text-white mr-4 transition-colors"><Edit className="w-5 h-5 inline" /></button>
                    <button onClick={() => deleteDoctor(doc._id)} className="text-rose-500 hover:text-rose-400 transition-colors"><Trash2 className="w-5 h-5 inline" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg overflow-hidden border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Edit Doctor Profile</h2>
              <button onClick={() => setEditingDoc(null)} className="text-slate-400 hover:text-red-400"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={submitEdit} className="p-6">
              
              <div className="mb-6 flex flex-col items-center">
                <img src={editingDoc.image} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500/30 mb-4" />
                <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingImage ? 'Uploading...' : 'Upload Picture'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Name</label>
                  <input type="text" value={editingDoc.name} onChange={e => setEditingDoc({...editingDoc, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Specialty</label>
                  <input type="text" value={editingDoc.specialty} onChange={e => setEditingDoc({...editingDoc, specialty: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Experience</label>
                  <input type="text" value={editingDoc.experience || ''} onChange={e => setEditingDoc({...editingDoc, experience: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="e.g. 15 Years" />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                 <button type="button" onClick={() => setEditingDoc(null)} className="px-5 py-2 rounded border border-slate-600 text-slate-300 hover:bg-slate-700">Cancel</button>
                 <button type="submit" className="px-5 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDoctors;
