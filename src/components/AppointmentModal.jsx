import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function AppointmentModal({ appointment, patients, onSave, onClose }) {
  const [formData, setFormData] = useState({
    patientId: '', data: '', hora: '', tipo: 'Curativo', status: 'agendado'
  });

  useEffect(() => {
    if (appointment) setFormData({ ...appointment });
  }, [appointment]);

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const p = patients.find(pat => pat.id === formData.patientId);
    if (!p) return alert('Selecione um paciente');

    onSave({
      ...formData,
      patientNome: p.nome,
      bairro: p.bairro
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{appointment ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Paciente</label>
            <select required name="patientId" className="form-select" value={formData.patientId} onChange={handleChange}>
              <option value="">Selecione...</option>
              {patients.filter(p => p.status === 'ativo').map(p => (
                <option key={p.id} value={p.id}>{p.nome} — {p.bairro}</option>
              ))}
            </select>
          </div>
          
          <div className="grid-2" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Data</label>
              <input type="date" required name="data" className="form-input" value={formData.data} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Hora</label>
              <input type="time" required name="hora" className="form-input" value={formData.hora} onChange={handleChange} />
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Tipo de Visita</label>
              <select required name="tipo" className="form-select" value={formData.tipo} onChange={handleChange}>
                <option value="Curativo">Curativo</option>
                <option value="Avaliação Inicial">Avaliação Inicial</option>
                <option value="Acompanhamento">Acompanhamento</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                <option value="agendado">Agendado</option>
                <option value="realizado">Realizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary"><Save size={16} /> Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
