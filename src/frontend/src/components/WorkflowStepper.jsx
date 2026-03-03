import React from 'react';
import { Check } from 'lucide-react';

const steps = [
  { id: 1, name: 'Solicitud' },
  { id: 2, name: 'Muestreo' },
  { id: 3, name: 'Envío' },
  { id: 4, name: 'Recepción' },
  { id: 5, name: 'Entrada Análisis' },
  { id: 6, name: 'Ejecución' },
  { id: 7, name: 'Medios/Insumos' },
  { id: 8, name: 'Equipos' },
  { id: 9, name: 'Resultados' },
  { id: 10, name: 'Informe' },
];

const WorkflowStepper = ({ currentStep = 1 }) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Circle */}
            <div className="flex flex-col items-center relative group">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${currentStep > step.id 
                    ? 'bg-success border-success text-white' 
                    : currentStep === step.id 
                      ? 'bg-accent-primary border-accent-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                      : 'bg-white/5 border-white/10 text-text-muted'
                  }`}
              >
                {currentStep > step.id ? <Check size={16} /> : <span className="text-xs font-bold">{step.id}</span>}
              </div>
              
              {/* Tooltip-like label */}
              <div className="absolute -bottom-6 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStep === step.id ? 'text-accent-primary' : 'text-text-muted'}`}>
                    {step.name}
                 </span>
              </div>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-[2px] mx-2 bg-white/10 relative overflow-hidden">
                <div 
                  className={`absolute inset-0 bg-grad-primary transition-all duration-500 transform origin-left
                    ${currentStep > step.id ? 'scale-x-100' : 'scale-x-0'}`}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default WorkflowStepper;
