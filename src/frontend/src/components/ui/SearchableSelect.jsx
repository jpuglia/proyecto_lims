import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * A searchable select component with Tailwind and Framer Motion.
 */
const SearchableSelect = ({
  options = [],
  value = '',
  onChange,
  placeholder = "Seleccionar opción...",
  noResultsText = "No se encontraron resultados",
  labelField = "label",
  valueField = "value",
  searchFields = ["label"],
  className = "",
  disabled = false,
  error = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = useMemo(() => 
    options.find(opt => String(opt[valueField]) === String(value)),
    [options, value, valueField]
  );

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(opt => 
      searchFields.some(field => 
        String(opt[field] || '').toLowerCase().includes(term)
      )
    );
  }, [options, searchTerm, searchFields]);

  const handleSelect = (option) => {
    onChange(String(option[valueField]));
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-white border-2 rounded-xl px-4 py-3 font-bold flex items-center justify-between transition-all cursor-pointer",
          isOpen ? "border-primary ring-4 ring-primary/5" : "border-border-light",
          disabled ? "opacity-50 cursor-not-allowed bg-bg-surface" : "hover:border-primary/50",
          error ? "border-danger" : ""
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-text-muted font-medium")}>
          {selectedOption ? selectedOption[labelField] : placeholder}
        </span>
        <div className="flex items-center gap-2">
          {selectedOption && !disabled && (
            <X 
              size={16} 
              className="text-text-muted hover:text-danger transition-colors" 
              onClick={handleClear}
            />
          )}
          <ChevronDown 
            size={20} 
            className={cn("text-text-muted transition-transform duration-300", isOpen && "rotate-180")} 
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 4 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full bg-white border-2 border-primary/20 rounded-2xl shadow-premium overflow-hidden mt-1"
          >
            <div className="p-3 border-b border-border-light bg-bg-surface/50">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  autoFocus
                  type="text"
                  className="w-full bg-white border border-border-light rounded-lg pl-10 pr-4 py-2 text-sm font-bold outline-none focus:border-primary transition-all"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option[valueField]}
                    className={cn(
                      "px-4 py-3 text-sm font-bold cursor-pointer transition-colors flex items-center justify-between",
                      String(option[valueField]) === String(value) 
                        ? "bg-primary text-white" 
                        : "hover:bg-primary/5 text-text-main"
                    )}
                    onClick={() => handleSelect(option)}
                  >
                    <span>{option[labelField]}</span>
                    {String(option[valueField]) === String(value) && (
                       <motion.div layoutId="active-check" className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-xs font-black uppercase tracking-widest text-text-muted">
                  {noResultsText}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchableSelect;
