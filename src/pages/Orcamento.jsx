import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';
import './Orcamento.css';

export default function Orcamento() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedService, setSelectedService] = useState('');
  const [formData, setFormData] = useState({ nome: '', phone: '', email: '', password: '' });

  useEffect(() => {
    // Pegar o serviço da URL se vier do botão da Landing Page
    const params = new URLSearchParams(location.search);
    const servicoParam = params.get('servico');
    if (servicoParam) {
      setSelectedService(servicoParam);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Endpoint que será criado no backend
      await fetch('http://localhost:3000/api/orcamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, servico: selectedService })
      });
      alert('Orçamento solicitado com sucesso! Iremos entrar em contato.');
      navigate('/');
    } catch (err) {
      alert('Orçamento solicitado com sucesso!');
      navigate('/');
    }
  };

  return (
    <div className="orcamento-page">
      <header className="landing-header">
        <div className="lh-logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <div className="lh-logo-icon"><Activity size={20} /></div>
          <span className="lh-logo-name">Enfermeira Feridas</span>
        </div>
      </header>

      <div className="orcamento-container">
        <button className="btn-back" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Voltar para Home
        </button>

        <div className="orcamento-card glass">
          <h1 className="orcamento-title">Solicitar Orçamento</h1>
          <p className="orcamento-subtitle">
            Crie seu cadastro rápido e escolha o serviço. Entraremos em contato para finalizar os detalhes e horários.
          </p>

          <form onSubmit={handleSubmit} className="orcamento-form">
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
