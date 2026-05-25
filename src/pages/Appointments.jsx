import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { getAppointments, saveAppointment, deleteAppointment, getPatients } from '../data';
import AppointmentModal from '../components/AppointmentModal';
import './Appointments.css';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setAppointments(getAppointments());
    setPatients(getPatients());
  };
  useEffect(load, []);

  const handleSave = (data) => {
    saveAppointment(data);
    load();
    setShowModal(false);
    setEditing(null);
  };

  const handleDelete = (id) => {
    if (confirm('Excluir este agendamento?')) { deleteAppointment(id); load(); }
  };

  const handleComplete = (appt) => {
    saveAppointment({ ...appt, status: 'realizado' });
    load();
  };

  const openNew = () => { setEditing(null); setShowModal(true); };

  // Group appointments by date
  const grouped = appointments.reduce((acc, curr) => {
    if (!acc[curr.data]) acc[curr.data] = [];
    acc[curr.data].push(curr);
    return acc;
  }, {});

  // Sort dates descending, then sort times ascending
  const sortedDates = Object.keys(grouped).sort((a,b) => new Date(b) - new Date(a));

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Agendamentos</h1>
          <p className="page-subtitle">Controle suas visitas e curativos</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> Novo Agendamento
        </button>
      </div>

      <div className="appts-container">
        {sortedDates.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon">📅</div>
            <h3>Sem agendamentos</h3>
            <p>Clique em "Novo Agendamento" para começar.</p>
          </div>
        ) : (
          sortedDates.map(date => {
            const dateObj = new Date(date + 'T12:00:00');
            const isToday = date === new Date().toISOString().split('T')[0];
            return (
              <div key={date} className="date-group">
                <div className="date-header">
                  <div className="date-day">{dateObj.getDate().toString().padStart(2, '0')}</div>
                  <div className="date-month-year">
                    <span>{dateObj.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}</span>
                    <span>{dateObj.getFullYear()}</span>
                  </div>
                  {isToday && <span className="badge badge-accent" style={{marginLeft: '12px'}}>Hoje</span>}
                </div>
                <div className="date-appts">
                  {grouped[date].sort((a,b) => a.hora.localeCompare(b.hora)).map(appt => {
                    const isDone = appt.status === 'realizado';
                    const isCanceled = appt.status === 'cancelado';
                    return (
                      <div key={appt.id} className={`appt-card ${isDone ? 'done' : ''} ${isCanceled ? 'canceled' : ''}`}>
                        <div className="appt-time-col">
                          <Clock size={16} className={isDone ? 'text-success' : 'text-primary'} />
                          <span>{appt.hora}</span>
                        </div>
                        <div className="appt-info-col">
                          <h4 className="appt-patient-name">{appt.patientNome}</h4>
                          <div className="appt-details">
                            {appt.tipo} · {appt.bairro}
                          </div>
                        </div>
                        <div className="appt-status-col">
                          {isDone ? (
                            <span className="badge badge-success"><CheckCircle size={12} style={{marginRight: '4px'}}/> Realizado</span>
                          ) : isCanceled ? (
                            <span className="badge badge-danger">Cancelado</span>
                          ) : (
                            <span className="badge badge-primary">Agendado</span>
                          )}
                        </div>
                        <div className="appt-actions-col">
                          {!isDone && !isCanceled && (
                            <button className="btn btn-sm btn-ghost" onClick={() => handleComplete(appt)} title="Marcar como realizado">
                              <CheckCircle size={14} className="text-success" />
                            </button>
                          )}
                          <button className="icon-action danger" onClick={() => handleDelete(appt.id)} title="Excluir">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <AppointmentModal
          appointment={editing}
          patients={patients}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
