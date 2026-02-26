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
import MainLayout from './components/MainLayout';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-bg-dark text-accent-primary">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;

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
    contentStyle: { background: 'rgba(15,15,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' },
    labelStyle: { color: '#a0a0b8' },
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">Panel de Control</h1>
        <p className="text-text-muted">Bienvenido al Sistema de Gestión de Laboratorio LIMS URUFARMA.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-l-4 border-accent-primary">
          <h3 className="text-sm font-medium text-text-muted uppercase">Equipos Activos</h3>
          <p className="text-3xl font-bold mt-2">{stats.equipos_activos}</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-accent-secondary">
          <h3 className="text-sm font-medium text-text-muted uppercase">Análisis Pendientes</h3>
          <p className="text-3xl font-bold mt-2">{stats.analisis_pendientes}</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-success">
          <h3 className="text-sm font-medium text-text-muted uppercase">Muestras Hoy</h3>
          <p className="text-3xl font-bold mt-2">{stats.muestras_hoy}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-text-muted uppercase mb-4">Análisis por Estado</h3>
          {stats.analisis_por_estado.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.analisis_por_estado}>
                <XAxis dataKey="estado" tick={{ fill: '#a0a0b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#a0a0b8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="count" fill="url(#gradPrimary)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-text-muted text-sm text-center py-12">Sin datos de análisis aún.</p>
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-text-muted uppercase mb-4">Muestras — Últimos 7 Días</h3>
          {stats.muestras_semana.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.muestras_semana}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="fecha" tick={{ fill: '#a0a0b8', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: '#a0a0b8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...chartTooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-text-muted text-sm text-center py-12">Sin datos de muestras aún.</p>
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
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
