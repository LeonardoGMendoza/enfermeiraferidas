import { useNavigate } from 'react-router-dom';
import { Activity, MapPin, Phone, Star, ArrowRight, Shield, Clock, Heart, Cross } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Header */}
      <header className="landing-header">
        <div className="lh-logo">
          <div className="lh-logo-icon"><Activity size={20} /></div>
          <div>
            <span className="lh-logo-name">Enfermeira Feridas</span>
          </div>
        </div>
        <nav className="lh-nav">
          <a href="#servicos">Serviços</a>
          <a href="#sobre">Sobre</a>
          <a href="#contato">Contato</a>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/app')}>
            Área Restrita
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-bubble bubble-1" />
          <div className="hero-bubble bubble-2" />
          <div className="hero-bubble bubble-3" />
          <div className="hero-glow" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <Shield size={14} />
            Especialista Certificada em Cuidados de Feridas
          </div>
          <h1 className="hero-title">
            Cuidado especializado<br />
            <span className="gradient-text">direto na sua casa</span>
          </h1>
          <p className="hero-subtitle">
            Enfermeira especialista em tratamento de feridas complexas, úlceras e curativos avançados.
            Atendimento domiciliar em toda São Paulo com qualidade hospitalar.
          </p>
          <div className="hero-actions">
            <a
              href="https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20agendar%20uma%20avaliação%20de%20ferida."
              className="btn btn-accent btn-lg"
              target="_blank"
              rel="noreferrer"
            >
              💬 Agendar via WhatsApp
            </a>
            <a href="#servicos" className="btn btn-ghost btn-lg">
              Ver Serviços <ArrowRight size={16} />
            </a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">200+</span>
              <span className="hero-stat-label">Pacientes Atendidos</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">5★</span>
              <span className="hero-stat-label">Avaliação Média</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">SP</span>
              <span className="hero-stat-label">Toda São Paulo</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card glass">
            <div className="hcard-header">
              <div className="hcard-pulse"><span /></div>
              <span>Atendimento em andamento</span>
            </div>
            <div className="hcard-patient">
              <div className="hcard-avatar">👴</div>
              <div>
                <div className="hcard-name">José Carlos, 72 anos</div>
                <div className="hcard-type">Úlcera por Pressão — Grau III</div>
              </div>
            </div>
            <div className="hcard-progress">
              <div className="hcard-progress-label">
                <span>Evolução do Tratamento</span>
                <span className="text-success">78%</span>
              </div>
              <div className="hcard-progress-bar">
                <div className="hcard-progress-fill" style={{width:'78%'}} />
              </div>
            </div>
            <div className="hcard-tags">
              <span className="badge badge-success">Curativo Trocado</span>
              <span className="badge badge-primary">Visita 12 de 15</span>
            </div>
          </div>
          <div className="hero-float-card glass">
            <MapPin size={16} className="text-accent" />
            <span>Moema, São Paulo</span>
          </div>
          <div className="hero-float-card hero-float-card-2 glass">
            <Heart size={16} className="text-danger" />
            <span>Próxima visita: Hoje 14h</span>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="section" id="servicos">
        <div className="section-label">O que oferecemos</div>
        <h2 className="section-title">Serviços Especializados</h2>
        <p className="section-sub">Tratamentos avançados com protocolo clínico de excelência</p>
        <div className="services-grid">
          {[
            { icon: '🩹', title: 'Curativos Avançados', desc: 'Curativos complexos com materiais de última geração para cicatrização acelerada e controle de infecção.' },
            { icon: '🦶', title: 'Pé Diabético', desc: 'Cuidado especializado para úlceras diabéticas, avaliação vascular e prevenção de complicações.' },
            { icon: '🛏️', title: 'Úlcera por Pressão', desc: 'Tratamento e prevenção de escaras em pacientes acamados com protocolo completo de reposicionamento.' },
            { icon: '🏥', title: 'Pós-Operatório', desc: 'Acompanhamento e cuidado de feridas cirúrgicas no domicílio com segurança e conforto.' },
            { icon: '🦵', title: 'Úlcera Venosa', desc: 'Tratamento de úlceras vasculares com terapia compressiva e curativos especializados.' },
            { icon: '🤝', title: 'Parcerias Homecare', desc: 'Atendemos pacientes encaminhados por empresas de homecare com relatórios periódicos.' },
          ].map((s, i) => (
            <div key={i} className="service-card card animate-fadeIn" style={{animationDelay:`${i*0.1}s`}}>
              <div className="service-icon">{s.icon}</div>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sobre */}
      <section className="section section-alt" id="sobre">
        <div className="about-wrapper">
          <div className="about-visual">
            <div className="about-badge-grid">
              {[
                { icon: '🎓', label: 'Curso de Feridas', sub: 'Especialização' },
                { icon: '🏥', label: 'Homecares', sub: 'Parcerias Ativas' },
                { icon: '📋', label: 'Relatórios', sub: 'Mensais' },
                { icon: '🚗', label: 'Atendimento', sub: 'Domiciliar SP' },
              ].map((b, i) => (
                <div key={i} className="about-badge-card glass">
                  <span className="about-badge-icon">{b.icon}</span>
                  <span className="about-badge-label">{b.label}</span>
                  <span className="about-badge-sub">{b.sub}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="about-content">
            <div className="section-label">Sobre mim</div>
            <h2 className="section-title" style={{textAlign:'left'}}>
              Dedicação e expertise<br />no cuidado de feridas
            </h2>
            <p className="about-text">
              Sou enfermeira com especialização em cuidados de feridas complexas. Minha missão é 
              proporcionar tratamento de qualidade hospitalar no conforto do lar, com atenção 
              humanizada e protocolos clínicos atualizados.
            </p>
            <p className="about-text">
              Atendo pacientes encaminhados por empresas de homecare em toda São Paulo, 
              oferecendo relatórios periódicos de evolução e comunicação constante com as equipes.
            </p>
            <div className="about-highlights">
              {[
                { icon: <Shield size={16} />, text: 'COREN ativo e regularizado' },
                { icon: <Clock size={16} />, text: 'Disponível 7 dias por semana' },
                { icon: <Star size={16} />, text: 'Especialização em feridas complexas' },
              ].map((h, i) => (
                <div key={i} className="about-highlight">
                  <span className="highlight-icon">{h.icon}</span>
                  {h.text}
                </div>
              ))}
            </div>
            <a
              href="https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20os%20serviços."
              className="btn btn-primary btn-lg"
              target="_blank"
              rel="noreferrer"
            >
              <Phone size={18} /> Falar Comigo
            </a>
          </div>
        </div>
      </section>

      {/* Homecare CTA */}
      <section className="section" id="homecares">
        <div className="hc-cta glass">
          <div className="hc-cta-content">
            <div className="section-label">Para Empresas</div>
            <h2 className="hc-cta-title">Parceria com Homecares</h2>
            <p className="hc-cta-text">
              Tem pacientes que precisam de cuidados especializados em feridas? 
              Vamos conversar sobre uma parceria. Ofereço relatórios mensais, 
              comunicação ágil e atendimento de qualidade para seus pacientes.
            </p>
            <div className="hc-cta-benefits">
              {['Relatórios periódicos de evolução','Comunicação direta com a equipe','Atendimento rápido e humanizado','Documentação clínica completa'].map((b,i) => (
                <div key={i} className="hc-benefit">
                  <span className="hc-benefit-dot" />
                  {b}
                </div>
              ))}
            </div>
            <a
              href="https://wa.me/5511999999999?text=Olá!%20Sou%20de%20uma%20empresa%20de%20homecare%20e%20gostaria%20de%20conversar%20sobre%20parceria."
              className="btn btn-accent btn-lg"
              target="_blank"
              rel="noreferrer"
            >
              💼 Propor Parceria
            </a>
          </div>
          <div className="hc-cta-img">🏥</div>
        </div>
      </section>

      {/* Redes de Farmácias e Clínicas */}
      <section className="section section-alt" id="parcerias-redes">
        <div className="hc-cta glass">
          <div className="hc-cta-img" style={{ fontSize: '72px', marginRight: '24px' }}>
            <Cross size={80} className="text-info" />
          </div>
          <div className="hc-cta-content">
            <div className="section-label" style={{ color: 'var(--info)', background: 'rgba(139,92,246,0.1)' }}>Parcerias B2B</div>
            <h2 className="hc-cta-title">Redes de Farmácias e Clínicas</h2>
            <p className="hc-cta-text">
              Ampliamos o atendimento aos seus clientes! Estabelecemos parcerias com grandes redes de farmácias, plataformas de saúde (como Nomad) e clínicas especializadas.
            </p>
            <div className="hc-cta-benefits">
              <div className="hc-benefit"><span className="hc-benefit-dot" style={{background: 'var(--info)'}} />Suporte a plataformas de telemedicina</div>
              <div className="hc-benefit"><span className="hc-benefit-dot" style={{background: 'var(--info)'}} />Parceria com redes de drogarias</div>
              <div className="hc-benefit"><span className="hc-benefit-dot" style={{background: 'var(--info)'}} />Atendimento complementar a clínicas</div>
            </div>
            <a href="https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20conversar%20sobre%20uma%20parceria%20corporativa." className="btn btn-primary btn-lg" target="_blank" rel="noreferrer">
              🤝 Falar sobre Parcerias B2B
            </a>
          </div>
        </div>
      </section>

      {/* Redes Sociais */}
      <section className="section social-section" id="redes">
        <div className="section-label">Redes Sociais</div>
        <h2 className="section-title">Acompanhe Nosso Trabalho</h2>
        <p className="section-sub">Dicas de cuidados, evolução de pacientes e muito mais</p>
        <div className="social-grid">
          <a href="#" className="social-card glass" target="_blank" rel="noreferrer">
            <span style={{ fontSize: '32px', marginBottom: '12px' }}>📷</span>
            <span>Instagram</span>
          </a>
          <a href="#" className="social-card glass" target="_blank" rel="noreferrer">
            <span style={{ fontSize: '32px', marginBottom: '12px' }}>📘</span>
            <span>Facebook</span>
          </a>
          <a href="#" className="social-card glass" target="_blank" rel="noreferrer">
            <span style={{ fontSize: '32px', marginBottom: '12px' }}>💼</span>
            <span>LinkedIn</span>
          </a>
        </div>
      </section>

      {/* Contato */}
      <section className="section section-alt" id="contato">
        <div className="section-label">Contato</div>
        <h2 className="section-title">Agende sua Avaliação</h2>
        <p className="section-sub">Atendemos em toda a região de São Paulo</p>
        <div className="contact-grid">
          {[
            { icon: '💬', title: 'WhatsApp', desc: 'Resposta em até 1 hora', action: 'Enviar mensagem', href: 'https://wa.me/5511999999999' },
            { icon: '📍', title: 'Área de Atendimento', desc: 'Toda cidade de São Paulo e Grande SP', action: null },
            { icon: '⏰', title: 'Horários', desc: 'Segunda a Sábado, 7h às 19h. Emergências: consultar', action: null },
          ].map((c, i) => (
            <div key={i} className="contact-card card">
              <div className="contact-icon">{c.icon}</div>
              <h3 className="contact-title">{c.title}</h3>
              <p className="contact-desc">{c.desc}</p>
              {c.action && (
                <a href={c.href} className="btn btn-primary btn-sm" target="_blank" rel="noreferrer">
                  {c.action}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="lh-logo">
            <div className="lh-logo-icon"><Activity size={18} /></div>
            <span className="lh-logo-name">Enfermeira Feridas</span>
          </div>
          <p className="footer-text">Especialista em cuidados de feridas — São Paulo</p>
          <p className="footer-copy">© {new Date().getFullYear()} Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}
