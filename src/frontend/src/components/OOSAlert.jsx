import React from 'react';
import { AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';

const OOSAlert = ({ isOpen, parameter, value, limit, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="p-4 rounded-2xl bg-error/5 border-2 border-error/20 animate-in zoom-in-95 duration-300">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center text-error shrink-0">
          <ShieldAlert size={24} />
        </div>
        <div className="space-y-1 flex-1">
          <h4 className="text-sm font-black text-error uppercase tracking-widest">Alerta OOS (Fuera de Especificación)</h4>
          <p className="text-xs text-text-main font-bold">
            El valor ingresado <span className="underline decoration-error decoration-2">"{value}"</span> para <span className="font-black italic">{parameter}</span> excede el límite establecido de <span className="font-black">"{limit}"</span>.
          </p>
          <div className="pt-3 flex items-center gap-4">
            <button 
              onClick={onConfirm}
              className="text-[10px] font-black text-error uppercase hover:underline flex items-center gap-1"
            >
              Confirmar Desviación <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OOSAlert;
