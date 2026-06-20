import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

// Icon paths for nav items
const ICONS = {
  dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  patients:  "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  consult:   "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  prescript: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM14 4v4h4",
  users:     "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  audit:     "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  calendar:  "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  dossier:   "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  logout:    "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
};

const ROLE_NAV = {
  admin: [
    { path: '/admin',             label: 'Tableau de bord', icon: ICONS.dashboard },
  ],
  medecin: [
    { path: '/medecin',              label: 'Tableau de bord', icon: ICONS.dashboard },
  ],
  infirmier: [
    { path: '/infirmier',          label: 'Tableau de bord', icon: ICONS.dashboard },
  ],
  secretaire: [
    { path: '/secretaire',          label: 'Tableau de bord', icon: ICONS.dashboard },
  ],
  patient: [
    { path: '/patient',            label: 'Tableau de bord', icon: ICONS.dashboard },
  ],
};

const ROLE_LABELS = { admin: 'Directeur', medecin: 'Médecin', infirmier: 'Infirmier', secretaire: 'Secrétaire', patient: 'Patient' };
const ROLE_COLORS = { admin: '#F97316', medecin: '#38BDF8', infirmier: '#34D399', secretaire: '#EAB308', patient: '#A78BFA' };

function NavIcon({ d }) {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const Sidebar = () => {
  const { user, hasRole, logout } = useAuth();
  const location = useLocation();

  const role = ['admin','medecin','infirmier','secretaire','patient'].find(r => hasRole(r)) || 'patient';
  const navLinks = ROLE_NAV[role] || [];
  const roleLabel = ROLE_LABELS[role];
  const roleColor = ROLE_COLORS[role];
  const initials = `${user?.first_name?.charAt(0) || ''}${user?.last_name?.charAt(0) || ''}`.toUpperCase();

  return (
    <aside style={{ background: '#0F2744', width: 232, minWidth: 232 }} className="flex flex-col h-full">

      {/* Logo */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '20px 20px 18px' }}>
        <div className="flex items-center gap-2.5">
          <div style={{ background: '#0EA5E9', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg style={{ width: 18, height: 18, color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <div style={{ color: '#F0F6FF', fontSize: 13, fontWeight: 600, letterSpacing: '0.02em', lineHeight: 1.2 }}>Clinique Mounsif</div>
            <div style={{ color: '#5B8DB8', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 1 }}>Casablanca</div>
          </div>
        </div>
      </div>

      {/* User profile */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2.5">
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: `${roleColor}22`, border: `1.5px solid ${roleColor}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: roleColor, fontSize: 11, fontWeight: 600
          }}>
            {initials}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#E8F0FA', fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.first_name} {user?.last_name}
            </div>
            <div style={{ color: roleColor, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 1 }}>
              {roleLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
        <div style={{ color: '#3E5E7A', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', padding: '8px 10px 6px' }}>
          Navigation
        </div>
        {navLinks.map(link => {
          const active = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
          return (
            <Link
              key={link.path}
              to={link.path}
              className={active ? 'nav-item-active' : 'nav-item'}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px',
                borderRadius: 6, marginBottom: 2,
                color: active ? '#F0F6FF' : '#7AAED9',
                background: active ? 'rgba(14,165,233,0.12)' : 'transparent',
                fontSize: 13, fontWeight: active ? 500 : 400,
                textDecoration: 'none',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#BDD6EC'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7AAED9'; }}}
            >
              <NavIcon d={link.icon} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '8px 10px', borderRadius: 6,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#5B8DB8', fontSize: 13, fontWeight: 400,
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#FCA5A5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5B8DB8'; }}
        >
          <NavIcon d={ICONS.logout} />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
