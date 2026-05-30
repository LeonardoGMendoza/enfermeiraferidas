import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';
import './Orcamento.css';

export default function Orcamento() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedService, setSelectedService] = useState('');
  const [formData, setFormData] = useState({ nome: '', phone: '', email: '', password: '' });
  const [isPreSelected, setIsPreSelected] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Pegar o serviço da URL se vier do botão da Landing Page
    const params = new URLSearchParams(location.search);
    const servicoParam = params.get('servico');
    if (servicoParam) {
      setSelectedService(servicoParam);
      setIsPreSelected(true);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Endpoint no backend (agora usando proxy Nginx via /api/)
      const response = await fetch('/api/orcamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, servico: selectedService })
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao solicitar orçamento');
      }
      setIsSubmitted(true);
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  if (isSubmitted) {
    return (
      <div className="orcamento-page">
        <header className="landing-header">
          <div className="lh-logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
            <div className="lh-logo-icon"><Activity size={20} /></div>
            <span className="lh-logo-name">Enfermeira Feridas</span>
          </div>
        </header>

        <div className="orcamento-container">
          <div className="orcamento-card glass" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h1 className="orcamento-title" style={{ marginBottom: '8px' }}>Pedido Recebido!</h1>
            <p className="orcamento-subtitle" style={{ marginBottom: '24px' }}>
              Seu cadastro foi criado e o serviço <strong>{selectedService}</strong> foi solicitado com sucesso.
            </p>

            <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '18px', marginBottom: '12px' }}>Atenção</h3>
              <p style={{ color: 'var(--text-primary)', fontSize: '15px', lineHeight: '1.5' }}>
                Para poder fecharmos a solicitação do serviço, entre na sua <strong>Área de Paciente</strong> e faça o pagamento via PIX para prosseguir com a visita.
              </p>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', fontSize: '16px', padding: '12px' }} onClick={() => navigate('/paciente/login')}>
              Acessar Minha Área de Paciente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orcamento-page">
      <header className="landing-header">
        <div className="lh-logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <div className="lh-logo-icon"><Activity size={20} /></div>
          <span className="lh-logo-name">Enfermeira Feridas</span>
        </div>
      </header>

      <div className="orcamento-container">
        <div className="orcamento-card glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h1 className="orcamento-title" style={{ marginBottom: 0 }}>Solicitar Orçamento</h1>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ border: '1px solid var(--border-color)' }}>
              <ArrowLeft size={16} /> Voltar
            </button>
          </div>
          <p className="orcamento-subtitle">
            Crie seu cadastro rápido e escolha o serviço. Entraremos em contato para finalizar os detalhes e horários.
          </p>

          <form onSubmit={handleSubmit} className="orcamento-form">
            {!isPreSelected ? (
              <div className="form-group">
                <label>Serviço Desejado</label>
                <select 
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  required
                >
                  <option value="">Selecione um serviço...</option>
                  <option value="Curativos Avançados">Curativos Avançados</option>
                  <option value="Pé Diabético">Pé Diabético</option>
                  <option value="Úlcera por Pressão">Úlcera por Pressão</option>
                  <option value="Pós-Operatório">Pós-Operatório</option>
                  <option value="Úlcera Venosa">Úlcera Venosa</option>
                  <option value="Parcerias B2B / Homecare">Parcerias B2B / Homecare</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label>Serviço Selecionado</label>
                <div style={{ 
                  padding: '12px 16px', 
                  background: 'rgba(14, 165, 233, 0.1)', 
                  border: '1px solid var(--accent-primary)', 
                  borderRadius: '8px',
                  color: 'var(--accent-primary)',
                  fontWeight: '600'
                }}>
                  {selectedService}
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Nome Completo</label>
              <input 
                type="text" required 
                value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>WhatsApp</label>
              <input 
                type="text" required placeholder="(11) 99999-9999"
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>E-mail</label>
                <input 
                  type="email" required 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Crie uma Senha</label>
                <input 
                  type="password" required 
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block">
              Finalizar Cadastro e Solicitar
            </button>
            
            <div className="whatsapp-alt">
              <span>Prefere um atendimento mais rápido?</span>
              <a href="https://wa.me/5511989553812" target="_blank" rel="noreferrer" className="text-accent">
                Chame no WhatsApp
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
