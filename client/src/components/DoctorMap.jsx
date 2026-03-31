import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map center updates
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const DoctorMap = ({ doctors, center = [41.0082, 28.9784], zoom = 11, theme }) => {
  const navigate = useNavigate();

  return (
    <div className={`h-[400px] w-full rounded-2xl overflow-hidden shadow-xl border mb-8 z-0 ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={theme === 'dark' 
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        />
        {doctors.map((doctor) => (
          <Marker 
            key={doctor._id} 
            position={[doctor.coordinates.latitude, doctor.coordinates.longitude]}
          >
            <Popup>
              <div className="p-1 min-w-[150px]">
                <div className="flex items-center gap-2 mb-2">
                  <img src={doctor.image} alt={doctor.name} className="w-10 h-10 rounded-full object-cover border" />
                  <div>
                    <h4 className="font-bold text-sm m-0 leading-tight">{doctor.name}</h4>
                    <p className="text-xs text-indigo-600 m-0">{doctor.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                  <span>{doctor.rating}</span>
                  <span className="mx-2">|</span>
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{doctor.location}</span>
                </div>
                <button 
                  onClick={() => navigate(`/doctors/${doctor._id}`)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded transition-colors"
                >
                  View Profile
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DoctorMap;
