import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function PatientModal({ patient, homecares, onSave, onClose }) {
  const [formData, setFormData] = useState({
    nome: '', idade: '', telefone: '', endereco: '', bairro: '', lat: '', lng: '',
    tipoFerida: '', grau: '', homecareId: '', obs: '', status: 'ativo'
  });

  useEffect(() => {
    if (patient) setFormData({ ...patient });
  }, [patient]);

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2 className="modal-title">{patient ? 'Editar Paciente' : 'Novo Paciente'}</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input required name="nome" className="form-input" value={formData.nome} onChange={handleChange} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Idade</label>
                <input type="number" required name="idade" className="form-input" value={formData.idade} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input required name="telefone" className="form-input" placeholder="(00) 0 0000-0000" value={formData.telefone} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: '16px' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Endereço Completo</label>
              <input required name="endereco" className="form-input" value={formData.endereco} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Bairro</label>
              <input required name="bairro" className="form-input" value={formData.bairro} onChange={handleChange} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Lat (Mapa)</label>
                <input name="lat" type="number" step="any" className="form-input" placeholder="-23.5505" value={formData.lat} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Lng (Mapa)</label>
                <input name="lng" type="number" step="any" className="form-input" placeholder="-46.6333" value={formData.lng} onChange={handleChange} />
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Homecare Parceira</label>
              <select name="homecareId" className="form-select" value={formData.homecareId} onChange={handleChange}>
                <option value="">Nenhuma (Particular)</option>
                {homecares.map(h => <option key={h.id} value={h.id}>{h.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de Ferida</label>
              <select required name="tipoFerida" className="form-select" value={formData.tipoFerida} onChange={handleChange}>
                <option value="">Selecione...</option>
                <option value="Úlcera por pressão">Úlcera por pressão</option>
                <option value="Úlcera diabética">Úlcera diabética</option>
                <option value="Úlcera venosa">Úlcera venosa</option>
                <option value="Ferida cirúrgica">Ferida cirúrgica</option>
                <option value="Celulite infecciosa">Celulite infecciosa</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Grau / Estágio</label>
              <input name="grau" className="form-input" placeholder="Ex: Grau II" value={formData.grau} onChange={handleChange} />
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                <option value="ativo">Ativo</option>
                <option value="alta">Alta</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Observações Iniciais</label>
            <textarea name="obs" className="form-textarea" value={formData.obs} onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary"><Save size={16} /> Salvar Paciente</button>
          </div>
        </form>
      </div>
    </div>
  );
}
