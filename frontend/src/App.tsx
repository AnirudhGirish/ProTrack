import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MyTasksPage from './pages/MyTasksPage';
import AdminPage from './pages/AdminPage';
import NotificationsPage from './pages/NotificationsPage';

// New Pages
import LandingPage from './pages/LandingPage';
import PrivacyPolicyPage from './pages/docs/PrivacyPolicyPage';
import TermsOfServicePage from './pages/docs/TermsOfServicePage';
import DataProcessingAgreementPage from './pages/docs/DataProcessingAgreementPage';
import SecurityArchitecturePage from './pages/docs/SecurityArchitecturePage';
import DisasterRecoveryPage from './pages/docs/DisasterRecoveryPage';
import UserManualPage from './pages/docs/UserManualPage';
import AdminManualPage from './pages/docs/AdminManualPage';
import ApiDocsPage from './pages/docs/ApiDocsPage';

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} />
      <Route path="/data-processing-agreement" element={<DataProcessingAgreementPage />} />
      <Route path="/security-architecture" element={<SecurityArchitecturePage />} />
      <Route path="/disaster-recovery" element={<DisasterRecoveryPage />} />
      <Route path="/user-manual" element={<UserManualPage />} />
      <Route path="/admin-manual" element={<AdminManualPage />} />
      <Route path="/api-documentation" element={<ApiDocsPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-tasks" element={<MyTasksPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontSize: '14px', borderRadius: '12px', background: '#fff', color: '#333' } }} />
      </AuthProvider>
    </BrowserRouter>
  );
}
