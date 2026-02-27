/**
 * FormField.jsx — Componente de campo de formulario con manejo de errores.
 *
 * Uso:
 *   <FormField label="Nombre" error={errors.nombre}>
 *     <input {...register('nombre')} />
 *   </FormField>
 *
 * O con el shorthand integrado para inputs simples:
 *   <FormField label="Código" error={errors.codigo} id="codigo">
 *     <input id="codigo" {...register('codigo')} className={inputCls(errors.codigo)} />
 *   </FormField>
 */
import React from 'react';

/**
 * Devuelve la clase CSS del input según si hay error.
 * Usá esta función para construir el className de tus inputs.
 */
export const inputCls = (error) =>
    `w-full bg-white/5 border rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none transition-all ${error
        ? 'border-error/70 focus:border-error'
        : 'border-white/10 focus:border-accent-primary'
    }`;

const FormField = ({ label, error, children, className = '' }) => (
    <div className={`space-y-1.5 ${className}`}>
        {label && (
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                {label}
            </label>
        )}
        {children}
        {error && (
            <p className="text-[11px] text-error font-medium flex items-center gap-1 mt-1">
                <span>⚠</span>
                {error.message}
            </p>
        )}
    </div>
);

export default FormField;
