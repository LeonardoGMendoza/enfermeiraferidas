import { useState, useRef } from 'react';
import { Activity, MapPin, Shield, Clock, Star, Heart, Menu, X } from 'lucide-react';
import './LandingPage.css';

const WA_NUMBER = '5511914339705';
const waLink = (msg = 'Olá! Gostaria de agendar uma avaliação de ferida.') =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

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
      </svg>
    )
  },
];

const SERVICES = [
  { icon: '🩹', title: 'Curativos Avançados', desc: 'Curativos complexos com materiais de última geração para cicatrização acelerada e controle de infecção.' },
  { icon: '🦶', title: 'Pé Diabético', desc: 'Cuidado especializado para úlceras diabéticas, avaliação vascular e prevenção de complicações.' },
  { icon: '🛏️', title: 'Úlcera por Pressão', desc: 'Tratamento e prevenção de escaras em pacientes acamados com protocolo completo.' },
  { icon: '🏥', title: 'Pós-Operatório', desc: 'Acompanhamento de feridas cirúrgicas no domicílio com segurança e conforto.' },
  { icon: '🦵', title: 'Úlcera Venosa', desc: 'Tratamento de úlceras vasculares com terapia compressiva e curativos especializados.' },
  { icon: '🤝', title: 'Parcerias Homecare', desc: 'Atendemos pacientes encaminhados por homecares com relatórios periódicos de evolução.' },
];

const TESTIMONIALS = [
  { name: 'Família Rodrigues', bairro: 'Itaquera', text: 'Meu pai estava acamado há meses com uma ferida difícil. O atendimento foi incrível, muito cuidadoso e profissional. A ferida cicatrizou muito mais rápido do que esperávamos!', stars: 5 },
  { name: 'Dona Maria', bairro: 'Zona Leste - SP', text: 'Enfermeira muito atenciosa e pontual. Passou segurança para toda a família sobre como cuidar do meu marido. Recomendo demais!', stars: 5 },
  { name: 'Sr. Carlos', bairro: 'São Paulo - SP', text: 'Serviço de altíssima qualidade. Veio até minha casa, explicou tudo direitinho e o curativo foi feito com muito cuidado. Parabéns pelo trabalho!', stars: 5 },
];

