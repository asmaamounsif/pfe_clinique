import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const location = useLocation();
  
  // Tableau de bords cliniques qui gèrent eux-mêmes leur propre coque ClinOpsShell
  const dashboards = ['/admin', '/medecin', '/infirmier', '/secretaire', '/patient'];
  const isDashboard = dashboards.includes(location.pathname);

  if (isDashboard) {
    return <Outlet />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#EEF2F7' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
