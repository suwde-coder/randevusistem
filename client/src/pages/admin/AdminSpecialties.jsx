import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSpecialties = () => {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const fetchSpecialties = async () => {
    try {
      const { data } = await axios.get('/api/specialties');
      setSpecialties(data);
    } catch (err) {
      toast.error('Failed to fetch specialties');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const createSpecialty = async () => {
    const name = window.prompt('Specialty Name:');
    if (!name) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/specialties', { name }, config);
      setSpecialties([...specialties, data]);
      toast.success('Specialty created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create specialty');
    }
  };

  const deleteSpecialty = async (id) => {
    if (!window.confirm('Delete this specialty?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/specialties/${id}`, config);
      setSpecialties(specialties.filter(s => s._id !== id));
      toast.success('Specialty removed');
    } catch (err) {
      toast.error('Could not delete specialty');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-white">Manage Specialties</h1>
        <button onClick={createSpecialty} className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus className="w-5 h-5 mr-2" /> Add Specialty
        </button>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" className="text-center py-8">Loading...</td></tr>
              ) : specialties.map((s) => (
                <tr key={s._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{s.name}</td>
                  <td className="px-6 py-4 text-emerald-400">{s.description || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => deleteSpecialty(s._id)} className="text-rose-500 hover:text-rose-400 transition-colors"><Trash2 className="w-5 h-5 inline" /></button>
                  </td>
                </tr>
              ))}
              {specialties.length === 0 && !loading && (
                <tr><td colSpan="3" className="text-center py-8">No specialties found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSpecialties;
