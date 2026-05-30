import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Phone, KeyRound } from 'lucide-react';
import './Login.css';

export default function LoginPaciente() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/login-paciente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Código inválido');
      localStorage.setItem('ef_paciente_token', data.token);
      localStorage.setItem('ef_paciente', JSON.stringify(data.paciente));
      navigate('/paciente/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card glass animate-slideIn">
        <div className="login-header">
          <div className="login-logo-icon"><Activity size={24} /></div>
          <h2>Área do Paciente</h2>
          <p>Entre com seu telefone e o código recebido via WhatsApp.</p>
        </div>
        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="login-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <div className="input-with-icon">
              <Phone size={18} className="input-icon" />
              <input type="email" required className="form-input pl-10"
                placeholder="seu@email.com" value={email}
                onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Senha</label>
            <div className="input-with-icon">
              <KeyRound size={18} className="input-icon" />
              <input type="password" required className="form-input pl-10"
                placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading}>
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
        <div className="login-footer">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
            ← Voltar para o Site
          </button>
        </div>
      </div>
    </div>
  );
}
