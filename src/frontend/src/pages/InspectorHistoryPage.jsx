import React, { useState, useEffect } from 'react';
import { History, Search, Download, Filter, Eye, FlaskConical, Package } from 'lucide-react';
import SampleService from '../api/sampleService';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';
import AnimatedPage from '../components/AnimatedPage';

const InspectorHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await SampleService.getAllSolicitudes();
      // Filtrar solo las completadas para el histórico
      setHistory(data.filter(s => s.estado_solicitud_id === 3));
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(s => 
    s.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.solicitud_muestreo_id.toString().includes(searchTerm)
  );

  return (
    <AnimatedPage className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-text-main tracking-tight">Histórico de Muestreos</h1>
          <p className="text-text-muted font-medium">Registro inmutable de actividades de muestreo y despacho.</p>
        </div>
        <Button variant="outline" className="rounded-xl font-bold">
          <Download size={18} className="mr-2" /> Exportar Reporte
        </Button>
      </div>

      <Card className="bg-white/50 border-none">
        <CardContent className="p-0 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <Input 
              placeholder="Buscar por ID, Lote o Inspector..." 
              className="pl-12 h-12 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="ghost" className="h-12 w-12 rounded-xl border border-border-light">
            <Filter size={20} />
          </Button>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-premium bg-white/80 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-surface/50 border-b border-border-light">
                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">ID / Fecha</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Contexto (Lote/Punto)</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Inspector (Muestreo)</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Revisor (Corroboración)</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Estado Final</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="animate-spin rounded-xl h-10 w-10 border-t-2 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-text-muted italic font-bold">
                    No se registran muestreos finalizados aún.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((s) => {
                  const isProducto = s.tipo === 'Producto' || s.orden_manufactura_id;
                  return (
                    <tr key={s.solicitud_muestreo_id} className="hover:bg-bg-surface/40 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs font-black text-primary">#{s.solicitud_muestreo_id}</p>
                        <p className="text-[10px] text-text-muted mt-1 font-bold">{new Date(s.fecha).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", isProducto ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary")}>
                            {isProducto ? <Package size={14} /> : <FlaskConical size={14} />}
                          </div>
                          <div>
                            <p className="text-xs font-black text-text-main">
                              {isProducto ? s.orden_manufactura?.lote : s.punto_muestreo?.nombre}
                            </p>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">{s.tipo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-text-main">{s.usuario?.nombre || 'Inspector'}</p>
                        <p className="text-[10px] text-text-muted">ID: {s.usuario?.usuario_id || '---'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-text-main">Supervisor LIMS</p>
                        <p className="text-[10px] text-text-muted">Corroboración Digital</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="success" className="bg-success/10 text-success font-black text-[10px] uppercase">Enviado</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-text-muted hover:text-primary">
                          <Eye size={18} />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AnimatedPage>
  );
};

export default InspectorHistoryPage;
