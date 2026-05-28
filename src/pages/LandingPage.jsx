import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, MapPin, Phone, Star, ArrowRight, Shield, Clock, Heart, Cross, Menu, X } from 'lucide-react';
import './LandingPage.css';

const NursingIcons = [
  { id: 'bandaid', size: 80, delay: '0s', duration: '14s', top: '8%', right: '5%',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="22" width="48" height="20" rx="6" fill="rgba(14,165,233,0.18)" stroke="rgba(14,165,233,0.5)" strokeWidth="2"/>
        <rect x="8" y="22" width="16" height="20" rx="3" fill="rgba(14,165,233,0.3)" stroke="rgba(14,165,233,0.4)" strokeWidth="1.5"/>
        <rect x="40" y="22" width="16" height="20" rx="3" fill="rgba(14,165,233,0.3)" stroke="rgba(14,165,233,0.4)" strokeWidth="1.5"/>
        <circle cx="32" cy="32" r="5" fill="rgba(255,255,255,0.15)" stroke="rgba(14,165,233,0.6)" strokeWidth="1.5"/>
        <line x1="30" y1="32" x2="34" y2="32" stroke="rgba(14,165,233,0.8)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="32" y1="30" x2="32" y2="34" stroke="rgba(14,165,233,0.8)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  },
  { id: 'syringe', size: 90, delay: '-4s', duration: '16s', top: '65%', left: '2%',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="10" y1="54" x2="50" y2="14" stroke="rgba(249,115,22,0.6)" strokeWidth="2.5" strokeLinecap="round"/>
        <rect x="22" y="16" width="20" height="12" rx="3" transform="rotate(45 32 22)" fill="rgba(249,115,22,0.2)" stroke="rgba(249,115,22,0.5)" strokeWidth="1.5"/>
        <circle cx="49" cy="15" r="4" fill="rgba(249,115,22,0.3)" stroke="rgba(249,115,22,0.6)" strokeWidth="1.5"/>
        <line x1="14" y1="50" x2="8" y2="56" stroke="rgba(249,115,22,0.5)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="30" y1="34" x2="34" y2="30" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="36" y1="28" x2="40" y2="24" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )
  },
  { id: 'cross', size: 60, delay: '-8s', duration: '12s', top: '38%', left: '52%',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="24" y="8" width="16" height="48" rx="4" fill="rgba(34,197,94,0.2)" stroke="rgba(34,197,94,0.5)" strokeWidth="2"/>
        <rect x="8" y="24" width="48" height="16" rx="4" fill="rgba(34,197,94,0.2)" stroke="rgba(34,197,94,0.5)" strokeWidth="2"/>
        <circle cx="32" cy="32" r="6" fill="rgba(34,197,94,0.3)"/>
      </svg>
    )
  },
  { id: 'heart', size: 70, delay: '-2s', duration: '10s', top: '18%', left: '18%',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 52 C32 52 8 38 8 22 C8 14 14 8 22 8 C26 8 30 10 32 14 C34 10 38 8 42 8 C50 8 56 14 56 22 C56 38 32 52 32 52Z" fill="rgba(239,68,68,0.2)" stroke="rgba(239,68,68,0.5)" strokeWidth="2"/>
        <polyline points="18,32 22,32 26,24 30,40 34,28 38,32 46,32" stroke="rgba(239,68,68,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    )
  },
  { id: 'pill', size: 65, delay: '-6s', duration: '8s', top: '68%', left: '38%',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="22" width="44" height="20" rx="10" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.5)" strokeWidth="2"/>
        <rect x="10" y="22" width="22" height="20" rx="10" fill="rgba(139,92,246,0.25)" stroke="rgba(139,92,246,0.4)" strokeWidth="1"/>
        <line x1="32" y1="22" x2="32" y2="42" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5"/>
      </svg>
    )
  },
  { id: 'thermo', size: 50, delay: '-3s', duration: '12s', top: '13%', left: '43%',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="28" y="8" width="8" height="36" rx="4" fill="rgba(14,165,233,0.15)" stroke="rgba(14,165,233,0.5)" strokeWidth="2"/>
        <circle cx="32" cy="48" r="8" fill="rgba(14,165,233,0.25)" stroke="rgba(14,165,233,0.6)" strokeWidth="2"/>
        <rect x="30" y="24" width="4" height="22" rx="2" fill="rgba(14,165,233,0.5)"/>
        <circle cx="32" cy="48" r="4" fill="rgba(14,165,233,0.6)"/>
      </svg>
    )
  },
  { id: 'stethoscope', size: 85, delay: '-9s', duration: '14s', bottom: '8%', right: '18%',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 12 C16 12 12 12 12 18 L12 30 C12 38 20 44 28 44 C36 44 44 38 44 30" stroke="rgba(14,165,233,0.5)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <circle cx="44" cy="46" r="8" fill="rgba(14,165,233,0.15)" stroke="rgba(14,165,233,0.5)" strokeWidth="2"/>
        <circle cx="44" cy="46" r="3" fill="rgba(14,165,233,0.5)"/>
        <line x1="12" y1="12" x2="12" y2="8" stroke="rgba(14,165,233,0.5)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="22" y1="12" x2="22" y2="8" stroke="rgba(14,165,233,0.5)" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="6" r="3" fill="rgba(14,165,233,0.3)" stroke="rgba(14,165,233,0.5)" strokeWidth="1.5"/>
        <circle cx="22" cy="6" r="3" fill="rgba(14,165,233,0.3)" stroke="rgba(14,165,233,0.5)" strokeWidth="1.5"/>
      </svg>
    )
  },
  { id: 'foot', size: 55, delay: '-1s', duration: '7s', top: '53%', right: '8%',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 52 C20 52 12 48 12 38 L12 24 C12 18 16 14 22 16 C24 16 26 18 26 20 L26 38 C26 40 28 42 30 42 L46 42 C50 42 52 46 50 50 C48 54 22 56 20 52Z" fill="rgba(249,115,22,0.15)" stroke="rgba(249,115,22,0.5)" strokeWidth="2"/>
        <circle cx="20" cy="18" r="4" fill="rgba(249,115,22,0.2)" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5"/>
        <circle cx="28" cy="14" r="3.5" fill="rgba(249,115,22,0.2)" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5"/>
        <circle cx="36" cy="13" r="3" fill="rgba(249,115,22,0.2)" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5"/>
        <circle cx="44" cy="15" r="2.5" fill="rgba(249,115,22,0.2)" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5"/>
        <circle cx="50" cy="18" r="2" fill="rgba(249,115,22,0.2)" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5"/>
      </svg>
    )
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="landing">

      {/* ── Header ── */}
      <header className="landing-header">
        <div className="lh-logo">
          <div className="lh-logo-icon"><Activity size={20} /></div>
          <div>
            <span className="lh-logo-name">Enfermeira Feridas</span>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="lh-nav-desktop">
          <a href="#servicos">Serviços</a>
          <a href="#sobre">Sobre</a>
          <a href="#contato">Contato</a>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/app')}>
            Área Restrita
          </button>
        </nav>

        {/* Botão hambúrguer */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* ── Mobile Menu ── */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={closeMenu} />
          <div className="mobile-dropdown-menu">
            <div className="mobile-dropdown-body">
              <a href="#servicos" className="md-item" onClick={closeMenu}>
                Serviços
              </a>
              <a href="#sobre" className="md-item" onClick={closeMenu}>
                Sobre
              </a>
              <a href="#contato" className="md-item" onClick={closeMenu}>
                Contato
              </a>
            </div>
            <div className="mobile-dropdown-footer">
              <button className="btn btn-primary" onClick={() => { navigate('/app'); closeMenu(); }}>
                Área Restrita
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-glow" />
          {NursingIcons.map((icon) => (
            <div
              key={icon.id}
              className="nursing-icon-float"
              style={{
                width: icon.size,
                height: icon.size,
                animationDelay: icon.delay,
                animationDuration: icon.duration,
                top: icon.top,
                left: icon.left,
                right: icon.right,
                bottom: icon.bottom,
              }}
            >
              {icon.svg}
            </div>
          ))}
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
              href="https://wa.me/5511989553812?text=Olá!%20Gostaria%20de%20agendar%20uma%20avaliação%20de%20ferida."
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

      {/* ── Serviços ── */}
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

      {/* ── Sobre ── */}
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
              href="https://wa.me/5511989553812?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20os%20serviços."
              className="btn btn-primary btn-lg"
              target="_blank"
              rel="noreferrer"
            >
              <Phone size={18} /> Falar Comigo
            </a>
          </div>
        </div>
      </section>

      {/* ── PARCERIAS: Redes de Farmácias e Clínicas (CORRIGIDO) ── */}
      <section className="section section-alt" id="parcerias-redes">
        <div className="hc-cta">
          <div className="hc-cta-content">
            <div className="section-label" style={{ color: 'var(--info)', background: 'rgba(139,92,246,0.1)' }}>
              📢 PARCERIAS B2B
            </div>
            <h2 className="hc-cta-title">Redes de Farmácias e Clínicas</h2>
            <p className="hc-cta-text">
              Ampliamos o atendimento aos seus clientes! Estabelecemos parcerias com grandes redes
              de farmácias, plataformas de saúde (como Nomad) e clínicas especializadas.
            </p>
            <div className="hc-cta-benefits">
              <div className="hc-benefit">
                <span className="hc-benefit-dot" style={{background: 'var(--info)'}} />
                Suporte a plataformas de telemedicina
              </div>
              <div className="hc-benefit">
                <span className="hc-benefit-dot" style={{background: 'var(--info)'}} />
                Parceria com grandes redes de drogarias
              </div>
              <div className="hc-benefit">
                <span className="hc-benefit-dot" style={{background: 'var(--info)'}} />
                Atendimento complementar a clínicas e homecares
              </div>
            </div>
            <a
              href="https://wa.me/5511989553812?text=Olá!%20Gostaria%20de%20conversar%20sobre%20uma%20parceria%20corporativa."
              className="btn btn-primary btn-lg"
              target="_blank"
              rel="noreferrer"
            >
              🤝 Falar sobre Parcerias B2B
            </a>
          </div>
        </div>
      </section>

      {/* ── Redes Sociais ── */}
      <section className="section social-section" id="redes">
        <div className="section-label">Redes Sociais</div>
        <h2 className="section-title">Acompanhe Nosso Trabalho</h2>
        <p className="section-sub">Dicas de cuidados, evolução de pacientes e muito mais</p>
        <div className="social-grid">
          <a href="https://www.instagram.com/sandra.luciane.58/" className="social-card glass social-insta" target="_blank" rel="noreferrer">
            <svg className="social-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
            </svg>
            <span>Instagram</span>
            <span className="social-handle">@sandra.luciane.58</span>
          </a>
          <a href="https://www.facebook.com/sandra.luciane.58" className="social-card glass social-fb" target="_blank" rel="noreferrer">
            <svg className="social-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
            <span>Facebook</span>
            <span className="social-handle">Sandra Luciane</span>
          </a>
          <a href="https://www.linkedin.com/in/sandralucianefonseca-enf/" className="social-card glass social-li" target="_blank" rel="noreferrer">
            <svg className="social-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect x="2" y="9" width="4" height="12"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
            <span>LinkedIn</span>
            <span className="social-handle">Sandra Luciane Fonseca</span>
          </a>
        </div>
      </section>

      {/* ── Contato ── */}
      <section className="section section-alt" id="contato">
        <div className="section-label">Contato</div>
        <h2 className="section-title">Agende sua Avaliação</h2>
        <p className="section-sub">Atendemos em toda a região de São Paulo</p>
        <div className="contact-grid">
          {[
            { icon: '💬', title: 'WhatsApp', desc: 'Resposta em até 1 hora', action: 'Enviar mensagem', href: 'https://wa.me/5511989553812' },
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

      {/* ── Footer ── */}
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
