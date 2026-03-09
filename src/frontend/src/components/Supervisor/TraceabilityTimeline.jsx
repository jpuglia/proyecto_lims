import React from 'react';
import { 
  FlaskConical, Truck, ClipboardCheck, 
  Zap, FileText, CheckCircle2, Clock 
} from 'lucide-react';
import { cn } from '../../lib/utils';

const TimelineItem = ({ icon: Icon, title, date, user, description, isLast, status }) => (
  <div className="relative pl-10 pb-8 group">
    {!isLast && (
      <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-border-light group-hover:bg-primary/30 transition-colors"></div>
    )}
    <div className={cn(
      "absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white z-10 transition-all shadow-sm",
      status === 'completed' ? "border-success text-success" : "border-border-light text-text-muted"
    )}>
      <Icon size={18} />
    </div>
    <div className="space-y-1">
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-black text-text-main uppercase tracking-tight">{title}</h4>
        <div className="flex items-center gap-1 text-[10px] font-black text-text-muted bg-bg-surface px-2 py-1 rounded-md border border-border-light">
          <Clock size={10} />
          {date}
        </div>
      </div>
      <p className="text-[11px] font-bold text-primary">Operario: {user}</p>
      <div className="p-3 bg-bg-surface/50 rounded-xl border border-border-light/50 mt-2">
        <p className="text-xs text-text-muted font-medium leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
);

const TraceabilityTimeline = ({ data }) => {
  if (!data) return null;

  return (
    <div className="p-2">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-1 h-8 bg-primary rounded-full"></div>
        <h3 className="text-lg font-black text-text-main tracking-tight">CICLO DE VIDA ANALÍTICO</h3>
      </div>

      <div className="max-w-md">
        <TimelineItem 
          icon={FlaskConical}
          title="Muestreo Registrado"
          date="04/03/2026 09:15"
          user="Inspector (ID 10)"
          description="Muestreo Ambiental realizado en Planta A. Equipos: Balanza B-01, Hisopo H-45."
          status="completed"
        />
        <TimelineItem 
          icon={Truck}
          title="Envío a Laboratorio"
          date="04/03/2026 09:45"
          user="Inspector (ID 10)"
          description="Muestra enviada a laboratorio de Microbiología. Cadena de frío mantenida."
          status="completed"
        />
        <TimelineItem 
          icon={ClipboardCheck}
          title="Recepción en Lab"
          date="04/03/2026 10:30"
          user="Analista (ID 5)"
          description="Muestra aceptada para análisis. Integridad del envase confirmada."
          status="completed"
        />
        <TimelineItem 
          icon={Zap}
          title="Ejecución de Análisis"
          date="04/03/2026 11:00"
          user="Analista (ID 5)"
          description="Análisis iniciado. Medio de cultivo: Agar Soja Tripticaseina (Lote L-202). Equipo: Incubadora I-05."
          status="completed"
        />
        <TimelineItem 
          icon={FileText}
          title="Resultado Reportado"
          date="04/03/2026 15:20"
          user="Analista (ID 5)"
          description="Dictamen FINAL: CUMPLE. Valor obtenido: 150 UFC/g."
          status="completed"
          isLast
        />
      </div>
    </div>
  );
};

export default TraceabilityTimeline;
