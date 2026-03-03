import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analysisService } from '../api/analysisService';
import { toast } from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import { FileText, ArrowLeft, Download, CheckCircle2, FlaskConical, Microscope, Clock } from 'lucide-react';
import WorkflowStepper from '../components/WorkflowStepper';

const ReportPage = () => {
    const { solicitudId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const data = await analysisService.getReport(solicitudId);
                setReport(data);
            } catch (error) {
                toast.error('Error al cargar el reporte');
                navigate('/samples');
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [solicitudId, navigate]);

    if (loading) return <div className="flex items-center justify-center h-screen"><Clock className="animate-spin text-accent-primary" size={48} /></div>;
    if (!report) return null;

    return (
        <AnimatedPage className="space-y-8">
            <div className="flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-muted hover:text-white transition-colors">
                    <ArrowLeft size={20} /> Volver
                </button>
                <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 transition-all">
                    <Download size={18} /> Exportar PDF
                </button>
            </div>

            <div className="glass-card p-8 space-y-8">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 rounded-2xl bg-grad-primary text-white shadow-lg">
                                <FileText size={24} />
                            </div>
                            <h1 className="text-4xl font-bold text-white tracking-tight">Informe de Trazabilidad</h1>
                        </div>
                        <p className="text-text-muted">Certificado analítico consolidado para la solicitud <span className="text-white font-mono font-bold">#{solicitudId}</span></p>
                    </div>
                    <div className="text-right">
                        <span className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Fecha Emisión</span>
                        <span className="text-lg font-mono text-white">{new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                <WorkflowStepper currentStep={10} />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <section className="glass-card p-6 border-l-4 border-accent-primary">
                        <h3 className="flex items-center gap-2 text-white font-bold mb-4 uppercase text-xs tracking-wider">
                            <FlaskConical size={16} className="text-accent-primary" /> Datos del Muestreo
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Tipo:</span>
                                <span className="text-white font-medium">{report.solicitud.tipo}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Sesión ID:</span>
                                <span className="text-white font-mono">{report.muestreo?.muestreo_id || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Operario:</span>
                                <span className="text-white font-medium">#{report.muestreo?.operario_id || '-'}</span>
                            </div>
                        </div>
                    </section>

                    <section className="glass-card p-6 border-l-4 border-accent-secondary">
                        <h3 className="flex items-center gap-2 text-white font-bold mb-4 uppercase text-xs tracking-wider">
                            <Microscope size={16} className="text-accent-secondary" /> Datos Analíticos
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Análisis ID:</span>
                                <span className="text-white font-mono">#{report.analisis[0]?.analisis_id || '-'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Método:</span>
                                <span className="text-white font-medium">v.{report.analisis[0]?.metodo_version_id || '-'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Incubación:</span>
                                <span className="text-white font-medium">{report.incubaciones.length > 0 ? 'Sí' : 'No'}</span>
                            </div>
                        </div>
                    </section>

                    <section className="glass-card p-6 border-l-4 border-success">
                        <h3 className="flex items-center gap-2 text-white font-bold mb-4 uppercase text-xs tracking-wider">
                            <CheckCircle2 size={16} className="text-success" /> Resultados Finales
                        </h3>
                        {report.resultados.map((res, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Valor:</span>
                                    <span className={`font-bold ${res.conforme ? 'text-success' : 'text-error'}`}>
                                        {res.valor_numerico || res.valor} {res.unidad}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Conformidad:</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${res.conforme ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                                        {res.conforme ? 'Conforme' : 'No Conforme'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </section>
                </div>

                <div className="glass-card p-6 bg-white/5">
                    <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Trazabilidad de Muestras ({report.muestras.length})</h3>
                    <div className="space-y-4">
                        {report.muestras.map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-mono text-accent-primary">#{m.codigo_etiqueta}</span>
                                    <span className="text-sm text-white">{m.tipo_muestra}</span>
                                </div>
                                <div className="flex gap-2">
                                    {report.envios.find(e => e.muestra_id === m.muestra_id) && (
                                        <span className="text-[10px] bg-success/10 text-success px-2 py-1 rounded font-bold">ENVIADA</span>
                                    )}
                                    {report.recepciones.find(r => report.envios.find(e => e.muestra_id === m.muestra_id)?.envio_muestra_id === r.envio_muestra_id) && (
                                        <span className="text-[10px] bg-accent-primary/10 text-accent-primary px-2 py-1 rounded font-bold">RECIBIDA</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default ReportPage;
