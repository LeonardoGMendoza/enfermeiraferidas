import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, Activity } from 'lucide-react';
import './Dashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar agendamentos reais do backend no futuro
    // Por enquanto, usaremos mock se o backend falhar
    const fetchAppointments = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/agendamentos`);
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        } else {
          // Fallback mock
          setAppointments([
            { id: 1, paciente: 'José Carlos Silva', data: new Date().toISOString().split('T')[0], hora: '14:00', status: 'confirmado', servico: 'Troca de Curativo', endereco: 'Moema, SP' },
            { id: 2, paciente: 'Maria Aparecida Souza', data: new Date().toISOString().split('T')[0], hora: '16:30', status: 'pendente', servico: 'Avaliação de Ferida', endereco: 'Bela Vista, SP' }
          ]);
        }
      } catch (err) {
        setAppointments([
          { id: 1, paciente: 'José Carlos Silva', data: new Date().toISOString().split('T')[0], hora: '14:00', status: 'confirmado', servico: 'Troca de Curativo', endereco: 'Moema, SP' },
          { id: 2, paciente: 'Maria Aparecida Souza', data: new Date().toISOString().split('T')[0], hora: '16:30', status: 'pendente', servico: 'Avaliação de Ferida', endereco: 'Bela Vista, SP' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);

  return (
    <div className="dashboard animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Agendamentos</h1>
          <p className="page-subtitle">Gerencie suas visitas e consultas</p>
        </div>
        <button className="btn btn-primary">
          <Calendar size={16} /> Novo Agendamento
        </button>
      </div>

      <div className="card dash-card" style={{ padding: '24px' }}>
        <h2 className="section-title mb-4">Próximas Visitas</h2>
        
        {loading ? (
          <p>Carregando agendamentos...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map(appt => (
              <div key={appt.id} className="card p-4 border border-slate-700 bg-slate-800">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <User size={18} className="text-primary" /> {appt.paciente}
                  </h3>
                  <span className={`badge ${appt.status === 'confirmado' ? 'badge-success' : 'badge-warning'}`}>
                    {appt.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="text-sm text-gray-400 space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} /> {appt.data}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} /> {appt.hora}
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity size={14} /> {appt.servico}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} /> {appt.endereco}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="btn btn-success flex-1 py-1 text-sm flex justify-center items-center gap-1">
                    <CheckCircle size={14} /> Concluir
                  </button>
                  <button className="btn btn-danger flex-1 py-1 text-sm flex justify-center items-center gap-1">
                    <XCircle size={14} /> Cancelar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
