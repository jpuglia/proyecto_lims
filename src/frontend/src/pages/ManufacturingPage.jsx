import React, { useState, useEffect } from 'react';
import {
    Plus, Search, RefreshCcw, Factory, ClipboardList, Settings, GitBranch,
    X, Check, Edit2, Trash2, Loader2, ArrowRightLeft, ChevronDown, ChevronRight, Clock, Download as DownloadIcon
} from 'lucide-react';
import { manufacturingService } from '../api/manufacturingService';
import toast from 'react-hot-toast';
import api from '../api/axios';
import AnimatedPage from '../components/AnimatedPage';
import RoleGuard from '../components/RoleGuard';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ordenManufacturaSchema, procesoManufacturaSchema } from '../validation/schemas';
import FormField, { inputCls } from '../components/FormField';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ESTADO_COLORS = {
    'planificado': 'bg-blue-500/20 text-blue-300',
    'en curso': 'bg-yellow-500/20 text-yellow-300',
    'en proceso': 'bg-yellow-500/20 text-yellow-300',
    'finalizado': 'bg-green-500/20 text-green-300',
    'completado': 'bg-green-500/20 text-green-300',
    'cancelado': 'bg-red-500/20 text-red-300',
    'pendiente': 'bg-purple-500/20 text-purple-300',
};

const estadoBadge = (nombre) => {
    const key = (nombre || '').toLowerCase();
    const cls = ESTADO_COLORS[key] || 'bg-white/10 text-text-muted';
    return <span className={`inline - flex items - center px - 2.5 py - 0.5 rounded - full text - xs font - medium ${cls} `}>{nombre || '—'}</span>;
};

const fmtDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }); }
    catch { return d; }
};

// ─── Órdenes Tab ─────────────────────────────────────────────────────────────

