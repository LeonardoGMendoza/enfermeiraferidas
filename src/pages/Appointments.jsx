import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AppointmentModal from '../components/AppointmentModal';
import './Appointments.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);

  // Fetch real appointments & patients
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/agendamentos`);
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        } else {
          setAppointments([]);
        }
      } catch (err) {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchPatients = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/pacientes`);
        if (res.ok) {
          const data = await res.json();
          setPatients(data);
        }
      } catch (err) { console.error(err); }
    };

    fetchAppointments();
    fetchPatients();
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const onDateClick = day => {
    setSelectedDate(day);
  };

  const handleSaveAppointment = async (data) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/agendamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const newAppt = await res.json();
        setAppointments(prev => [...prev, newAppt]);
      } else {
        // Fallback visual case the API is not ready
        setAppointments(prev => [...prev, { id: Date.now(), ...data }]);
      }
    } catch (err) {
      setAppointments(prev => [...prev, { id: Date.now(), ...data }]);
    }
    setShowModal(false);
  };

  // Calendar rendering logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const dateFormat = 'dd';
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = '';

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      // Filter appointments for this day
      const dayAppts = appointments.filter(a => a.data && isSameDay(parseISO(a.data), cloneDay));

      days.push(
        <div
          className={`cal-cell ${!isSameMonth(day, monthStart) ? 'disabled' : isSameDay(day, selectedDate) ? 'selected' : ''}`}
          key={day}
          onClick={() => onDateClick(parseISO(cloneDay.toISOString()))}
        >
          <span className="cal-number">{formattedDate}</span>
          <div className="cal-events">
            {dayAppts.map(a => (
              <div key={a.id} className={`cal-event-pill ${a.status === 'confirmado' ? 'bg-success' : 'bg-warning'}`} title={`${a.hora} - ${a.paciente}`}>
                {a.hora} {a.paciente?.split(' ')[0]}
              </div>
            ))}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(<div className="cal-row" key={day}>{days}</div>);
    days = [];
  }

  const selectedAppts = appointments.filter(a => a.data && isSameDay(parseISO(a.data), selectedDate));

  return (
    <div className="appointments-page animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Agenda</h1>
          <p className="page-subtitle">Planejamento de Visitas e Plantões</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <CalendarIcon size={16} /> Novo Agendamento
        </button>
      </div>

      <div className="agenda-layout">
        <div className="card cal-container">
          <div className="cal-header">
            <button className="icon-btn" onClick={prevMonth}><ChevronLeft size={20}/></button>
            <h2 className="cal-month">{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</h2>
            <button className="icon-btn" onClick={nextMonth}><ChevronRight size={20}/></button>
          </div>
          
          <div className="cal-days-header">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="cal-day-name">{d}</div>
            ))}
          </div>
          
          <div className="cal-body">
            {rows}
          </div>
        </div>

        <div className="card cal-details">
          <h3 className="cal-details-title">
            <CalendarIcon size={16} style={{display:'inline', marginRight:'8px'}}/>
            {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </h3>
          
          <div className="cal-details-list">
            {loading ? (
               <p className="text-muted">Carregando...</p>
            ) : selectedAppts.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum paciente agendado para este dia.</p>
              </div>
            ) : (
              selectedAppts.map(appt => (
                <div key={appt.id} className="appt-card">
                  <div className="appt-card-header">
                    <span className="appt-time"><Clock size={14}/> {appt.hora}</span>
                    <span className={`badge ${appt.status === 'confirmado' ? 'badge-success' : 'badge-warning'}`}>{appt.status}</span>
                  </div>
                  <div className="appt-patient"><User size={14}/> {appt.paciente}</div>
                  <div className="appt-service">{appt.servico}</div>
                  
                  <div className="appt-actions">
                    <button className="btn btn-success btn-sm"><CheckCircle size={14}/> Concluir</button>
                    <button className="btn btn-danger btn-sm"><XCircle size={14}/> Cancelar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <AppointmentModal
          selectedDate={selectedDate}
          patients={patients}
          onClose={() => setShowModal(false)}
          onSave={handleSaveAppointment}
        />
      )}
    </div>
  );
}
