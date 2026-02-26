import React, { useState, useEffect } from 'react';
import {
    Plus, Search, RefreshCcw, Factory, ClipboardList, Settings,
    X, Check, Edit2, Trash2, Loader2, ArrowRightLeft, Package
} from 'lucide-react';
import { manufacturingService } from '../api/manufacturingService';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';

// ─── Órdenes Tab ─────────────────────────────────────────────────────────────

const ORDEN_INITIAL = {
    codigo: '', lote: '', fecha: '', producto_id: '', cantidad: '', unidad: 'kg', operario_id: '',
};

const OrdenesTab = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ ...ORDEN_INITIAL });
    const [editId, setEditId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetch = async () => {
        setLoading(true);
        try {
            const data = await manufacturingService.getOrdenes();
            setItems(data);
        } catch { toast.error('Error al cargar órdenes'); }
        setLoading(false);
    };

    useEffect(() => { fetch(); }, []);

    const openCreate = () => { setEditId(null); setForm({ ...ORDEN_INITIAL }); setShowModal(true); };
    const openEdit = (item) => {
        setEditId(item.orden_manufactura_id);
        setForm({
            codigo: item.codigo,
            lote: item.lote,
            fecha: item.fecha,
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            unidad: item.unidad,
            operario_id: item.operario_id,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...form,
                producto_id: Number(form.producto_id),
                cantidad: Number(form.cantidad),
                operario_id: Number(form.operario_id),
            };
            if (editId) {
                await manufacturingService.updateOrden(editId, payload);
                toast.success('Orden actualizada');
            } else {
                await manufacturingService.createOrden(payload);
                toast.success('Orden creada');
            }
            setShowModal(false);
            fetch();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Error al guardar');
        }
        setSubmitting(false);
    };

    const handleDelete = async (item) => {
        if (!confirm(`¿Eliminar orden ${item.codigo}?`)) return;
        try {
            await manufacturingService.deleteOrden(item.orden_manufactura_id);
            toast.success('Orden eliminada');
            fetch();
        } catch { toast.error('Error al eliminar'); }
    };

    const filtered = items.filter(
        (i) => i.codigo.toLowerCase().includes(search.toLowerCase()) ||
            i.lote.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Buscar por código o lote…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-accent-primary transition-colors"
                    />
                </div>
                <button onClick={fetch} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors" title="Refrescar">
                    <RefreshCcw size={16} />
                </button>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-grad-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">
                    <Plus size={16} /> Nueva Orden
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-accent-primary" /></div>
            ) : filtered.length === 0 ? (
                <div className="glass-card p-12 text-center text-text-muted">No se encontraron órdenes.</div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10 text-text-muted text-left">
                                <th className="px-4 py-3 font-medium">Código</th>
                                <th className="px-4 py-3 font-medium">Lote</th>
                                <th className="px-4 py-3 font-medium">Fecha</th>
                                <th className="px-4 py-3 font-medium">Cantidad</th>
                                <th className="px-4 py-3 font-medium">Unidad</th>
                                <th className="px-4 py-3 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item) => (
                                <tr key={item.orden_manufactura_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-medium text-accent-primary">{item.codigo}</td>
                                    <td className="px-4 py-3">{item.lote}</td>
                                    <td className="px-4 py-3">{item.fecha}</td>
                                    <td className="px-4 py-3">{item.cantidad}</td>
                                    <td className="px-4 py-3">{item.unidad}</td>
                                    <td className="px-4 py-3 text-right space-x-1">
                                        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-accent-secondary"><Edit2 size={14} /></button>
                                        <button onClick={() => handleDelete(item)} className="p-1.5 rounded-lg hover:bg-error/20 transition-colors text-error"><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="glass-card p-6 w-full max-w-lg space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{editId ? 'Editar Orden' : 'Nueva Orden de Manufactura'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-white/10"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-text-muted mb-1 block">Código</label>
                                    <input required value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-accent-primary" placeholder="OM-2026-001" />
                                </div>
                                <div>
                                    <label className="text-xs text-text-muted mb-1 block">Lote</label>
                                    <input required value={form.lote} onChange={(e) => setForm({ ...form, lote: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-accent-primary" placeholder="L26001" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-text-muted mb-1 block">Fecha</label>
                                    <input required type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-accent-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-text-muted mb-1 block">Producto ID</label>
                                    <input required type="number" value={form.producto_id} onChange={(e) => setForm({ ...form, producto_id: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-accent-primary" placeholder="1" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs text-text-muted mb-1 block">Cantidad</label>
                                    <input required type="number" step="0.01" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-accent-primary" placeholder="1000" />
                                </div>
                                <div>
                                    <label className="text-xs text-text-muted mb-1 block">Unidad</label>
                                    <input required value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-accent-primary" placeholder="kg" />
                                </div>
                                <div>
                                    <label className="text-xs text-text-muted mb-1 block">Operario ID</label>
                                    <input required type="number" value={form.operario_id} onChange={(e) => setForm({ ...form, operario_id: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-accent-primary" placeholder="1" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors">Cancelar</button>
                                <button type="submit" disabled={submitting} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-grad-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                    {editId ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Procesos Tab ────────────────────────────────────────────────────────────

const PROCESO_INITIAL = {
    orden_manufactura_id: '', estado_manufactura_id: '1', observacion: '',
};

const ProcesosTab = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ ...PROCESO_INITIAL });
    const [submitting, setSubmitting] = useState(false);

    // Estado change modal
    const [showEstadoModal, setShowEstadoModal] = useState(false);
    const [estadoTarget, setEstadoTarget] = useState(null);
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [usuarioEstado, setUsuarioEstado] = useState('');

    const fetch = async () => {
        setLoading(true);
        try {
            const data = await manufacturingService.getProcesos();
            setItems(data);
        } catch { toast.error('Error al cargar procesos'); }
        setLoading(false);
    };

    useEffect(() => { fetch(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                orden_manufactura_id: Number(form.orden_manufactura_id),
                estado_manufactura_id: Number(form.estado_manufactura_id),
                observacion: form.observacion || null,
            };
            await manufacturingService.createProceso(payload);
            toast.success('Proceso creado');
            setShowModal(false);
            fetch();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Error al crear proceso');
        }
        setSubmitting(false);
    };

    const handleChangeEstado = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await manufacturingService.changeEstado(
                estadoTarget.manufactura_id,
                Number(nuevoEstado),
                Number(usuarioEstado),
            );
            toast.success('Estado actualizado');
            setShowEstadoModal(false);
            fetch();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Error al cambiar estado');
        }
        setSubmitting(false);
    };

    const openEstadoModal = (item) => {
        setEstadoTarget(item);
        setNuevoEstado('');
        setUsuarioEstado('');
        setShowEstadoModal(true);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="flex-1" />
                <button onClick={fetch} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors" title="Refrescar">
                    <RefreshCcw size={16} />
                </button>
                <button onClick={() => { setForm({ ...PROCESO_INITIAL }); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-grad-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">
                    <Plus size={16} /> Nuevo Proceso
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-accent-primary" /></div>
            ) : items.length === 0 ? (
                <div className="glass-card p-12 text-center text-text-muted">No hay procesos registrados.</div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10 text-text-muted text-left">
                                <th className="px-4 py-3 font-medium">ID</th>
                                <th className="px-4 py-3 font-medium">Orden ID</th>
                                <th className="px-4 py-3 font-medium">Estado ID</th>
                                <th className="px-4 py-3 font-medium">Inicio</th>
                                <th className="px-4 py-3 font-medium">Fin</th>
                                <th className="px-4 py-3 font-medium">Observación</th>
                                <th className="px-4 py-3 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.manufactura_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-medium text-accent-primary">{item.manufactura_id}</td>
                                    <td className="px-4 py-3">{item.orden_manufactura_id}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-accent-primary/20 text-accent-primary">
                                            {item.estado_manufactura_id}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-text-muted">{item.fecha_inicio || '—'}</td>
                                    <td className="px-4 py-3 text-text-muted">{item.fecha_fin || '—'}</td>
                                    <td className="px-4 py-3 text-text-muted truncate max-w-[160px]">{item.observacion || '—'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => openEstadoModal(item)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-accent-secondary" title="Cambiar estado">
                                            <ArrowRightLeft size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="glass-card p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Nuevo Proceso de Manufactura</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-white/10"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-3">
                            <div>
                                <label className="text-xs text-text-muted mb-1 block">Orden de Manufactura ID</label>
                                <input required type="number" value={form.orden_manufactura_id}
                                    onChange={(e) => setForm({ ...form, orden_manufactura_id: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-accent-primary" placeholder="1" />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted mb-1 block">Estado Manufactura ID</label>
                                <input required type="number" value={form.estado_manufactura_id}
                                    onChange={(e) => setForm({ ...form, estado_manufactura_id: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-accent-primary" placeholder="1" />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted mb-1 block">Observación</label>
                                <textarea value={form.observacion} onChange={(e) => setForm({ ...form, observacion: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-accent-primary resize-none" rows={2} placeholder="Opcional" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors">Cancelar</button>
                                <button type="submit" disabled={submitting} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-grad-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                    Crear
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Cambio de Estado Modal */}
            {showEstadoModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowEstadoModal(false)}>
                    <div className="glass-card p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Cambiar Estado</h3>
                            <button onClick={() => setShowEstadoModal(false)} className="p-1 rounded-lg hover:bg-white/10"><X size={18} /></button>
                        </div>
                        <p className="text-sm text-text-muted">Proceso #{estadoTarget?.manufactura_id} — Estado actual: <span className="text-accent-primary font-medium">{estadoTarget?.estado_manufactura_id}</span></p>
                        <form onSubmit={handleChangeEstado} className="space-y-3">
                            <div>
                                <label className="text-xs text-text-muted mb-1 block">Nuevo Estado ID</label>
                                <input required type="number" value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-accent-primary" />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted mb-1 block">Usuario ID</label>
                                <input required type="number" value={usuarioEstado} onChange={(e) => setUsuarioEstado(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-accent-primary" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowEstadoModal(false)} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors">Cancelar</button>
                                <button type="submit" disabled={submitting} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-grad-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <ArrowRightLeft size={14} />}
                                    Cambiar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const TABS = [
    { id: 'ordenes', label: 'Órdenes', icon: ClipboardList },
    { id: 'procesos', label: 'Procesos', icon: Settings },
];

const ManufacturingPage = () => {
    const [activeTab, setActiveTab] = useState('ordenes');

    return (
        <AnimatedPage className="space-y-6">
            {/* Header */}
            <div className="glass-card p-8">
                <div className="flex items-center gap-3 mb-2">
                    <Factory size={28} className="text-accent-primary" />
                    <h1 className="text-3xl font-bold text-gradient">Manufactura</h1>
                </div>
                <p className="text-text-muted">Gestión de órdenes y procesos de manufactura.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${active
                                ? 'bg-grad-primary text-white shadow-lg shadow-accent-primary/20'
                                : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            {activeTab === 'ordenes' && <OrdenesTab />}
            {activeTab === 'procesos' && <ProcesosTab />}
        </AnimatedPage>
    );
};

export default ManufacturingPage;
