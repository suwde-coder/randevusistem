import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const DoctorRoute = () => {
  const { user } = useContext(AuthContext);

  return user && user.isDoctor ? <Outlet /> : <Navigate to="/" />;
};

export default DoctorRoute;
