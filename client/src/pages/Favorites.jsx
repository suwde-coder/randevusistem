import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Heart, Search, MapPin, Star, UserSquare, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchFavorites = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/auth/favorites', config);
      setFavorites(data);
    } catch (error) {
      toast.error('Failed to load favorites');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchFavorites();
    }
  }, [user, navigate]);

  const toggleFavoriteItem = async (e, doctorId) => {
    e.preventDefault(); // prevent routing to doctor detail
    e.stopPropagation();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`/api/auth/favorites/${doctorId}`, {}, config);
      
      // Update global context
      const updatedUser = { ...user, favorites: data.favorites };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Instantly remove from local list since this is the favorites page
      setFavorites(favorites.filter(doc => doc._id !== doctorId));
      toast.success(data.message);
    } catch (err) {
      toast.error('Could not modify favorites');
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-8 flex items-center">
          <Heart className="w-8 h-8 mr-3 text-rose-500 fill-current" />
          My Favorite Doctors
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-indigo-500 w-12 h-12" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 bg-slate-800 rounded-2xl border border-slate-700">
            <Heart className="mx-auto h-16 w-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-medium text-slate-300">No favorites yet</h3>
            <p className="text-slate-400 mt-2 mb-6">Start exploring doctors to add them to your favorites list.</p>
            <Link to="/doctors" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors inline-block">
              Browse Doctors
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((doctor) => (
              <Link to={`/doctors/${doctor._id}`} key={doctor._id}>
                <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-indigo-500/20 group relative cursor-pointer">
                  <div className="absolute top-4 right-4 z-10">
                    <button 
                      onClick={(e) => toggleFavoriteItem(e, doctor._id)}
                      className="p-2 transition-transform hover:scale-110"
                    >
                      <Heart className="w-7 h-7 text-rose-500 fill-current drop-shadow-lg" />
                    </button>
                  </div>

                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={doctor.image} 
                      alt={doctor.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur px-2 py-1 flex items-center gap-1 rounded text-sm font-semibold text-yellow-400">
                      <Star className="w-4 h-4 fill-current" /> {doctor.rating}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{doctor.name}</h3>
                    <p className="text-indigo-400 font-medium mb-4">{doctor.specialty}</p>
                    <div className="flex items-center text-slate-400 mb-2 text-sm">
                      <MapPin className="w-4 h-4 mr-2" /> {doctor.location}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
