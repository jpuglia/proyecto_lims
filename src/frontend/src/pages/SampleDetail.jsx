import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FlaskConical, ArrowLeft, ShieldCheck, 
  FileText, Clock, CheckCircle2, Package, 
  Printer, Share2, MapPin, ClipboardCheck, X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { analysisService } from '../api/analysisService';
import { toast } from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import InspectorSamplingForm from '../components/Inspector/InspectorSamplingForm';

const SampleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const data = await analysisService.getReport(id);
        setReport(data);
      } catch {
        toast.error('Error al cargar detalle de muestra');
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-xl h-12 w-12 border-t-2 border-b-2 border-primary shadow-lg"></div>
        <p className="text-text-muted font-bold animate-pulse uppercase tracking-widest text-[10px]">Cargando Trazabilidad...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-black text-text-main">Muestra no encontrada</h2>
        <Button onClick={() => navigate('/samples')} className="mt-4">Volver a Muestras</Button>
      </div>
    );
  }

  const { solicitud, muestreo, recepciones, analisis, resultados } = report;

  const handleSamplingSuccess = () => {
    setIsInspectionModalOpen(false);
    // Refresh report data to show the new event if needed (though our timeline is simplified)
    // For now just stay on page
  };

  return (
    <AnimatedPage className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">{solicitud.tipo}</Badge>
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">ID Solicitud #{solicitud.solicitud_muestreo_id}</span>
            </div>
            <h1 className="text-4xl font-black text-text-main tracking-tight">Expediente de Muestra</h1>
          </div>
        </div>
        <div className="flex gap-3">
          {hasRole('inspector', 'administrador') && (
            <Button 
              onClick={() => setIsInspectionModalOpen(true)}
              className="h-11 rounded-xl px-6 bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/20"
            >
              <ClipboardCheck size={18} className="mr-2" /> Iniciar Muestreo de Inspección
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-11 rounded-xl">
            <Printer size={18} className="mr-2" /> Imprimir Protocolo
          </Button>
        </div>
      </div>

      {/* Modal Muestreo Inspección */}
      {isInspectionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-text-main/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsInspectionModalOpen(false)} 
              className="absolute top-6 right-6 z-10 p-2 text-text-muted hover:text-text-main hover:bg-bg-surface rounded-full transition-all"
            >
              <X size={20} />
            </button>
            <div className="overflow-y-auto p-8">
              <InspectorSamplingForm 
                requestId={solicitud.solicitud_muestreo_id}
                initialData={{
                  product_id: solicitud.producto_id, // Si existe en el backend model de solicitud
                  punto_muestreo_id: solicitud.punto_muestreo_id
                }}
                onSuccess={handleSamplingSuccess}
                onCancel={() => setIsInspectionModalOpen(false)}
              />
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="space-y-8">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Package size={16} className="text-primary" /> Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-border-light pb-3">
                  <span className="text-xs text-text-muted font-bold uppercase">Estado</span>
                  <Badge variant={solicitud.estado_solicitud_id === 3 ? 'success' : 'secondary'}>
                    {solicitud.estado_solicitud_id === 3 ? 'Completado' : 'En Proceso'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center border-b border-border-light pb-3">
                  <span className="text-xs text-text-muted font-bold uppercase text-left">Fecha Solicitud</span>
                  <span className="text-sm font-black text-text-main">{new Date(solicitud.fecha).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border-light pb-3">
                  <span className="text-xs text-text-muted font-bold uppercase">Solicitante</span>
                  <span className="text-sm font-black text-text-main">ID User {solicitud.usuario_id}</span>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-bg-surface border border-border-light space-y-2">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Observaciones</span>
                <p className="text-xs text-text-main font-medium italic">"{solicitud.observacion || 'Sin observaciones adicionales.'}"</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-primary uppercase tracking-widest">Cumplimiento GAMP 5</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center text-success">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-text-main">Audit Trail Activo</p>
                  <p className="text-[10px] text-text-muted font-bold">Cada cambio está logueado.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-info/20 flex items-center justify-center text-info">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-text-main">Validación de Datos</p>
                  <p className="text-[10px] text-text-muted font-bold">Criterios de aceptación OK.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content: Workflow Timeline */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="border-b border-border-light pb-6">
              <CardTitle className="text-xl font-black text-text-main">Línea de Vida de la Muestra</CardTitle>
              <CardDescription>Eventos registrados cronológicamente para trazabilidad total.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 relative">
              <div className="absolute left-[39px] top-8 bottom-8 w-0.5 bg-border-light"></div>
              
              <div className="space-y-12">
                {/* Event: Solicitud */}
                <TimelineEvent 
                  icon={<FileText size={18} />} 
                  title="Solicitud de Muestreo Creada" 
                  date={solicitud.fecha}
                  status="completed"
                  details={`Tipo: ${solicitud.tipo}`}
                />

                {/* Event: Muestreo */}
                {muestreo ? (
                  <TimelineEvent 
                    icon={<MapPin size={18} />} 
                    title="Sesión de Muestreo Ejecutada" 
                    date={muestreo.fecha_inicio}
                    status="completed"
                    details={`Operario ID: ${muestreo.operario_id}`}
                  />
                ) : (
                  <TimelineEvent 
                    icon={<MapPin size={18} />} 
                    title="Muestreo Pendiente" 
                    status="pending"
                  />
                )}

                {/* Event: Recepción */}
                {recepciones.length > 0 ? (
                  <TimelineEvent 
                    icon={<CheckCircle2 size={18} />} 
                    title="Recepción en Laboratorio" 
                    date={recepciones[0].fecha}
                    status="completed"
                    details={`Recibido en: ${recepciones[0].recibido_en} — Decisión: ${recepciones[0].decision}`}
                  />
                ) : (
                  <TimelineEvent 
                    icon={<CheckCircle2 size={18} />} 
                    title="Recepción Pendiente" 
                    status="pending"
                  />
                )}

                {/* Event: Análisis */}
                {analisis.length > 0 ? (
                  <TimelineEvent 
                    icon={<FlaskConical size={18} />} 
                    title="Procesamiento Analítico" 
                    date={analisis[0].ultimo_cambio}
                    status="completed"
                    details={`${analisis.length} análisis vinculados. Estado final: Completado.`}
                  />
                ) : (
                  <TimelineEvent 
                    icon={<FlaskConical size={18} />} 
                    title="Análisis No Iniciados" 
                    status="pending"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Table if available */}
          {resultados.length > 0 && (
            <Card className="overflow-hidden border-success/30 ring-1 ring-success/10">
              <CardHeader className="bg-success/5 border-b border-success/20">
                <CardTitle className="text-sm font-black text-success uppercase tracking-widest">Resultados Analíticos Finales</CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-bg-surface border-b border-border-light">
                    <tr>
                      <th className="px-6 py-4 font-black text-[10px] uppercase text-text-muted">Parámetro</th>
                      <th className="px-6 py-4 font-black text-[10px] uppercase text-text-muted text-center">Valor</th>
                      <th className="px-6 py-4 font-black text-[10px] uppercase text-text-muted text-center">Unidad</th>
                      <th className="px-6 py-4 font-black text-[10px] uppercase text-text-muted text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {resultados.map((res, idx) => (
                      <tr key={idx} className="hover:bg-bg-surface/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-text-main">{res.parametro || 'N/A'}</td>
                        <td className="px-6 py-4 font-black text-primary text-center">{res.valor || res.valor_numerico}</td>
                        <td className="px-6 py-4 text-text-muted text-center font-bold">{res.unidad || '-'}</td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={res.conforme ? 'success' : 'destructive'}>
                            {res.conforme ? 'Conforme' : 'No Conforme'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};

const TimelineEvent = ({ icon, title, date, status, details }) => {
  const isPending = status === 'pending';
  
  return (
    <div className="flex gap-6 relative z-10 group">
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-300",
        isPending 
          ? "bg-bg-surface text-text-muted border border-border-light" 
          : "bg-white text-primary border border-primary/20 ring-4 ring-primary/5 group-hover:scale-110"
      )}>
        {icon}
      </div>
      <div className="space-y-1 pt-1">
        <h4 className={cn(
          "text-sm font-black tracking-tight",
          isPending ? "text-text-muted" : "text-text-main"
        )}>{title}</h4>
        {!isPending && (
          <>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-text-muted uppercase flex items-center gap-1">
                <Clock size={10} /> {new Date(date).toLocaleString()}
              </span>
            </div>
            {details && <p className="text-xs text-text-muted font-medium bg-bg-surface/50 p-2 rounded-lg border border-border-light mt-2">{details}</p>}
          </>
        )}
        {isPending && <p className="text-[10px] text-text-muted font-bold italic">Pendiente de ejecución en el flujo...</p>}
      </div>
    </div>
  );
};

export default SampleDetail;
