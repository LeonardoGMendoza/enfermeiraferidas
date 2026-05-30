import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, Calendar, TrendingUp, Clock, MapPin, ChevronRight, Activity, Bell, Check, X } from 'lucide-react';
import { getPatients, getHomecares, getAppointments } from '../data';
import './Dashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [homecares, setHomecares] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setPatients(getPatients());
    setHomecares(getHomecares());
    setAppointments(getAppointments());
    
    // Fetch alertas from backend
    const fetchAlertas = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/alertas`);
        if (res.ok) {
          const data = await res.json();
          setAlertas(data);
        }
      } catch (err) {
        console.error('Erro ao buscar alertas:', err);
      }
    };
    
    fetchAlertas();
    const interval = setInterval(fetchAlertas, 10000); // Polling cada 10s
    return () => clearInterval(interval);
  }, []);

  const handleConfirmPix = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/alertas/${id}/confirmar`, { method: 'POST' });
      if (res.ok) {
        setAlertas(alertas.filter(a => a.id !== id));
        // Aqui também deve criar o paciente e agendamento usando data.js para o local storage
        alert('Pagamento confirmado e paciente notificado!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectPix = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/alertas/${id}/rejeitar`, { method: 'POST' });
      if (res.ok) {
        setAlertas(alertas.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.data === today);
  const activePatients = patients.filter(p => p.status === 'ativo');
  const partnerHomecares = homecares.filter(h => h.status === 'parceira');
  const doneToday = todayAppts.filter(a => a.status === 'realizado').length;

  const stats = [
    { label: 'Pacientes Ativos', value: activePatients.length, icon: Users, color: 'primary', sub: `${patients.length} total` },
    { label: 'Homecares Parceiras', value: partnerHomecares.length, icon: Building2, color: 'accent', sub: `${homecares.length} total` },
    { label: 'Visitas Hoje', value: todayAppts.length, icon: Calendar, color: 'success', sub: `${doneToday} realizadas` },
    { label: 'Taxa de Conclusão', value: todayAppts.length ? `${Math.round((doneToday/todayAppts.length)*100)}%` : '—', icon: TrendingUp, color: 'info', sub: 'visitas hoje' },
  ];

  const statusMap = { agendado: { label: 'Agendado', cls: 'badge-primary' }, realizado: { label: 'Realizado', cls: 'badge-success' }, cancelado: { label: 'Cancelado', cls: 'badge-danger' } };
  const tipoFerida2Color = { 'Úlcera por pressão': 'danger', 'Úlcera diabética': 'warning', 'Ferida cirúrgica': 'info', 'Celulite infecciosa': 'accent', 'Úlcera venosa': 'primary' };

  return (
    <div className="dashboard animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão geral do seu negócio</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/app/agendamentos')}>
          <Calendar size={16} /> Novo Agendamento
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className={`stat-card card stat-${s.color}`}>
            <div className="stat-icon-wrap">
              <s.icon size={22} />
            </div>
            <div className="stat-body">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alertas WhatsApp */}
      {alertas.length > 0 && (
        <div className="alertas-section mb-6">
          <h2 className="section-title flex items-center gap-2 mb-4 text-warning">
            <Bell size={20} /> Pedidos Pendentes WhatsApp ({alertas.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alertas.map(alerta => (
              <div key={alerta.id} className="card p-4 border-l-4 border-warning bg-opacity-10 bg-warning">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{alerta.nome}</h3>
                  <span className="badge badge-warning">PIX Pendente</span>
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  <p><strong>Telefone:</strong> {alerta.phone}</p>
                  <p><strong>Endereço:</strong> {alerta.endereco}</p>
                  <p><strong>Serviço:</strong> {alerta.tipo_servico}</p>
                  <p><strong>Valor:</strong> R$ {alerta.valor}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleConfirmPix(alerta.id)} className="btn btn-success flex-1 py-2 text-sm flex justify-center items-center gap-1">
                    <Check size={16} /> Confirmar PIX
                  </button>
                  <button onClick={() => handleRejectPix(alerta.id)} className="btn btn-danger flex-1 py-2 text-sm flex justify-center items-center gap-1">
                    <X size={16} /> Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dash-grid">
        {/* Today's appointments */}
        <div className="card dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <Clock size={18} className="icon-primary" />
              Visitas de Hoje
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/agendamentos')}>
              Ver todas <ChevronRight size={14} />
            </button>
          </div>
          {todayAppts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3>Nenhuma visita hoje</h3>
              <p>Agende visitas para seus pacientes</p>
            </div>
          ) : (
            <div className="appt-list">
              {todayAppts.sort((a,b) => a.hora.localeCompare(b.hora)).map(appt => (
                <div key={appt.id} className="appt-item">
                  <div className="appt-time">{appt.hora}</div>
                  <div className="appt-info">
                    <div className="appt-patient">{appt.patientNome}</div>
                    <div className="appt-meta">
                      <MapPin size={12} /> {appt.bairro} · {appt.tipo}
                    </div>
                  </div>
                  <span className={`badge ${statusMap[appt.status]?.cls || 'badge-primary'}`}>
                    {statusMap[appt.status]?.label || appt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active patients */}
        <div className="card dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <Activity size={18} className="icon-primary" />
              Pacientes Ativos
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/pacientes')}>
              Ver todos <ChevronRight size={14} />
            </button>
          </div>
          {activePatients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3>Nenhum paciente ativo</h3>
            </div>
          ) : (
            <div className="patient-list">
              {activePatients.slice(0, 5).map(p => {
                const hc = homecares.find(h => h.id === p.homecareId);
                const color = tipoFerida2Color[p.tipoFerida] || 'primary';
                return (
                  <div key={p.id} className="patient-item" onClick={() => navigate(`/app/pacientes/${p.id}`)}>
                    <div className={`patient-dot status-dot active`} />
                    <div className="patient-info">
                      <div className="patient-name">{p.nome}</div>
                      <div className="patient-meta">{p.bairro} · {p.tipoFerida}</div>
                    </div>
                    <span className={`badge badge-${color}`}>{p.grau}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Homecares */}
        <div className="card dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <Building2 size={18} className="icon-primary" />
              Homecares Parceiras
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/homecares')}>
              Gerenciar <ChevronRight size={14} />
            </button>
          </div>
          <div className="hc-list">
            {homecares.map(hc => (
              <div key={hc.id} className="hc-item">
                <div className={`status-dot ${hc.status === 'parceira' ? 'active' : 'warning'}`} />
                <div className="hc-info">
                  <div className="hc-name">{hc.nome}</div>
                  <div className="hc-meta">{hc.bairro} · {hc.pacientesEnviados || 0} pacientes</div>
                </div>
                <span className={`badge ${hc.status === 'parceira' ? 'badge-success' : 'badge-warning'}`}>
                  {hc.status === 'parceira' ? 'Parceira' : 'Prospectando'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick map preview */}
        <div className="card dash-card dash-map-preview">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <MapPin size={18} className="icon-primary" />
              Mapa de Pacientes
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/app/mapa')}>
              Abrir Mapa
            </button>
          </div>
          <div className="map-preview-content">
            <div className="map-preview-visual">
              <div className="map-preview-bg">🗺️</div>
              <div className="map-preview-pins">
                {activePatients.slice(0,4).map((p, i) => (
                  <div key={p.id} className={`map-pin pin-${i}`}>📍</div>
                ))}
              </div>
            </div>
            <div className="map-preview-info">
              <div className="map-stat"><span>{activePatients.length}</span> pacientes no mapa</div>
              <div className="map-stat"><span>{[...new Set(activePatients.map(p=>p.bairro))].length}</span> bairros</div>
              <p className="map-hint">Clique em "Abrir Mapa" para ver a localização de todos os pacientes e otimizar suas rotas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
