import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserRoundCog, HeartPulse } from 'lucide-react';

const AdminSidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Doctors', path: '/admin/doctors', icon: <UserRoundCog className="w-5 h-5" /> },
    { name: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { name: 'Specialties', path: '/admin/specialties', icon: <HeartPulse className="w-5 h-5" /> },
  ];

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 hidden md:block fixed h-[calc(100vh-73px)] z-40">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider text-sm">Admin Panel</h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                  isActive 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
