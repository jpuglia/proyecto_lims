import React from 'react';

/**
 * Shared input styling following the new clean light theme
 */
export const inputCls = (error) => {
  const base = "w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none placeholder:text-slate-400";
  if (error) {
    return `${base} border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-100`;
  }
  return base;
};

const FormField = ({ label, error, required, children, helperText }) => {
  // error can be a string or a react-hook-form error object
  const errorMessage = typeof error === 'object' ? error?.message : error;

  return (
    <div className="flex flex-col space-y-2 w-full">
      {label && (
        <label className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1 ml-1">
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}
      
      <div className="relative">
        {children}
      </div>

      {errorMessage && (
        <p className="text-[11px] font-bold text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
          {errorMessage}
        </p>
      )}
      
      {helperText && !error && (
        <span className="text-[11px] font-medium text-slate-400 ml-1">
          {helperText}
        </span>
      )}
    </div>
  );
};

export default FormField;
