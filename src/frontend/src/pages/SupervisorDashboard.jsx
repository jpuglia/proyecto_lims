import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

import TraceabilityTimeline from '../components/Supervisor/TraceabilityTimeline';
import { Search, Eye, X } from 'lucide-react';

const SupervisorDashboard = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [timelineData, setTimelineData] = useState(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await api.get('/analisis');
      // Filter for analyses that are ready for approval (state 4: Resultado Final)
      setQueue(res.data.filter(a => a.estado_analisis_id === 4));
    } catch (error) {
      toast.error('Error al cargar cola de aprobación');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (analysis) => {
    setTimelineData(analysis);
    setShowDrawer(true);
  };

  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleOpenApproval = (analysis) => {
    setSelectedAnalysis(analysis);
    setPassword('');
    setShowApprovalModal(true);
  };

  const submitApproval = async () => {
    if (!password) {
      toast.error('La contraseña es obligatoria para la firma electrónica.');
      return;
    }

    setIsVerifying(true);
    try {
      // 1. Verify signature (Double Challenge)
      await api.post('/auth/verify-signature', {
        password: password,
        motivo: `Aprobación de análisis #${selectedAnalysis.analisis_id}`
      });

      // 2. Approve Analysis
      await api.post(`/analisis/${selectedAnalysis.analisis_id}/estado`, {
        nuevo_estado_id: 5, // Aprobado
        operario_id: 1 // Current user ID
      });

      toast.success('Análisis aprobado y firmado digitalmente');
      setShowApprovalModal(false);
      fetchQueue();
    } catch (error) {
      toast.error('Error de firma: Contraseña incorrecta o permisos insuficientes');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div>
        <h1 className="text-4xl font-black text-text-main tracking-tight">Panel de Supervisor</h1>
        <p className="text-text-muted font-medium uppercase tracking-widest text-xs">Revisión, aprobación y liberación de resultados.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="border-t-4 border-t-success shadow-xl shadow-success/5">
          <CardHeader className="bg-bg-surface/50 border-b border-border-light flex flex-row justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <CardTitle className="text-sm font-black uppercase">Cola de Aprobación Pendiente</CardTitle>
            </div>
            <Badge variant="primary" className="font-black px-4 py-1">{queue.length} PENDIENTES</Badge>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center p-20">
                <div className="animate-spin h-12 w-12 border-4 border-success border-t-transparent rounded-full"></div>
              </div>
            ) : queue.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] border-b border-border-light">
                      <th className="py-6 px-8">Análisis</th>
                      <th className="py-6 px-8">Muestra</th>
                      <th className="py-6 px-8">Analista</th>
                      <th className="py-6 px-8">Resultado</th>
                      <th className="py-6 px-8 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map((a) => (
                      <tr key={a.analisis_id} className="border-b border-border-light/30 hover:bg-success/[0.02] transition-colors group">
                        <td className="py-6 px-8 font-black text-text-main">#{a.analisis_id}</td>
                        <td className="py-6 px-8 font-bold text-text-muted">M-{a.muestra_id}</td>
                        <td className="py-6 px-8">
                           <div className="flex items-center gap-2">
                             <div className="w-6 h-6 bg-bg-surface border border-border-light rounded-full flex items-center justify-center text-[10px] font-black">AN</div>
                             <span className="text-xs font-bold text-text-muted">Operario {a.operario_id}</span>
                           </div>
                        </td>
                        <td className="py-6 px-8">
                           <Badge variant="success" className="text-[9px] font-black">DISPONIBLE</Badge>
                        </td>
                        <td className="py-6 px-8 text-right flex justify-end gap-3">
                          <button 
                            onClick={() => handleViewDetails(a)}
                            className="p-2.5 bg-bg-surface border-2 border-border-light rounded-xl text-text-muted hover:text-primary hover:border-primary transition-all shadow-sm"
                            title="Ver Trazabilidad"
                          >
                             <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleOpenApproval(a)}
                            className="bg-success text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-success/20 hover:scale-105 active:scale-95 transition-all"
                          >
                             APROBAR Y FIRMAR
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-24 space-y-6">
                 <div className="text-7xl">🛡️</div>
                 <div>
                   <p className="text-text-main font-black text-lg tracking-tight">Todo bajo control</p>
                   <p className="text-text-muted font-bold italic text-sm">No hay análisis pendientes de aprobación en este momento.</p>
                 </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Side Drawer for Traceability */}
      {showDrawer && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] animate-in fade-in" onClick={() => setShowDrawer(false)}></div>
          <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white z-[120] shadow-2xl animate-in slide-in-from-right duration-500 border-l border-border-light overflow-y-auto">
            <div className="p-8 border-b border-border-light flex justify-between items-center bg-bg-surface/50">
              <div>
                <h2 className="text-2xl font-black text-text-main tracking-tight">Detalle de Trazabilidad</h2>
                <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Expediente Digital #{timelineData?.analisis_id}</p>
              </div>
              <button onClick={() => setShowDrawer(false)} className="p-2 hover:bg-error/10 hover:text-error rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8">
              <TraceabilityTimeline data={timelineData} />
            </div>
          </div>
        </>
      )}

      {/* Approval Modal (Double Challenge) */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-md shadow-2xl border-success/30 overflow-hidden">
            <div className="h-2 bg-success"></div>
            <CardHeader className="border-b border-border-light bg-bg-surface/50">
              <CardTitle className="text-xl font-black flex items-center gap-3">
                <span className="p-2 bg-success/10 rounded-lg text-success">🖋️</span>
                Firma de Aprobación
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="bg-bg-surface p-4 rounded-xl border border-border-light space-y-1">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Documento a firmar</p>
                <p className="font-bold text-text-main">Aprobación Final de Análisis #{selectedAnalysis?.analisis_id}</p>
                <p className="text-xs text-text-muted">Al firmar, usted confirma que ha revisado los resultados y son conformes.</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-widest flex justify-between">
                  Contraseña de Firma
                  <span className="text-error">* Requerido</span>
                </label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña..."
                  className="w-full bg-bg-surface border-2 border-border-light rounded-xl px-5 py-4 font-bold text-text-main focus:border-success transition-all outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowApprovalModal(false)}
                  disabled={isVerifying}
                  className="flex-1 px-6 py-4 border-2 border-border-light rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-bg-surface transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={submitApproval}
                  disabled={isVerifying}
                  className="flex-1 px-6 py-4 bg-success text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-success/30 hover:scale-105 active:scale-95 transition-all disabled:animate-pulse"
                >
                  {isVerifying ? 'VERIFICANDO...' : 'CONFIRMAR FIRMA'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SupervisorDashboard;
