import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardHome from './pages/DashboardHome';
import InspectorDashboard from './pages/InspectorDashboard';
import InspectorSamplingPage from './pages/InspectorSamplingPage';
import InspectorHistoryPage from './pages/InspectorHistoryPage';
import AdhocInspectionPage from './pages/AdhocInspectionPage';
import AnalistaDashboard from './pages/AnalistaDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import EquipmentsPage from './pages/EquipmentsPage';
import PlantsPage from './pages/PlantsPage';
import SamplesPage from './pages/SamplesPage';
import AnalysisPage from './pages/AnalysisPage';
import InventoryPage from './pages/InventoryPage';
import ManufacturingPage from './pages/ManufacturingPage';
import ReportPage from './pages/ReportPage';
import DataEntryPage from './pages/DataEntry';
import ReviewQueuePage from './pages/ReviewQueue';
import SampleDetailPage from './pages/SampleDetail';
import TiposSolicitudPage from './pages/TiposSolicitudPage';
import AdminUsersPage from './pages/AdminUsersPage';
import { SettingsPage } from './pages/Placeholders';

import './index.css';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-bg-surface text-primary">
      <div className="animate-spin rounded-xl h-12 w-12 border-t-2 border-b-2 border-primary shadow-lg shadow-primary/20"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="text-6xl p-6 bg-error/10 rounded-full">🔒</div>
          <h2 className="text-2xl font-black text-text-main">Acceso Denegado</h2>
          <p className="text-text-muted">No tenés los permisos necesarios para acceder a esta sección.</p>
        </div>
      </DashboardLayout>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#FFFFFF',
            color: '#1E293B',
            fontWeight: '600',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            border: '1px solid #E2E8F0',
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <DashboardHome />
            </ProtectedRoute>
          } />

          {/* Inspector Module */}
          <Route path="/dashboard/inspector" element={
            <ProtectedRoute roles={['inspector', 'administrador']}>
              <InspectorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/sampling" element={
            <ProtectedRoute roles={['inspector', 'administrador']}>
              <InspectorSamplingPage />
            </ProtectedRoute>
          } />
          <Route path="/inspection/adhoc" element={
            <ProtectedRoute roles={['inspector', 'administrador']}>
              <AdhocInspectionPage />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute roles={['inspector', 'administrador']}>
              <InspectorHistoryPage />
            </ProtectedRoute>
          } />

          {/* Other Dashboards */}
          <Route path="/dashboard/analista" element={
            <ProtectedRoute roles={['analista', 'administrador']}>
              <AnalistaDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/supervisor" element={
            <ProtectedRoute roles={['supervisor', 'administrador']}>
              <SupervisorDashboard />
            </ProtectedRoute>
          } />

          {/* Operations */}
          <Route path="/samples" element={
            <ProtectedRoute roles={['administrador', 'supervisor', 'analista', 'operador']}>
              <SamplesPage />
            </ProtectedRoute>
          } />
          <Route path="/samples/:id" element={
            <ProtectedRoute>
              <SampleDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/analysis" element={
            <ProtectedRoute roles={['administrador', 'supervisor', 'analista', 'operador']}>
              <AnalysisPage />
            </ProtectedRoute>
          } />
          <Route path="/manufacturing" element={
            <ProtectedRoute roles={['administrador', 'supervisor', 'analista', 'operador']}>
              <ManufacturingPage />
            </ProtectedRoute>
          } />
          <Route path="/data-entry" element={
            <ProtectedRoute>
              <DataEntryPage />
            </ProtectedRoute>
          } />
          <Route path="/review-queue" element={
            <ProtectedRoute roles={['administrador', 'supervisor']}>
              <ReviewQueuePage />
            </ProtectedRoute>
          } />
          <Route path="/report/:solicitudId" element={
            <ProtectedRoute>
              <ReportPage />
            </ProtectedRoute>
          } />

          {/* Resources */}
          <Route path="/equipments" element={
            <ProtectedRoute roles={['administrador', 'supervisor', 'analista', 'operador']}>
              <EquipmentsPage />
            </ProtectedRoute>
          } />
          <Route path="/plants" element={
            <ProtectedRoute roles={['administrador', 'supervisor', 'analista', 'operador']}>
              <PlantsPage />
            </ProtectedRoute>
          } />
          <Route path="/sampling-types" element={
            <ProtectedRoute roles={['administrador', 'supervisor', 'analista', 'operador']}>
              <TiposSolicitudPage />
            </ProtectedRoute>
          } />
          <Route path="/inventory" element={
            <ProtectedRoute roles={['administrador', 'supervisor']}>
              <InventoryPage />
            </ProtectedRoute>
          } />

          {/* System */}
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['administrador']}>
              <AdminUsersPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute roles={['administrador', 'supervisor']}>
              <SettingsPage />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
