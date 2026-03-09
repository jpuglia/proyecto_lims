import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

import EjecucionAnalisisForm from '../components/Analista/EjecucionAnalisisForm';

const AnalistaDashboard = () => {
  const { user } = useAuth();
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executingAnalysis, setExecutingAnalysis] = useState(null);

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    setLoading(true);
    try {
      // In a real scenario, filter by analyst's lab
      const res = await api.get('/analisis');

      // Filter logic: if user has labs, only show analyses that are assigned to those labs (via reception)
      // For this demo, since models might not have all relations loaded, we'll try to filter by data we have
      let filtered = res.data;
      if (user?.laboratorios?.length > 0) {
         // This is a client-side filter for the demo, but should be server-side
         // We'll assume for now we show all if no complex linking exists in current API response
      }

      setSamples(filtered);
    } catch (error) {
      toast.error('Error al cargar muestras');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (id) => {
    switch (id) {
      case 1: return <Badge variant="warning">Programado</Badge>;
      case 2: return <Badge variant="info">En Ejecución</Badge>;
      case 3: return <Badge variant="secondary">Preliminar</Badge>;
      case 4: return <Badge variant="success">Resultado Final</Badge>;
      case 5: return <Badge variant="success">Aprobado</Badge>;
      default: return <Badge variant="neutral">Desconocido</Badge>;
    }
  };

  const [selectedSample, setSelectedSample] = useState(null);
  const [receptionForm, setReceptionForm] = useState({ decision: 'Aceptado', justificacion: '' });
  const [showModal, setShowModal] = useState(false);

  const handleOpenReception = (sample) => {
    setSelectedSample(sample);
    setReceptionForm({ decision: 'Aceptado', justificacion: '' });
    setShowModal(true);
  };

  const submitReception = async () => {
    if (receptionForm.decision !== 'Aceptado' && !receptionForm.justificacion) {
      toast.error('La justificación es obligatoria para este estado.');
      return;
    }

    try {
      await api.post('/muestreo/recepciones', {
        envio_muestra_id: selectedSample.recepcion_id, // This is simplified for the demo
        operario_id: 1, // Current user ID
        decision: receptionForm.decision,
        justificacion: receptionForm.justificacion,
        laboratorio_id: 1 // Based on user lab
      });
      toast.success('Muestra recibida correctamente');
      setShowModal(false);
      fetchSamples();
    } catch (error) {
      toast.error('Error al procesar recepción');
    }
  };

  if (executingAnalysis) {
    return (
      <EjecucionAnalisisForm 
        analysis={executingAnalysis} 
        onSuccess={() => { setExecutingAnalysis(null); fetchSamples(); }}
        onCancel={() => setExecutingAnalysis(null)}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-text-main tracking-tight">Panel de Analista</h1>
        <p className="text-text-muted font-medium italic">Viendo actividades para: {user?.laboratorios?.join(', ') || 'Global'}</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="border-t-4 border-t-primary">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Bandeja de Entrada — Recepción y Análisis</CardTitle>
            <button onClick={fetchSamples} className="text-xs font-black text-primary hover:underline uppercase">Actualizar</button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-16">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full shadow-lg"></div>
              </div>
            ) : samples.length > 0 ? (
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bg-surface text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">
                      <th className="py-5 px-6">ID Análisis</th>
                      <th className="py-5 px-6">Muestra</th>
                      <th className="py-5 px-6">Estado</th>
                      <th className="py-5 px-6">Última Actividad</th>
                      <th className="py-5 px-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {samples.map((s) => (
                      <tr key={s.analisis_id} className="border-b border-border-light/30 hover:bg-primary/[0.02] transition-colors group">
                        <td className="py-5 px-6 font-black text-text-main text-sm">#{s.analisis_id}</td>
                        <td className="py-5 px-6">
                           <div className="flex flex-col">
                             <span className="font-bold text-text-main">M-{s.muestra_id}</span>
                             <span className="text-[10px] text-text-muted font-bold uppercase">Lote: {s.lote || 'N/A'}</span>
                           </div>
                        </td>
                        <td className="py-5 px-6">{getStatusBadge(s.estado_analisis_id)}</td>
                        <td className="py-5 px-6 font-bold text-text-muted text-[11px]">
                          {new Date(s.ultimo_cambio).toLocaleString()}
                        </td>
                        <td className="py-5 px-6 text-right">
                          {s.estado_analisis_id === 1 ? (
                            <button 
                              onClick={() => handleOpenReception(s)}
                              className="bg-info text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-md shadow-info/20 hover:scale-105 active:scale-95 transition-all"
                            >
                              Recibir
                            </button>
                          ) : (
                            <button 
                              onClick={() => setExecutingAnalysis(s)}
                              className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                            >
                              Ejecutar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 bg-bg-surface/50 rounded-2xl border-2 border-dashed border-border-light">
                <p className="text-text-muted font-black text-sm uppercase tracking-widest">Sin muestras pendientes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reception Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-md shadow-2xl border-primary/20 scale-in-center">
            <CardHeader className="border-b border-border-light">
              <CardTitle className="text-xl font-black">Recepción de Muestra #{selectedSample?.muestra_id}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-text-muted">Decisión</label>
                <select 
                  value={receptionForm.decision}
                  onChange={(e) => setReceptionForm({...receptionForm, decision: e.target.value})}
                  className="w-full bg-bg-surface border-2 border-border-light rounded-xl px-4 py-3 font-bold text-text-main focus:border-primary transition-all outline-none"
                >
                  <option value="Aceptado">Aceptar Total</option>
                  <option value="Aceptado Parcial">Aceptar Parcialmente</option>
                  <option value="Rechazado">Rechazar Muestra</option>
                </select>
              </div>

              {receptionForm.decision !== 'Aceptado' && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-black uppercase text-text-muted">Justificación Obligatoria</label>
                  <textarea 
                    value={receptionForm.justificacion}
                    onChange={(e) => setReceptionForm({...receptionForm, justificacion: e.target.value})}
                    placeholder="Indique los motivos de la decisión..."
                    className="w-full bg-bg-surface border-2 border-border-light rounded-xl px-4 py-3 font-bold text-text-main focus:border-primary transition-all outline-none min-h-[100px]"
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-border-light rounded-xl font-black text-xs uppercase tracking-widest hover:bg-bg-surface transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={submitReception}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                >
                  Confirmar
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AnalistaDashboard;
