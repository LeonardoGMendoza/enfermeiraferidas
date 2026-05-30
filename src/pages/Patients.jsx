import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MapPin, Phone, Edit2, Trash2, Eye } from 'lucide-react';
import { getHomecares } from '../data';
import PatientModal from '../components/PatientModal';

const STATUS_MAP = {
  ativo:    { label: 'Ativo',    cls: 'badge-success' },
  alta:     { label: 'Alta',     cls: 'badge-info' },
  inativo:  { label: 'Inativo', cls: 'badge-danger' },
};

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [homecares, setHomecares] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const load = async () => { 
    try {
      const res = await fetch('/api/pacientes');
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      } else {
        setPatients([]);
      }
    } catch (e) {
      console.error(e);
      setPatients([]);
    } finally {
      setLoading(false);
    }
    setHomecares(getHomecares()); 
  };
  
  useEffect(() => { load(); }, []);

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.nome?.toLowerCase().includes(q) || p.bairro?.toLowerCase().includes(q) || p.tipoFerida?.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'todos' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = (data) => {
    savePatient(data);
    load();
    setShowModal(false);
    setEditing(null);
  };

  const handleDelete = (id) => {
    if (confirm('Excluir este paciente?')) { deletePatient(id); load(); }
  };

  const openEdit = (p) => { setEditing(p); setShowModal(true); };
  const openNew = () => { setEditing(null); setShowModal(true); };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-subtitle">{patients.length} pacientes cadastrados</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> Novo Paciente
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input className="form-input search-input" placeholder="Buscar por nome, bairro ou tipo..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {['todos','ativo','alta','inativo'].map(s => (
            <button key={s} className={`filter-tab ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
              {s === 'todos' ? 'Todos' : STATUS_MAP[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>Nenhum paciente encontrado</h3>
          <p>Cadastre um novo paciente ou ajuste os filtros</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Tipo de Ferida</th>
                <th>Bairro</th>
                <th>Homecare</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const hc = homecares.find(h => h.id === p.homecareId);
                const st = STATUS_MAP[p.status] || { label: p.status, cls: 'badge-primary' };
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="patient-cell">
                        <div className="patient-cell-avatar">{p.nome?.[0] || '?'}</div>
                        <div>
                          <div className="patient-cell-name">{p.nome}</div>
                          <div className="patient-cell-age"><Phone size={11} /> {p.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="ferida-cell">
                        <span className="ferida-tipo">{p.tipoFerida}</span>
                        {p.grau && <span className="badge badge-primary" style={{fontSize:'10px'}}>{p.grau}</span>}
                      </div>
                    </td>
                    <td>
                      <span className="meta-cell"><MapPin size={13} /> {p.endereco || 'Não informado'}</span>
                    </td>
                    <td>
                      <span className="meta-cell">{hc ? hc.nome : <span className="text-muted">—</span>}</span>
                    </td>
                    <td><span className={`badge badge-success`}>Ativo</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-action" title="Ver detalhes" onClick={() => navigate(`/app/pacientes/${p.id}`)}>
                          <Eye size={15} />
                        </button>
                        <button className="icon-action" title="Editar" onClick={() => openEdit(p)}>
                          <Edit2 size={15} />
                        </button>
                        <button className="icon-action danger" title="Excluir" onClick={() => handleDelete(p.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <PatientModal
          patient={editing}
          homecares={homecares}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
