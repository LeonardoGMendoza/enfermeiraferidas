import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Map, Building2, Calendar,
  Menu, X, ChevronRight, Activity, Bell
} from 'lucide-react';
import './Layout.css';

const navItems = [
  { to: '/app/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/pacientes',    icon: Users,           label: 'Pacientes' },
  { to: '/app/mapa',         icon: Map,             label: 'Mapa' },
  { to: '/app/agendamentos', icon: Calendar,        label: 'Agendamentos' },
  { to: '/app/homecares',    icon: Building2,       label: 'Homecares' },
];

export default function Layout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`app-shell ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>

      {sidebarOpen && isMobile && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 99,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <aside className="sidebar" style={{ zIndex: 100 }}>
        <div className="sidebar-logo">
          <div className="logo-icon"><Activity size={20} /></div>
          {sidebarOpen && (
            <div className="logo-text">
              <span className="logo-name">Enfermeira</span>
              <span className="logo-sub">Feridas</span>
            </div>
          )}
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              {sidebarOpen && <span>{label}</span>}
              {sidebarOpen && <ChevronRight size={14} className="nav-arrow" />}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen && (
            <div className="sidebar-profile">
              <div className="profile-avatar">👩‍⚕️</div>
              <div className="profile-info">
                <span className="profile-name">Enfermeira</span>
                <span className="profile-role">Admin</span>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', flexDirection: sidebarOpen ? 'row' : 'column' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} title="Voltar ao site">
              {sidebarOpen ? '← Site' : '←'}
            </button>
            <button
              className="btn btn-ghost btn-sm text-danger"
              onClick={() => { localStorage.removeItem('ef_token'); navigate('/login'); }}
              title="Sair do Sistema"
            >
              {sidebarOpen ? 'Sair' : 'X'}
            </button>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="app-header">
          <div className="header-left">
            {isMobile && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSidebarOpen(true)}
                style={{ marginRight: '8px' }}
              >
                <Menu size={20} />
              </button>
            )}
            <div className="header-breadcrumb">
              <Activity size={16} className="breadcrumb-icon" />
              <span>Sistema de Gestão</span>
            </div>
          </div>
          <div className="header-right">
            <div className="header-date">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <button className="icon-btn">
              <Bell size={18} />
              <span className="notif-dot" />
            </button>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
