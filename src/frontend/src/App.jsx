import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import './index.css';

import EquipmentsPage from './pages/EquipmentsPage';
import PlantsPage from './pages/PlantsPage';
import SamplesPage from './pages/SamplesPage';
import AnalysisPage from './pages/AnalysisPage';
import InventoryPage from './pages/InventoryPage';
import ManufacturingPage from './pages/ManufacturingPage';
import ReportPage from './pages/ReportPage';
import MainLayout from './components/MainLayout';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-bg-dark text-accent-primary">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;

  // Verificación de rol a nivel de ruta
  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="text-6xl">🔒</div>
          <h2 className="text-2xl font-bold text-white">Acceso Denegado</h2>
          <p className="text-text-muted">No tenés los permisos necesarios para acceder a esta sección.</p>
        </div>
      </MainLayout>
    );
  }

  return <MainLayout>{children}</MainLayout>;
};


import { useState, useEffect } from 'react';
import api from './api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    equipos_activos: '...', analisis_pendientes: '...', muestras_hoy: '...',
    analisis_por_estado: [], muestras_semana: [],
  });

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((r) => setStats(r.data))
      .catch(() => { });
  }, []);

  const chartTooltipStyle = {
    contentStyle: { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
    labelStyle: { color: '#64748B', fontWeight: 'bold' },
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Panel de Control</h1>
        <p className="text-secondary font-medium">Bienvenido al Sistema de Gestión de Laboratorio LIMS URUFARMA.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-primary">
          <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">Equipos Activos</h3>
          <p className="text-4xl font-black mt-2 text-slate-900">{stats.equipos_activos}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-secondary">
          <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">Análisis Pendientes</h3>
          <p className="text-4xl font-black mt-2 text-slate-900">{stats.analisis_pendientes}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-success">
          <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">Muestras Hoy</h3>
          <p className="text-4xl font-black mt-2 text-slate-900">{stats.muestras_hoy}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase mb-6 flex items-center gap-2">
            <span className="w-2 h-4 bg-primary rounded-full"></span>
            Análisis por Estado
          </h3>
          {stats.analisis_por_estado.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.analisis_por_estado}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="estado" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...chartTooltipStyle} cursor={{fill: '#F8FAFC'}} />
                <Bar dataKey="count" fill="#00A0DF" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-secondary text-sm text-center py-16 font-medium bg-slate-50 rounded-xl">Sin datos de análisis aún.</p>
          )}
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase mb-6 flex items-center gap-2">
            <span className="w-2 h-4 bg-secondary rounded-full"></span>
            Muestras — Últimos 7 Días
          </h3>
          {stats.muestras_semana.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.muestras_semana}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="fecha" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...chartTooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#00A0DF" strokeWidth={3} dot={{ fill: '#00A0DF', strokeWidth: 2, r: 4, stroke: '#FFF' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-secondary text-sm text-center py-16 font-medium bg-slate-50 rounded-xl">Sin datos de muestras aún.</p>
          )}
        </div>
      </div>
    </div>
  );
};

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipments"
            element={
              <ProtectedRoute>
                <EquipmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plants"
            element={
              <ProtectedRoute>
                <PlantsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/samples"
            element={
              <ProtectedRoute>
                <SamplesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis"
            element={
              <ProtectedRoute>
                <AnalysisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manufacturing"
            element={
              <ProtectedRoute>
                <ManufacturingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report/:solicitudId"
            element={
              <ProtectedRoute>
                <ReportPage />
              </ProtectedRoute>
            }
          />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
