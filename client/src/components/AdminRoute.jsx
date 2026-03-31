import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import AdminSidebar from './AdminSidebar';

const AdminRoute = () => {
  const { user } = useContext(AuthContext);

  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-[calc(100vh-73px)] bg-slate-900">
      <AdminSidebar />
      <div className="flex-1 p-8 ml-0 md:ml-64 transition-all overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminRoute;
