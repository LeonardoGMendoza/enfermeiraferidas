import { useNavigate } from 'react-router-dom';
import { Activity, Calendar, Phone, LogOut } from 'lucide-react';

export default function PacienteDashboard() {
  const navigate = useNavigate();
  const paciente = JSON.parse(localStorage.getItem('ef_paciente') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('ef_paciente_token');
    localStorage.removeItem('ef_paciente');
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '24px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--accent-primary)', borderRadius: '12px', padding: '8px' }}>
              <Activity size={24} color="white" />
            </div>
            <div>
              <h1 style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 700 }}>
                Olá, {paciente.nome || 'Paciente'}!
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Área do Paciente</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            <LogOut size={16} /> Sair
          </button>
        </div>
        <div className="card glass" style={{ padding: '24px', marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💚</div>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '22px', marginBottom: '8px' }}>
            Bem-vindo(a) ao seu espaço!
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
            Aqui você poderá acompanhar seus agendamentos e evolução do tratamento.
          </p>
          
          {paciente.tipo_ferida && (
            <div style={{ 
              background: 'rgba(14, 165, 233, 0.1)', 
              border: '1px solid var(--accent-primary)', 
              borderRadius: '8px', 
              padding: '12px',
              display: 'inline-block'
            }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Serviço Solicitado:
              </span>
              <strong style={{ color: 'var(--accent-primary)', fontSize: '16px' }}>
                {paciente.tipo_ferida}
              </strong>
            </div>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="card glass" style={{ padding: '20px', textAlign: 'center' }}>
            <Calendar size={32} color="var(--accent-primary)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ color: 'var(--text-primary)', fontSize: '16px', marginBottom: '8px' }}>Agendamentos</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Em breve</p>
          </div>
          <div className="card glass" style={{ padding: '20px', textAlign: 'center' }}>
            <Phone size={32} color="var(--accent-secondary)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ color: 'var(--text-primary)', fontSize: '16px', marginBottom: '8px' }}>Contato</h3>
            <a href="https://wa.me/5511989553812" target="_blank" rel="noreferrer"
              className="btn btn-accent btn-sm" style={{ marginTop: '8px', display: 'inline-block' }}>
              WhatsApp
            </a>
          </div>
        </div>

        {/* PIX Payment Section */}
        <div className="card glass" style={{ padding: '24px', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--accent-primary)', borderRadius: '8px', padding: '8px', display: 'flex' }}>
              <span style={{ fontWeight: 'bold', color: 'white', fontSize: '14px', letterSpacing: '1px' }}>PIX</span>
            </div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '18px', margin: 0 }}>Pagamento via PIX</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
            Para confirmar o seu agendamento, realize o pagamento utilizando o código Copia e Cola abaixo:
          </p>
          <div style={{ 
            background: 'var(--bg-secondary)', 
            padding: '16px', 
            borderRadius: '8px', 
            border: '1px solid var(--border-color)',
            marginBottom: '16px'
          }}>
            <code style={{ 
              color: 'var(--text-primary)', 
              fontSize: '12px', 
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              display: 'block'
            }}>
              00020126530014BR.GOV.BCB.PIX0131desenvolvimento3000@outlook.com5204000053039865802BR5924Leonardo Junior Gonzales6009SAO PAULO62140510oJPC2LZmwM63042F8F
            </code>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
            onClick={() => {
              navigator.clipboard.writeText('00020126530014BR.GOV.BCB.PIX0131desenvolvimento3000@outlook.com5204000053039865802BR5924Leonardo Junior Gonzales6009SAO PAULO62140510oJPC2LZmwM63042F8F');
              alert('Código PIX copiado com sucesso! Abra o app do seu banco para pagar.');
            }}
          >
            Copiar Código PIX
          </button>
        </div>
      </div>
    </div>
  );
}
