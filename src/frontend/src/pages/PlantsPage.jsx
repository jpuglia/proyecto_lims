import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Edit2, Trash2, RefreshCcw, X, Check, Tag, Loader2, Layers, Download as DownloadIcon } from 'lucide-react';
import PlantService from '../api/plantService';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import RoleGuard from '../components/RoleGuard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { plantaSchema } from '../validation/schemas';
import FormField, { inputCls } from '../components/FormField';
import FileUploader from '../components/FileUploader';

const PlantsPage = () => {
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPlant, setCurrentPlant] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(plantaSchema),
        defaultValues: { codigo: '', nombre: '', sistema_id: 1, activo: true },
    });
    const activoValue = watch('activo');

    useEffect(() => {
        fetchPlants();
    }, []);

    const fetchPlants = async () => {
        setLoading(true);
        try {
            const data = await PlantService.getAll();
            setPlants(data);
        } catch (error) {
            console.error('Error fetching plants:', error);
            toast.error('Error al cargar plantas');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async () => {
        try {
            toast.loading('Generando CSV...', { id: 'exportMsg' });
            const response = await api.get('/exports/plantas.csv', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'plantas.csv');
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

    const handleOpenModal = (plant = null) => {
        if (plant) {
            setCurrentPlant(plant);
            reset({ codigo: plant.codigo, nombre: plant.nombre, sistema_id: plant.sistema_id, activo: plant.activo });
        } else {
            setCurrentPlant(null);
            reset({ codigo: '', nombre: '', sistema_id: 1, activo: true });
        }
        setIsModalOpen(true);
    };

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            if (currentPlant) {
                await PlantService.update(currentPlant.planta_id, data);
                toast.success('Planta actualizada correctamente');
            } else {
                await PlantService.create(data);
                toast.success('Planta creada correctamente');
            }
            setIsModalOpen(false);
            fetchPlants();
        } catch (error) {
            toast.error('Error al guardar planta');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de que desea eliminar esta planta?')) {
            try {
                await PlantService.delete(id);
                toast.success('Planta eliminada');
                fetchPlants();
            } catch (error) {
                console.error('Error deleting plant:', error);
                toast.error('Error al eliminar planta');
            }
        }
    };

    const filteredPlants = plants.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AnimatedPage className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gradient">Gestión de Plantas</h1>
                    <p className="text-text-muted mt-1">Administre las ubicaciones y plantas físicas del sistema.</p>
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
                            data-testid="btn-nueva-planta"
                            onClick={() => handleOpenModal()}
                            className="bg-grad-primary hover:brightness-110 active:scale-95 text-white px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-accent-primary/20"
                        >
                            <Plus size={20} />
                            Nueva Planta
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
                    onClick={fetchPlants}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                >
                    <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-text-muted">
                        <Loader2 className="animate-spin text-accent-primary mx-auto mb-2" size={32} />
                        <span>Cargando plantas...</span>
                    </div>
                ) : filteredPlants.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-text-muted glass-card">
                        No se encontraron plantas registradas.
                    </div>
                ) : (
                    filteredPlants.map((plant) => (
                        <div key={plant.planta_id} className="glass-card p-6 group hover:border-accent-primary/50 transition-all">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-accent-secondary/10 text-accent-secondary group-hover:bg-accent-secondary/20 transition-all">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{plant.nombre}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-mono text-text-muted uppercase tracking-wider">{plant.codigo}</span>
                                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                            <span className="text-[10px] text-text-muted uppercase">Sistema ID: {plant.sistema_id}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <RoleGuard roles={['administrador', 'supervisor']}>
                                        <button
                                            onClick={() => handleOpenModal(plant)}
                                            className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </RoleGuard>
                                    <RoleGuard roles={['administrador']}>
                                        <button
                                            onClick={() => handleDelete(plant.planta_id)}
                                            className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </RoleGuard>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                                <span className={`text-[10px] uppercase tracking-widest font-bold ${plant.activo ? 'text-success' : 'text-error'}`}>
                                    {plant.activo ? 'Activa' : 'Inactiva'}
                                </span>
                                <button className="text-xs font-semibold text-accent-primary hover:underline">Ver detalles</button>
                            </div>
                        </div>
                    ))
                )}
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
                            {currentPlant ? 'Editar Planta' : 'Nueva Planta'}
                        </h2>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <FormField label="Código" error={errors.codigo}>
                                <input type="text" placeholder="Ej: PLT-01" {...register('codigo')} className={inputCls(errors.codigo)} />
                            </FormField>

                            <FormField label="Nombre" error={errors.nombre}>
                                <input data-testid="planta-nombre" type="text" placeholder="Ej: Planta Principal" {...register('nombre')} className={inputCls(errors.nombre)} />
                            </FormField>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Sistema ID" error={errors.sistema_id}>
                                    <input type="number" {...register('sistema_id')} className={inputCls(errors.sistema_id)} />
                                </FormField>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">Estado</label>
                                    <div className="flex items-center gap-4 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setValue('activo', !activoValue)}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${activoValue ? 'bg-success' : 'bg-white/10'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${activoValue ? 'left-7' : 'left-1'}`}></div>
                                        </button>
                                        <span className="text-sm text-text-muted">{activoValue ? 'Activa' : 'Inactiva'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all">
                                    Cancelar
                                </button>
                                <button data-testid="planta-submit" type="submit" disabled={submitting}
                                    className="flex-1 py-3 px-4 rounded-xl bg-grad-primary text-white font-semibold shadow-lg shadow-accent-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                    {currentPlant ? 'Guardar Cambios' : 'Crear Planta'}
                                </button>
                            </div>
                        </form>

                        {/* Area de Subida de Documentos (solo si estamos editando una existente) */}
                        {currentPlant && (
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <FileUploader
                                    entidadTipo="planta"
                                    entidadId={currentPlant.planta_id}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AnimatedPage>
    );
};

export default PlantsPage;
