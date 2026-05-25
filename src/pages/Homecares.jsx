import { useState, useEffect } from 'react';
import { Building2, Plus, Search, Edit2, Trash2, Mail, Phone, ExternalLink } from 'lucide-react';
import { getHomecares, saveHomecare, deleteHomecare } from '../data';
import HomecareModal from '../components/HomecareModal';
import './Homecares.css';

const STATUS_MAP = {
  parceira:     { label: 'Parceira',     cls: 'badge-success' },
  prospectando: { label: 'Prospectando', cls: 'badge-warning' },
  inativa:      { label: 'Inativa',      cls: 'badge-danger' },
};

export default function Homecares() {
  const [homecares, setHomecares] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => setHomecares(getHomecares());
  useEffect(load, []);

  const filtered = homecares.filter(h => {
    const q = search.toLowerCase();
    return !q || h.nome?.toLowerCase().includes(q) || h.bairro?.toLowerCase().includes(q) || h.contato?.toLowerCase().includes(q);
  });

  const handleSave = (data) => {
    saveHomecare(data);
    load();
    setShowModal(false);
    setEditing(null);
  };

  const handleDelete = (id) => {
    if (confirm('Excluir esta Homecare?')) { deleteHomecare(id); load(); }
  };

  const openEdit = (h) => { setEditing(h); setShowModal(true); };
  const openNew = () => { setEditing(null); setShowModal(true); };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Homecares</h1>
          <p className="page-subtitle">Gestão de parcerias e prospecção</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> Nova Homecare
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input className="form-input search-input" placeholder="Buscar empresa ou contato..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏢</div>
          <h3>Nenhuma Homecare encontrada</h3>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(hc => {
            const st = STATUS_MAP[hc.status] || { label: hc.status, cls: 'badge-primary' };
            return (
              <div key={hc.id} className="card hc-card">
                <div className="hc-card-header">
                  <div className="hc-card-icon"><Building2 size={24} /></div>
                  <div className="hc-card-actions">
                    <button className="icon-action" onClick={() => openEdit(hc)}><Edit2 size={14}/></button>
                    <button className="icon-action danger" onClick={() => handleDelete(hc.id)}><Trash2 size={14}/></button>
                  </div>
                </div>
                <h3 className="hc-card-title">{hc.nome}</h3>
                <div className="hc-card-meta">{hc.bairro}</div>
                
                <div className="hc-card-contact">
                  <div className="contact-item"><Phone size={14}/> {hc.telefone || 'Sem telefone'}</div>
                  <div className="contact-item"><Mail size={14}/> {hc.email || 'Sem email'}</div>
                  <div className="contact-item" style={{color: 'var(--text-primary)'}}>
                    <span className="contact-label">Contato:</span> {hc.contato}
                  </div>
                </div>

                <div className="hc-card-footer">
                  <span className={`badge ${st.cls}`}>{st.label}</span>
                  <div className="hc-card-stats">
                    <strong>{hc.pacientesEnviados || 0}</strong> pacientes
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <HomecareModal
          homecare={editing}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
