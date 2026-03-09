import React, { useState, useEffect } from 'react';
import { Search, Loader2, Beaker, Settings, Check, X, Microscope, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { analysisService } from '../../api/analysisService';
import { inventoryService } from '../../api/inventoryService';
import equipmentService from '../../api/equipmentService';

const ExecutionTab = () => {
    const [analyses, setAnalyses] = useState([]);
    const [media, setMedia] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ans, med, eq] = await Promise.all([
                analysisService.getAll(),
                inventoryService.getStock(),
                equipmentService.getAll()
            ]);
            // Filter analyses that are Programmed (1) or In Execution (2)
            setAnalyses(ans.filter(a => a.estado_analisis_id <= 2));
            setMedia(med.filter(m => m.estado_qc_id === 2)); // Only approved media
            setEquipment(eq.filter(e => e.estado === 'Activo'));
        } catch (error) {
            toast.error('Error al cargar datos de ejecución');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenResources = (analysis) => {
        setSelectedAnalysis(analysis);
        setIsResourceModalOpen(true);
    };

    const handleStartAnalysis = async (analysis) => {
        try {
            await analysisService.changeStatus(analysis.analisis_id, 2, 1); // 2: In Execution, 1: Op ID
            toast.success('Análisis iniciado');
            fetchData();
        } catch (error) {
            toast.error('Error al iniciar análisis');
        }
    };

    const handleConcludeAnalysis = async (analysis) => {
        try {
            await analysisService.changeStatus(analysis.analisis_id, 3, 1); // 3: Concluded
            toast.success('Análisis concluido (pendiente incubación/lectura)');
            fetchData();
        } catch (error) {
            toast.error('Error al concluir análisis');
        }
    };

    const handleAssignMedia = async (mediaId) => {
        setSubmitting(true);
        try {
            await analysisService.registerUsageMedia({
                analisis_id: selectedAnalysis.analisis_id,
                stock_medios_id: mediaId
            });
            toast.success('Medio asignado correctamente');
            fetchData();
        } catch (error) {
            toast.error('Error al asignar medio');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAssignEquipment = async (eqId) => {
        setSubmitting(true);
        try {
            await analysisService.registerUsageEquipment({
                analisis_id: selectedAnalysis.analisis_id,
                equipo_instrumento_id: eqId,
                fecha_uso: new Date().toISOString()
            });
            toast.success('Equipo asignado correctamente');
            fetchData();
        } catch (error) {
            toast.error('Error al asignar equipo');
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
                    <div className="glass-card p-20 text-center text-text-muted italic">No hay análisis en ejecución.</div>
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
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${a.estado_analisis_id === 1 ? 'bg-blue-500/20 text-blue-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                                {a.estado_analisis_id === 1 ? 'Programado' : 'En Ejecución'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {a.estado_analisis_id === 1 ? (
                                                    <button 
                                                        onClick={() => handleStartAnalysis(a)}
                                                        className="px-4 py-1.5 rounded-lg bg-accent-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                                                    >
                                                        Iniciar
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button 
                                                            onClick={() => handleOpenResources(a)}
                                                            className="p-2 rounded-lg bg-white/5 text-accent-secondary hover:bg-white/10 transition-all"
                                                            title="Asignar Recursos"
                                                        >
                                                            <Beaker size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleConcludeAnalysis(a)}
                                                            className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                                                        >
                                                            Concluir
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Recursos */}
            {isResourceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div>
                                <h3 className="text-xl font-black">Asignación de Recursos</h3>
                                <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Análisis #{selectedAnalysis?.analisis_id}</p>
                            </div>
                            <button onClick={() => setIsResourceModalOpen(false)} className="p-2 text-text-muted hover:text-white transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Medios de Cultivo */}
                            <div className="space-y-4">
                                <h4 className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-accent-secondary">
                                    <Beaker size={16} /> Medios y Reactivos
                                </h4>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {media.map(m => (
                                        <div key={m.stock_medios_id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center group hover:border-accent-secondary/50 transition-all">
                                            <div>
                                                <p className="font-bold text-white text-sm">{m.lote_interno}</p>
                                                <p className="text-[10px] text-text-muted font-bold uppercase">Vence: {m.vence}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleAssignMedia(m.stock_medios_id)}
                                                disabled={submitting}
                                                className="p-2 rounded-lg bg-accent-secondary/20 text-accent-secondary hover:bg-accent-secondary hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Check size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Equipamiento */}
                            <div className="space-y-4">
                                <h4 className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-accent-primary">
                                    <Settings size={16} /> Instrumentos y Equipos
                                </h4>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {equipment.map(e => (
                                        <div key={e.equipo_instrumento_id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center group hover:border-accent-primary/50 transition-all">
                                            <div>
                                                <p className="font-bold text-white text-sm">{e.nombre}</p>
                                                <p className="text-[10px] text-text-muted font-bold uppercase">{e.codigo}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleAssignEquipment(e.equipo_instrumento_id)}
                                                disabled={submitting}
                                                className="p-2 rounded-lg bg-accent-primary/20 text-accent-primary hover:bg-accent-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Check size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/10 flex justify-end bg-white/5">
                            <button onClick={() => setIsResourceModalOpen(false)} className="px-8 py-2 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all text-xs uppercase">Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExecutionTab;
