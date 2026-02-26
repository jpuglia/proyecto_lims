import React, { useState, useEffect } from 'react';
import { Plus, Search, RefreshCcw, Package, FlaskConical, BarChart3, X, Check, Edit2, Trash2, Loader2, Tag, Layers } from 'lucide-react';
import { inventoryService } from '../api/inventoryService';
import { toast } from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';

// ─── Tab Components ──────────────────────────────────────────────────────────

const TABS = [
    { id: 'polvos', label: 'Polvos / Suplementos', icon: <Package size={16} /> },
    { id: 'medios', label: 'Medios Preparados', icon: <FlaskConical size={16} /> },
    { id: 'stock', label: 'Stock', icon: <BarChart3 size={16} /> },
];

// ─── Polvos Tab ──────────────────────────────────────────────────────────────

const PolvosTab = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [current, setCurrent] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ nombre: '', codigo: '', unidad: 'gramos' });
    const [editForm, setEditForm] = useState({ nombre: '' });

    const fetch = async () => {
        setLoading(true);
        try { setItems(await inventoryService.getPolvos()); }
        catch { toast.error('Error al cargar polvos'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await inventoryService.createPolvo(form);
            toast.success('Polvo/Suplemento creado');
            setIsModalOpen(false);
            setForm({ nombre: '', codigo: '', unidad: 'gramos' });
            fetch();
        } catch { toast.error('Error al crear polvo'); }
        finally { setSubmitting(false); }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await inventoryService.updatePolvo(current.polvo_id, editForm);
            toast.success('Polvo actualizado');
            setIsEditModalOpen(false);
            fetch();
        } catch { toast.error('Error al actualizar'); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`¿Eliminar "${item.nombre}"?`)) return;
        try {
            await inventoryService.deletePolvo(item.polvo_id);
            toast.success('Polvo eliminado');
            fetch();
        } catch { toast.error('Error al eliminar'); }
    };

    const filtered = items.filter((i) =>
        i.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (i.codigo || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input
                        type="text" placeholder="Buscar por nombre o código..."
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-accent-primary transition-all text-sm"
                    />
                </div>
                <button onClick={fetch} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
                    <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
                <button id="btn-nuevo-polvo" onClick={() => setIsModalOpen(true)}
                    className="bg-grad-primary hover:brightness-110 active:scale-95 text-white px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm shadow-lg shadow-accent-primary/20">
                    <Plus size={16} /> Nuevo Polvo
                </button>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            {['ID', 'Nombre', 'Código', 'Unidad', 'Acciones'].map(h => (
                                <th key={h} className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan="5" className="px-5 py-10 text-center"><RefreshCcw className="animate-spin text-accent-primary mx-auto" size={28} /></td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan="5" className="px-5 py-10 text-center text-text-muted text-sm">No se encontraron polvos o suplementos.</td></tr>
                        ) : filtered.map((item) => (
                            <tr key={item.polvo_id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-5 py-3 font-mono text-xs text-text-muted">#{item.polvo_id}</td>
                                <td className="px-5 py-3 font-medium text-white">{item.nombre}</td>
                                <td className="px-5 py-3 text-sm text-text-muted font-mono">{item.codigo || '—'}</td>
                                <td className="px-5 py-3 text-sm text-text-muted">{item.unidad}</td>
                                <td className="px-5 py-3">
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setCurrent(item); setEditForm({ nombre: item.nombre }); setIsEditModalOpen(true); }}
                                            className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-all"><Edit2 size={14} /></button>
                                        <button onClick={() => handleDelete(item)}
                                            className="p-1.5 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-all"><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Crear */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-text-muted hover:text-white"><X size={22} /></button>
                        <h2 className="text-xl font-bold text-gradient mb-5">Nuevo Polvo / Suplemento</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            {[
                                { label: 'Nombre', key: 'nombre', placeholder: 'Ej: Agar Mueller-Hinton', required: true },
                                { label: 'Código', key: 'codigo', placeholder: 'Ej: AMH-001' },
                                { label: 'Unidad', key: 'unidad', placeholder: 'Ej: gramos', required: true },
                            ].map(({ label, key, placeholder, required }) => (
                                <div key={key} className="space-y-1">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">{label}</label>
                                    <input type="text" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                        required={required} placeholder={placeholder}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-accent-primary transition-all text-sm" />
                                </div>
                            ))}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white text-sm font-semibold hover:bg-white/5 transition-all">Cancelar</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-grad-primary text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:brightness-110 active:scale-95 transition-all">
                                    {submitting ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Crear
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Editar */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setIsEditModalOpen(false)} className="absolute top-5 right-5 text-text-muted hover:text-white"><X size={22} /></button>
                        <h2 className="text-xl font-bold text-gradient mb-5">Editar Polvo #{current?.polvo_id}</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Nombre</label>
                                <input type="text" value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-accent-primary transition-all text-sm" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white text-sm font-semibold hover:bg-white/5 transition-all">Cancelar</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-grad-primary text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:brightness-110 active:scale-95 transition-all">
                                    {submitting ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Actualizar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Medios Tab ──────────────────────────────────────────────────────────────

const MediosTab = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ nombre: '', tipo: 'agar', volumen_ml: '' });

    const fetch = async () => {
        setLoading(true);
        try { setItems(await inventoryService.getMedios()); }
        catch { toast.error('Error al cargar medios'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await inventoryService.createMedio({ ...form, volumen_ml: parseFloat(form.volumen_ml) });
            toast.success('Medio preparado creado');
            setIsModalOpen(false);
            setForm({ nombre: '', tipo: 'agar', volumen_ml: '' });
            fetch();
        } catch { toast.error('Error al crear medio'); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <button onClick={fetch} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
                    <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
                <button id="btn-nuevo-medio" onClick={() => setIsModalOpen(true)}
                    className="bg-grad-primary hover:brightness-110 active:scale-95 text-white px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm shadow-lg shadow-accent-primary/20">
                    <Plus size={16} /> Nuevo Medio
                </button>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            {['ID', 'Nombre', 'Tipo', 'Volumen (mL)'].map(h => (
                                <th key={h} className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan="4" className="px-5 py-10 text-center"><RefreshCcw className="animate-spin text-accent-primary mx-auto" size={28} /></td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan="4" className="px-5 py-10 text-center text-text-muted text-sm">No hay medios preparados registrados.</td></tr>
                        ) : items.map((item) => (
                            <tr key={item.medio_id} className="hover:bg-white/5 transition-colors">
                                <td className="px-5 py-3 font-mono text-xs text-text-muted">#{item.medio_id}</td>
                                <td className="px-5 py-3 font-medium text-white">{item.nombre}</td>
                                <td className="px-5 py-3">
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-secondary/10 text-accent-secondary">
                                        {item.tipo}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-sm text-text-muted">{item.volumen_ml} mL</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-text-muted hover:text-white"><X size={22} /></button>
                        <h2 className="text-xl font-bold text-gradient mb-5">Nuevo Medio Preparado</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Nombre</label>
                                <input type="text" value={form.nombre} required onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    placeholder="Ej: Caldo Nutritivo"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-accent-primary transition-all text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Tipo</label>
                                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-accent-primary transition-all appearance-none text-sm">
                                    {['agar', 'caldo', 'solución', 'buffer'].map(t => (
                                        <option key={t} value={t} className="bg-bg-dark capitalize">{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Volumen (mL)</label>
                                <input type="number" step="0.1" min="0" value={form.volumen_ml} required
                                    onChange={(e) => setForm({ ...form, volumen_ml: e.target.value })}
                                    placeholder="Ej: 500"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-accent-primary transition-all text-sm" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white text-sm font-semibold hover:bg-white/5 transition-all">Cancelar</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-grad-primary text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:brightness-110 active:scale-95 transition-all">
                                    {submitting ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Crear
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Stock Tab ────────────────────────────────────────────────────────────────

const StockTab = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetch = async () => {
        setLoading(true);
        try { setItems(await inventoryService.getStock()); }
        catch { toast.error('Error al cargar stock'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, []);

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button onClick={fetch} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
                    <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>
            <div className="glass-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            {['ID', 'Medio ID', 'Cantidad Disponible', 'Unidad'].map(h => (
                                <th key={h} className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan="4" className="px-5 py-10 text-center"><RefreshCcw className="animate-spin text-accent-primary mx-auto" size={28} /></td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan="4" className="px-5 py-10 text-center text-text-muted text-sm">No hay registros de stock disponibles.</td></tr>
                        ) : items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                <td className="px-5 py-3 font-mono text-xs text-text-muted">#{item.stock_id || idx + 1}</td>
                                <td className="px-5 py-3 text-sm text-text-muted">{item.medio_preparado_id}</td>
                                <td className="px-5 py-3">
                                    <span className={`font-bold text-lg ${item.cantidad_disponible > 0 ? 'text-success' : 'text-error'}`}>
                                        {item.cantidad_disponible}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-sm text-text-muted">{item.unidad || 'unidades'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const InventoryPage = () => {
    const [activeTab, setActiveTab] = useState('polvos');

    return (
        <AnimatedPage className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gradient">Inventario</h1>
                <p className="text-text-muted mt-1">Gestione polvos, suplementos, medios preparados y stock de laboratorio.</p>
            </div>

            {/* Tabs */}
            <div className="glass-card p-1 flex gap-1 w-fit rounded-xl">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        id={`tab-${tab.id}`}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
                            ? 'bg-grad-primary text-white shadow-lg shadow-accent-primary/20'
                            : 'text-text-muted hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'polvos' && <PolvosTab />}
                {activeTab === 'medios' && <MediosTab />}
                {activeTab === 'stock' && <StockTab />}
            </div>
        </AnimatedPage>
    );
};

export default InventoryPage;
