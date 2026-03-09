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
import FormField from '../components/FormField';
import FileUploader from '../components/FileUploader';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';

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
            const link = document.body.appendChild(document.createElement('a'));
            link.href = url;
            link.setAttribute('download', 'plantas.csv');
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
        <AnimatedPage className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-text-main tracking-tight">Gestión de Plantas</h1>
                    <p className="text-text-muted font-medium italic">Administre las ubicaciones y plantas físicas del ecosistema productivo.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={handleExportCSV} className="rounded-xl border-border-light">
                        <DownloadIcon size={18} className="mr-2 text-primary" />
                        Exportar CSV
                    </Button>
                    <RoleGuard roles={['administrador', 'supervisor']}>
                        <Button data-testid="btn-nueva-planta" onClick={() => handleOpenModal()} className="rounded-xl px-6 shadow-xl shadow-primary/20">
                            <Plus size={18} className="mr-2" /> Nueva Planta
                        </Button>
                    </RoleGuard>
                </div>
            </div>

            <Card className="bg-white/50 border-none shadow-none">
                <CardContent className="p-0 flex flex-col md:flex-row gap-6 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <Input
                            placeholder="Buscar por nombre o código..."
                            className="pl-12 h-12 bg-white shadow-sm border-border-light"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" onClick={fetchPlants} disabled={loading} className="h-12 w-12 rounded-xl">
                        <RefreshCcw size={20} className={cn(loading && "animate-spin")} />
                    </Button>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {loading && plants.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="animate-spin rounded-xl h-12 w-12 border-t-2 border-b-2 border-primary shadow-lg shadow-primary/20"></div>
                        <p className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Cargando Arquitectura de Planta...</p>
                    </div>
                ) : filteredPlants.length === 0 ? (
                    <div className="col-span-full py-24 text-center space-y-4 bg-white/50 border-2 border-dashed border-border-light rounded-3xl">
                        <div className="w-20 h-20 rounded-full bg-bg-surface flex items-center justify-center text-text-muted mx-auto">
                            <Layers size={40} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-text-main">No se encontraron plantas</h3>
                            <p className="text-sm text-text-muted">Ajuste los criterios de búsqueda o registre un nuevo centro operativo.</p>
                        </div>
                    </div>
                ) : (
                    filteredPlants.map((plant) => (
                        <Card key={plant.planta_id} className="group hover:border-primary/50 transition-all duration-300">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-bg-surface text-primary group-hover:bg-primary/10 transition-all">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-text-main group-hover:text-primary transition-colors">{plant.nombre}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-mono text-text-muted uppercase tracking-widest font-bold">#{plant.codigo}</span>
                                                <span className="w-1 h-1 rounded-full bg-border-light"></span>
                                                <span className="text-[10px] text-text-muted font-black uppercase">Sistema ID: {plant.sistema_id}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <RoleGuard roles={['administrador', 'supervisor']}>
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(plant)} className="h-8 w-8 text-text-muted hover:text-primary">
                                                <Edit2 size={16} />
                                            </Button>
                                        </RoleGuard>
                                        <RoleGuard roles={['administrador']}>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(plant.planta_id)} className="h-8 w-8 text-text-muted hover:text-error">
                                                <Trash2 size={16} />
                                            </Button>
                                        </RoleGuard>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardFooter className="mt-2 pt-6 border-t border-border-light flex items-center justify-between">
                                <Badge variant={plant.activo ? "success" : "destructive"}>
                                    {plant.activo ? 'Operativa' : 'Inactiva'}
                                </Badge>
                                <Button variant="link" size="sm" className="text-[10px] font-black uppercase tracking-widest h-auto p-0">
                                    Ver Áreas Relacionadas
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-text-main/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
                        <CardHeader className="bg-bg-surface border-b border-border-light pb-6">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-black">{currentPlant ? 'Editar Planta' : 'Nuevo Registro de Planta'}</CardTitle>
                                    <CardDescription>Configure las propiedades físicas del centro operativo en el LIMS.</CardDescription>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-text-muted hover:text-text-main transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                        </CardHeader>
                        
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                            <CardContent className="pt-8 space-y-6 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="Código" error={errors.codigo} required>
                                        <Input data-testid="planta-codigo" {...register('codigo')} placeholder="PLT-01" />
                                    </FormField>
                                    <FormField label="Nombre" error={errors.nombre} required>
                                        <Input data-testid="planta-nombre" {...register('nombre')} placeholder="Planta Principal" />
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <FormField label="ID de Sistema" error={errors.sistema_id} required>
                                        <Input type="number" {...register('sistema_id', { valueAsNumber: true })} />
                                    </FormField>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Estado Operativo</label>
                                        <div className="p-3.5 rounded-xl bg-bg-surface border border-border-light flex items-center justify-between">
                                            <span className="text-xs font-bold text-text-main">{activoValue ? 'Activa' : 'Inactiva'}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" {...register('activo')} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-border-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-light after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {currentPlant && (
                                    <div className="mt-4 pt-6 border-t border-border-light">
                                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Gestión Documental</h4>
                                        <FileUploader
                                            entidadTipo="planta"
                                            entidadId={currentPlant.planta_id}
                                        />
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter className="bg-bg-surface border-t border-border-light p-6 justify-end gap-3 flex-shrink-0">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl border-border-light">
                                    Cancelar
                                </Button>
                                <Button data-testid="planta-submit" type="submit" disabled={submitting} className="rounded-xl px-8 shadow-lg shadow-primary/30">
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : (currentPlant ? 'Actualizar' : 'Guardar Planta')}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </AnimatedPage>
    );
};

export default PlantsPage;
