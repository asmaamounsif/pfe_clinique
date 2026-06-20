import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import useAuth from './hooks/useAuth';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Loading Spinner for Suspense
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-[var(--color-bg-secondary)]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
  </div>
);

// Lazy Imports
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const BlankDashboard = React.lazy(() => import('./pages/BlankDashboard'));

// Page 403 d'accès non autorisé
const UnauthorizedPage = () => (
  <div className="flex h-screen flex-col items-center justify-center bg-gray-50 px-4">
    <div className="text-center">
      <h1 className="text-6xl font-extrabold text-medical-800">403</h1>
      <p className="mt-4 text-xl font-bold text-gray-900">Accès interdit</p>
      <p className="mt-2 text-gray-500">Vous ne possédez pas les privilèges requis pour accéder à cette page.</p>
      <button
        onClick={() => window.location.href = '/'}
        className="mt-6 inline-flex items-center rounded-md bg-medical-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-medical-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-medical-800"
      >
        Retour à l'accueil
      </button>
    </div>
  </div>
);

// Redirection intelligente en racine "/" selon le rôle de l'utilisateur connecté
const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role?.slug;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'medecin') return <Navigate to="/medecin" replace />;
  if (role === 'secretaire') return <Navigate to="/secretaire" replace />;
  if (role === 'infirmier') return <Navigate to="/infirmier" replace />;
  if (role === 'patient') return <Navigate to="/patient" replace />;

  return <Navigate to="/unauthorized" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Routes Publiques */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Redirection Racine */}
            <Route path="/" element={<RootRedirect />} />

            {/* Routes Protégées avec Layout (Sidebar + Outlet) */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              
              {/* Shared / Messaging */}
              <Route path="/messages" element={<ProtectedRoute allowedRoles={['admin', 'medecin', 'secretaire', 'patient', 'infirmier']}><BlankDashboard /></ProtectedRoute>} />

              {/* Administration */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><BlankDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><BlankDashboard /></ProtectedRoute>} />
              <Route path="/admin/clinical-records" element={<ProtectedRoute allowedRoles={['admin']}><BlankDashboard /></ProtectedRoute>} />
              <Route path="/admin/patient-flow" element={<ProtectedRoute allowedRoles={['admin']}><BlankDashboard /></ProtectedRoute>} />

              {/* Médecine */}
              <Route path="/medecin" element={<ProtectedRoute allowedRoles={['medecin']}><BlankDashboard /></ProtectedRoute>} />
              <Route path="/medecin/patients" element={<ProtectedRoute allowedRoles={['medecin']}><BlankDashboard /></ProtectedRoute>} />
              <Route path="/medecin/patients/:id" element={<ProtectedRoute allowedRoles={['medecin']}><BlankDashboard /></ProtectedRoute>} />
              <Route path="/medecin/patients/:id/new-consultation" element={<ProtectedRoute allowedRoles={['medecin']}><BlankDashboard /></ProtectedRoute>} />
              <Route path="/medecin/prescriptions" element={<ProtectedRoute allowedRoles={['medecin']}><BlankDashboard /></ProtectedRoute>} />

              {/* Secrétariat */}
              <Route path="/secretaire" element={<ProtectedRoute allowedRoles={['secretaire']}><BlankDashboard /></ProtectedRoute>} />
              <Route path="/secretaire/patients" element={<ProtectedRoute allowedRoles={['secretaire']}><BlankDashboard /></ProtectedRoute>} />
              <Route path="/secretaire/agenda" element={<ProtectedRoute allowedRoles={['secretaire']}><BlankDashboard /></ProtectedRoute>} />
              <Route path="/secretaire/gestion" element={<ProtectedRoute allowedRoles={['secretaire']}><BlankDashboard /></ProtectedRoute>} />

              {/* Infirmier */}
              <Route path="/infirmier" element={<ProtectedRoute allowedRoles={['infirmier']}><BlankDashboard /></ProtectedRoute>} />

              {/* Patients */}
              <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><BlankDashboard /></ProtectedRoute>} />
              <Route path="/patient/profile/:id" element={<ProtectedRoute allowedRoles={['patient']}><BlankDashboard /></ProtectedRoute>} />
              <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['patient']}><BlankDashboard /></ProtectedRoute>} />
              <Route path="/prendre-rdv" element={<ProtectedRoute allowedRoles={['patient']}><BlankDashboard /></ProtectedRoute>} />

            </Route>

            {/* Fallback 404 automatique vers la racine */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
