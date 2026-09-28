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
  const [newEvo, setNewEvo] = useState({ desc: '', foto: '', materialUsado: '', custoMaterial: '', valorCobrado: '', pago: 'Pendente' });

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
      foto: newEvo.foto,
      materialUsado: newEvo.materialUsado,
      custoMaterial: newEvo.custoMaterial,
      valorCobrado: newEvo.valorCobrado,
      pago: newEvo.pago
    });
    setNewEvo({ desc: '', foto: '', materialUsado: '', custoMaterial: '', valorCobrado: '', pago: 'Pendente' });
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
                  <label className="form-label">Descrição da Evolução / Tratamento</label>
                  <textarea 
                    required 
                    className="form-textarea" 
                    placeholder="Ex: Limpeza com soro, curativo com alginato..."
                    value={newEvo.desc}
                    onChange={e => setNewEvo({...newEvo, desc: e.target.value})}
                  />
                </div>
                
                <div className="form-group mb-3">
                  <label className="form-label">Materiais Usados</label>
                  <textarea 
                    className="form-textarea" 
                    style={{ minHeight: '60px' }}
                    placeholder="Ex: 2 gazes, 1 atadura, pomada cicatrizante..."
                    value={newEvo.materialUsado || ''}
                    onChange={e => setNewEvo({...newEvo, materialUsado: e.target.value})}
                  />
                </div>

                <div className="pd-details-grid mb-3">
                  <div className="form-group">
                    <label className="form-label">Custo do Material (R$)</label>
                    <input 
                      type="number" step="0.01" 
                      className="form-input" 
                      placeholder="Ex: 30.00"
                      value={newEvo.custoMaterial || ''}
                      onChange={e => setNewEvo({...newEvo, custoMaterial: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Valor Cobrado (R$)</label>
                    <input 
                      type="number" step="0.01" 
                      className="form-input" 
                      placeholder="Ex: 150.00"
                      value={newEvo.valorCobrado || ''}
                      onChange={e => setNewEvo({...newEvo, valorCobrado: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select 
                      className="form-input" 
                      value={newEvo.pago || 'Pendente'}
                      onChange={e => setNewEvo({...newEvo, pago: e.target.value})}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Pago">Pago</option>
                    </select>
                  </div>
                </div>

                <div className="flex-end gap-2">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddEvo(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary btn-sm">Salvar Registro</button>
                </div>
              </form>
            )}

            <div className="evo-timeline">
              {evolutions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <h3>Nenhuma evolução registrada</h3>
                  <p>Adicione o primeiro atendimento para acompanhar o tratamento e lucros.</p>
                </div>
              ) : (
                evolutions.map((evo, i) => {
                  const d = new Date(evo.createdAt);
                  const cobrado = parseFloat(evo.valorCobrado) || 0;
                  const custo = parseFloat(evo.custoMaterial) || 0;
                  const lucro = cobrado - custo;
                  
                  return (
                    <div key={evo.id} className="evo-item">
                      <div className="evo-marker" />
                      <div className="evo-content">
                        <div className="evo-header">
                          <div>
                            <span className="evo-date">{d.toLocaleDateString('pt-BR')}</span>
                            <span className="evo-time">{d.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span>
                          </div>
                          {evo.pago === 'Pago' ? (
                            <span className="badge badge-success">Pago</span>
                          ) : (
                            <span className="badge badge-warning">Pendente</span>
                          )}
                        </div>
                        <div className="evo-desc"><strong>Tratamento:</strong> {evo.desc}</div>
                        
                        {evo.materialUsado && (
                          <div className="evo-desc" style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            <strong>Materiais:</strong> {evo.materialUsado}
                          </div>
                        )}

                        {(cobrado > 0 || custo > 0) && (
                          <div style={{ marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px', display: 'flex', gap: '20px', fontSize: '13px' }}>
                            <div>
                              <span style={{color: 'var(--text-secondary)'}}>Cobrado:</span>
                              <strong style={{display: 'block', color: 'var(--text-primary)'}}>R$ {cobrado.toFixed(2)}</strong>
                            </div>
                            <div>
                              <span style={{color: 'var(--text-secondary)'}}>Custo Mat.:</span>
                              <strong style={{display: 'block', color: 'var(--text-error)'}}>- R$ {custo.toFixed(2)}</strong>
                            </div>
                            <div style={{borderLeft: '1px solid #e2e8f0', paddingLeft: '20px'}}>
                              <span style={{color: 'var(--text-secondary)'}}>Lucro Real:</span>
                              <strong style={{display: 'block', color: 'var(--primary)', fontSize: '15px'}}>R$ {lucro.toFixed(2)}</strong>
                            </div>
                          </div>
                        )}

                        {evo.foto && (
                          <div className="evo-photo" style={{ marginTop: '12px' }}>
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
