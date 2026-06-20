import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  // ClinOpsShell is now the global design system.
  // Each page wraps its own content in <ClinOpsShell> to maintain specific tabs/state.
  // We no longer render the legacy Sidebar or Navbar here.
  return <Outlet />;
};

export default Layout;
