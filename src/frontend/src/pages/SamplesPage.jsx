import React, { useState, useEffect } from 'react';
import { Plus, Search, RefreshCcw, FlaskConical, Calendar, Tag, FileText, X, Check, Edit2, Loader2, Play, Package, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SampleService from '../api/sampleService';
import EquipmentService from '../api/equipmentService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import RoleGuard from '../components/RoleGuard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { solicitudMuestreoSchema, solicitudMuestreoEditSchema } from '../validation/schemas';
import FormField, { inputCls } from '../components/FormField';
import WorkflowStepper from '../components/WorkflowStepper';

const SamplesPage = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSamplingModalOpen, setIsSamplingModalOpen] = useState(false);
    const [currentSolicitud, setCurrentSolicitud] = useState(null);
    const [equipments, setEquipments] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const createForm = useForm({
        resolver: zodResolver(solicitudMuestreoSchema),
        defaultValues: { tipo: 'Ambiental', equipo_instrumento_id: '', observacion: '', estado_solicitud_id: 1 },
    });
    const editForm = useForm({
        resolver: zodResolver(solicitudMuestreoEditSchema),
        defaultValues: { observacion: '' },
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [samplesData, eqData] = await Promise.all([
                SampleService.getAllSolicitudes(),
                EquipmentService.getAll()
            ]);
            setSolicitudes(samplesData);
            setEquipments(eqData);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSolicitud = async (data) => {
        setSubmitting(true);
        try {
            const payload = {
                ...data, usuario_id: user?.sub ? Number(user.sub) : 1,
                equipo_instrumento_id: data.equipo_instrumento_id ? Number(data.equipo_instrumento_id) : null
            };
            await SampleService.createSolicitud(payload);
            setIsModalOpen(false);
            toast.success('Solicitud creada');
            fetchData();
            createForm.reset();
        } catch (error) {
            toast.error('Error al crear solicitud');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (item) => {
        setCurrentSolicitud(item);
        editForm.reset({ observacion: item.observacion || '' });
        setIsEditModalOpen(true);
    };

    const handleUpdateSolicitud = async (data) => {
        setSubmitting(true);
        try {
            await SampleService.updateSolicitud(currentSolicitud.solicitud_muestreo_id, data);
            setIsEditModalOpen(false);
            toast.success('Solicitud actualizada');
            fetchData();
        } catch (error) {
            toast.error('Error al actualizar solicitud');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSamplingClick = (item) => {
        setCurrentSolicitud(item);
        setIsSamplingModalOpen(true);
    };

    const handleExecuteSampling = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData(e.target);
            const payload = {
                session: {
                    solicitud_muestreo_id: currentSolicitud.solicitud_muestreo_id,
                    operario_id: Number(formData.get('operario_id')),
                    fecha_inicio: new Date().toISOString()
                },
                muestras: [
                    {
                        tipo_muestra: currentSolicitud.tipo,
                        codigo_etiqueta: formData.get('codigo_etiqueta'),
                        observacion: formData.get('muestra_obs'),
                        equipo_instrumento_id: currentSolicitud.equipo_instrumento_id
                    }
                ]
            };
            await SampleService.createSession(payload);
            toast.success('Sesión de muestreo registrada');
            setIsSamplingModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Error al registrar muestreo');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredSolicitudes = solicitudes.filter(s =>
        s.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.observacion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (statusId) => {
        const statuses = {
            1: { label: 'Pendiente', class: 'bg-accent-secondary/10 text-accent-secondary' },
            2: { label: 'En Proceso', class: 'bg-accent-primary/10 text-accent-primary' },
            3: { label: 'Completado', class: 'bg-success/10 text-success' },
            4: { label: 'Cancelado', class: 'bg-error/10 text-error' }
        };
        const status = statuses[statusId] || { label: 'Desconocido', class: 'bg-white/5 text-text-muted' };
        return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.class}`}>{status.label}</span>;
    };

    return (
        <AnimatedPage className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gradient">Muestreo y Solicitudes</h1>
                    <p className="text-text-muted mt-1">Gestione el flujo desde la solicitud hasta la toma de muestras.</p>
                </div>
                <RoleGuard roles={['administrador', 'supervisor', 'analista', 'operador']}>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-grad-primary hover:brightness-110 active:scale-95 text-white px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-accent-primary/20"
                    >
                        <Plus size={20} />
                        Nueva Solicitud
                    </button>
                </RoleGuard>
            </div>

            <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por tipo o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-white focus:outline-none focus:border-accent-primary transition-all"
                    />
                </div>
                <button
                    onClick={fetchData}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                >
                    <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Flujo</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center">
                                    <RefreshCcw className="animate-spin text-accent-primary mx-auto" size={32} />
                                </td>
                            </tr>
                        ) : filteredSolicitudes.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-text-muted">
                                    No se encontraron solicitudes.
                                </td>
                            </tr>
                        ) : (
                            filteredSolicitudes.map((item) => (
                                <tr key={item.solicitud_muestreo_id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-xs text-text-muted">#{item.solicitud_muestreo_id}</td>
                                    <td className="px-6 py-4 min-w-[200px]">
                                        <WorkflowStepper currentStep={item.estado_solicitud_id === 3 ? 3 : 1} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary">
                                                <FlaskConical size={16} />
                                            </div>
                                            <span className="font-medium text-white">{item.tipo}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(item.estado_solicitud_id)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {item.estado_solicitud_id === 3 && (
                                                <button
                                                    onClick={() => navigate(`/report/${item.solicitud_muestreo_id}`)}
                                                    className="p-2 rounded-lg bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 transition-all flex items-center gap-1 text-xs font-bold"
                                                    title="Ver Informe"
                                                >
                                                    <Eye size={14} /> Informe
                                                </button>
                                            )}
                                            {item.estado_solicitud_id === 1 && (
                                                <button
                                                    onClick={() => handleSamplingClick(item)}
                                                    className="p-2 rounded-lg bg-success/20 text-success hover:bg-success/30 transition-all flex items-center gap-1 text-xs font-bold"
                                                    title="Ejecutar Muestreo"
                                                >
                                                    <Play size={14} /> Muestrear
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEditClick(item)}
                                                className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-all"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Nueva Solicitud */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-lg p-8 shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-text-muted hover:text-white"><X size={24} /></button>
                        <h2 className="text-2xl font-bold text-gradient mb-6">Nueva Solicitud</h2>
                        <form onSubmit={createForm.handleSubmit(handleCreateSolicitud)} className="space-y-4">
                            <FormField label="Tipo de Muestreo" error={createForm.formState.errors.tipo}>
                                <select {...createForm.register('tipo')} className={inputCls(createForm.formState.errors.tipo) + ' appearance-none'}>
                                    {['Ambiental', 'Producto', 'Proceso', 'Personal', 'Agua'].map(t => (
                                        <option key={t} className="bg-bg-dark" value={t}>{t}</option>
                                    ))}
                                </select>
                            </FormField>
                            <FormField label="Equipo / Instrumento (Opcional)" error={createForm.formState.errors.equipo_instrumento_id}>
                                <select {...createForm.register('equipo_instrumento_id')} className={inputCls(createForm.formState.errors.equipo_instrumento_id) + ' appearance-none'}>
                                    <option className="bg-bg-dark" value="">Ninguno</option>
                                    {equipments.map(eq => (
                                        <option key={eq.equipo_instrumento_id} className="bg-bg-dark" value={eq.equipo_instrumento_id}>{eq.nombre} ({eq.codigo})</option>
                                    ))}
                                </select>
                            </FormField>
                            <FormField label="Observaciones" error={createForm.formState.errors.observacion}>
                                <textarea {...createForm.register('observacion')} rows="3" className={inputCls(createForm.formState.errors.observacion) + ' resize-none'} />
                            </FormField>
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white font-semibold">Cancelar</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-3 px-4 rounded-xl bg-grad-primary text-white font-semibold">
                                    {submitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Crear Solicitud'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Ejecutar Muestreo (Step 2) */}
            {isSamplingModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-lg p-8 shadow-2xl relative">
                        <button onClick={() => setIsSamplingModalOpen(false)} className="absolute top-6 right-6 text-text-muted hover:text-white"><X size={24} /></button>
                        <h2 className="text-2xl font-bold text-gradient mb-2">Ejecutar Muestreo</h2>
                        <p className="text-sm text-text-muted mb-6">Materializando solicitud <span className="text-white font-mono">#{currentSolicitud?.solicitud_muestreo_id}</span> ({currentSolicitud?.tipo})</p>
                        <form onSubmit={handleExecuteSampling} className="space-y-4">
                            <FormField label="Operario Responsable (ID)">
                                <input type="number" name="operario_id" required defaultValue="1" className={inputCls()} />
                            </FormField>
                            <FormField label="Código de Etiqueta (Muestra)">
                                <input type="text" name="codigo_etiqueta" required placeholder="Ej: LOTE-AG-001" className={inputCls()} />
                            </FormField>
                            <FormField label="Observaciones de Toma">
                                <textarea name="muestra_obs" rows="2" className={inputCls() + ' resize-none'} />
                            </FormField>
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setIsSamplingModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white font-semibold">Cancelar</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-3 px-4 rounded-xl bg-success text-white font-semibold">
                                    {submitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Registrar Muestras'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Editar */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-lg p-8 shadow-2xl relative">
                        <button onClick={() => setIsEditModalOpen(false)} className="absolute top-6 right-6 text-text-muted hover:text-white"><X size={24} /></button>
                        <h2 className="text-2xl font-bold text-gradient mb-2">Editar Observación</h2>
                        <form onSubmit={editForm.handleSubmit(handleUpdateSolicitud)} className="space-y-4">
                            <FormField label="Observaciones" error={editForm.formState.errors.observacion}>
                                <textarea {...editForm.register('observacion')} rows="4" className={inputCls(editForm.formState.errors.observacion) + ' resize-none'} />
                            </FormField>
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white font-semibold">Cancelar</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-3 px-4 rounded-xl bg-grad-primary text-white font-semibold">
                                    {submitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Actualizar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AnimatedPage>
    );
};

export default SamplesPage;
