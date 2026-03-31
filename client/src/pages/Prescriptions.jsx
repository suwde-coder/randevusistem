import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import { FileText, Calendar, AlertCircle, Pill, ChevronDown, ChevronUp, Printer, Download } from 'lucide-react';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchPrescriptions = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('/api/prescriptions/user', config);
        setPrescriptions(data);
      } catch (err) {
        setError('Failed to load your prescriptions.');
      }
      setLoading(false);
    };

    fetchPrescriptions();
  }, [user, navigate]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handlePrint = (id) => {
    const printContent = document.getElementById(`prescription-card-${id}`);
    const originalContents = document.body.innerHTML;
    
    // Create a printable wrapper
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription - RandeVu</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; }
            .header { border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: 800; color: #4f46e5; }
            .doc-info { margin-bottom: 30px; }
            .doc-name { font-size: 20px; font-weight: 700; }
            .med-list { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .med-list th, .med-list td { padding: 12px; border: 1px solid #e5e7eb; text-align: left; }
            .med-list th { background: #f9fafb; font-size: 12px; text-transform: uppercase; }
            .notes { background: #f3f4f6; padding: 15px; border-radius: 8px; font-style: italic; margin-top: 20px; }
            .footer { margin-top: 50px; font-size: 12px; color: #6b7280; text-align: center; border-t: 1px solid #eee; padding-top: 20px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">RandeVu Medical</div>
            <div style="text-align: right">
              <p style="margin: 0; font-size: 14px;">Date: ${new Date().toLocaleDateString()}</p>
              <p style="margin: 0; font-size: 14px;">ID: PR-${id.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <div class="doc-info">
             <h1 class="doc-name">${printContent.getAttribute('data-doctor-name')}</h1>
             <p style="color: #4f46e5; font-weight: 600; margin: 0;">${printContent.getAttribute('data-specialty')}</p>
          </div>
          <p><strong>Patient:</strong> ${user.name}</p>
          <h3>Prescribed Medications</h3>
          <table class="med-list">
            <thead>
              <tr><th>Medicine</th><th>Dosage</th><th>Usage</th></tr>
            </thead>
            <tbody>
              ${Array.from(printContent.querySelectorAll('.med-item')).map(item => `
                <tr>
                  <td><strong>${item.getAttribute('data-name')}</strong></td>
                  <td>${item.getAttribute('data-dosage')}</td>
                  <td>${item.getAttribute('data-usage')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="notes">
            <strong>Doctor's Notes:</strong><br/>
            ${printContent.getAttribute('data-notes') || 'No additional notes.'}
          </div>
          <div class="footer">
            This is an electronically generated prescription. No signature required.
            <br/>Generated via RandeVu Medical Platform.
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
  };

  if (loading) return (
    <div className="min-h-[calc(100vh-73px)] py-20 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className={`min-h-[calc(100vh-73px)] py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
      <div className="max-w-5xl mx-auto w-full">
        <h1 className={`text-3xl font-extrabold tracking-tight mb-8 flex items-center transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <FileText className={`w-8 h-8 mr-3 transition-colors duration-300 ${theme === 'dark' ? 'text-indigo-500' : 'text-emerald-500'}`} />
          My Prescriptions
        </h1>

        {error && (
          <div className={`p-4 rounded-lg flex items-center mb-8 border transition-colors duration-300 ${theme === 'dark' ? 'bg-red-900/40 border-red-500/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
            <AlertCircle className="w-5 h-5 mr-3" />
            <p>{error}</p>
          </div>
        )}

        {prescriptions.length === 0 ? (
          <div className={`rounded-2xl p-10 text-center border shadow-xl transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
            <FileText className={`w-16 h-16 mx-auto mb-4 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-600' : 'text-emerald-300'}`} />
            <h3 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>No prescriptions yet</h3>
            <p className={`mb-6 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>You don't have any prescriptions in your medical history.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {prescriptions.map((pr) => (
              <div 
                key={pr._id} 
                id={`prescription-card-${pr._id}`}
                data-doctor-name={pr.doctorId?.name}
                data-specialty={pr.doctorId?.specialty}
                data-notes={pr.notes}
                className={`rounded-xl overflow-hidden shadow-lg border transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 hover:shadow-xl'
                }`}
              >
                {/* Header */}
                <div 
                  className={`p-6 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer transition-colors ${
                    theme === 'dark' ? 'hover:bg-slate-800/80' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleExpand(pr._id)}
                >
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <img 
                      src={pr.doctorId?.image || `https://ui-avatars.com/api/?name=${pr.doctorId?.name || 'Dr'}&background=random`} 
                      alt="Doctor" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/30" 
                    />
                    <div>
                      <h2 className={`text-xl font-bold transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {pr.doctorId?.name || 'Unknown Doctor'}
                      </h2>
                      <p className={`text-sm font-medium transition-colors ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {pr.doctorId?.specialty}
                      </p>
                      <div className={`flex items-center mt-1 text-xs transition-colors ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(pr.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePrint(pr._id); }}
                      className={`p-2 rounded-lg flex items-center text-xs font-bold transition-colors ${theme === 'dark' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                    >
                      <Download className="w-4 h-4 mr-1" /> PDF
                    </button>
                    <button className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-slate-700 text-slate-300 hover:text-white' : 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100'}`}>
                      {expandedId === pr._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === pr._id && (
                  <div className={`p-6 border-t transition-colors animate-in fade-in slide-in-from-top-4 duration-300 ${
                    theme === 'dark' ? 'border-slate-700 bg-slate-900/50' : 'border-gray-100 bg-gray-50'
                  }`}>
                    <h4 className={`text-sm tracking-widest uppercase font-bold mb-4 flex items-center transition-colors ${
                      theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
                    }`}>
                      <Pill className="w-4 h-4 mr-2" /> Prescribed Medicines
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {pr.medicines.map((med, idx) => (
                        <div 
                          key={idx} 
                          className="med-item"
                          data-name={med.name}
                          data-dosage={med.dosage}
                          data-usage={med.usage}
                        >
                          <div className={`p-4 rounded-xl border transition-colors ${
                            theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-indigo-100 shadow-sm'
                          }`}>
                            <p className={`font-bold text-lg mb-2 transition-colors ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-700'}`}>
                              {med.name}
                            </p>
                            <div className={`text-sm space-y-1 transition-colors ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                              <p><strong className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>Dosage:</strong> {med.dosage}</p>
                              <p><strong className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>Usage:</strong> {med.usage}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {pr.notes && (
                      <div className={`p-4 rounded-xl border transition-colors ${
                        theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-indigo-50/50 border-indigo-100'
                      }`}>
                        <h4 className={`text-xs uppercase font-bold mb-2 transition-colors ${
                          theme === 'dark' ? 'text-slate-500' : 'text-indigo-400'
                        }`}>
                          Doctor's Notes
                        </h4>
                        <p className={`italic transition-colors ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>"{pr.notes}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;
