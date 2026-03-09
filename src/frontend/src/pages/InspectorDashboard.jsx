import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { 
  AlertTriangle, Clock, Send, CheckCircle, 
  TrendingUp, Calendar, ArrowRight, FlaskConical 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import { cn } from '../lib/utils';

const InspectorDashboard = () => {
  const [stats, setStats] = useState({
    urgentes_hoy: 0,
    espera_envio: 0,
    completados_hoy: 0,
    recientes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // En una implementación real, esto vendría de un endpoint específico /dashboard/inspector
      const res = await api.get('/muestreo/solicitudes');
      const sols = res.data;
      
      const hoy = new Date();
      const urgentes = sols.filter(s => {
        if (!s.fecha_limite) return false;
        const limite = new Date(s.fecha_limite);
        return (limite - hoy) / (1000 * 60 * 60) <= 24 && s.estado_solicitud_id < 3;
      });

      const espera = sols.filter(s => s.estado_solicitud_id === 2 || s.estado_solicitud_id === 5);
      const completados = sols.filter(s => {
        const f = new Date(s.fecha);
        return f.toDateString() === hoy.toDateString() && s.estado_solicitud_id === 3;
      });

      setStats({
        urgentes_hoy: urgentes.length,
        espera_envio: espera.length,
        completados_hoy: completados.length,
        recientes: sols.slice(0, 5)
      });
    } catch (error) {
      console.error('Error dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    { 
      label: 'Muestreos Críticos', 
      value: stats.urgentes_hoy, 
      sub: 'Vencen en menos de 24h', 
      icon: <AlertTriangle className="text-error" />, 
      color: 'border-l-error' 
    },
    { 
      label: 'En Espera de Envío', 
      value: stats.espera_envio, 
      sub: 'Pendientes de despacho', 
      icon: <Clock className="text-warning" />, 
      color: 'border-l-warning' 
    },
    { 
      label: 'Completados Hoy', 
      value: stats.completados_hoy, 
      sub: 'Muestras enviadas', 
      icon: <CheckCircle className="text-success" />, 
      color: 'border-l-success' 
    }
  ];

  return (
    <AnimatedPage className="space-y-10 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-text-main tracking-tight">Panel de Inspector</h1>
        <p className="text-text-muted font-medium italic underline decoration-primary/30 decoration-2">Visión general del estado operativo de muestreos.</p>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {kpis.map((kpi, i) => (
          <Card key={i} className={cn("border-l-4 shadow-premium transition-transform hover:scale-[1.02]", kpi.color)}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
                  <h3 className="text-4xl font-black text-text-main">{loading ? '...' : kpi.value}</h3>
                  <p className="text-xs text-text-muted mt-2 font-medium">{kpi.sub}</p>
                </div>
                <div className="p-3 bg-bg-surface rounded-2xl">
                  {kpi.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Accesos Directos */}
        <Card className="bg-primary/5 border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" /> Próximas Acciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/sampling" className="flex items-center justify-between p-4 bg-white rounded-2xl hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <FlaskConical size={20} />
                </div>
                <div>
                  <p className="font-black text-sm text-text-main">Ejecutar Muestreos</p>
                  <p className="text-[10px] text-text-muted uppercase font-bold">Solicitudes pendientes</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-text-muted group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/sampling" className="flex items-center justify-between p-4 bg-white rounded-2xl hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 text-secondary rounded-xl">
                  <Send size={20} />
                </div>
                <div>
                  <p className="font-black text-sm text-text-main">Gestionar Envíos</p>
                  <p className="text-[10px] text-text-muted uppercase font-bold">Corroboración de muestras</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-text-muted group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardContent>
        </Card>

        {/* Agenda Visual */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <Calendar size={20} className="text-text-muted" /> Actividad Reciente
            </CardTitle>
            <Link to="/history" className="text-[10px] font-black uppercase text-primary hover:underline">Ver todo</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recientes.length > 0 ? stats.recientes.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border-light/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <div>
                      <p className="text-xs font-bold text-text-main">#{s.solicitud_muestreo_id} — {s.tipo}</p>
                      <p className="text-[10px] text-text-muted">{new Date(s.fecha).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter">
                    {s.estado_solicitud_id === 3 ? 'Completado' : 'Procesado'}
                  </Badge>
                </div>
              )) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-text-muted italic font-medium">No hay actividad registrada hoy.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
};

export default InspectorDashboard;
