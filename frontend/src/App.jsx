import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import useAuth from './hooks/useAuth';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Importation des pages (les squelettes ou implémentations réelles)
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AuditLogs from './pages/admin/AuditLogs';
import PatientsList from './pages/medecin/PatientsList';
import PatientDetail from './pages/medecin/PatientDetail';
import NewConsultation from './pages/medecin/NewConsultation';
import MedecinDashboard from './pages/medecin/MedecinDashboard';
import InfirmierDashboard from './pages/infirmier/InfirmierDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';
import SecretaireDashboard from './pages/secretaire/SecretaireDashboard';
import AgendaJour from './pages/secretaire/AgendaJour';
import GestionRdv from './pages/secretaire/GestionRdv';
import PrendreRdv from './pages/patient/PrendreRdv';

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

// Composants fictifs temporaires pour les routes secondaires
const UserManagement = () => <div className="p-6 bg-white rounded shadow"><h2 className="text-xl font-bold text-medical-800 mb-4">Gestion des Utilisateurs (Administrateur)</h2><p className="text-gray-600">Module de gestion des utilisateurs hospitaliers.</p></div>;
const Prescriptions = () => <div className="p-6 bg-white rounded shadow"><h2 className="text-xl font-bold text-medical-800 mb-4">Historique des Ordonnances</h2><p className="text-gray-600">Liste globale des prescriptions du service.</p></div>;
const MonDossier = () => <div className="p-6 bg-white rounded shadow"><h2 className="text-xl font-bold text-medical-800 mb-4">Mon Dossier Médical</h2><p className="text-gray-600">Consultation de vos antécédents, examens et prescriptions.</p></div>;
const MesRendezVous = () => <div className="p-6 bg-white rounded shadow"><h2 className="text-xl font-bold text-medical-800 mb-4">Mes Rendez-vous</h2><p className="text-gray-600">Historique et planification de vos consultations.</p></div>;

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
        <Routes>
          {/* Routes Publiques */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Redirection Racine */}
          <Route path="/" element={<RootRedirect />} />

          {/* Routes Protégées avec Layout (Sidebar + Navbar) */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            
            {/* Administration */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['admin']}><AuditLogs /></ProtectedRoute>} />

            {/* Médecine */}
            <Route path="/medecin" element={<ProtectedRoute allowedRoles={['medecin']}><MedecinDashboard /></ProtectedRoute>} />
            <Route path="/medecin/patients" element={<ProtectedRoute allowedRoles={['medecin']}><PatientsList /></ProtectedRoute>} />
            <Route path="/medecin/patients/:id" element={<ProtectedRoute allowedRoles={['medecin']}><PatientDetail /></ProtectedRoute>} />
            <Route path="/medecin/patients/:id/new-consultation" element={<ProtectedRoute allowedRoles={['medecin']}><NewConsultation /></ProtectedRoute>} />
            <Route path="/medecin/prescriptions" element={<ProtectedRoute allowedRoles={['medecin']}><Prescriptions /></ProtectedRoute>} />

            {/* Secrétariat */}
            <Route path="/secretaire" element={<ProtectedRoute allowedRoles={['secretaire']}><SecretaireDashboard /></ProtectedRoute>} />
            <Route path="/secretaire/patients" element={<ProtectedRoute allowedRoles={['secretaire']}><PatientsList /></ProtectedRoute>} />
            <Route path="/secretaire/agenda" element={<ProtectedRoute allowedRoles={['secretaire']}><AgendaJour /></ProtectedRoute>} />
            <Route path="/secretaire/gestion" element={<ProtectedRoute allowedRoles={['secretaire']}><GestionRdv /></ProtectedRoute>} />

            {/* Infirmier */}
            <Route path="/infirmier" element={<ProtectedRoute allowedRoles={['infirmier']}><InfirmierDashboard /></ProtectedRoute>} />

            {/* Patients */}
            <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patient/profile/:id" element={<ProtectedRoute allowedRoles={['patient']}><MonDossier /></ProtectedRoute>} />
            <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['patient']}><MesRendezVous /></ProtectedRoute>} />
            <Route path="/prendre-rdv" element={<ProtectedRoute allowedRoles={['patient']}><PrendreRdv /></ProtectedRoute>} />

          </Route>

          {/* Fallback 404 automatique vers la racine */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
