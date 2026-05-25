import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function HomecareModal({ homecare, onSave, onClose }) {
  const [formData, setFormData] = useState({
    nome: '', contato: '', telefone: '', email: '', bairro: '', status: 'prospectando', pacientesEnviados: 0
  });

  useEffect(() => {
    if (homecare) setFormData({ ...homecare });
  }, [homecare]);

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{homecare ? 'Editar Homecare' : 'Nova Homecare'}</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Nome da Empresa</label>
            <input required name="nome" className="form-input" value={formData.nome} onChange={handleChange} />
          </div>
          <div className="grid-2" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Nome do Contato</label>
              <input required name="contato" className="form-input" placeholder="Ex: Dra. Maria" value={formData.contato} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Telefone (WhatsApp)</label>
              <input required name="telefone" className="form-input" placeholder="(11) 90000-0000" value={formData.telefone} onChange={handleChange} />
            </div>
          </div>
          <div className="grid-2" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Bairro Principal</label>
              <input name="bairro" className="form-input" value={formData.bairro} onChange={handleChange} />
            </div>
          </div>
          <div className="grid-2" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                <option value="prospectando">Prospectando</option>
                <option value="parceira">Parceira Ativa</option>
                <option value="inativa">Inativa</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Pacientes Enviados</label>
              <input type="number" name="pacientesEnviados" className="form-input" value={formData.pacientesEnviados} onChange={handleChange} disabled={!homecare} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary"><Save size={16} /> Salvar Homecare</button>
          </div>
        </form>
      </div>
    </div>
  );
}
