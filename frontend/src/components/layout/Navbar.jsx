import React from 'react';
import { useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const BREADCRUMBS = {
  '/admin':              ['Administration', 'Tableau de bord'],
  '/medecin':            ['Médecin', 'Tableau de bord'],
  '/infirmier':          ['Infirmier', 'Tableau de bord'],
  '/secretaire':         ['Secrétaire', 'Tableau de bord'],
  '/patient':            ['Patient', 'Tableau de bord'],
};

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const dateStr = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  const crumbs = BREADCRUMBS[location.pathname] || ['', 'Page'];

  return (
    <header style={{
      height: 52, background: '#fff',
      borderBottom: '1px solid #E4EAF2',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
    }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
        <span style={{ color: '#8FA3B8' }}>{crumbs[0]}</span>
        {crumbs[1] && (
          <>
            <svg style={{ width: 12, height: 12, color: '#C5D2DC' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span style={{ color: '#1C2B3A', fontWeight: 500 }}>{crumbs[1]}</span>
          </>
        )}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Date */}
        <span style={{ fontSize: 12, color: '#8FA3B8', textTransform: 'capitalize' }}>{dateStr}</span>

        {/* Separator */}
        <div style={{ width: 1, height: 18, background: '#E4EAF2' }} />

        {/* Status dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#0D9488', fontWeight: 500 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0D9488', display: 'inline-block' }} />
          Connecté
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: 18, background: '#E4EAF2' }} />

        {/* User chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: '#EBF3FA', border: '1px solid #BDD6EC',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600, color: '#0F2744'
          }}>
            {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
          </div>
          <span style={{ fontSize: 13, color: '#1C2B3A', fontWeight: 500 }}>
            {user?.first_name} {user?.last_name}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