const OrdenesTab = ({ estados }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(''); // Renamed to 'q' in the snippet, but keeping 'search' for consistency with 'filtered'
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Trazabilidad: expanded row
    const [expandedId, setExpandedId] = useState(null);
    const [procesos, setProcesos] = useState({});   // { [orden_id]: [] }
    const [loadingProcesos, setLoadingProcesos] = useState({});

    const form = useForm({
        resolver: zodResolver(ordenManufacturaSchema),
        defaultValues: { codigo: '', lote: '', fecha: '', producto_id: '', cantidad: '', unidad: 'kg', operario_id: '' },
    });

    const fetchOrdenes = async () => {
        setLoading(true);
        try { setItems(await manufacturingService.getOrdenes()); }
        catch { toast.error('Error al cargar órdenes'); }
        setLoading(false);
    };

    useEffect(() => { fetchOrdenes(); }, []);

    const openCreate = () => {
        setEditId(null);
        form.reset({ codigo: '', lote: '', fecha: '', producto_id: '', cantidad: '', unidad: 'kg', operario_id: '' });
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditId(item.orden_manufactura_id);
        form.reset({
            codigo: item.codigo,
            lote: item.lote,
            fecha: item.fecha,
            producto_id: String(item.producto_id),
            cantidad: String(item.cantidad),
            unidad: item.unidad,
            operario_id: String(item.operario_id),
        });
        setShowModal(true);
    };

    const handleSubmit = async (data) => {
        setSubmitting(true);
        try {
            const payload = {
                ...data,
                producto_id: Number(data.producto_id),
                cantidad: Number(data.cantidad),
                operario_id: Number(data.operario_id),
            };
            if (editId) {
                await manufacturingService.updateOrden(editId, payload);
                toast.success('Orden actualizada');
            } else {
                await manufacturingService.createOrden(payload);
                toast.success('Orden creada');
            }
            setShowModal(false);
            fetchOrdenes();
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
            fetchOrdenes();
        } catch { toast.error('Error al eliminar'); }
    };

    const handleExportCSV = async () => {
        try {
            toast.loading('Generando CSV...', { id: 'exportMsg' });
            const response = await api.get('/exports/ordenes-manufactura.csv', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'ordenes-manufactura.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Exportación completada', { id: 'exportMsg' });
        } catch (error) {
            console.error('Error exporting CSV:', error);
            toast.error('Error al exportar datos', { id: 'exportMsg' });
        }
    };

    const toggleExpand = async (item) => {
        const id = item.orden_manufactura_id;
        if (expandedId === id) { setExpandedId(null); return; }
        setExpandedId(id);
        if (!procesos[id]) {
            setLoadingProcesos(prev => ({ ...prev, [id]: true }));
            try {
                const data = await manufacturingService.getProcesosOrden(id);
                setProcesos(prev => ({ ...prev, [id]: data }));
            } catch { toast.error('Error al cargar procesos'); }
            finally { setLoadingProcesos(prev => ({ ...prev, [id]: false })); }
        }
    };

    const filtered = items.filter(
        (i) => (i.codigo || '').toLowerCase().includes(search.toLowerCase()) ||
            (i.lote || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input type="text" placeholder="Buscar por código o lote..."
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-white focus:outline-none focus:border-accent-primary transition-all" />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2"
                        title="Exportar Órdenes a CSV"
                    >
                        <DownloadIcon size={18} />
                    </button>
                    <button onClick={fetchOrdenes} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
                        <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <RoleGuard roles={['administrador', 'supervisor', 'operador']}>
                        <button onClick={openCreate} className="bg-grad-primary hover:brightness-110 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2">
                            <Plus size={20} />
                            Nueva Orden
                        </button>
                    </RoleGuard>
                </div>
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
                                <th className="px-4 py-3 w-8" />
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
                                <React.Fragment key={item.orden_manufactura_id}>
                                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                                        onClick={() => toggleExpand(item)}>
                                        <td className="px-4 py-3 text-text-muted">
                                            {expandedId === item.orden_manufactura_id
                                                ? <ChevronDown size={14} />
                                                : <ChevronRight size={14} />}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-accent-primary">{item.codigo}</td>
                                        <td className="px-4 py-3">{item.lote}</td>
                                        <td className="px-4 py-3 text-text-muted">{item.fecha}</td>
                                        <td className="px-4 py-3">{item.cantidad}</td>
                                        <td className="px-4 py-3">{item.unidad}</td>
                                        <td className="px-4 py-3 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                                            <RoleGuard roles={['administrador', 'supervisor']}>
                                                <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-accent-secondary"><Edit2 size={14} /></button>
                                                <button onClick={() => handleDelete(item)} className="p-1.5 rounded-lg hover:bg-error/20 transition-colors text-error"><Trash2 size={14} /></button>
                                            </RoleGuard>
                                        </td>
                                    </tr>
                                    {/* Expanded trazabilidad row */}
                                    {expandedId === item.orden_manufactura_id && (
                                        <tr className="border-b border-white/5 bg-white/[0.02]">
                                            <td colSpan={7} className="px-8 py-4">
                                                {loadingProcesos[item.orden_manufactura_id] ? (
                                                    <div className="flex items-center gap-2 text-text-muted text-xs">
                                                        <Loader2 size={14} className="animate-spin" /> Cargando procesos…
                                                    </div>
                                                ) : (procesos[item.orden_manufactura_id] || []).length === 0 ? (
                                                    <p className="text-xs text-text-muted">Sin procesos registrados para esta orden.</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Procesos de la orden</p>
                                                        <div className="flex gap-3 flex-wrap">
                                                            {(procesos[item.orden_manufactura_id] || []).map((p, idx) => (
                                                                <div key={p.manufactura_id} className="flex items-center gap-2">
                                                                    <div className="text-xs glass-card px-3 py-2 space-y-1 min-w-[140px]">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-text-muted">#{p.manufactura_id}</span>
                                                                            {estadoBadge(p.estado_nombre)}
                                                                        </div>
                                                                        <div className="text-text-muted flex items-center gap-1">
                                                                            <Clock size={10} /> {fmtDate(p.fecha_inicio)}
                                                                        </div>
                                                                    </div>
                                                                    {idx < (procesos[item.orden_manufactura_id] || []).length - 1 && (
                                                                        <ArrowRightLeft size={12} className="text-text-muted flex-shrink-0" />
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-6 w-full max-w-lg space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{editId ? 'Editar Orden' : 'Nueva Orden de Manufactura'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-white/10"><X size={18} /></button>
                        </div>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <FormField label="Código" error={form.formState.errors.codigo}>
                                    <input {...form.register('codigo')} placeholder="OM-2026-001" className={inputCls(form.formState.errors.codigo)} />
                                </FormField>
                                <FormField label="Lote" error={form.formState.errors.lote}>
                                    <input {...form.register('lote')} placeholder="L26001" className={inputCls(form.formState.errors.lote)} />
                                </FormField>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <FormField label="Fecha" error={form.formState.errors.fecha}>
                                    <input type="date" {...form.register('fecha')} className={inputCls(form.formState.errors.fecha)} />
                                </FormField>
                                <FormField label="Producto ID" error={form.formState.errors.producto_id}>
                                    <input type="number" min="1" {...form.register('producto_id')} placeholder="1" className={inputCls(form.formState.errors.producto_id)} />
                                </FormField>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <FormField label="Cantidad" error={form.formState.errors.cantidad}>
                                    <input type="number" step="0.01" min="0" {...form.register('cantidad')} placeholder="1000" className={inputCls(form.formState.errors.cantidad)} />
                                </FormField>
                                <FormField label="Unidad" error={form.formState.errors.unidad}>
                                    <input {...form.register('unidad')} placeholder="kg" className={inputCls(form.formState.errors.unidad)} />
                                </FormField>
                                <FormField label="Operario ID" error={form.formState.errors.operario_id}>
                                    <input type="number" min="1" {...form.register('operario_id')} placeholder="1" className={inputCls(form.formState.errors.operario_id)} />
                                </FormField>
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

const ProcesosTab = ({ estados }) => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Estado change modal
    const [showEstadoModal, setShowEstadoModal] = useState(false);
    const [estadoTarget, setEstadoTarget] = useState(null);
    const [changingEstado, setChangingEstado] = useState(false);

    // Historial drawer
    const [showHistorial, setShowHistorial] = useState(false);
    const [historialTarget, setHistorialTarget] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [loadingHistorial, setLoadingHistorial] = useState(false);

    const createForm = useForm({
        resolver: zodResolver(procesoManufacturaSchema),
        defaultValues: { orden_manufactura_id: '', estado_manufactura_id: '', observacion: '' },
    });

    const estadoForm = useForm({
        defaultValues: { nuevo_estado_id: '' },
    });

    const fetchProcesos = async () => {
        setLoading(true);
        try { setItems(await manufacturingService.getProcesos()); }
        catch { toast.error('Error al cargar procesos'); }
        setLoading(false);
    };

    useEffect(() => { fetchProcesos(); }, []);

    const handleCreate = async (data) => {
        setSubmitting(true);
        try {
            await manufacturingService.createProceso({
                orden_manufactura_id: Number(data.orden_manufactura_id),
                estado_manufactura_id: Number(data.estado_manufactura_id),
                observacion: data.observacion || null,
            });
            toast.success('Proceso creado');
            setShowModal(false);
            createForm.reset();
            fetchProcesos();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Error al crear proceso');
        }
        setSubmitting(false);
    };

    const openEstadoModal = (item) => {
        setEstadoTarget(item);
        estadoForm.reset({ nuevo_estado_id: '' });
        setShowEstadoModal(true);
    };

    const handleChangeEstado = async (data) => {
        setChangingEstado(true);
        try {
            await manufacturingService.changeEstado(
                estadoTarget.manufactura_id,
                Number(data.nuevo_estado_id),
                parseInt(user?.sub, 10) || 1,   // JWT sub = str(usuario_id)
            );
            toast.success('Estado actualizado');
            setShowEstadoModal(false);
            fetchProcesos();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Error al cambiar estado');
        }
        setChangingEstado(false);
    };

    const openHistorial = async (item) => {
        setHistorialTarget(item);
        setShowHistorial(true);
        setLoadingHistorial(true);
        try {
            const data = await manufacturingService.getHistorialProceso(item.manufactura_id);
            setHistorial(data);
        } catch { toast.error('Error al cargar historial'); }
        setLoadingHistorial(false);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="flex-1" />
                <button onClick={fetchProcesos} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors" title="Refrescar">
                    <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
                <RoleGuard roles={['administrador', 'supervisor', 'analista', 'operador']}>
                    <button onClick={() => { createForm.reset(); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-grad-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">
                        <Plus size={16} /> Nuevo Proceso
                    </button>
                </RoleGuard>
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
                                <th className="px-4 py-3 font-medium">Estado</th>
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
                                    <td className="px-4 py-3">{estadoBadge(item.estado_nombre)}</td>
                                    <td className="px-4 py-3 text-text-muted">{fmtDate(item.fecha_inicio)}</td>
                                    <td className="px-4 py-3 text-text-muted">{fmtDate(item.fecha_fin)}</td>
                                    <td className="px-4 py-3 text-text-muted truncate max-w-[160px]">{item.observacion || '—'}</td>
                                    <td className="px-4 py-3 text-right space-x-1">
                                        <button onClick={() => openHistorial(item)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-text-muted" title="Ver historial">
                                            <Clock size={14} />
                                        </button>
                                        <RoleGuard roles={['administrador', 'supervisor']}>
                                            <button onClick={() => openEstadoModal(item)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-accent-secondary" title="Cambiar estado">
                                                <ArrowRightLeft size={14} />
                                            </button>
                                        </RoleGuard>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-6 w-full max-w-md space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Nuevo Proceso de Manufactura</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-white/10"><X size={18} /></button>
                        </div>
                        <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-3">
                            <FormField label="Orden de Manufactura ID" error={createForm.formState.errors.orden_manufactura_id}>
                                <input type="number" min="1" placeholder="1" {...createForm.register('orden_manufactura_id')}
                                    className={inputCls(createForm.formState.errors.orden_manufactura_id)} />
                            </FormField>
                            <FormField label="Estado" error={createForm.formState.errors.estado_manufactura_id}>
                                {estados.length > 0 ? (
                                    <select {...createForm.register('estado_manufactura_id')} className={inputCls(createForm.formState.errors.estado_manufactura_id) + ' appearance-none'}>
                                        <option value="">Seleccionar estado…</option>
                                        {estados.map(e => (
                                            <option key={e.estado_manufactura_id} value={e.estado_manufactura_id} className="bg-bg-dark">{e.nombre}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input type="number" min="1" placeholder="ID del estado" {...createForm.register('estado_manufactura_id')}
                                        className={inputCls(createForm.formState.errors.estado_manufactura_id)} />
                                )}
                            </FormField>
                            <FormField label="Observación (opcional)" error={createForm.formState.errors.observacion}>
                                <textarea {...createForm.register('observacion')} rows={2} placeholder="Opcional"
                                    className={inputCls(createForm.formState.errors.observacion) + ' resize-none'} />
                            </FormField>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors">Cancelar</button>
                                <button type="submit" disabled={submitting} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-grad-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
                                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Crear
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Cambio de Estado Modal (usuario_id from JWT) */}
            {showEstadoModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-6 w-full max-w-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Cambiar Estado</h3>
                            <button onClick={() => setShowEstadoModal(false)} className="p-1 rounded-lg hover:bg-white/10"><X size={18} /></button>
                        </div>
                        <p className="text-sm text-text-muted">
                            Proceso <span className="text-white font-mono">#{estadoTarget?.manufactura_id}</span> — Estado actual: {estadoBadge(estadoTarget?.estado_nombre)}
                        </p>
                        <form onSubmit={estadoForm.handleSubmit(handleChangeEstado)} className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Nuevo Estado</label>
                                {estados.length > 0 ? (
                                    <select {...estadoForm.register('nuevo_estado_id', { required: true })} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-accent-primary transition-all appearance-none text-sm">
                                        <option value="">Seleccionar…</option>
                                        {estados.map(e => (
                                            <option key={e.estado_manufactura_id} value={e.estado_manufactura_id} className="bg-bg-dark">{e.nombre}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input type="number" min="1" {...estadoForm.register('nuevo_estado_id', { required: true })} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-accent-primary transition-all text-sm" />
                                )}
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowEstadoModal(false)} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors">Cancelar</button>
                                <button type="submit" disabled={changingEstado} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-grad-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
                                    {changingEstado ? <Loader2 size={14} className="animate-spin" /> : <ArrowRightLeft size={14} />} Cambiar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Historial Drawer */}
            {showHistorial && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
                    <div className="glass-card p-6 w-full max-w-md space-y-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Clock size={18} className="text-accent-primary" />
                                Historial — Proceso #{historialTarget?.manufactura_id}
                            </h3>
                            <button onClick={() => setShowHistorial(false)} className="p-1 rounded-lg hover:bg-white/10"><X size={18} /></button>
                        </div>
                        {loadingHistorial ? (
                            <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-accent-primary" /></div>
                        ) : historial.length === 0 ? (
                            <p className="text-sm text-text-muted text-center py-6">Sin historial registrado.</p>
                        ) : (
                            <div className="relative ml-2">
                                <div className="absolute left-3 top-0 bottom-0 w-px bg-white/10" />
                                {historial.map((h, idx) => (
                                    <div key={h.historico_estado_manufactura_id} className="relative flex gap-4 pb-5 last:pb-0">
                                        <div className="relative z-10 w-6 h-6 rounded-full border-2 border-accent-primary bg-bg-dark flex-shrink-0 flex items-center justify-center">
                                            <span className="text-[8px] font-bold text-accent-primary">{idx + 1}</span>
                                        </div>
                                        <div className="flex-1 glass-card p-3 space-y-1">
                                            <div className="flex items-center justify-between">
                                                {estadoBadge(h.estado_nombre || String(h.estado_manufactura_id))}
                                                <span className="text-xs text-text-muted">{fmtDate(h.fecha)}</span>
                                            </div>
                                            <p className="text-xs text-text-muted">Usuario ID: {h.usuario_id}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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
    const [estados, setEstados] = useState([]);

    useEffect(() => {
        manufacturingService.getEstados()
            .then(setEstados)
            .catch(() => setEstados([]));
    }, []);

    return (
        <AnimatedPage className="space-y-6">
            {/* Header */}
            <div className="glass-card p-8">
                <div className="flex items-center gap-3 mb-2">
                    <Factory size={28} className="text-accent-primary" />
                    <h1 className="text-3xl font-bold text-gradient">Manufactura</h1>
                </div>
                <p className="text-text-muted">Gestión de órdenes y procesos de manufactura con trazabilidad completa.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items - center gap - 2 px - 5 py - 2.5 rounded - xl text - sm font - medium transition - all ${active
                                    ? 'bg-grad-primary text-white shadow-lg shadow-accent-primary/20'
                                    : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-white'
                                } `}>
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            {activeTab === 'ordenes' && <OrdenesTab estados={estados} />}
            {activeTab === 'procesos' && <ProcesosTab estados={estados} />}
        </AnimatedPage>
    );
};

export default ManufacturingPage;
