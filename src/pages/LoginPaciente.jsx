import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Phone, KeyRound } from 'lucide-react';
import './Login.css';

export default function LoginPaciente() {
  const [telefone, setTelefone] = useState('');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const tel = telefone.replace(/\D/g, '');
      const response = await fetch('/api/paciente/verificar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefone: tel, codigo })
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
            <label className="form-label">Telefone (com DDD)</label>
            <div className="input-with-icon">
              <Phone size={18} className="input-icon" />
              <input type="tel" required className="form-input pl-10"
                placeholder="11999999999" value={telefone}
                onChange={e => setTelefone(e.target.value)} />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Código de Acesso</label>
            <div className="input-with-icon">
              <KeyRound size={18} className="input-icon" />
              <input type="text" required maxLength={6} className="form-input pl-10"
                placeholder="123456" value={codigo}
                onChange={e => setCodigo(e.target.value)} />
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
