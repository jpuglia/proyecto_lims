import React, { useState, useEffect } from 'react';
import { Search, FlaskConical, ClipboardCheck, ArrowRight, Save, ShieldCheck, Beaker, Database, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { analysisService } from '../api/analysisService';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormField from '../components/FormField';
import AnimatedPage from '../components/AnimatedPage';
import ElectronicSignatureModal from '../components/ElectronicSignatureModal';
import OOSAlert from '../components/OOSAlert';
import { cn } from '../lib/utils';

const resultSchema = z.object({
  analisis_id: z.number(),
  parametro: z.string().min(1, "Requerido"),
  valor: z.string().min(1, "Requerido"),
  unidades: z.string().min(1, "Requerido"),
  especificacion: z.string().optional(),
  cumple: z.boolean().default(true),
  observacion: z.string().optional(),
});

const DataEntry = () => {
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [showOOS, setShowOOS] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(resultSchema),
    defaultValues: { cumple: true }
  });

  const watchCumple = watch('cumple');
  const watchValor = watch('valor');
  const watchParam = watch('parametro');
  const watchSpec = watch('especificacion');

  useEffect(() => {
    if (watchCumple === false) {
      setShowOOS(true);
    } else {
      setShowOOS(false);
    }
  }, [watchCumple]);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const data = await analysisService.getAll();
      setAnalyses(data);
    } catch {
      toast.error('Error al cargar análisis pendientes');
    } finally {
      setLoading(false);
    }
  };

  const onHandleSubmit = (data) => {
    setFormData(data);
    setIsSignModalOpen(true);
  };

  const onSaveResult = async (signature) => {
    setIsSubmitting(true);
    try {
      // In a real app, we'd send the signature info to the backend for auditing
      await analysisService.registerResult({ ...formData, signature });
      toast.success('Resultado registrado y firmado exitosamente');
      setSelectedAnalysis(null);
      reset();
      fetchAnalyses();
    } catch {
      toast.error('Error al registrar resultado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAnalyses = analyses.filter(a => 
    a.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.tipo_analisis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatedPage className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-text-main tracking-tight">Data Entry Central</h1>
        <p className="text-text-muted font-medium">Registro técnico de resultados analíticos y trazabilidad de recursos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Search & Select */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest">Seleccionar Análisis</CardTitle>
              <CardDescription>Busque el análisis activo para ingresar datos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <Input 
                  placeholder="ID, Lote o Tipo..." 
                  className="pl-9 h-10 text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                  <div className="py-8 flex justify-center"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div></div>
                ) : filteredAnalyses.length === 0 ? (
                  <p className="text-center py-8 text-xs text-text-muted font-bold italic bg-bg-surface rounded-xl border border-dashed border-border-light">No hay análisis pendientes.</p>
                ) : (
                  filteredAnalyses.map(a => (
                    <button
                      key={a.analisis_id}
                      onClick={() => {
                        setSelectedAnalysis(a);
                        reset({ analisis_id: a.analisis_id, parametro: '', valor: '', unidades: '', cumple: true });
                      }}
                      className={cn(
                        "w-full flex flex-col items-start p-4 rounded-xl border transition-all text-left group",
                        selectedAnalysis?.analisis_id === a.analisis_id
                          ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20"
                          : "bg-white border-border-light hover:bg-bg-surface hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="text-[10px] font-black text-text-muted font-mono uppercase">#{a.analisis_id}</span>
                        <Badge variant={a.tipo_analisis === 'microbiologico' ? 'default' : 'secondary'} className="h-4">
                          {a.tipo_analisis}
                        </Badge>
                      </div>
                      <p className="text-sm font-bold text-text-main line-clamp-1 group-hover:text-primary transition-colors">{a.descripcion || 'Sin descripción'}</p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                        <FlaskConical size={10} /> {a.estado || 'En Proceso'}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Data Form */}
        <div className="lg:col-span-8">
          {selectedAnalysis ? (
            <Card className="animate-in slide-in-from-right-4 duration-500">
              <CardHeader className="border-b border-border-light pb-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-black text-text-main">Registro de Resultado</CardTitle>
                    <CardDescription className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
                      <FlaskConical size={12} className="text-primary" /> 
                      Análisis #{selectedAnalysis.analisis_id} — {selectedAnalysis.tipo_analisis}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedAnalysis(null)} className="h-8 text-[10px] font-black uppercase">Cancelar</Button>
                </div>
              </CardHeader>
              <form onSubmit={handleSubmit(onHandleSubmit)}>
                <CardContent className="pt-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                        <ClipboardCheck size={12} className="text-primary" /> Parámetros Técnicos
                      </h4>
                      <div className="space-y-4">
                        <FormField label="Parámetro a Medir" error={errors.parametro}>
                          <Input {...register('parametro')} placeholder="Ej: Recuento de Mohos" />
                        </FormField>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField label="Valor Hallado" error={errors.valor}>
                            <Input {...register('valor')} placeholder="10" />
                          </FormField>
                          <FormField label="Unidades" error={errors.unidades}>
                            <Input {...register('unidades')} placeholder="UFC/g" />
                          </FormField>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle size={12} className="text-warning" /> Especificación & Control
                      </h4>
                      <div className="space-y-4">
                        <FormField label="Referencia / Especificación" error={errors.especificacion}>
                          <Input {...register('especificacion')} placeholder="Ej: < 100 UFC/g" />
                        </FormField>
                        <div className="p-4 rounded-xl bg-bg-surface border border-border-light flex items-center justify-between">
                          <span className="text-xs font-bold text-text-muted">¿Cumple Especificación?</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" {...register('cumple')} className="sr-only peer" />
                            <div className="w-11 h-6 bg-border-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-light after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                      <Beaker size={12} className="text-primary" /> Observaciones Adicionales
                    </h4>

                    <OOSAlert 
                      isOpen={showOOS}
                      parameter={watchParam}
                      value={watchValor}
                      limit={watchSpec}
                      onConfirm={() => setShowOOS(false)}
                    />

                    <textarea 
                      {...register('observacion')}

                      className="w-full min-h-[100px] rounded-xl border border-border-light p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                      placeholder="Detalles sobre el procedimiento, desviaciones o hallazgos..."
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-border-light pt-6 justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted bg-bg-surface px-3 py-2 rounded-lg border border-border-light">
                    <ShieldCheck size={14} className="text-success" /> GAMP 5 Compliance Active
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="h-12 px-8 rounded-2xl">
                    {isSubmitting ? <span className="animate-spin mr-2">⏳</span> : <Save size={18} className="mr-2" />}
                    Registrar Resultado
                  </Button>
                </CardFooter>
              </form>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-24 text-center space-y-4 bg-white/50 border-2 border-dashed border-border-light rounded-2xl">
              <div className="w-20 h-20 rounded-full bg-bg-surface flex items-center justify-center text-text-muted">
                <FlaskConical size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-text-main">No hay análisis seleccionado</h3>
                <p className="text-sm text-text-muted max-w-xs mx-auto">Seleccione un análisis de la lista izquierda para comenzar a registrar resultados técnicos.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ElectronicSignatureModal 
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSign={onSaveResult}
        actionName={`Registro de resultado analítico para Análisis #${selectedAnalysis?.analisis_id}`}
      />
    </AnimatedPage>
  );
};

export default DataEntry;
