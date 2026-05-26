import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getPatients, getHomecares } from '../data';
import { MapPin, Navigation, User, Phone } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapView.css';

// Fix for default Leaflet icon in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom colored icons
const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const icons = {
  ativo: createIcon('green'),
  alta: createIcon('blue'),
  inativo: createIcon('grey')
};

export default function MapView() {
  const [patients, setPatients] = useState([]);
  const [homecares, setHomecares] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setPatients(getPatients());
    setHomecares(getHomecares());
  }, []);

  const mapCenter = [-23.5505, -46.6333]; // São Paulo center

  const activeCount = patients.filter(p => p.status === 'ativo').length;
  const mappedCount = patients.filter(p => p.lat && p.lng).length;

  return (
    <div className="map-page animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mapa de Pacientes</h1>
          <p className="page-subtitle">{mappedCount} pacientes localizados no mapa</p>
        </div>
      </div>

      <div className="map-layout">
        <div className="map-sidebar card">
          <h3 className="map-sidebar-title"><Navigation size={16}/> Resumo de Rotas</h3>
          
          <div className="map-stats">
            <div className="map-stat-box">
              <div className="map-stat-num text-success">{activeCount}</div>
              <div className="map-stat-label">Ativos Totais</div>
            </div>
            <div className="map-stat-box">
              <div className="map-stat-num text-primary">{mappedCount}</div>
              <div className="map-stat-label">Mapeados</div>
            </div>
          </div>

          <h4 className="map-sidebar-subtitle">Pacientes Ativos no Mapa</h4>
          <div className="map-patient-list">
            {patients.filter(p => p.status === 'ativo' && p.lat && p.lng).map(p => (
              <div key={p.id} className="map-patient-item" onClick={() => navigate(`/app/pacientes/${p.id}`)}>
                <MapPin size={14} className="text-success" />
                <div className="map-p-info">
                  <div className="map-p-name">{p.nome}</div>
                  <div className="map-p-bairro">{p.bairro}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="map-container-wrapper card">
          <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-lg)', zIndex: 1 }}>
            <TileLayer
              attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
              url="https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              subdomains={['0','1','2','3']}
              maxZoom={20}
            />
            {patients.filter(p => p.lat && p.lng).map(p => {
              const hc = homecares.find(h => h.id === p.homecareId);
              return (
                <Marker key={p.id} position={[p.lat, p.lng]} icon={icons[p.status] || icons.ativo}>
                  <Popup>
                    <div className="map-popup">
                      <div className="popup-header">
                        <strong>{p.nome}</strong>
                        <span className={`badge ${p.status === 'ativo' ? 'badge-success' : 'badge-info'}`}>{p.status}</span>
                      </div>
                      <div className="popup-body">
                        <div><User size={12}/> {p.tipoFerida}</div>
                        <div><MapPin size={12}/> {p.endereco}</div>
                        <div><Phone size={12}/> {p.telefone}</div>
                        {hc && <div className="text-primary" style={{marginTop:'4px'}}>Via: {hc.nome}</div>}
                      </div>
                      <button className="btn btn-primary btn-sm" style={{width:'100%', marginTop:'10px'}} onClick={() => navigate(`/app/pacientes/${p.id}`)}>
                        Ver Prontuário
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
