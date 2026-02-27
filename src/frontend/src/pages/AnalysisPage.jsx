import React, { useState, useEffect } from 'react';
import { Plus, Search, RefreshCcw, Microscope, X, Check, Edit2, Trash2, Loader2, FileText, User } from 'lucide-react';
import { analysisService } from '../api/analysisService';
import { toast } from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import RoleGuard from '../components/RoleGuard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { analisisSchema, analisisEditSchema } from '../validation/schemas';
import FormField, { inputCls } from '../components/FormField';

const TIPO_OPCIONES = ['microbiologico', 'fisicoquimico', 'ambiental', 'producto'];

const getTipoBadge = (tipo) => {
    const badges = {
        microbiologico: 'bg-accent-primary/10 text-accent-primary',
        fisicoquimico: 'bg-accent-secondary/10 text-accent-secondary',
        ambiental: 'bg-success/10 text-success',
        producto: 'bg-warning/10 text-warning',
    };
    const cls = badges[tipo] || 'bg-white/5 text-text-muted';
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}>
            {tipo || 'N/A'}
        </span>
    );
};

const EMPTY_FORM = {
    operario_id: '',
    tipo_analisis: 'microbiologico',
    descripcion: '',
};

const AnalysisPage = () => {
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const createForm = useForm({
        resolver: zodResolver(analisisSchema),
        defaultValues: { tipo_analisis: 'microbiologico', operario_id: '', descripcion: '' },
    });
    const editForm = useForm({
        resolver: zodResolver(analisisEditSchema),
        defaultValues: { descripcion: '' },
    });

    useEffect(() => { fetchAnalyses(); }, []);

    const fetchAnalyses = async () => {
        setLoading(true);
        try {
            const data = await analysisService.getAll();
            setAnalyses(data);
        } catch {
            toast.error('Error al cargar análisis');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAnalysis = async (data) => {
        setSubmitting(true);
        try {
            const payload = { ...data, operario_id: data.operario_id ? Number(data.operario_id) : null };
            await analysisService.create(payload);
            setIsModalOpen(false);
            createForm.reset();
            toast.success('Análisis creado');
            fetchAnalyses();
        } catch (error) {
            toast.error('Error al crear análisis');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (item) => {
        setCurrentItem(item);
        editForm.reset({ descripcion: item.descripcion || '' });
        setIsEditModalOpen(true);
    };

    const handleUpdateAnalysis = async (data) => {
        setSubmitting(true);
        try {
            await analysisService.update(currentItem.analisis_id, data);
            setIsEditModalOpen(false);
            toast.success('Análisis actualizado');
            fetchAnalyses();
        } catch (error) {
            toast.error('Error al actualizar análisis');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`¿Confirmar eliminación del análisis #${item.analisis_id}?`)) return;
        try {
            await analysisService.delete(item.analisis_id);
            toast.success('Análisis eliminado');
            fetchAnalyses();
        } catch {
            toast.error('Error al eliminar el análisis');
        }
    };

    const filtered = analyses.filter((a) =>
        (a.tipo_analisis || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AnimatedPage className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gradient">Análisis</h1>
                    <p className="text-text-muted mt-1">Gestione los análisis microbiológicos, fisicoquímicos y ambientales.</p>
                </div>
                <RoleGuard roles={['administrador', 'supervisor', 'analista', 'operador']}>
                    <button
                        id="btn-nuevo-analisis"
                        onClick={() => setIsModalOpen(true)}
                        className="bg-grad-primary hover:brightness-110 active:scale-95 text-white px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-accent-primary/20"
                    >
                        <Plus size={20} />
                        Nuevo Análisis
                    </button>
                </RoleGuard>
            </div>

            {/* Search bar */}
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
                    onClick={fetchAnalyses}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                >
                    <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Operario ID</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Descripción</th>
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
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-text-muted">
                                    No se encontraron análisis.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((item) => (
                                <tr key={item.analisis_id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-xs text-text-muted">#{item.analisis_id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary">
                                                <Microscope size={16} />
                                            </div>
                                            {getTipoBadge(item.tipo_analisis)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-muted">
                                        {item.operario_id ? (
                                            <span className="flex items-center gap-1"><User size={12} /> {item.operario_id}</span>
                                        ) : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-muted italic max-w-xs truncate">
                                        {item.descripcion || '—'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <RoleGuard roles={['administrador', 'supervisor', 'analista', 'operador']}>
                                                <button
                                                    onClick={() => handleEditClick(item)}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            </RoleGuard>
                                            <RoleGuard roles={['administrador', 'supervisor']}>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </RoleGuard>
                                        </div>
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
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-text-muted hover:text-white transition-colors"><X size={24} /></button>
                        <h2 className="text-2xl font-bold text-gradient mb-6">Nuevo Análisis</h2>
                        <form onSubmit={createForm.handleSubmit(handleCreateAnalysis)} className="space-y-4">
                            <FormField label="Tipo de Análisis" error={createForm.formState.errors.tipo_analisis}>
                                <select {...createForm.register('tipo_analisis')} className={inputCls(createForm.formState.errors.tipo_analisis) + ' appearance-none'}>
                                    {['microbiologico', 'fisicoquimico', 'ambiental', 'producto'].map(t => (
                                        <option key={t} className="bg-bg-dark" value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                    ))}
                                </select>
                            </FormField>
                            <FormField label="ID Operario (Opcional)" error={createForm.formState.errors.operario_id}>
                                <input type="number" min="1" placeholder="Ej: 1" {...createForm.register('operario_id')} className={inputCls(createForm.formState.errors.operario_id)} />
                            </FormField>
                            <FormField label="Descripción" error={createForm.formState.errors.descripcion}>
                                <textarea {...createForm.register('descripcion')} rows="4"
                                    placeholder="Describir el análisis a realizar..."
                                    className={inputCls(createForm.formState.errors.descripcion) + ' resize-none'} />
                            </FormField>
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all">Cancelar</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-3 px-4 rounded-xl bg-grad-primary text-white font-semibold shadow-lg shadow-accent-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />} Crear Análisis
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-lg p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setIsEditModalOpen(false)} className="absolute top-6 right-6 text-text-muted hover:text-white transition-colors"><X size={24} /></button>
                        <h2 className="text-2xl font-bold text-gradient mb-2">Editar Análisis</h2>
                        <p className="text-sm text-text-muted mb-6">Actualice la descripción del análisis <span className="text-white font-mono">#{currentItem?.analisis_id}</span>.</p>
                        <form onSubmit={editForm.handleSubmit(handleUpdateAnalysis)} className="space-y-4">
                            <FormField label="Descripción" error={editForm.formState.errors.descripcion}>
                                <textarea {...editForm.register('descripcion')} rows="5"
                                    className={inputCls(editForm.formState.errors.descripcion) + ' resize-none'} />
                            </FormField>
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all">Cancelar</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-3 px-4 rounded-xl bg-grad-primary text-white font-semibold shadow-lg shadow-accent-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />} Actualizar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AnimatedPage>
    );
};

export default AnalysisPage;
