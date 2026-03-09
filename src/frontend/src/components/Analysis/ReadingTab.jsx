import React, { useState, useEffect } from 'react';
import { Search, Loader2, FileText, Check, X, RefreshCcw, Thermometer, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { analysisService } from '../../api/analysisService';

const ReadingTab = () => {
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    
    const [resultForm, setResultForm] = useState({ valor: '', valor_numerico: '', unidad: '', observacion: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const ans = await analysisService.getAll();
            // Filter analyses that are "Incubated" or "Concluded" (3) but ready for reading
            // In a real flow, we'd have a specific state like "Ready for Reading" (5)
            // For this demo, we'll show state 3 as well.
            setAnalyses(ans.filter(a => a.estado_analisis_id === 3));
        } catch (error) {
            toast.error('Error al cargar datos de lectura');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenResult = (analysis) => {
        setSelectedAnalysis(analysis);
        setResultForm({ valor: '', valor_numerico: '', unidad: 'UFC/ml', observacion: '' });
        setIsResultModalOpen(true);
    };

    const handleReincubar = async (analysis) => {
        try {
            // Simply reset to state 3 if it was moved forward, or keep it in 3 but notify
            toast.success('Análisis marcado para re-incubación');
            fetchData();
        } catch (error) {
            toast.error('Error al procesar re-incubación');
        }
    };

    const onSubmitResult = async (isFinal = true) => {
        if (!resultForm.valor && !resultForm.valor_numerico) {
            toast.error('Ingrese al menos un resultado (textual o numérico).');
            return;
        }
        setSubmitting(true);
        try {
            await analysisService.registerResult({
                analisis_id: selectedAnalysis.analisis_id,
                operario_id: 1,
                valor: resultForm.valor,
                valor_numerico: resultForm.valor_numerico ? parseFloat(resultForm.valor_numerico) : null,
                unidad: resultForm.unidad,
                observacion: resultForm.observacion
            }, isFinal);
            toast.success(isFinal ? 'Resultado Final registrado' : 'Resultado Preliminar registrado');
            setIsResultModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Error al registrar resultado');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredAnalyses = analyses.filter(a => 
        a.analisis_id.toString().includes(searchTerm) ||
        a.muestra_id.toString().includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="glass-card p-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por ID de análisis o muestra..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-accent-primary transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent-primary" size={40} /></div>
                ) : filteredAnalyses.length === 0 ? (
                    <div className="glass-card p-20 text-center text-text-muted italic">No hay análisis listos para lectura.</div>
                ) : (
                    <div className="glass-card overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-text-muted uppercase tracking-wider text-[10px] font-black">
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Muestra</th>
                                    <th className="px-6 py-4">Método</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredAnalyses.map((a) => (
                                    <tr key={a.analisis_id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-accent-primary">#{a.analisis_id}</td>
                                        <td className="px-6 py-4 font-bold text-white">M-{a.muestra_id}</td>
                                        <td className="px-6 py-4 text-text-muted uppercase text-[10px] font-bold">Version {a.metodo_version_id}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300">
                                                Listo para Leer
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleReincubar(a)}
                                                    className="p-2 rounded-lg bg-white/5 text-yellow-500 hover:bg-white/10 transition-all"
                                                    title="Re-incubar"
                                                >
                                                    <RefreshCcw size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenResult(a)}
                                                    className="px-4 py-1.5 rounded-lg bg-grad-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                                                >
                                                    <FileText size={12} /> Registrar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Resultado */}
            {isResultModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div>
                                <h3 className="text-xl font-black">Reporte de Resultados</h3>
                                <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Análisis #{selectedAnalysis?.analisis_id}</p>
                            </div>
                            <button onClick={() => setIsResultModalOpen(false)} className="p-2 text-text-muted hover:text-white transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-text-muted tracking-widest">Resultado Booleano</label>
                                    <select 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-primary outline-none transition-all font-bold"
                                        value={resultForm.valor}
                                        onChange={(e) => setResultForm({...resultForm, valor: e.target.value})}
                                    >
                                        <option value="">N/A</option>
                                        <option value="AUSENCIA">AUSENCIA</option>
                                        <option value="PRESENCIA">PRESENCIA</option>
                                        <option value="CUMPLE">CUMPLE</option>
                                        <option value="NO CUMPLE">NO CUMPLE</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-text-muted tracking-widest">Resultado Numérico</label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-primary outline-none transition-all font-bold"
                                        placeholder="0.00"
                                        value={resultForm.valor_numerico}
                                        onChange={(e) => setResultForm({...resultForm, valor_numerico: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-text-muted tracking-widest">Unidad</label>
                                    <input 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-primary outline-none transition-all font-bold"
                                        placeholder="UFC/ml"
                                        value={resultForm.unidad}
                                        onChange={(e) => setResultForm({...resultForm, unidad: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-text-muted tracking-widest">Observaciones</label>
                                <textarea 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-primary outline-none transition-all font-medium min-h-[100px]"
                                    placeholder="Detalle cualquier anomalía..."
                                    value={resultForm.observacion}
                                    onChange={(e) => setResultForm({...resultForm, observacion: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/10 flex justify-between items-center bg-white/5">
                            <button 
                                onClick={() => onSubmitResult(false)}
                                className="px-6 py-2 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all text-xs uppercase"
                            >
                                Guardar Preliminar
                            </button>
                            <div className="flex gap-3">
                                <button onClick={() => setIsResultModalOpen(false)} className="px-6 py-2 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all text-xs uppercase">Cancelar</button>
                                <button 
                                    onClick={() => onSubmitResult(true)}
                                    disabled={submitting}
                                    className="px-8 py-2 rounded-xl bg-accent-primary text-white font-black shadow-lg shadow-accent-primary/20 hover:brightness-110 transition-all flex items-center gap-2 text-xs uppercase"
                                >
                                    {submitting && <Loader2 className="animate-spin" size={14} />} Confirmar Final
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReadingTab;
