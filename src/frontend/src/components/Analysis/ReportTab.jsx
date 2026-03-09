import React, { useState, useEffect } from 'react';
import { Search, Loader2, FileText, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { analysisService } from '../../api/analysisService';

const ReportTab = () => {
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const ans = await analysisService.getAll();
            // Filter analyses that are Completed (4) or Approved (5)
            setAnalyses(ans.filter(a => a.estado_analisis_id >= 4));
        } catch (error) {
            toast.error('Error al cargar reportes');
        } finally {
            setLoading(false);
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
                    <div className="glass-card p-20 text-center text-text-muted italic">No hay análisis finalizados para reportar.</div>
                ) : (
                    <div className="glass-card overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-text-muted uppercase tracking-wider text-[10px] font-black">
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Muestra</th>
                                    <th className="px-6 py-4">Método</th>
                                    <th className="px-6 py-4">Resultado</th>
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
                                            <div className="flex items-center gap-2">
                                                {/* Placeholder for real result value */}
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-green-500/20 text-green-300">
                                                    FINALIZADO
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 rounded-lg bg-white/5 text-accent-primary hover:bg-white/10 transition-all" title="Descargar Reporte">
                                                <Download size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportTab;
