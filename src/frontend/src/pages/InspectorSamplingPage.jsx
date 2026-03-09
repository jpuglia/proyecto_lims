import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Clock, Check, Send,
  Plus, X, Square, CheckSquare, Layers, Eye,
  Droplets, Wind, Beaker, Package, FlaskConical
} from 'lucide-react';
import { inspectionService } from '../api/inspectionService';
import SampleService from '../api/sampleService';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';
import AnimatedPage from '../components/AnimatedPage';
import InspectorSamplingForm from '../components/Inspector/InspectorSamplingForm';
import SamplingDetailModal from '../components/Inspector/SamplingDetailModal';

const InspectorSamplingPage = () => {
  const [activeTab, setActiveTab] = useState('solicitudes');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdhocModalOpen, setIsAdhocModalOpen] = useState(false);

  // Detail modal state
  const [detailItem, setDetailItem] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Data States
  const [solicitudes, setSolicitudes] = useState([]);
  const [samplings, setSamplings] = useState([]);
  const [plantas, setPlantas] = useState([]);

  // Batch State
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'solicitudes') {
        const sols = await SampleService.getAllSolicitudes();
        setSolicitudes(sols);
      } else if (activeTab === 'revision') {
        const data = await inspectionService.getAllSamplings('PENDING_REVIEW');
        setSamplings(data);
      } else if (activeTab === 'espera') {
        const data = await inspectionService.getAllSamplings('PENDING_SUBMISSION');
        setSamplings(data);
        setSelectedIds([]);
      }

      if (plantas.length === 0) {
        const plants = await api.get('/ubicaciones/plantas');
        setPlantas(plants.data);
      }
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSamplingSuccess = () => {
    setIsAdhocModalOpen(false);
    fetchData();
  };

  const handleReview = async (id, isBatch = false) => {
    try {
      if (isBatch) {
        await inspectionService.reviewBatch(id);
        toast.success('Lote de muestreos revisado y movido a cola de envío');
        setSamplings(prev => prev.filter(s => s.batch_id !== id));
      } else {
        await inspectionService.reviewSampling(id);
        toast.success('Muestreo revisado y movido a cola de envío');
        setSamplings(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      toast.error('Error al revisar muestreo');
    }
  };

  const handleBatchSubmit = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmittingBatch(true);
    try {
      await inspectionService.batchSubmit(selectedIds);
      toast.success(`${selectedIds.length} muestreos enviados exitosamente`);
      setSamplings(prev => prev.filter(s => !selectedIds.includes(s.id)));
      setSelectedIds([]);
    } catch (error) {
      toast.error('Error en el envío por lotes');
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  const toggleSelect = (id, items = null) => {
    if (items && Array.isArray(items)) {
      // If items are provided, it's a group selection
      const allSelected = items.every(it => selectedIds.includes(it.id));
      if (allSelected) {
        setSelectedIds(prev => prev.filter(i => !items.some(it => it.id === i)));
      } else {
        const toAdd = items.filter(it => !selectedIds.includes(it.id)).map(it => it.id);
        setSelectedIds(prev => [...prev, ...toAdd]);
      }
    } else {
      setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredData.length) {
      setSelectedIds([]);
    } else {
      // For toggle all, we need the individual IDs from all entries (including groups)
      const allIds = filteredData.flatMap(item => {
        if (item._isGroup) return item.items.map(it => it.id);
        return isSolicitud ? item.solicitud_muestreo_id : item.id;
      });
      setSelectedIds(allIds);
    }
  };

  const openDetail = (item) => {
    if (item._isGroup) {
      setDetailItem(item.items);
    } else {
      setDetailItem(item);
    }
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailItem(null);
    setIsDetailOpen(false);
    // Refresh data in case some items were validated individually in the modal
    fetchData();
  };

  const filteredData = useMemo(() => {
    let raw = [];
    if (activeTab === 'solicitudes') {
      raw = solicitudes.filter(s => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = s.tipo?.toLowerCase().includes(term) ||
          s.destino?.toLowerCase().includes(term) ||
          s.punto_muestreo?.nombre?.toLowerCase().includes(term) ||
          s.lote_number?.toLowerCase().includes(term) ||
          s.region_swabbed?.toLowerCase().includes(term) ||
          (s.usuario?.nombre && s.usuario.nombre.toLowerCase().includes(term)) ||
          (s.observacion && s.observacion.toLowerCase().includes(term));

        const matchesTab = s.estado_solicitud_id === 1 || s.estado_solicitud_id === 2;
        return matchesSearch && matchesTab;
      });
    } else {
      raw = samplings.filter(s => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = (s.destination && s.destination.toLowerCase().includes(term)) ||
          (s.sample_type && s.sample_type.toLowerCase().includes(term)) ||
          (s.lot_number && s.lot_number.toLowerCase().includes(term)) ||
          (s.region_swabbed && s.region_swabbed.toLowerCase().includes(term)) ||
          (s.id && s.id.toLowerCase().includes(term));
        return matchesSearch;
      });
    }

    // Apply grouping by batch_id
    const groups = {};
    const result = [];

    raw.forEach(item => {
      const bId = item.batch_id;
      if (bId) {
        if (!groups[bId]) {
          groups[bId] = {
            ...item,
            _isGroup: true,
            items: [item]
          };
          result.push(groups[bId]);
        } else {
          groups[bId].items.push(item);
        }
      } else {
        result.push(item);
      }
    });

    return result;
  }, [activeTab, solicitudes, samplings, searchTerm]);

  const getDestinoBadge = (destino) => {
    if (!destino) return <span className="text-text-muted text-xs italic">—</span>;
    const map = {
      'Microbiología': 'bg-purple-100 text-purple-700',
      'Fisicoquímico': 'bg-blue-100 text-blue-700',
      'Retén': 'bg-amber-100 text-amber-700'
    };
    return <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter', map[destino] || 'bg-gray-100 text-gray-600')}>{destino}</span>;
  };

  const getTypeIcon = (tipo) => {
    const map = { 'Agua': Droplets, 'HVAC': Wind, 'Nitrógeno': Wind, 'Aire Comprimido': Wind, 'Aire dentro de equipos': Wind, 'Hisopado': Beaker, 'Producto': Package, 'Materia Prima': Package };
    return map[tipo] || FlaskConical;
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const isSolicitud = activeTab === 'solicitudes';

  // ── Table header configs per tab ──
  const tableHeaders = (() => {
    const common = [
      { label: 'Tipo de Muestreo', className: 'min-w-[140px]' },
      { label: 'Destino / Solicitante', className: 'min-w-[160px]' },
      { label: 'Fecha', className: 'min-w-[100px]' },
    ];

    if (activeTab === 'solicitudes') {
      return [...common,
      { label: 'Fecha Límite', className: 'min-w-[100px]' },
      { label: 'Detalles', className: 'w-[90px] text-center' },
      { label: 'Acción', className: 'w-[160px] text-center' },
      ];
    }
    if (activeTab === 'revision') {
      return [...common,
      { label: 'Detalles', className: 'w-[90px] text-center' },
      { label: 'Acción', className: 'w-[160px] text-center' },
      ];
    }
    // espera
    return [
      { label: '', className: 'w-[40px]' }, // checkbox
      ...common,
      { label: 'Detalles', className: 'w-[90px] text-center' },
      { label: 'Estado', className: 'w-[140px] text-center' },
    ];
  })();

  return (
    <AnimatedPage className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-text-main tracking-tight">Gestión de Muestreos</h1>
          <p className="text-text-muted font-medium">Panel operativo de auditoría y envíos para Inspectores.</p>
        </div>
        <Button
          onClick={() => setIsAdhocModalOpen(true)}
          className="h-12 px-6 bg-secondary text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-secondary/20 flex items-center gap-2"
        >
          <Plus size={18} /> Inspección Ad-hoc
        </Button>
      </div>

      {/* Modal Inspección Ad-hoc */}
      {isAdhocModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-text-main/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[95vh] overflow-hidden bg-white rounded-3xl border border-border-light">
            <button
              onClick={() => setIsAdhocModalOpen(false)}
              className="absolute top-6 right-6 z-10 p-2 text-text-muted hover:text-text-main hover:bg-bg-surface rounded-full transition-all"
            >
              <X size={20} />
            </button>
            <div className="overflow-y-auto p-8">
              <InspectorSamplingForm
                onSuccess={handleSamplingSuccess}
                onCancel={() => setIsAdhocModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && (
        <SamplingDetailModal
          item={detailItem}
          isSolicitud={isSolicitud}
          onClose={closeDetail}
          onReviewItem={(id) => handleReview(id, false)}
          onReviewBatch={(batchId) => handleReview(batchId, true)}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border-light pb-px overflow-x-auto">
        {[
          { id: 'solicitudes', label: 'Solicitudes Pendientes', icon: <Clock size={16} /> },
          { id: 'revision', label: 'Revisión de Muestreos', icon: <Layers size={16} /> },
          { id: 'espera', label: 'Espera de Envío', icon: <Send size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-6 py-4 text-sm font-black uppercase tracking-widest transition-all relative flex items-center gap-2 whitespace-nowrap",
              activeTab === tab.id ? "text-primary border-b-2 border-primary" : "text-text-muted hover:text-text-main"
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <Input
            placeholder="Buscar por tipo, destino, lote o notas..."
            className="pl-12 h-12 bg-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {activeTab === 'espera' && filteredData.length > 0 && (
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
            >
              {selectedIds.length === filteredData.length ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
              Seleccionar Todos
            </button>
            <Button
              disabled={selectedIds.length === 0 || isSubmittingBatch}
              onClick={handleBatchSubmit}
              className="flex-1 md:flex-none h-12 px-8 bg-success text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-success/20 flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmittingBatch ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" /> : <Send size={16} />}
              Enviar Lote ({selectedIds.length})
            </Button>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-xl h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20 bg-bg-surface">
            <p className="text-text-muted font-bold italic">No hay registros que coincidan con la vista actual.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border-light bg-bg-surface/60">
                  {tableHeaders.map((h, i) => (
                    <th
                      key={i}
                      className={cn(
                        "px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-text-muted",
                        h.className
                      )}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => {
                  const itemId = isSolicitud ? item.solicitud_muestreo_id : item.id;
                  const tipo = isSolicitud ? item.tipo : (item.sample_type || '—');
                  const destino = isSolicitud ? item.destino : item.destination;
                  const fecha = isSolicitud ? item.fecha : item.start_datetime;
                  const Icon = getTypeIcon(tipo);

                  // Group logic
                  const isGroup = item._isGroup;
                  const groupItems = isGroup ? item.items : [item];
                  const allSelected = groupItems.every(it => selectedIds.includes(it.id || it.solicitud_muestreo_id));
                  const someSelected = groupItems.some(it => selectedIds.includes(it.id || it.solicitud_muestreo_id));
                  const isSelected = !isSolicitud && allSelected;

                  return (
                    <tr
                      key={isGroup ? `group-${item.batch_id}` : itemId}
                      className={cn(
                        "border-b border-border-light/60 hover:bg-primary/[0.02] transition-colors",
                        isSelected && "bg-primary/5"
                      )}
                    >
                      {/* Checkbox for espera tab */}
                      {activeTab === 'espera' && (
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleSelect(itemId, isGroup ? item.items : null)}
                            className="text-primary transition-transform active:scale-90"
                          >
                            {allSelected ? (
                              <CheckSquare size={20} />
                            ) : someSelected ? (
                              <div className="relative">
                                <Square size={20} className="text-border-light" />
                                <div className="absolute inset-1 bg-primary/40 rounded-sm" />
                              </div>
                            ) : (
                              <Square size={20} className="text-border-light hover:text-primary" />
                            )}
                          </button>
                        </td>
                      )}

                      {/* Tipo de Muestreo */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={cn("p-1.5 rounded-lg", isSolicitud ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary")}>
                            <Icon size={14} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-text-main">{tipo}</span>
                            {isGroup && (
                              <span className="text-[10px] text-text-muted font-black uppercase">
                                {groupItems.length} Muestras
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Destino / Solicitante */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {getDestinoBadge(destino)}
                          {(isSolicitud && item.usuario) && (
                            <span className="text-[11px] text-text-muted font-medium">
                              {item.usuario.nombre || ''} {item.usuario.apellido || ''}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Fecha */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-text-main">{formatDate(fecha)}</span>
                      </td>

                      {/* Fecha Límite (only solicitudes) */}
                      {activeTab === 'solicitudes' && (
                        <td className="px-4 py-3">
                          {item.fecha_limite ? (
                            <span className={cn(
                              "text-sm font-bold",
                              new Date(item.fecha_limite) < new Date() ? "text-error" : "text-text-main"
                            )}>
                              {formatDate(item.fecha_limite)}
                            </span>
                          ) : (
                            <span className="text-xs text-text-muted italic">—</span>
                          )}
                        </td>
                      )}

                      {/* Detalles Button */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openDetail(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-surface hover:bg-primary/10 text-text-muted hover:text-primary text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          <Eye size={13} /> Ver
                        </button>
                      </td>

                      {/* Action Column */}
                      {activeTab === 'solicitudes' && (
                        <td className="px-4 py-3 text-center">
                          <Button className="h-8 px-4 rounded-lg bg-primary text-white font-black text-[10px] uppercase tracking-widest">
                            <Plus size={12} className="mr-1" /> Muestrear
                          </Button>
                        </td>
                      )}

                      {activeTab === 'revision' && (
                        <td className="px-4 py-3 text-center">
                          <Button
                            onClick={() => handleReview(isGroup ? item.batch_id : itemId, isGroup)}
                            className="h-8 px-4 rounded-lg bg-secondary text-white font-black text-[10px] uppercase tracking-widest"
                          >
                            <Check size={12} className="mr-1" /> Validar {isGroup ? 'Lote' : ''}
                          </Button>
                        </td>
                      )}

                      {activeTab === 'espera' && (
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-success/10 text-success font-black text-[10px] uppercase tracking-widest">
                            {isGroup ? `${groupItems.length} Listos` : 'Listo'}
                          </span>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default InspectorSamplingPage;
