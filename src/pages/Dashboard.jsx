import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, Calendar, TrendingUp, Clock, MapPin, ChevronRight, Activity } from 'lucide-react';
import { getPatients, getHomecares, getAppointments } from '../data';
import './Dashboard.css';

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [homecares, setHomecares] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setPatients(getPatients());
    setHomecares(getHomecares());
    setAppointments(getAppointments());
  }, []);

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
