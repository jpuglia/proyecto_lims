import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, HardDrive, RefreshCcw, X, Check, Tag, MapPin, Loader2, Download as DownloadIcon } from 'lucide-react';
import EquipmentService from '../api/equipmentService';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import RoleGuard from '../components/RoleGuard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { equipoSchema } from '../validation/schemas';
import FormField, { inputCls } from '../components/FormField';
import FileUploader from '../components/FileUploader';

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
        <AnimatedPage className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Equipos</h1>
                    <p className="text-secondary font-medium mt-2">Administre el inventario de instrumentación y equipos del laboratorio.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleExportCSV}
                        className="bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 text-slate-700 px-5 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm"
                        title="Exportar a CSV"
                    >
                        <DownloadIcon size={20} className="text-primary" />
                        <span className="hidden sm:inline">Exportar CSV</span>
                    </button>
                    <RoleGuard roles={['administrador', 'supervisor']}>
                        <button
                            data-testid="btn-nuevo-equipo"
                            onClick={() => handleOpenModal()}
                            className="bg-primary hover:bg-primary/90 active:scale-95 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-xl shadow-primary/20"
                        >
                            <Plus size={20} />
                            Nuevo Equipo
                        </button>
                    </RoleGuard>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o código..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={fetchEquipments}
                    className="p-3.5 text-secondary hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                    title="Actualizar lista"
                >
                    <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="animate-spin text-primary" size={48} />
                    <p className="text-secondary font-bold animate-pulse">Cargando equipos...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEquipments.map((eq) => (
                        <div key={eq.equipo_instrumento_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all group overflow-hidden flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-primary/10 transition-colors">
                                        <HardDrive className="text-primary" size={24} />
                                    </div>
                                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        eq.estado_equipo_id === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                        {eq.estado_equipo_id === 1 ? 'Activo' : 'Mantenimiento'}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{eq.nombre}</h3>
                                <p className="text-xs font-black text-secondary mt-1 uppercase tracking-wider">{eq.codigo}</p>
                                
                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <MapPin size={16} className="text-slate-400" />
                                        <span className="text-sm font-semibold truncate">Planta: {eq.area_id}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Tag size={16} className="text-slate-400" />
                                        <span className="text-sm font-semibold">Tipo: Instrumento</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                                <RoleGuard roles={['administrador', 'supervisor']}>
                                    <button
                                        onClick={() => handleOpenModal(eq)}
                                        className="p-2.5 text-secondary hover:text-primary hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200"
                                        title="Editar"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(eq.equipo_instrumento_id)}
                                        className="p-2.5 text-secondary hover:text-red-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </RoleGuard>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal para Crear/Editar */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl relative animate-in fade-in zoom-in duration-300 overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-2xl font-black text-slate-900">
                                {currentEquip ? 'Editar Equipo' : 'Nuevo Equipo'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X size={24} className="text-slate-500" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="Código" error={errors.codigo?.message} required>
                                    <input
                                        {...register('codigo')}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                        placeholder="EQ-001"
                                    />
                                </FormField>
                                <FormField label="Nombre" error={errors.nombre?.message} required>
                                    <input
                                        {...register('nombre')}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                        placeholder="Microscopio Óptico"
                                    />
                                </FormField>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField label="Tipo">
                                    <select
                                        {...register('tipo_equipo_id', { valueAsNumber: true })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none"
                                    >
                                        <option value={1}>Instrumento</option>
                                        <option value={2}>Equipo Crítico</option>
                                    </select>
                                </FormField>
                                <FormField label="Estado">
                                    <select
                                        {...register('estado_equipo_id', { valueAsNumber: true })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none"
                                    >
                                        <option value={1}>Activo</option>
                                        <option value={2}>Mantenimiento</option>
                                        <option value={3}>Fuera de Servicio</option>
                                    </select>
                                </FormField>
                                <FormField label="Área/Planta">
                                    <select
                                        {...register('area_id', { valueAsNumber: true })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none"
                                    >
                                        <option value={1}>Planta Montevideo</option>
                                        <option value={2}>Planta Canelones</option>
                                    </select>
                                </FormField>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 rounded-xl font-bold text-secondary hover:bg-slate-100 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                                    {currentEquip ? 'Actualizar' : 'Guardar Equipo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AnimatedPage>
    );
};

export default EquipmentsPage;