const AREA_BAIRROS = [
  'Itaquera', 'Guaianazes', 'São Mateus', 'Cidade Tiradentes',
  'Arthur Alvim', 'Penha', 'Vila Carrão', 'Patriarca',
  'Mooca', 'Belém', 'São Miguel', 'Ermelino Matarazzo',
  'Vila Guilhermina', 'Vila Matilde',
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mapQuery, setMapQuery] = useState('');
  const [mapSrc, setMapSrc] = useState(
    'https://maps.google.com/maps?q=Itaquera+S%C3%A3o+Paulo+SP&output=embed&hl=pt-BR&z=13'
  );
  const [showCoverageMessage, setShowCoverageMessage] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);
  const handleMapSearch = () => {
    if (!mapQuery.trim()) return;
    const q = encodeURIComponent(mapQuery.trim() + ', São Paulo SP');
    setMapSrc(`https://maps.google.com/maps?q=${q}&output=embed&hl=pt-BR&z=15`);
    setShowCoverageMessage(true);
  };

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
          <a href="#area">Área de Atuação</a>
          <a href="#parceiras" className="nav-parceiras-link">🤝 Parceiras</a>
          <a href="#contato">Contato</a>
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
              <a href="#servicos" className="md-item" onClick={closeMenu}>Serviços</a>
              <a href="#sobre" className="md-item" onClick={closeMenu}>Sobre</a>
              <a href="#area" className="md-item" onClick={closeMenu}>Área de Atuação</a>
              <a href="#parceiras" className="md-item" onClick={closeMenu}>🤝 Parceiras</a>
              <a href="#contato" className="md-item" onClick={closeMenu}>Contato</a>
            </div>
            <div className="mobile-dropdown-footer">
              <a href="#contato" className="btn btn-accent" onClick={closeMenu} style={{ display: 'block', textAlign: 'center' }}>
                📞 Contato
              </a>
            </div>
          </div>
        </>
      )}

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-glow" />
          {NursingIcons.map(icon => (
            <div
              key={icon.id}
              className="nursing-icon-float"
              style={{
                top: icon.top, bottom: icon.bottom,
                left: icon.left, right: icon.right,
                animationDelay: icon.delay, animationDuration: icon.duration,
                width: `${icon.size}px`, height: `${icon.size}px`
              }}
            >
              {icon.svg}
            </div>
          ))}
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <Shield size={14} />
            Especialista Certificada em Cuidados de Feridas — Doutor Feridas
          </div>
          <h1 className="hero-title">
            Cuidado especializado<br />
            <span className="gradient-text">direto na sua casa</span>
          </h1>
          <p className="hero-subtitle">
            Enfermeira especialista em tratamento de feridas complexas, úlceras e curativos avançados.
            Atendimento domiciliar na Zona Leste de São Paulo — Itaquera e região.
          </p>
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
              <span className="hero-stat-num">ZL</span>
              <span className="hero-stat-label">Zona Leste SP</span>
            </div>
          </div>
        </div>

        <div className="hero-visual" style={{ flex: 1.5 }}>
          <div className="glass" style={{ padding: '8px', borderRadius: '24px', overflow: 'hidden', display: 'flex', width: '100%', maxWidth: '950px', boxShadow: 'var(--shadow-xl)' }}>
            <img 
              src="/FOTOCAPA.png" 
              alt="Capa Doutor Feridas" 
              style={{ width: '100%', height: 'auto', borderRadius: '16px', objectFit: 'cover' }} 
            />
          </div>
        </div>
      </section>

      {/* ── Serviços ── */}
      <section className="section" id="servicos">
        <div className="section-label">O que oferecemos</div>
        <h2 className="section-title">Serviços Especializados</h2>
        <p className="section-sub">Tratamentos avançados com protocolo clínico de excelência</p>
        <div className="services-grid">
          {SERVICES.map((s, i) => (
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
                { icon: '🏥', label: 'Doutor Feridas', sub: 'Franquia Oficial' },
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
              Sou enfermeira com especialização em cuidados de feridas complexas, atuando como
              franqueada da rede <strong>Doutor Feridas</strong> na Zona Leste de São Paulo — Itaquera e região.
              Minha missão é proporcionar tratamento de qualidade hospitalar no conforto do lar.
            </p>
            <p className="about-text">
              Atendo pacientes com feridas agudas e crônicas, úlceras vasculares, pé diabético e
              pós-operatório, com atenção humanizada e protocolos clínicos atualizados.
            </p>
            <div className="about-highlights">
              {[
                { icon: <Shield size={16} />, text: 'COREN ativo e regularizado' },
                { icon: <Clock size={16} />, text: 'Disponível 6 dias por semana' },
                { icon: <Star size={16} />, text: 'Especialização em feridas complexas' },
              ].map((h, i) => (
                <div key={i} className="about-highlight">
                  <span className="highlight-icon">{h.icon}</span>
                  {h.text}
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Área de Atuação ── */}
      <section className="section" id="area">
        <div className="section-label" style={{ color: 'var(--success)', background: 'rgba(22,163,74,0.1)' }}>
          📍 ONDE ATENDEMOS
        </div>
        <h2 className="section-title">Área de Atuação</h2>
        <p className="section-sub">
          Atendimento domiciliar especializado na <strong>Zona Leste de São Paulo</strong>
        </p>
        <div className="area-wrapper">
          <div className="area-map-card card">
            <h3 className="area-map-title">📍 Verifique seu endereço</h3>
            <p className="area-map-desc">Digite seu endereço e veja no mapa se atendemos na sua região:</p>
            <div className="area-map-search">
              <input
                type="text"
                className="area-map-input"
                placeholder="Ex: Rua das Flores, 123 - Itaquera"
                value={mapQuery}
                onChange={e => setMapQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleMapSearch()}
              />
              <button className="btn btn-accent" onClick={handleMapSearch}>
                🔍 Buscar
              </button>
            </div>
            {showCoverageMessage && (
              <div className="coverage-success-msg animate-fadeIn" style={{ padding: '12px', backgroundColor: 'var(--success)', color: 'white', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                ✅ Sim! Nós atendemos nesta região.
              </div>
            )}
            <div className="area-map-frame">
              <iframe
                src={mapSrc}
                title="Área de atendimento — Itaquera SP"
                frameBorder="0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
          <div className="area-bairros-card card">
            <h4 className="area-bairros-title">Bairros Atendidos</h4>
            <div className="area-bairros-grid">
              {AREA_BAIRROS.map((b, i) => (
                <div key={i} className="area-bairro-item">
                  <span className="area-bairro-dot" />
                  {b}
                </div>
              ))}
            </div>
            <p className="area-bairros-note">
              * Não encontrou seu bairro? Fale conosco pelo botão WhatsApp abaixo! 👇
            </p>
          </div>
        </div>
      </section>

      {/* ── Depoimentos ── */}
      <section className="section section-alt" id="depoimentos">
        <div className="section-label">O que dizem nossos pacientes</div>
        <h2 className="section-title">Depoimentos</h2>
        <p className="section-sub">A satisfação de nossos pacientes é nossa maior recompensa</p>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card card glass">
              <div className="testimonial-stars">
                {'★'.repeat(t.stars)}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.name.charAt(0)}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-bairro">📍 {t.bairro}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Chamada para Avaliação */}
        <div style={{ marginTop: '40px', textAlign: 'center', background: 'rgba(14,165,233,0.05)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(14,165,233,0.1)' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '10px', color: 'var(--text-primary)' }}>Já foi atendido por nós?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Sua opinião é muito importante. Ajude outras pessoas a encontrarem um cuidado humanizado e especializado.
          </p>
          <a 
            href="https://g.page/r/sua-url-de-avaliacao-do-google" 
            target="_blank" 
            rel="noreferrer" 
            className="btn btn-accent"
            style={{ display: 'inline-flex', padding: '12px 24px', fontSize: '16px' }}
          >
            ⭐ Deixe sua avaliação no Google
          </a>
        </div>
      </section>

      {/* ── PARCERIAS B2B ── */}
      <section className="section" id="parcerias-redes">
        <div className="hc-cta">
          <div className="hc-cta-content">
            <div className="section-label" style={{ color: 'var(--info)', background: 'rgba(139,92,246,0.1)' }}>
              📢 PARCERIAS B2B
            </div>
            <h2 className="hc-cta-title">Redes de Farmácias e Clínicas</h2>
            <p className="hc-cta-text">
              Ampliamos o atendimento aos seus clientes! Estabelecemos parcerias com homecares,
              farmácias e clínicas especializadas na Zona Leste.
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
                Relatórios periódicos de evolução clínica
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Parceiras de Confiança ── */}
      <section className="section section-alt" id="parceiras">
        <div className="section-label" style={{ color: 'var(--accent)', background: 'rgba(14,165,233,0.1)' }}>
          🤝 PARCERIA OFICIAL
        </div>
        <h2 className="section-title">Parceiras de Confiança</h2>
        <p className="section-sub">
          Trabalhamos em conjunto para oferecer cuidado completo e humanizado ao seu familiar
        </p>
        <div className="parceiras-grid">
          <div className="parceira-card card glass">
            <div className="parceira-logo-wrap">
              <img
                src="/serenya-logo.jpg"
                alt="Serenya Agência de Cuidadores"
                className="parceira-logo"
              />
            </div>
            <div className="parceira-info">
              <div className="parceira-badge">
                <span className="badge badge-success">✅ Parceria Ativa</span>
                <span className="badge badge-primary">⏰ Atendimento 24h</span>
              </div>
              <h3 className="parceira-name">Serenya Agência de Cuidadores</h3>
              <p className="parceira-desc">
                Cuidamos de quem você ama como se fosse da nossa família.
                Equipe especializada com atendimento domiciliar 24h.
                A parceria perfeita: <strong>feridas com expertise + cuidadores dedicados</strong>.
              </p>
              <div className="parceira-services">
                <div className="parceira-service-item">👩‍⚕️ Cuidadores especializados</div>
                <div className="parceira-service-item">🏠 Atendimento domiciliar</div>
                <div className="parceira-service-item">⏰ Disponível 24 horas</div>
                <div className="parceira-service-item">❤️ Cuidado humanizado</div>
              </div>
              <div className="parceira-actions">
                {/* 
                <a
                  href="https://wa.me/5511974995342?text=Olá!%20Vim%20pelo%20site%20da%20Enfermeira%20Feridas%20e%20gostaria%20de%20saber%20mais%20sobre%20os%20cuidados%20domiciliares."
                  className="btn btn-accent btn-sm"
                  target="_blank"
                  rel="noreferrer"
                >
                  💬 WhatsApp Serenya
                </a> 
                */}
                <a
                  href="https://www.instagram.com/cuidadosserenya/"
                  className="btn btn-outline btn-sm"
                  target="_blank"
                  rel="noreferrer"
                >
                  📸 @cuidadosserenya
                </a>
                {/* 
                <a
                  href="https://serenyahomecare.com.br/"
                  className="btn btn-outline btn-sm"
                  target="_blank"
                  rel="noreferrer"
                  style={{ width: '100%', marginTop: '8px', justifyContent: 'center' }}
                >
                  🔗 Ver Parceria Completa
                </a>
                */}
              </div>
            </div>
          </div>
          <div className="parceria-benefit-card card">
            <div className="pb-icon">🌟</div>
            <h4 className="pb-title">Por que essa parceria?</h4>
            <p className="pb-text">
              Quando seu paciente precisa de <strong>cuidados especializados em feridas</strong> combinados
              com <strong>suporte domiciliar completo</strong>, as duas especialistas trabalham juntas
              para garantir o melhor resultado.
            </p>
            <div className="pb-flow">
              <div className="pb-step">
                <span className="pb-step-icon">🩹</span>
                <span>Enfermeira Feridas cuida das feridas</span>
              </div>
              <div className="pb-arrow">+</div>
              <div className="pb-step">
                <span className="pb-step-icon">🏠</span>
                <span>Serenya cuida do paciente 24h</span>
              </div>
              <div className="pb-arrow">=</div>
              <div className="pb-step pb-step-result">
                <span className="pb-step-icon">❤️</span>
                <span>Cuidado completo e humanizado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Redes Sociais ── */}
      <section className="section social-section" id="redes">
        <div className="section-label">Redes Sociais</div>
        <h2 className="section-title">Acompanhe Nosso Trabalho</h2>
        <p className="section-sub">Dicas de cuidados, evolução de pacientes e muito mais — em breve!</p>
        <div className="social-grid">
          <a href="https://www.instagram.com/enfermeiraferidas2026/" target="_blank" rel="noreferrer" className="social-card glass social-insta" style={{ textDecoration: 'none', color: 'inherit' }}>
            <svg className="social-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
            </svg>
            <span>Instagram</span>
            <span className="social-handle">@enfermeiraferidas2026</span>
          </a>
          <a href="https://www.facebook.com/enfermeiraferidas/" target="_blank" rel="noreferrer" className="social-card glass social-fb" style={{ textDecoration: 'none', color: 'inherit' }}>
            <svg className="social-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
            <span>Facebook</span>
            <span className="social-handle">/enfermeiraferidas</span>
          </a>
          <div className="social-card glass social-li">
            <svg className="social-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect x="2" y="9" width="4" height="12"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
            <span>LinkedIn</span>
            <span className="social-handle">Em breve</span>
          </div>
        </div>
      </section>

      {/* ── Contato ── */}
      <section className="section section-alt" id="contato">
        <div className="section-label">Contato</div>
        <h2 className="section-title">Agende sua Avaliação</h2>
        <p className="section-sub">Atendemos em toda a Zona Leste de São Paulo — Itaquera e região</p>
        <div className="contact-grid">
          {[
            { icon: '💬', title: 'WhatsApp', desc: 'Resposta em até 1 hora' },
            { icon: '📍', title: 'Área de Atendimento', desc: 'Zona Leste SP — Itaquera, Guaianazes, Penha e região' },
            { icon: '⏰', title: 'Horários', desc: 'Segunda a Sábado, 7h às 19h. Emergências: consultar' },
          ].map((c, i) => (
            <div key={i} className="contact-card card">
              <div className="contact-icon">{c.icon}</div>
              <h3 className="contact-title">{c.title}</h3>
              <p className="contact-desc">{c.desc}</p>
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
          <p className="footer-text">Especialista em cuidados de feridas — Zona Leste São Paulo</p>
          <p className="footer-text" style={{ fontSize: '12px', opacity: 0.6 }}>Franqueada Oficial Doutor Feridas</p>
          <p className="footer-copy">© {new Date().getFullYear()} Todos os direitos reservados</p>
        </div>
      </footer>

      {/* ── Floating WhatsApp Button ── */}
      <a
        href={waLink('Olá! Vim pelo site e gostaria de mais informações.')}
        className="whatsapp-float"
        target="_blank"
        rel="noreferrer"
        aria-label="Falar no WhatsApp"
        id="cta-float-whatsapp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span>Como posso te ajudar?</span>
      </a>
    </div>
  );
}
