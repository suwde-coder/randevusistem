import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { Trash2, ShieldCheck, User } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const fetchUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/users', config);
      setUsers(data);
    } catch (err) {
      toast.error('Failed to fetch users');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/users/${id}`, config);
      setUsers(users.filter(u => u._id !== id));
      toast.success('User removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete user');
    }
  };

  const makeAdmin = async (id) => {
    if (!window.confirm('Make this user an Admin?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/users/${id}/admin`, {}, config);
      setUsers(users.map(u => u._id === id ? data : u));
      toast.success('User updated to Admin');
    } catch (err) {
      toast.error('Could not update user');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-white mb-8">Manage Users</h1>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-center">Admin</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-8">Loading...</td></tr>
              ) : users.map((u) => (
                <tr key={u._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center space-x-3">
                    <User className="w-8 h-8 p-1 bg-slate-700 rounded-full text-slate-400" />
                    <span>{u.name}</span>
                  </td>
                  <td className="px-6 py-4 text-indigo-400">{u.email}</td>
                  <td className="px-6 py-4 text-center">
                    {u.isAdmin ? (
                      <span className="bg-emerald-900/40 text-emerald-400 px-2 py-1 rounded text-xs font-bold border border-emerald-500/30">Yes</span>
                    ) : (
                      <span className="bg-slate-700 text-slate-400 px-2 py-1 rounded text-xs font-bold">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!u.isAdmin && (
                      <button onClick={() => makeAdmin(u._id)} title="Make Admin" className="text-emerald-500 hover:text-emerald-400 mr-4 transition-colors">
                        <ShieldCheck className="w-5 h-5 inline" />
                      </button>
                    )}
                    <button onClick={() => deleteUser(u._id)} className="text-rose-500 hover:text-rose-400 transition-colors">
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
