import { useState } from 'react';
import { X, Save } from 'lucide-react';

export default function AppointmentModal({ selectedDate, onClose, onSave, patients }) {
  const [formData, setFormData] = useState({
    paciente: '',
    data: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
    hora: '',
    servico: 'Avaliação',
    endereco: '',
    status: 'pendente'
  });

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Novo Agendamento</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <label className="form-label">Paciente</label>
            <select required name="paciente" className="form-select" value={formData.paciente} onChange={handleChange}>
              <option value="">Selecione o paciente...</option>
              {patients && patients.map(p => (
                <option key={p.id} value={p.nome}>{p.nome}</option>
              ))}
              <option value="Outro (Não cadastrado)">Outro (Não cadastrado)</option>
            </select>
          </div>
          
          <div className="grid-2 mb-4">
            <div className="form-group">
              <label className="form-label">Data</label>
              <input type="date" required name="data" className="form-input" value={formData.data} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Hora</label>
              <input type="time" required name="hora" className="form-input" value={formData.hora} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Serviço / Procedimento</label>
            <input required name="servico" className="form-input" placeholder="Ex: Troca de Curativo, Avaliação" value={formData.servico} onChange={handleChange} />
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Endereço da Visita</label>
            <input required name="endereco" className="form-input" placeholder="Ex: Rua das Flores, 123" value={formData.endereco} onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary"><Save size={16} /> Agendar Visita</button>
          </div>
        </form>
      </div>
    </div>
  );
}
