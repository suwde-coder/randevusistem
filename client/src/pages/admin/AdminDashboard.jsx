import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Activity, Users, UserRoundCog, CheckSquare, Star, TrendingUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import AuthContext from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        const { data } = await axios.get('/api/admin/analytics', config);
        setData(data);
      } catch (error) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user.token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Appointments', value: data?.stats.totalAppointments || 0, icon: <CheckSquare className="w-8 h-8 text-indigo-500" /> },
    { title: 'Active Doctors', value: data?.stats.totalDoctors || 0, icon: <UserRoundCog className="w-8 h-8 text-emerald-500" /> },
    { title: 'Registered Users', value: data?.stats.totalUsers || 0, icon: <Users className="w-8 h-8 text-rose-500" /> },
    { title: 'Appointments Today', value: data?.appointmentsByDay?.slice(-1)[0]?.count || 0, icon: <TrendingUp className="w-8 h-8 text-blue-500" /> },
  ];

  // Chart data configuration
  const chartData = {
    labels: data?.appointmentsByDay?.map(item => item.date.split('-').slice(1).join('/')) || [],
    datasets: [
      {
        fill: true,
        label: 'Appointments',
        data: data?.appointmentsByDay?.map(item => item.count) || [],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#6366f1',
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 12 }
        }
      },
      y: {
        grid: {
          color: '#334155',
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 12 },
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold text-white">Dashboard Overview</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm flex items-center space-x-4 transition-transform hover:scale-[1.02]">
            <div className="bg-slate-900/50 p-4 rounded-xl">
              {stat.icon}
            </div>
            <div>
              <p className="text-slate-400 font-medium text-sm">{stat.title}</p>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointments Chart */}
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-sm">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-indigo-500" /> Appointments (Last 7 Days)
          </h2>
          <div className="h-[300px] w-full">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Top Doctors */}
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-sm">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" /> Top Rated Doctors
          </h2>
          <div className="space-y-4">
            {data?.topDoctors.map((doctor, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-500/20 text-indigo-400 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-white font-bold">{doctor.name}</p>
                    <p className="text-slate-400 text-xs">{doctor.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center bg-yellow-500/10 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="text-yellow-500 font-bold">{doctor.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
