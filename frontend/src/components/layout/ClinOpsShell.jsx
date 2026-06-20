// src/components/layout/ClinOpsShell.jsx
// Coque de mise en page clinique dark premium avec rail d'icônes adaptable par rôle, topbar et horloge
import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationPanel from '../NotificationPanel';
import GlobalSearch from '../GlobalSearch';

/**
 * ClinOpsShell - Coque de mise en page réutilisable conforme au design de référence
 */
export const ClinOpsShell = ({ tabs = [], activeTab, onTabChange, children }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState('--:--:--');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Horloge en temps réel au format en-GB (HH:MM:SS)
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB'));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // Raccourci clavier Ctrl+K pour la recherche
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Définition des items du rail selon le rôle de l'utilisateur (dynamisé)
  const getRailItems = () => {
    const role = user?.role?.slug;
    switch (role) {
      case 'admin': return [
        { path: '/admin',                   title: 'Dashboard',   icon: 'dashboard' },
      ];
      case 'medecin': return [
        { path: '/medecin',               title: 'Dashboard',      icon: 'dashboard'     },
      ];
      case 'secretaire': return [
        { path: '/secretaire',            title: 'Dashboard',        icon: 'dashboard'     },
      ];
      case 'infirmier': return [
        { path: '/infirmier',          title: 'Dashboard',     icon: 'dashboard' },
      ];
      case 'patient': return [
        { path: '/patient',                         title: 'Dashboard',      icon: 'dashboard'     },
      ];
      default: return [{ path: '/', title: 'Dashboard', icon: 'dashboard' }];
    }
  };

  const railItems = getRailItems();

  const getInitials = () => {
    const f = user?.first_name?.[0] || '';
    const l = user?.last_name?.[0] || '';
    return (f + l).toUpperCase() || 'US';
  };

  // Composant d'icônes SVG extrait du design premium
  const Icon = ({ type }) => {
    switch (type) {
      case 'dashboard':
        return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
      case 'patients':
      case 'users':
        return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
      case 'consultations':
        return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>;
      case 'prescriptions':
      case 'ordonnances':
        return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path d="M9 12h6m-3-3v6M19 3H5a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2V5a2 2 0 00-2-2z"/></svg>;
      case 'calendar':
      case 'rendez-vous':
        return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
      case 'soins':
      case 'dossier':
        return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v11m0 0l-3 6h12l-3-6M9 14h6"/></svg>;
      case 'audit':
        return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
      case 'settings':
        return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
      default:
        return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="10"/></svg>;
    }
  };

  return (
    <div className="clinops-theme">
      <div className="shell">
        
        {/* ICON RAIL */}
        <nav className="rail">
          <div className="rail-logo" title="ClinOps">
            <svg viewBox="0 0 24 24">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7.5 3.75L12 11.68 4.5 7.93 12 4.18zM4 9.59l7 3.5v6.32l-7-3.5V9.59zm9 9.82v-6.32l7-3.5v6.32l-7 3.5z"/>
            </svg>
          </div>

          {railItems.map((item, idx) => {
            if (item.path === '#') {
              return (
                <div key={idx} className="rail-item" title={item.title}>
                  <Icon type={item.icon} />
                  <span className="rail-label">{item.title}</span>
                  {item.badge && <span className="rail-badge"></span>}
                </div>
              );
            }
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <div
                key={idx}
                className={`rail-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                title={item.title}
              >
                <Icon type={item.icon} />
                <span className="rail-label">{item.title}</span>
                {item.badge && <span className="rail-badge"></span>}
              </div>
            );
          })}

          <div className="rail-sep"></div>

          <div className="rail-bottom">
            {/* About */}
            <div title="À propos" className="rail-item">
              <Icon type="help" />
              <span className="rail-label">À propos</span>
            </div>

            {/* Avatar Profile Trigger */}
            <div style={{ position: 'relative' }}>
              <div
                className="rail-avatar"
                onClick={() => setShowProfileMenu(v => !v)}
                title={`${user?.first_name || ''} ${user?.last_name || ''}`}
              >
                {getInitials()}
              </div>

              {showProfileMenu && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 42,
                  width: 220, borderRadius: 8,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  zIndex: 200, padding: '8px 0',
                }}>
                  <div style={{ padding: '8px 14px 10px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {user?.first_name} {user?.last_name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 1, wordBreak: 'break-all' }}>
                      {user?.email}
                    </div>
                    <div style={{
                      display: 'inline-block', marginTop: 6,
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em',
                      padding: '1px 6px', borderRadius: 3,
                      background: 'rgba(59,130,246,.12)', color: 'var(--accent-blue)',
                      border: '1px solid rgba(59,130,246,.2)',
                    }}>
                      {user?.role?.name || 'Utilisateur'}
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', padding: '8px 14px',
                      background: 'transparent', border: 'none',
                      cursor: 'pointer', color: 'var(--priority-urgent)',
                      fontSize: 12, fontWeight: 500, textAlign: 'left',
                      transition: 'background .12s',
                    }}
                  >
                    <svg style={{ width: 13, height: 13 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* MAIN AREA */}
        <main className="main">
          {/* TOP BAR */}
          <header className="topbar">
            <div className="topbar-tabs">
              {tabs.map(tab => (
                <div
                  key={tab.id}
                  onClick={() => onTabChange && onTabChange(tab.id)}
                  className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                >
                  {tab.label}
                </div>
              ))}
            </div>

            <div className="topbar-right">
              <div className="status-dot">All Systems Nominal</div>
              
              <div className="topbar-info">
                Dept: <span>{user?.role?.name || 'Clinical Operations'}</span>
              </div>

              <div className="live-clock">
                {time}
              </div>

              <div className="btn-icon" title="Search">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
              </div>

              <div className="btn-icon" title="Notifications">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
              </div>

              <span className="pulse-ring" title="Live feed active"></span>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
};

export default ClinOpsShell;
