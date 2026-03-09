import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, HardDrive, RefreshCcw, X, Check, Tag, MapPin, Loader2, Download as DownloadIcon, History, Settings } from 'lucide-react';
import EquipmentService from '../api/equipmentService';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import RoleGuard from '../components/RoleGuard';
import FileUploader from '../components/FileUploader';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { equipoSchema } from '../validation/schemas';
import FormField from '../components/FormField';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';

const EquipmentsPage = () => {
    const [equipments, setEquipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEquip, setCurrentEquip] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(equipoSchema),
        defaultValues: { codigo: '', nombre: '', tipo_equipo_id: 1, estado_equipo_id: 1, area_id: 1 },
    });

    useEffect(() => {
        fetchEquipments();
    }, []);

    const fetchEquipments = async () => {
        setLoading(true);
        try {
            const data = await EquipmentService.getAll();
            setEquipments(data);
        } catch (error) {
            console.error('Error fetching equipments:', error);
            toast.error('Error al cargar equipos');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async () => {
        try {
            toast.loading('Generando CSV...', { id: 'exportMsg' });
            const response = await api.get('/exports/equipos.csv', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'equipos.csv');
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

    const handleOpenModal = (equip = null) => {
        if (equip) {
            setCurrentEquip(equip);
            reset({
                codigo: equip.codigo,
                nombre: equip.nombre,
                tipo_equipo_id: equip.tipo_equipo_id,
                estado_equipo_id: equip.estado_equipo_id,
                area_id: equip.area_id,
            });
        } else {
            setCurrentEquip(null);
            reset({ codigo: '', nombre: '', tipo_equipo_id: 1, estado_equipo_id: 1, area_id: 1 });
        }
        setIsModalOpen(true);
    };

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            if (currentEquip) {
                await EquipmentService.update(currentEquip.equipo_instrumento_id, data);
                toast.success('Equipo actualizado correctamente');
            } else {
                await EquipmentService.create(data);
                toast.success('Equipo creado correctamente');
            }
            setIsModalOpen(false);
            fetchEquipments();
        } catch (error) {
            toast.error('Error al guardar equipo');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de que desea eliminar este equipo?')) {
            try {
                await EquipmentService.delete(id);
                toast.success('Equipo eliminado');
                fetchEquipments();
            } catch (error) {
                console.error('Error deleting equipment:', error);
                toast.error('Error al eliminar equipo');
            }
        }
    };

    const filteredEquipments = equipments.filter(eq =>
        eq.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AnimatedPage className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-text-main tracking-tight">Equipos e Instrumentos</h1>
                    <p className="text-text-muted font-medium italic">Gestión de activos críticos y control de estado operacional.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleExportCSV} className="rounded-xl border-border-light">
                        <DownloadIcon size={18} className="mr-2 text-primary" />
                        Exportar CSV
                    </Button>
                    <RoleGuard roles={['administrador', 'supervisor']}>
                        <Button data-testid="btn-nuevo-equipo" onClick={() => handleOpenModal()} className="rounded-xl px-6">
                            <Plus size={18} className="mr-2" /> Nuevo Equipo
                        </Button>
                    </RoleGuard>
                </div>
            </div>

            <Card className="bg-white/50 border-none shadow-none">
                <CardContent className="p-0 flex flex-col md:flex-row gap-6 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <Input
                            placeholder="Buscar por código, nombre o marca..."
                            className="pl-12 h-12 bg-white shadow-sm border-border-light"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" onClick={fetchEquipments} disabled={loading} className="h-12 w-12 rounded-xl">
                        <RefreshCcw size={20} className={cn(loading && "animate-spin")} />
                    </Button>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {loading && equipments.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="animate-spin rounded-xl h-12 w-12 border-t-2 border-b-2 border-primary shadow-lg shadow-primary/20"></div>
                        <p className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Cargando Inventario Técnico...</p>
                    </div>
                ) : filteredEquipments.length === 0 ? (
                    <div className="col-span-full py-24 text-center space-y-4 bg-white/50 border-2 border-dashed border-border-light rounded-3xl">
                        <div className="w-20 h-20 rounded-full bg-bg-surface flex items-center justify-center text-text-muted mx-auto">
                            <HardDrive size={40} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-text-main">No se encontraron equipos</h3>
                            <p className="text-sm text-text-muted">Ajuste los criterios de búsqueda o registre un nuevo activo.</p>
                        </div>
                    </div>
                ) : (
                    filteredEquipments.map((eq) => (
                        <Card key={eq.equipo_instrumento_id} className="group hover:border-primary/50 transition-all duration-300">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-bg-surface rounded-xl group-hover:bg-primary/10 transition-colors">
                                        <HardDrive className="text-primary" size={24} />
                                    </div>
                                    <Badge variant={eq.estado_equipo_id === 1 ? "success" : "warning"}>
                                        {eq.estado_equipo_id === 1 ? 'Operativo' : 'Mantenimiento'}
                                    </Badge>
                                </div>
                                <div className="mt-4">
                                    <span className="text-[10px] font-black text-text-muted font-mono uppercase tracking-widest">{eq.codigo}</span>
                                    <CardTitle className="text-lg font-black group-hover:text-primary transition-colors line-clamp-1">{eq.nombre}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="mt-2 space-y-3">
                                    <div className="flex items-center gap-3 text-text-main">
                                        <MapPin size={16} className="text-text-muted" />
                                        <span className="text-sm font-semibold truncate">Ubicación: Planta {eq.area_id}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-text-main">
                                        <Tag size={16} className="text-text-muted" />
                                        <span className="text-sm font-semibold">Tipo: Instrumento</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-border-light pt-4 justify-between gap-4">
                                <div className="flex gap-2">
                                    <RoleGuard roles={['administrador', 'supervisor']}>
                                        <Button variant="outline" size="icon" onClick={() => handleOpenModal(eq)} className="h-9 w-9 border-border-light">
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => handleDelete(eq.equipo_instrumento_id)} className="h-9 w-9 text-error border-error/20 hover:bg-error/5">
                                            <Trash2 size={16} />
                                        </Button>
                                    </RoleGuard>
                                </div>
                                <Button variant="secondary" size="sm" className="h-9 text-[10px] font-black uppercase">
                                    <History size={14} className="mr-2" /> Historial
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-text-main/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
                        <CardHeader className="bg-bg-surface border-b border-border-light pb-6">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-black">{currentEquip ? 'Editar Equipo' : 'Nuevo Registro de Equipo'}</CardTitle>
                                    <CardDescription>Ingrese los datos técnicos del activo en el sistema LIMS.</CardDescription>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-text-muted hover:text-text-main transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                            <CardContent className="pt-8 space-y-6 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="Código SAP/ERP" error={errors.codigo} required>
                                        <Input {...register('codigo')} placeholder="EQ-001" />
                                    </FormField>
                                    <FormField label="Nombre del Equipo" error={errors.nombre} required>
                                        <Input data-testid="equipo-nombre" {...register('nombre')} placeholder="Incubadora" />
                                    </FormField>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField label="Tipo">
                                        <select
                                            {...register('tipo_equipo_id', { valueAsNumber: true })}
                                            className="flex h-11 w-full rounded-xl border border-border-light bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                                        >
                                            <option value={1}>Instrumento</option>
                                            <option value={2}>Equipo Crítico</option>
                                        </select>
                                    </FormField>
                                    <FormField label="Estado">
                                        <select
                                            {...register('estado_equipo_id', { valueAsNumber: true })}
                                            className="flex h-11 w-full rounded-xl border border-border-light bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                                        >
                                            <option value={1}>Activo</option>
                                            <option value={2}>Mantenimiento</option>
                                            <option value={3}>Fuera de Servicio</option>
                                        </select>
                                    </FormField>
                                    <FormField label="Área/Planta">
                                        <select
                                            {...register('area_id', { valueAsNumber: true })}
                                            className="flex h-11 w-full rounded-xl border border-border-light bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                                        >
                                            <option value={1}>Planta Montevideo</option>
                                            <option value={2}>Planta Canelones</option>
                                        </select>
                                    </FormField>
                                </div>

                                {currentEquip && (
                                    <div className="mt-4 pt-6 border-t border-border-light">
                                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Gestión Documental</h4>
                                        <FileUploader
                                            entidadTipo="equipo"
                                            entidadId={currentEquip.equipo_instrumento_id}
                                        />
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="bg-bg-surface border-t border-border-light p-6 justify-end gap-3 flex-shrink-0">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl border-border-light">
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={submitting} className="rounded-xl px-8 shadow-lg shadow-primary/30">
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : (currentEquip ? 'Actualizar' : 'Guardar Equipo')}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </AnimatedPage>
    );
};

export default EquipmentsPage;
