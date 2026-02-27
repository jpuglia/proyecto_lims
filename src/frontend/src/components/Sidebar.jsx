import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Database, HardDrive, MapPin, FlaskConical, Factory } from 'lucide-react';

const Sidebar = () => {
    const { logout, user, userRoles } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
        { icon: <FlaskConical size={20} />, label: 'Muestras', path: '/samples' },
        { icon: <Database size={20} />, label: 'Equipos', path: '/equipments' },
        { icon: <MapPin size={20} />, label: 'Plantas', path: '/plants' },
        { icon: <FlaskConical size={20} />, label: 'Análisis', path: '/analysis' },
        { icon: <HardDrive size={20} />, label: 'Inventario', path: '/inventory' },
        { icon: <Factory size={20} />, label: 'Manufactura', path: '/manufacturing' },
    ];

    return (
        <aside className="w-64 h-screen bg-[#0d0e15] border-r border-white/10 flex flex-col fixed left-0 top-0 z-50">
            <div className="p-6">
                <h1 className="text-xl font-bold text-gradient">LIMS URUFARMA</h1>
                <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest">Control de Calidad</p>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        data-testid={`nav-${item.path.replace('/', '') || 'dashboard'}`}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-text-muted hover:text-white group"
                    >
                        <span className="text-accent-primary group-hover:scale-110 transition-transform">
                            {item.icon}
                        </span>
                        <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-grad-primary flex items-center justify-center text-xs font-bold">
                        {user?.username?.substring(0, 2).toUpperCase() || 'US'}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-white truncate w-32">{user?.username || 'Usuario'}</span>
                        <span className="text-[10px] text-text-muted capitalize">
                            {userRoles[0] || 'sin rol'}
                        </span>
                    </div>
                </div>
                <button
                    data-testid="btn-logout"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error/10 transition-all text-sm font-medium"
                >
                    <LogOut size={18} />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
