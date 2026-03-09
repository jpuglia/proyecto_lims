import React, { useState, useEffect } from 'react';
import { Plus, Search, RefreshCcw, FlaskConical, Calendar, Tag, FileText, X, Check, Edit2, Loader2, Play, Package, Eye, ArrowRight, MapPin, Droplets, Wind, Thermometer, Beaker } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SampleService from '../api/sampleService';
import EquipmentService from '../api/equipmentService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import RoleGuard from '../components/RoleGuard';
import FileUploader from '../components/FileUploader';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { solicitudMuestreoEditSchema } from '../validation/schemas';
import FormField from '../components/FormField';
import InspectorSamplingForm from '../components/Inspector/InspectorSamplingForm';
import WorkflowStepper from '../components/WorkflowStepper';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';

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

    const filteredSolicitudes = solicitudes.filter(s => {
        const term = searchTerm.toLowerCase();
        return (
            s.tipo?.toLowerCase().includes(term) ||
            s.destino?.toLowerCase().includes(term) ||
            s.lote_number?.toLowerCase().includes(term) ||
            s.region_swabbed?.toLowerCase().includes(term) ||
            s.punto_muestreo?.nombre?.toLowerCase().includes(term) ||
            s.observacion?.toLowerCase().includes(term)
        );
    });

    const getDetalleIcon = (tipo) => {
        const map = { 'Agua': Droplets, 'HVAC': Wind, 'Nitrógeno': Wind, 'Aire Comprimido': Wind, 'Hisopado': Beaker, 'Producto': Package, 'Materia Prima': Package };
        return map[tipo] || FlaskConical;
    };

    const renderDetalleMuestral = (item) => {
        if (item.punto_muestreo) {
            return (
                <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-primary flex-shrink-0" />
                    <div>
                        <p className="font-bold text-text-main text-xs">{item.punto_muestreo.codigo}</p>
                        <p className="text-[10px] text-text-muted truncate max-w-[160px]">{item.punto_muestreo.nombre}</p>
                    </div>
                </div>
            );
        }
        if (item.lote_number) {
            return (
                <div className="flex items-center gap-2">
                    <Package size={14} className="text-secondary flex-shrink-0" />
                    <span className="font-mono font-bold text-xs text-text-main">{item.lote_number}</span>
                </div>
            );
        }
        if (item.region_swabbed) {
            const eqName = item.equipo_instrumento_id ? equipments.find(e => e.equipo_instrumento_id === item.equipo_instrumento_id)?.nombre : null;
            return (
                <div className="text-xs">
                    {eqName && <p className="font-bold text-text-main">{eqName}</p>}
                    <p className="text-text-muted italic">🧪 {item.region_swabbed}</p>
                </div>
            );
        }
        return <span className="text-text-muted text-xs italic">—</span>;
    };

    const getStatusBadge = (statusId) => {
        const statuses = {
            1: { label: 'Pendiente', variant: 'secondary' },
            2: { label: 'En Proceso', variant: 'default' },
            3: { label: 'Completado', variant: 'success' },
            4: { label: 'Cancelado', variant: 'destructive' }
        };
        const status = statuses[statusId] || { label: 'Desconocido', variant: 'outline' };
        return <Badge variant={status.variant}>{status.label}</Badge>;
    };

    const getDestinoBadge = (destino) => {
        if (!destino) return null;
        const map = {
            'Microbiología': 'bg-purple-100 text-purple-700',
            'Fisicoquímico': 'bg-blue-100 text-blue-700',
            'Retén': 'bg-amber-100 text-amber-700'
        };
        return <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter', map[destino] || 'bg-gray-100 text-gray-600')}>{destino}</span>;
    };

    return (
        <AnimatedPage className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-text-main tracking-tight">Muestreo y Solicitudes</h1>
                    <p className="text-text-muted font-medium italic">Trazabilidad desde el requerimiento inicial hasta la toma física de muestra.</p>
                </div>
                <RoleGuard roles={['administrador', 'supervisor']}>
                    <Button onClick={() => setIsModalOpen(true)} className="rounded-xl px-6 shadow-xl shadow-primary/20">
                        <Plus size={18} className="mr-2" /> Nueva Solicitud
                    </Button>
                </RoleGuard>
            </div>

            <Card className="bg-white/50 border-none shadow-none">
                <CardContent className="p-0 flex flex-col md:flex-row gap-6 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <Input
                            placeholder="Buscar por tipo o descripción..."
                            className="pl-12 h-12 bg-white shadow-sm border-border-light"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" onClick={fetchData} disabled={loading} className="h-12 w-12 rounded-xl">
                        <RefreshCcw size={20} className={cn(loading && "animate-spin")} />
                    </Button>
                </CardContent>
            </Card>

            <Card className="overflow-hidden border-none shadow-premium bg-white/80 backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-bg-surface/50 border-b border-border-light">
                                <th className="px-5 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">ID</th>
                                <th className="px-5 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Flujo</th>
                                <th className="px-5 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Destino</th>
                                <th className="px-5 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Tipo Muestra</th>
                                <th className="px-5 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Detalle Muestral</th>
                                <th className="px-5 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Estado</th>
                                <th className="px-5 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light">
                            {loading && solicitudes.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-20 text-center">
                                        <div className="animate-spin rounded-xl h-10 w-10 border-t-2 border-b-2 border-primary mx-auto shadow-lg"></div>
                                    </td>
                                </tr>
                            ) : filteredSolicitudes.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-20 text-center">
                                        <p className="text-sm font-bold text-text-muted italic">No se encontraron solicitudes vigentes.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredSolicitudes.map((item) => (
                                    <tr key={item.solicitud_muestreo_id} className="hover:bg-bg-surface/40 transition-colors group">
                                        <td className="px-5 py-4 font-mono text-xs text-text-muted font-bold">#{item.solicitud_muestreo_id}</td>
                                        <td className="px-5 py-4 min-w-[180px]">
                                            <WorkflowStepper currentStep={item.estado_solicitud_id === 3 ? 3 : 1} />
                                        </td>
                                        <td className="px-5 py-4">
                                            {getDestinoBadge(item.destino)}
                                        </td>
                                        <td className="px-5 py-4">
                                            {(() => {
                                                const Icon = getDetalleIcon(item.tipo);
                                                return (
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                                            <Icon size={14} />
                                                        </div>
                                                        <span className="font-bold text-text-main text-xs">{item.tipo}</span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-5 py-4">
                                            {renderDetalleMuestral(item)}
                                        </td>
                                        <td className="px-5 py-4">
                                            {getStatusBadge(item.estado_solicitud_id)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {item.estado_solicitud_id === 3 && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`/samples/${item.solicitud_muestreo_id}`)}
                                                        className="h-9 text-[10px] font-black uppercase border-primary/20 text-primary hover:bg-primary/5"
                                                    >
                                                        <Eye size={14} className="mr-1.5" /> Expediente
                                                    </Button>
                                                )}
                                                {item.estado_solicitud_id === 1 && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleSamplingClick(item)}
                                                        className="h-9 text-[10px] font-black uppercase bg-success hover:bg-success/90"
                                                    >
                                                        <Play size={14} className="mr-1.5" /> Muestrear
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditClick(item)}
                                                    className="h-9 w-9 text-text-muted hover:text-text-main"
                                                >
                                                    <Edit2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal Nueva Solicitud */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-text-main/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <InspectorSamplingForm
                            mode="solicitud"
                            onCancel={() => setIsModalOpen(false)}
                            onSuccess={() => { setIsModalOpen(false); fetchData(); }}
                        />
                    </div>
                </div>
            )}

            {/* Modal Ejecutar Muestreo (Step 2) */}
            {isSamplingModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-text-main/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
                        <CardHeader className="p-8 border-b border-border-light flex items-center justify-between flex-shrink-0 bg-bg-surface/50">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-black">Ejecutar Muestreo</CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <Package size={14} className="text-primary" />
                                    Solicitud <span className="font-mono font-black">#{currentSolicitud?.solicitud_muestreo_id}</span>
                                </CardDescription>
                            </div>
                            <button onClick={() => setIsSamplingModalOpen(false)} className="text-text-muted hover:text-text-main transition-colors"><X size={24} /></button>
                        </CardHeader>

                        <form onSubmit={handleExecuteSampling} className="flex flex-col flex-1 overflow-hidden">
                            <CardContent className="p-8 space-y-6 overflow-y-auto">
                                <FormField label="ID Operario Responsable">
                                    <Input type="number" name="operario_id" required defaultValue="1" />
                                </FormField>
                                <FormField label="Código de Etiqueta / Lote">
                                    <Input data-testid="input-codigo-etiqueta" type="text" name="codigo_etiqueta" required placeholder="Ej: LOTE-AG-001" />
                                </FormField>
                                <FormField label="Observaciones de Campo">
                                    <textarea data-testid="textarea-muestra-obs" name="muestra_obs" rows="2" className="w-full rounded-xl border border-border-light p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Condiciones ambientales, anomalías..." />
                                </FormField>
                            </CardContent>

                            <CardFooter className="p-8 border-t border-border-light flex gap-4 bg-bg-surface/30 flex-shrink-0">
                                <Button type="button" variant="outline" onClick={() => setIsSamplingModalOpen(false)} className="flex-1 rounded-xl">Cancelar</Button>
                                <Button data-testid="btn-registrar-muestras" type="submit" disabled={submitting} className="flex-1 rounded-xl bg-success hover:bg-success/90 shadow-lg shadow-success/20">
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Registrar Muestras'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}

            {/* Modal Editar */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-text-main/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-lg shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-hidden">
                        <CardHeader className="p-8 border-b border-border-light flex items-center justify-between bg-bg-surface/50 flex-shrink-0">
                            <CardTitle className="text-2xl font-black">Expediente de Solicitud</CardTitle>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-text-muted hover:text-text-main transition-colors"><X size={24} /></button>
                        </CardHeader>

                        <form onSubmit={editForm.handleSubmit(handleUpdateSolicitud)} className="flex flex-col flex-1 overflow-hidden">
                            <CardContent className="p-8 space-y-6 overflow-y-auto">
                                <FormField label="Nuevas Notas de la Solicitud" error={editForm.formState.errors.observacion}>
                                    <textarea {...editForm.register('observacion')} rows="4" className="w-full rounded-xl border border-border-light p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                                </FormField>

                                {currentSolicitud && (
                                    <div className="mt-4 pt-6 border-t border-border-light">
                                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Gestión Documental</h4>
                                        <FileUploader
                                            entidadTipo="solicitud_muestreo"
                                            entidadId={currentSolicitud.solicitud_muestreo_id}
                                        />
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter className="p-8 border-t border-border-light flex gap-4 bg-bg-surface/30 flex-shrink-0">
                                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">Cancelar</Button>
                                <Button type="submit" disabled={submitting} className="flex-1 shadow-lg shadow-primary/20">
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Actualizar'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </AnimatedPage>
    );
};

export default SamplesPage;
