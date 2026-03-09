import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LogOut, LayoutDashboard, Database, HardDrive,
    MapPin, FlaskConical, Factory, ClipboardCheck,
    Search, Settings, ChevronRight, History, Plus, Users
} from 'lucide-react';
import { cn } from '../lib/utils';

const Sidebar = () => {
    const { logout, hasRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        {
            icon: <LayoutDashboard size={20} />,
            label: 'Dashboard',
            path: hasRole('inspector') && !hasRole('administrador') ? '/dashboard/inspector' : '/',
            id: 'nav-dashboard'
        },
        {
            icon: <FlaskConical size={20} />,
            label: 'Muestreos',
            path: '/sampling',
            id: 'nav-sampling',
            roles: ['inspector', 'administrador']
        },
        {
            icon: <Plus size={20} />,
            label: 'Inspección Ad-hoc',
            path: '/inspection/adhoc',
            id: 'nav-adhoc',
            roles: ['inspector', 'administrador']
        },
        {
            icon: <History size={20} />,
            label: 'Histórico',
            path: '/history',
            id: 'nav-history',
            roles: ['inspector', 'administrador']
        },
        {
            icon: <ClipboardCheck size={20} />,
            label: 'Inspector (Admin)',
            path: '/dashboard/inspector',
            id: 'nav-inspector',
            roles: ['administrador']
        },
        {
            icon: <FlaskConical size={20} />,
            label: 'Analista',
            path: '/dashboard/analista',
            id: 'nav-analista',
            roles: ['analista', 'administrador']
        },
        {
            icon: <Search size={20} />,
            label: 'Supervisor',
            path: '/dashboard/supervisor',
            id: 'nav-supervisor',
            roles: ['supervisor', 'administrador']
        },
        { type: 'divider', label: 'Operaciones', roles: ['administrador', 'supervisor', 'analista', 'operador'] },
        { icon: <FlaskConical size={20} />, label: 'Muestras', path: '/samples', id: 'nav-samples', roles: ['administrador', 'supervisor', 'analista', 'operador'] },
        { icon: <FlaskConical size={20} />, label: 'Análisis', path: '/analysis', id: 'nav-analysis', roles: ['administrador', 'supervisor', 'analista', 'operador'] },
        { icon: <Factory size={20} />, label: 'Manufactura', path: '/manufacturing', id: 'nav-manufacturing', roles: ['administrador', 'supervisor', 'analista', 'operador'] },
        { type: 'divider', label: 'Recursos', roles: ['administrador', 'supervisor'] },
        { icon: <Database size={20} />, label: 'Equipos', path: '/equipments', id: 'nav-equipments', roles: ['administrador', 'supervisor'] },
        { icon: <MapPin size={20} />, label: 'Plantas', path: '/plants', id: 'nav-plants', roles: ['administrador', 'supervisor'] },
        { icon: <ClipboardCheck size={20} />, label: 'Tipos Solicitud', path: '/sampling-types', id: 'nav-sampling-types', roles: ['administrador', 'supervisor'] },
        { icon: <HardDrive size={20} />, label: 'Inventario', path: '/inventory', id: 'nav-inventory', roles: ['administrador', 'supervisor'] },
        { type: 'divider', label: 'Sistema', roles: ['administrador'] },
        { icon: <Users size={20} />, label: 'Usuarios', path: '/admin/users', id: 'nav-users', roles: ['administrador'] },
        { icon: <Settings size={20} />, label: 'Ajustes', path: '/settings', id: 'nav-settings', roles: ['administrador'] },
    ];

    return (
        <aside className="w-64 h-screen bg-white border-r border-border-light flex flex-col fixed left-0 top-0 z-50 shadow-sm overflow-hidden">
            <div className="p-8">
                <div className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                        <FlaskConical size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-text-main tracking-tight leading-none">LIMS</h1>
                        <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest font-black">Urufarma</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.filter(item => !item.roles || hasRole(...item.roles)).map((item, idx) => {
                    if (item.type === 'divider') {
                        return (
                            <div key={`div-${idx}`} className="pt-6 pb-2 px-4">
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{item.label}</span>
                            </div>
                        );
                    }

                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            data-testid={item.id}
                            className={cn(
                                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-text-muted hover:bg-bg-surface hover:text-text-main"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    "transition-colors",
                                    isActive ? "text-primary" : "text-text-muted group-hover:text-primary"
                                )}>
                                    {item.icon}
                                </span>
                                <span className="text-sm font-bold">{item.label}</span>
                            </div>
                            {isActive && <ChevronRight size={14} />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-border-light">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:text-error hover:bg-error/5 transition-all text-sm font-bold group"
                >
                    <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
