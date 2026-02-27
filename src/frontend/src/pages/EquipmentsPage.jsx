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
        <AnimatedPage className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gradient">Gestión de Equipos</h1>
                    <p className="text-text-muted mt-1">Administre el inventario de instrumentación y equipos del laboratorio.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 text-white px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2"
                        title="Exportar a CSV"
                    >
                        <DownloadIcon size={20} />
                        <span className="hidden sm:inline">Exportar CSV</span>
                    </button>
                    <RoleGuard roles={['administrador', 'supervisor']}>
                        <button
                            data-testid="btn-nuevo-equipo"
                            onClick={() => handleOpenModal()}
                            className="bg-grad-primary hover:brightness-110 active:scale-95 text-white px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-accent-primary/20"
                        >
                            <Plus size={20} />
                            Nuevo Equipo
                        </button>
                    </RoleGuard>
                </div>
            </div>

            <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-white focus:outline-none focus:border-accent-primary transition-all"
                    />
                </div>
                <button
                    onClick={fetchEquipments}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                >
                    <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Equipo</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Código</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Estado ID</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Área ID</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center">
                                    <Loader2 className="animate-spin text-accent-primary mx-auto" size={32} />
                                </td>
                            </tr>
                        ) : filteredEquipments.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-text-muted">
                                    No se encontraron equipos registrados.
                                </td>
                            </tr>
                        ) : (
                            filteredEquipments.map((item) => (
                                <tr key={item.equipo_instrumento_id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary">
                                                <HardDrive size={18} />
                                            </div>
                                            <span className="font-medium text-white">{item.nombre}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-muted font-mono">{item.codigo}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/5 text-text-muted border border-white/10">
                                            ID: {item.estado_equipo_id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-muted">ID: {item.area_id}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <RoleGuard roles={['administrador', 'supervisor']}>
                                            <button
                                                onClick={() => handleOpenModal(item)}
                                                className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-all"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </RoleGuard>
                                        <RoleGuard roles={['administrador']}>
                                            <button
                                                onClick={() => handleDelete(item.equipo_instrumento_id)}
                                                className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </RoleGuard>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-lg p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 text-text-muted hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold text-gradient mb-6">
                            {currentEquip ? 'Editar Equipo' : 'Nuevo Equipo'}
                        </h2>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Código" error={errors.codigo}>
                                    <input
                                        type="text"
                                        placeholder="Ej: EQU-001"
                                        {...register('codigo')}
                                        className={inputCls(errors.codigo)}
                                    />
                                </FormField>
                                <FormField label="Nombre" error={errors.nombre}>
                                    <input
                                        data-testid="equipo-nombre"
                                        type="text"
                                        placeholder="Ej: Incubadora"
                                        {...register('nombre')}
                                        className={inputCls(errors.nombre)}
                                    />
                                </FormField>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Área ID" error={errors.area_id}>
                                    <input
                                        type="number"
                                        {...register('area_id')}
                                        className={inputCls(errors.area_id)}
                                    />
                                </FormField>
                                <FormField label="Tipo ID" error={errors.tipo_equipo_id}>
                                    <input
                                        type="number"
                                        {...register('tipo_equipo_id')}
                                        className={inputCls(errors.tipo_equipo_id)}
                                    />
                                </FormField>
                            </div>

                            <FormField label="Estado ID" error={errors.estado_equipo_id}>
                                <input
                                    type="number"
                                    {...register('estado_equipo_id')}
                                    className={inputCls(errors.estado_equipo_id)}
                                />
                            </FormField>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    data-testid="equipo-submit"
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 px-4 rounded-xl bg-grad-primary text-white font-semibold shadow-lg shadow-accent-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                    {currentEquip ? 'Guardar Cambios' : 'Crear Equipo'}
                                </button>
                            </div>
                        </form>

                        {/* Area de Subida de Documentos (solo si estamos editando uno existente) */}
                        {currentEquip && (
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <FileUploader
                                    entidadTipo="equipo"
                                    entidadId={currentEquip.equipo_instrumento_id}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AnimatedPage>
    );
};

export default EquipmentsPage;
