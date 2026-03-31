import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Bell, CheckCircle, Info, CalendarClock, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const fetchNotifications = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/notifications', config);
      setNotifications(data);
    } catch (err) {
      toast.error('Failed to load notifications');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const markAsRead = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/notifications/${id}/read`, {}, config);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.log(err);
    }
  };

  const markAllRead = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put('/api/notifications/read-all', {}, config);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-[calc(100vh-73px)] py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Bell className="text-indigo-500 w-8 h-8" />
          Notifications
          {unreadCount > 0 && (
            <span className="bg-rose-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              {unreadCount} New
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>
        ) : notifications.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
            <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-slate-300">You're all caught up!</h3>
            <p className="text-slate-400 mt-2">No new notifications at the moment.</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif._id} 
              className={`p-5 rounded-xl border flex gap-4 transition-all ${
                notif.isRead ? 'bg-slate-800/50 border-slate-700/50 opacity-70' : 'bg-slate-800 border-indigo-500/30 shadow-lg shadow-indigo-500/10 transform hover:-translate-y-1'
              }`}
            >
              <div className="shrink-0 mt-1">
                {notif.type === 'booking' && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                {notif.type === 'reminder' && <CalendarClock className="w-6 h-6 text-amber-500" />}
                {notif.type === 'system' && <Info className="w-6 h-6 text-blue-500" />}
              </div>
              <div className="flex-1">
                <p className={`text-sm md:text-base ${notif.isRead ? 'text-slate-400' : 'text-slate-200 font-medium'}`}>
                  {notif.message}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>
              {!notif.isRead && (
                <button 
                  onClick={() => markAsRead(notif._id)}
                  title="Mark as read"
                  className="shrink-0 h-fit p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <Check className="w-5 h-5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
