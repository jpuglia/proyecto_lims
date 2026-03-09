import React, { useState, useEffect } from 'react';
import { Plus, Search, ClipboardList, Edit2, Trash2, RefreshCcw, X, Check, Tag, Loader2, Layers } from 'lucide-react';
import { masterService } from '../api/masterService';
import { toast } from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import RoleGuard from '../components/RoleGuard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tipoSolicitudMuestreoSchema } from '../validation/schemas';
import FormField from '../components/FormField';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';

const TiposSolicitudPage = () => {
    const [tipos, setTipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTipo, setCurrentTipo] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(tipoSolicitudMuestreoSchema),
        defaultValues: { codigo: '', descripcion: '', categoria: '', activo: true },
    });
    const activoValue = watch('activo');

    useEffect(() => {
        fetchTipos();
    }, []);

    const fetchTipos = async () => {
        setLoading(true);
        try {
            const data = await masterService.getTiposSolicitud();
            setTipos(data);
        } catch (error) {
            console.error('Error fetching tipos solicitud:', error);
            toast.error('Error al cargar tipos de solicitud');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (tipo = null) => {
        if (tipo) {
            setCurrentTipo(tipo);
            reset({ 
                codigo: tipo.codigo, 
                descripcion: tipo.descripcion, 
                categoria: tipo.categoria || '', 
                activo: tipo.activo 
            });
        } else {
            setCurrentTipo(null);
            reset({ codigo: '', descripcion: '', categoria: '', activo: true });
        }
        setIsModalOpen(true);
    };

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            if (currentTipo) {
                await masterService.updateTipoSolicitud(currentTipo.tipo_solicitud_id, data);
                toast.success('Tipo de solicitud actualizado');
            } else {
                await masterService.createTipoSolicitud(data);
                toast.success('Tipo de solicitud creado');
            }
            setIsModalOpen(false);
            fetchTipos();
        } catch (error) {
            toast.error('Error al guardar tipo de solicitud');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredTipos = tipos.filter(t => 
        t.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.categoria && t.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <ClipboardList className="h-8 w-8 text-blue-400" />
                            Catálogo de Tipos de Solicitud
                        </h1>
                        <p className="text-slate-400 mt-1">Gestión paramétrica de tipos de muestreo de calidad</p>
                    </div>

                    <RoleGuard roles={['administrador', 'supervisor']}>
                        <Button 
                            onClick={() => handleOpenModal()}
                            className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Nuevo Tipo
                        </Button>
                    </RoleGuard>
                </div>

                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por código, descripción o categoría..."
                                className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                                <p className="text-slate-400 animate-pulse">Cargando catálogo...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-700/50 text-slate-400 text-sm">
                                            <th className="px-4 py-3 font-medium">Código</th>
                                            <th className="px-4 py-3 font-medium">Descripción</th>
                                            <th className="px-4 py-3 font-medium">Categoría</th>
                                            <th className="px-4 py-3 font-medium text-center">Estado</th>
                                            <th className="px-4 py-3 font-medium text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30">
                                        {filteredTipos.length > 0 ? (
                                            filteredTipos.map((tipo) => (
                                                <tr key={tipo.tipo_solicitud_id} className="hover:bg-slate-700/20 transition-colors group">
                                                    <td className="px-4 py-4">
                                                        <div className="font-mono text-sm text-blue-300 bg-blue-900/20 px-2 py-1 rounded inline-block">
                                                            {tipo.codigo}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-white font-medium">
                                                        {tipo.descripcion}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {tipo.categoria ? (
                                                            <Badge variant="outline" className="border-slate-600 text-slate-300">
                                                                {tipo.categoria}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-slate-500 text-xs italic">Sin categoría</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        {tipo.activo ? (
                                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                                                Activo
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-slate-700 text-slate-400 border-slate-600">
                                                                Inactivo
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <RoleGuard roles={['administrador', 'supervisor']}>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10"
                                                                    onClick={() => handleOpenModal(tipo)}
                                                                >
                                                                    <Edit2 className="h-4 w-4" />
                                                                </Button>
                                                            </RoleGuard>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-12 text-center text-slate-500 italic">
                                                    No se encontraron tipos de solicitud
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="text-xs text-slate-500 border-t border-slate-700/30 pt-4">
                        Mostrando {filteredTipos.length} de {tipos.length} tipos registrados
                    </CardFooter>
                </Card>
            </div>

            {/* Modal de Creación/Edición */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg bg-slate-900 border-slate-700 shadow-2xl scale-in-center">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl text-white">
                                    {currentTipo ? 'Editar Tipo de Solicitud' : 'Nuevo Tipo de Solicitud'}
                                </CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <CardDescription className="text-slate-400">
                                Complete los datos del catálogo paramétrico.
                            </CardDescription>
                        </CardHeader>
                        
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <FormField label="Código" error={errors.codigo}>
                                    <Input 
                                        {...register('codigo')} 
                                        placeholder="Ej: AIRE_AREA" 
                                        className="bg-slate-800 border-slate-700 text-white"
                                        disabled={!!currentTipo}
                                        data-testid="tipo-codigo"
                                    />
                                </FormField>
                                
                                <FormField label="Descripción" error={errors.descripcion}>
                                    <Input 
                                        {...register('descripcion')} 
                                        placeholder="Ej: Aire en área clasificada" 
                                        className="bg-slate-800 border-slate-700 text-white"
                                        data-testid="tipo-descripcion"
                                    />
                                </FormField>

                                <FormField label="Categoría" error={errors.categoria}>
                                    <Input 
                                        {...register('categoria')} 
                                        placeholder="Ej: Ambiental, Producto, etc." 
                                        className="bg-slate-800 border-slate-700 text-white"
                                        data-testid="tipo-categoria"
                                    />
                                </FormField>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                                            activoValue ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-500"
                                        )}>
                                            {activoValue ? <Check className="h-6 w-6" /> : <X className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">Estado Activo</p>
                                            <p className="text-xs text-slate-400">Determina si el tipo es visible en formularios</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setValue('activo', !activoValue)}
                                        className={cn(
                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900",
                                            activoValue ? 'bg-blue-600' : 'bg-slate-700'
                                        )}
                                    >
                                        <span className={cn(
                                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                            activoValue ? 'translate-x-6' : 'translate-x-1'
                                        )} />
                                    </button>
                                </div>
                            </CardContent>
                            
                            <CardFooter className="flex justify-end gap-3 border-t border-slate-800 mt-4 pt-6">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white hover:bg-slate-800">
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-500 text-white min-w-[120px]" data-testid="tipo-submit">
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        'Guardar'
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </AnimatedPage>
    );
};

export default TiposSolicitudPage;
