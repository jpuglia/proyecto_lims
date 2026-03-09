import React from 'react';

const DashboardHome = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-text-main tracking-tight">Panel de Control</h1>
        <p className="text-text-muted font-medium">Bienvenido al ecosistema digital LIMS de URUFARMA.</p>
      </div>
      <div className="p-12 bg-white rounded-3xl shadow-premium border border-slate-100">
        <p className="text-lg font-bold text-slate-600 italic">Cargando métricas del sistema...</p>
      </div>
    </div>
  );
};

export default DashboardHome;
