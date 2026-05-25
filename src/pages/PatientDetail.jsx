import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Phone, Building2, Plus, Camera, FileText } from 'lucide-react';
import { getPatientById, getHomecares, getEvolutions, saveEvolution } from '../data';
import './PatientDetail.css';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [homecare, setHomecare] = useState(null);
  const [evolutions, setEvolutions] = useState([]);
  const [showAddEvo, setShowAddEvo] = useState(false);
  const [newEvo, setNewEvo] = useState({ desc: '', foto: '' });

  const load = () => {
    const p = getPatientById(id);
    if (!p) return navigate('/app/pacientes');
    setPatient(p);
    
    if (p.homecareId) {
      const hcs = getHomecares();
      setHomecare(hcs.find(h => h.id === p.homecareId));
    }
    
    setEvolutions(getEvolutions(id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  useEffect(load, [id]);

  if (!patient) return null;

  const handleAddEvo = (e) => {
    e.preventDefault();
    saveEvolution({
      patientId: id,
      desc: newEvo.desc,
      foto: newEvo.foto // in a real app this would be an uploaded URL
    });
    setNewEvo({ desc: '', foto: '' });
    setShowAddEvo(false);
    load();
  };

  return (
    <div className="animate-fadeIn">
      <button className="btn btn-ghost btn-sm mb-4" onClick={() => navigate('/app/pacientes')}>
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="pd-header card">
        <div className="pd-header-main">
          <div className="pd-avatar">{patient.nome[0]}</div>
          <div className="pd-title-area">
            <h1 className="pd-name">{patient.nome}</h1>
            <div className="pd-meta">
              <span>{patient.idade} anos</span>
              <span className="dot-sep" />
              <span className={`badge ${patient.status === 'ativo' ? 'badge-success' : 'badge-info'}`}>{patient.status}</span>
            </div>
          </div>
        </div>
        
        <div className="pd-details-grid">
          <div className="pd-detail-item">
            <Phone size={16} className="text-muted" />
            <div>
              <div className="detail-label">Telefone</div>
              <div className="detail-value">{patient.telefone}</div>
            </div>
          </div>
          <div className="pd-detail-item">
            <MapPin size={16} className="text-muted" />
            <div>
              <div className="detail-label">Endereço</div>
              <div className="detail-value">{patient.endereco}</div>
              <div className="detail-sub">{patient.bairro}</div>
            </div>
          </div>
          <div className="pd-detail-item">
            <Building2 size={16} className="text-muted" />
            <div>
              <div className="detail-label">Origem / Homecare</div>
              <div className="detail-value">{homecare ? homecare.nome : 'Particular'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="pd-content">
        <div className="pd-sidebar">
          <div className="card pd-clinical-card">
            <h3 className="pd-card-title"><User size={18}/> Informações Clínicas</h3>
            <div className="clinical-data">
              <div className="c-label">Tipo de Ferida</div>
              <div className="c-value">{patient.tipoFerida}</div>
              
              <div className="c-label mt-3">Grau/Estágio</div>
              <div className="c-value"><span className="badge badge-primary">{patient.grau || 'Não definido'}</span></div>
              
              <div className="c-label mt-3">Observações Iniciais</div>
              <div className="c-value text-muted">{patient.obs || 'Nenhuma observação registrada.'}</div>
            </div>
          </div>
        </div>

        <div className="pd-main">
          <div className="card pd-evo-card">
            <div className="pd-card-header">
              <h3 className="pd-card-title"><FileText size={18}/> Evolução da Ferida</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddEvo(!showAddEvo)}>
                <Plus size={16} /> Nova Evolução
              </button>
            </div>

            {showAddEvo && (
              <form className="evo-form animate-slideIn" onSubmit={handleAddEvo}>
                <div className="form-group mb-3">
                  <label className="form-label">Descrição da Evolução / Curativo</label>
                  <textarea 
                    required 
                    className="form-textarea" 
                    placeholder="Descreva o aspecto da ferida, exsudato, bordas, tecido de granulação..."
                    value={newEvo.desc}
                    onChange={e => setNewEvo({...newEvo, desc: e.target.value})}
                  />
                </div>
                <div className="form-group mb-4">
                  <label className="form-label"><Camera size={14} style={{display:'inline', marginRight:'4px'}}/> URL da Foto (Opcional - Simulação)</label>
                  <input 
                    type="url" 
                    className="form-input" 
                    placeholder="https://exemplo.com/foto.jpg"
                    value={newEvo.foto}
                    onChange={e => setNewEvo({...newEvo, foto: e.target.value})}
                  />
                </div>
                <div className="flex-end gap-2">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddEvo(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary btn-sm">Salvar Evolução</button>
                </div>
              </form>
            )}

            <div className="evo-timeline">
              {evolutions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <h3>Nenhuma evolução registrada</h3>
                  <p>Adicione a primeira evolução para acompanhar o tratamento.</p>
                </div>
              ) : (
                evolutions.map((evo, i) => {
                  const d = new Date(evo.createdAt);
                  return (
                    <div key={evo.id} className="evo-item">
                      <div className="evo-marker" />
                      <div className="evo-content">
                        <div className="evo-header">
                          <span className="evo-date">{d.toLocaleDateString('pt-BR')}</span>
                          <span className="evo-time">{d.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="evo-desc">{evo.desc}</div>
                        {evo.foto && (
                          <div className="evo-photo">
                            <img src={evo.foto} alt="Evolução" onError={(e) => e.target.style.display='none'} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
