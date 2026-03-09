import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-bg-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden ml-64 transition-all duration-300">
        <Header />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
        <footer className="p-8 border-t border-border-light text-center text-text-muted text-xs font-medium">
          &copy; 2026 URUFARMA LIMS — Control de Calidad GAMP 5 Compliant
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
