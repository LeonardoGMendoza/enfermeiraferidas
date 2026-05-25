import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail } from 'lucide-react';
import './Login.css';

export default function Login() {
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
      // Quando o backend estiver pronto, você usará isso:
      /*
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao logar');
      localStorage.setItem('ef_token', data.token);
      localStorage.setItem('ef_user', JSON.stringify(data.user));
      navigate('/app');
      */

      // Simulação Temporária enquanto o BD não é configurado:
      if (email === 'admin@feridas.com' && password === '123456') {
        localStorage.setItem('ef_token', 'temp_token_123');
        navigate('/app');
      } else {
        throw new Error('E-mail ou senha incorretos. (Use admin@feridas.com / 123456 na demonstração)');
      }
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
          <h2>Área Restrita</h2>
          <p>Faça login para gerenciar seus pacientes e agendamentos.</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="login-error">{error}</div>}
          
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                required 
                className="form-input pl-10" 
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Senha</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                required 
                className="form-input pl-10" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar no Sistema'}
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
