
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import { Calendar, LogOut, User, Bell } from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      if (!user) return;
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('/api/notifications', config);
        setUnreadCount(data.filter(n => !n.isRead).length);
      } catch (err) { }
    };
    fetchUnread();
  }, [user, location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      className={`shadow-md px-6 py-4 sticky top-0 z-50 border-b transition-colors duration-300
        ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link
          to="/"
          className={`flex items-center space-x-2 font-bold text-xl transition-colors duration-300
            ${theme === 'dark' ? 'text-indigo-500 hover:text-indigo-400' : 'text-emerald-600 hover:text-emerald-500'}`}
        >
          <Calendar className="w-6 h-6" />
          <span>RandeVu</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link
            to="/doctors"
            className={`font-medium transition-colors duration-300
              ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-gray-700 hover:text-emerald-600'}`}
          >
            Find Doctors
          </Link>
          {user && (
            <>
              <Link
                to="/appointments"
                className={`font-medium transition-colors duration-300
                  ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-gray-700 hover:text-emerald-600'}`}
              >
                My Appointments
              </Link>
              <Link
                to="/prescriptions"
                className={`font-medium transition-colors duration-300
                  ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-gray-700 hover:text-emerald-600'}`}
              >
                My Prescriptions
              </Link>
            </>
          )}
          {user?.isDoctor && (
            <Link
              to="/doctor-dashboard"
              className={`font-bold transition-colors flex items-center gap-1 duration-300
                ${theme === 'dark' ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}
            >
              Doctor Panel
            </Link>
          )}
          {user?.isAdmin && (
            <Link
              to="/admin"
              className={`font-bold transition-colors flex items-center gap-1 duration-300
                ${theme === 'dark' ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-500'}`}
            >
              Admin Panel
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link
                to="/notifications"
                className={`relative p-2 transition-colors mr-2 duration-300
                  ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-gray-700 hover:text-emerald-600'}`}
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                )}
              </Link>
              <Link to="/profile" className={`flex items-center space-x-2 px-2 py-1 rounded transition-colors duration-300 ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-gray-700 hover:bg-gray-100'}`}>
                <User className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-emerald-400'}`} />
                <span className="font-medium text-sm hover:underline">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className={`flex items-center space-x-1 text-sm px-3 py-2 rounded-lg transition-colors border duration-300
                  ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'}`}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`text-sm font-medium transition-colors duration-300
                  ${theme === 'dark' ? 'text-slate-300 hover:text-indigo-400' : 'text-gray-700 hover:text-emerald-600'}`}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm duration-300
                  ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'}`}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
