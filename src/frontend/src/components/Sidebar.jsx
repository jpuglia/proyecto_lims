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
        <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-50 shadow-sm">
            <div className="p-8">
                <h1 className="text-xl font-bold text-primary tracking-tight">LIMS URUFARMA</h1>
                <p className="text-[10px] text-secondary mt-1 uppercase tracking-widest font-semibold">Control de Calidad</p>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        data-testid={`nav-${item.path.replace('/', '') || 'dashboard'}`}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-secondary hover:bg-slate-50 hover:text-primary group"
                    >
                        <span className="text-secondary group-hover:text-primary transition-colors">
                            {item.icon}
                        </span>
                        <span className="text-sm font-semibold">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-6 border-t border-slate-100">
                <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        {user?.username?.substring(0, 2).toUpperCase() || 'US'}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800 truncate w-24">{user?.username || 'Usuario'}</span>
                        <span className="text-[10px] text-secondary font-medium capitalize">
                            {userRoles[0] || 'sin rol'}
                        </span>
                    </div>
                </div>
                <button
                    data-testid="btn-logout"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all text-sm font-semibold"
                >
                    <LogOut size={18} />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
