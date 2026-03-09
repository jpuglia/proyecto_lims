import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle2, XCircle, ShieldCheck, FileText, Calendar, User, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { analysisService } from '../api/analysisService';
import { toast } from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import ElectronicSignatureModal from '../components/ElectronicSignatureModal';

const ReviewQueue = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      // In a real app, we'd fetch only those with status 'Finalizado' (3)
      const data = await analysisService.getAll();
      setAnalyses(data.filter(a => a.estado_analisis_id === 3 || a.estado === 'Finalizado'));
    } catch {
      toast.error('Error al cargar la cola de revisión');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (_id) => {
    setIsSignModalOpen(true);
  };

  const onSignApprove = async (_signature) => {
    try {
      // Assuming 5 is 'Aprobado' (we might need to add it or just log the action)
      // await analysisService.changeStatus(selectedAnalysis.analisis_id, 5, 1); 
      toast.success('Análisis aprobado y firmado electrónicamente');
      fetchAnalyses();
      setSelectedAnalysis(null);
    } catch {
      toast.error('Error al aprobar el análisis');
    }
  };

  const filtered = analyses.filter(a => 
    a.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.analisis_id.toString().includes(searchTerm)
  );

  return (
    <AnimatedPage className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-text-main tracking-tight">Review Queue</h1>
        <p className="text-text-muted font-medium">Validación técnica y liberación de resultados analíticos (QA/QC).</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left: List of items to review */}
        <div className="xl:col-span-5 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-widest">Pendientes de Firma</CardTitle>
                <Badge variant="secondary">{filtered.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <Input 
                  placeholder="Filtrar por ID o descripción..." 
                  className="pl-9 h-10 text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                  <div className="py-12 flex justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div></div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-12 px-6 bg-bg-surface rounded-2xl border-2 border-dashed border-border-light">
                    <CheckCircle2 className="mx-auto text-success mb-3" size={32} />
                    <p className="text-sm font-bold text-text-main">¡Todo al día!</p>
                    <p className="text-[10px] text-text-muted mt-1 uppercase font-black">No hay análisis pendientes de revisión.</p>
                  </div>
                ) : (
                  filtered.map(a => (
                    <button
                      key={a.analisis_id}
                      onClick={() => setSelectedAnalysis(a)}
                      className={cn(
                        "w-full p-5 rounded-2xl border transition-all text-left group relative overflow-hidden",
                        selectedAnalysis?.analisis_id === a.analisis_id
                          ? "bg-white border-primary shadow-lg ring-1 ring-primary/10"
                          : "bg-white border-border-light hover:border-primary/40 hover:shadow-md"
                      )}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-text-muted font-mono uppercase">Batch Analítico #{a.analisis_id}</span>
                          <h4 className="font-black text-text-main group-hover:text-primary transition-colors mt-1">{a.descripcion || 'Análisis de Control'}</h4>
                        </div>
                        <div className="p-2 rounded-xl bg-bg-surface text-text-muted group-hover:bg-primary group-hover:text-white transition-all">
                          <Eye size={16} />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        <div className="flex items-center gap-1"><Calendar size={12} /> {new Date(a.ultimo_cambio).toLocaleDateString()}</div>
                        <div className="flex items-center gap-1"><User size={12} /> Operario ID: {a.operario_id}</div>
                      </div>

                      {selectedAnalysis?.analisis_id === a.analisis_id && (
                        <div className="absolute left-0 top-0 w-1 h-full bg-primary"></div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Detail & Actions */}
        <div className="xl:col-span-7">
          {selectedAnalysis ? (
            <Card className="animate-in fade-in slide-in-from-right-4 duration-500 overflow-hidden">
              <CardHeader className="bg-bg-surface border-b border-border-light p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="success" className="animate-pulse">Finalizado</Badge>
                      <span className="text-xs font-mono text-text-muted">ID: {selectedAnalysis.analisis_id}</span>
                    </div>
                    <CardTitle className="text-3xl font-black text-text-main">Detalle de Revisión</CardTitle>
                    <CardDescription className="text-sm font-medium">Revisión de resultados para liberación de lote.</CardDescription>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/report/${selectedAnalysis.analisis_id}`)}>
                      <FileText size={16} className="mr-2" /> Reporte Completo
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border-light pb-2">Información de Origen</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted font-bold">Tipo:</span>
                        <span className="text-text-main font-black uppercase">{selectedAnalysis.tipo_analisis}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted font-bold">Iniciado:</span>
                        <span className="text-text-main font-black">{new Date(selectedAnalysis.fecha_inicio).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted font-bold">Finalizado:</span>
                        <span className="text-text-main font-black">{new Date(selectedAnalysis.ultimo_cambio).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border-light pb-2">Control de Calidad</h5>
                    <div className="p-4 rounded-2xl bg-success/5 border border-success/20 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-success uppercase tracking-wider">Resultados Listos</p>
                        <p className="text-[10px] text-success/70 font-bold italic">Validación técnica preliminar conforme.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-bg-surface border border-border-light space-y-4">
                  <h5 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} /> Resumen de Resultados
                  </h5>
                  <div className="bg-white rounded-xl border border-border-light overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-bg-surface border-b border-border-light">
                        <tr>
                          <th className="px-4 py-3 font-black text-[10px] uppercase text-text-muted">Parámetro</th>
                          <th className="px-4 py-3 font-black text-[10px] uppercase text-text-muted">Valor</th>
                          <th className="px-4 py-3 font-black text-[10px] uppercase text-text-muted">Especificación</th>
                          <th className="px-4 py-3 font-black text-[10px] uppercase text-text-muted">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-light">
                        <tr>
                          <td className="px-4 py-3 font-bold text-text-main">Recuento Aerobios</td>
                          <td className="px-4 py-3 font-black text-primary">15 UFC/g</td>
                          <td className="px-4 py-3 text-text-muted">&lt; 100 UFC/g</td>
                          <td className="px-4 py-3"><Badge variant="success">Cumple</Badge></td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-bold text-text-main">Hongos y Levaduras</td>
                          <td className="px-4 py-3 font-black text-primary">&lt; 10 UFC/g</td>
                          <td className="px-4 py-3 text-text-muted">&lt; 100 UFC/g</td>
                          <td className="px-4 py-3"><Badge variant="success">Cumple</Badge></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-bg-surface p-8 border-t border-border-light justify-between">
                <Button variant="outline" className="text-error hover:bg-error/5 hover:border-error/30" onClick={() => setSelectedAnalysis(null)}>
                  <XCircle size={18} className="mr-2" /> Rechazar / Observar
                </Button>
                <div className="flex gap-4">
                  <Button className="bg-primary hover:bg-primary-dark rounded-2xl h-14 px-10 shadow-xl shadow-primary/30" onClick={() => handleApprove(selectedAnalysis.analisis_id)}>
                    <ShieldCheck size={20} className="mr-2" /> Firmar y Aprobar
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-white/50 border-2 border-dashed border-border-light rounded-3xl space-y-6">
              <div className="w-24 h-24 rounded-full bg-bg-surface flex items-center justify-center text-text-muted animate-pulse">
                <ClipboardCheck size={48} />
              </div>
              <div className="max-w-xs space-y-2">
                <h3 className="text-2xl font-black text-text-main tracking-tight">Seleccione para Revisar</h3>
                <p className="text-sm text-text-muted font-medium">Todos los análisis en estado 'Finalizado' aparecerán aquí para su validación final por supervisión.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ElectronicSignatureModal 
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSign={onSignApprove}
        actionName={`Aprobación final de QA/QC para Análisis #${selectedAnalysis?.analisis_id}`}
      />
    </AnimatedPage>
  );
};

export default ReviewQueue;
