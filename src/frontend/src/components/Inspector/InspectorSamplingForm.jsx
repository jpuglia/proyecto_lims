import React, { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import {
  FlaskConical, Calendar, Clock, Package,
  MapPin, Scale, Send, Loader2, X, Hash,
  ChevronRight, ArrowLeft, Search, Check, Filter
} from 'lucide-react';

import { inspectionService } from '../../api/inspectionService';
import { productService } from '../../api/productService';
import PlantService from '../../api/plantService';
import SampleService from '../../api/sampleService';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import FormField from '../FormField';
import SearchableSelect from '../ui/SearchableSelect';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { Input } from '../ui/Input';

// ============================================
// VALIDADORES ZOD DINÁMICOS DEPENDIENDO DEL PASO
// ============================================
const samplingSchema = z.object({
  destination: z.enum(["", "Microbiología", "Fisicoquímico", "Retén"], {
    errorMap: () => ({ message: "Destino inválido. Seleccione uno" })
  }),
  sample_type: z.string().optional().nullable(),

  start_datetime: z.string().min(1, "Fecha de inicio requerida"),
  end_datetime: z.string().min(1, "Fecha de fin requerida"),

  // Producto
  product_id: z.string().optional().nullable(),
  lot_number: z.string().optional().nullable(),
  extracted_quantity: z.string().optional().nullable(),

  // Puntos 
  sampling_point_ids: z.array(z.string()).optional().default([]),

  // Hisopado
  equipo_ids: z.array(z.string()).optional().default([]),
  operarios_muestreados_ids: z.array(z.string()).optional().default([]),
  areas_ids: z.array(z.string()).optional().default([]),
  region_swabbed: z.string().optional().nullable()
}).superRefine((data, ctx) => {
  if (!data.destination) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Seleccione un destino", path: ["destination"] });
    return;
  }

  // Validar fechas
  if (data.start_datetime && data.end_datetime) {
    if (new Date(data.end_datetime) <= new Date(data.start_datetime)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Fecha fin debe ser posterior", path: ["end_datetime"] });
    }
  }

  // Lógica específica por destino -> Tipo de Muestra
  if (data.destination === "Microbiología" && !data.sample_type) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Seleccione un tipo de muestra para Microbiología", path: ["sample_type"] });
    return; // Stop here if no sample type
  }

  const isMicro = data.destination === "Microbiología";
  const stype = data.sample_type;

  // Categorías
  const isUtility = isMicro && ["Agua", "HVAC", "Aire Comprimido", "Nitrógeno", "Aire dentro de equipos"].includes(stype);
  const isHisopado = isMicro && stype === "Hisopado";
  const isProdMicro = isMicro && ["Producto", "Materia Prima"].includes(stype);
  const isFisicoOrReten = data.destination === "Fisicoquímico" || data.destination === "Retén";

  if (isUtility) {
    if (!data.sampling_point_ids || data.sampling_point_ids.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Seleccione al menos un Punto de Muestreo", path: ["sampling_point_ids"] });
    }
  }

  if (isHisopado) {
    const hasEquipo = data.equipo_ids && data.equipo_ids.length > 0;
    const hasOperario = data.operarios_muestreados_ids && data.operarios_muestreados_ids.length > 0;
    const hasArea = data.areas_ids && data.areas_ids.length > 0;

    if (!hasEquipo && !hasOperario && !hasArea) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe seleccionar al menos un Equipo, Operario o Área", path: ["equipo_ids"] });
    }
    // Only require top-level region_swabbed if NOT using Equipo-based selection 
    // (which handles it internally via state)
    // In many cases we don't have hisopadoType here, so we might need to skip this 
    // or handle it in onSubmit
  }

  if (isProdMicro || isFisicoOrReten) {
    if (!data.product_id && !data.lot_number) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Seleccione un Producto o Lote manual", path: ["product_id"] });
    }
    if (data.product_id && !data.lot_number) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Indique el Lote", path: ["lot_number"] });
    }
    if (data.lot_number && !data.extracted_quantity) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Cantidad extraída es requerida", path: ["extracted_quantity"] });
    }
  }
});

const DESTINATIONS = [
  { id: "Microbiología", icon: "🦠", desc: "Análisis microbiológico" },
  { id: "Fisicoquímico", icon: "⚗️", desc: "Análisis fisicoquímico" },
  { id: "Retén", icon: "📦", desc: "Muestra para retén" }
];

const MICRO_OPTIONS = [
  { id: "Agua", icon: "💧" },
  { id: "HVAC", icon: "❄️" },
  { id: "Nitrógeno", icon: "💨" },
  { id: "Aire Comprimido", icon: "🌬️" },
  { id: "Aire dentro de equipos", icon: "⚙️" },
  { id: "Hisopado", icon: "🧪" },
  { id: "Producto", icon: "💊" },
  { id: "Materia Prima", icon: "🛢️" }
];

const HISOPADO_TYPES = ["Equipo", "Personal", "Superficies"];

export default function InspectorSamplingForm({ requestId = null, initialData = {}, onSuccess, onCancel, mode = "adhoc" }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loadingContext, setLoadingContext] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Catálogos
  const [products, setProducts] = useState([]);
  const [points, setPoints] = useState([]);
  const [plantas, setPlantas] = useState([]);
  const [sistemas, setSistemas] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [operarios, setOperarios] = useState([]);
  const [areas, setAreas] = useState([]);

  // Filters for utilities
  const [utilSearch, setUtilSearch] = useState('');
  const [utilPlanta, setUtilPlanta] = useState('');
  const [utilSistema, setUtilSistema] = useState('');

  // Filters for areas
  const [areaSearch, setAreaSearch] = useState('');
  const [areaPlanta, setAreaPlanta] = useState('');

  const [hisopadoType, setHisopadoType] = useState('Equipo');
  // equipmentSelections: { [id]: [{ zoneId: string, customArea: string, id: string }] }
  const [equipmentSelections, setEquipmentSelections] = useState({});
  // areaSelections: { [id]: [{ zoneId: string, customArea: string, id: string }] }
  const [areaSelections, setAreaSelections] = useState({});

  const {
    register, handleSubmit, watch, control, setValue, trigger, formState: { errors }
  } = useForm({
    resolver: zodResolver(samplingSchema),
    defaultValues: {
      destination: '',
      sample_type: '',
      start_datetime: new Date().toISOString().slice(0, 16),
      end_datetime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
      product_id: '',
      lot_number: '',
      extracted_quantity: '',
      sampling_point_ids: [],
      equipo_ids: [],
      operarios_muestreados_ids: [],
      areas_ids: [],
      region_swabbed: '',
      ...initialData
    },
    mode: "onChange"
  });

  const watchDestination = watch("destination");
  const watchSampleType = watch("sample_type");

  const toggleSelection = (field, id) => {
    const current = watch(field) || [];
    const idStr = id.toString();
    if (current.includes(idStr)) {
      setValue(field, current.filter(i => i !== idStr), { shouldValidate: true });
      if (field === "equipo_ids") {
        setEquipmentSelections(prev => {
          const next = { ...prev };
          delete next[idStr];
          return next;
        });
      }
      if (field === "areas_ids") {
        setAreaSelections(prev => {
          const next = { ...prev };
          delete next[idStr];
          return next;
        });
      }
    } else {
      setValue(field, [...current, idStr], { shouldValidate: true });
      if (field === "equipo_ids") {
        setEquipmentSelections(prev => ({
          ...prev,
          [idStr]: [{ zoneId: '', customArea: '', id: crypto.randomUUID() }]
        }));
      }
      if (field === "areas_ids") {
        setAreaSelections(prev => ({
          ...prev,
          [idStr]: [{ zoneId: '', customArea: '', id: crypto.randomUUID() }]
        }));
      }
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoadingContext(true);
      try {
        const [pRes, ptRes, plRes, sysRes, eqRes, opRes, arRes] = await Promise.all([
          productService.getAll().catch(() => []),
          PlantService.getPuntosMuestreo().catch(() => []),
          api.get('/ubicaciones/plantas').then(r => r.data).catch(() => []),
          api.get('/ubicaciones/sistemas').then(r => r.data).catch(() => []),
          api.get('/equipos').then(r => r.data).catch(() => []),
          api.get('/auth/operarios').then(r => r.data).catch(() => []),
          api.get('/ubicaciones/areas').then(r => r.data).catch(() => [])
        ]);

        setProducts(pRes.map(p => ({
          ...p, id: p.producto_id.toString(), displayLabel: `${p.codigo} - ${p.nombre}`, searchContent: `${p.codigo} ${p.nombre}`.toLowerCase()
        })));
        setPoints(ptRes);
        setPlantas(plRes);
        setSistemas(sysRes);
        setEquipos(eqRes);
        setOperarios(opRes);
        console.log("AREAS FETCHED:", arRes?.length, arRes?.[0]);
        setAreas(arRes);
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar datos base");
      } finally {
        setLoadingContext(false);
      }
    };
    fetchAll();
  }, []);

  // Filtered Points para Utilities
  const filteredPoints = useMemo(() => {
    return points.filter(p => {
      const matchSearch = p.nombre.toLowerCase().includes(utilSearch.toLowerCase()) || p.codigo.toLowerCase().includes(utilSearch.toLowerCase());
      const matchPlanta = utilPlanta ? p.area?.planta_id === parseInt(utilPlanta) : true;
      const matchSistema = utilSistema ? p.sistema_id === parseInt(utilSistema) : true;
      return matchSearch && matchPlanta && matchSistema;
    });
  }, [points, utilSearch, utilPlanta, utilSistema]);

  const handleNext = async () => {
    if (step === 1 && !watchDestination) {
      toast.error("Seleccione un destino"); return;
    }
    if (step === 2 && watchDestination === "Microbiología" && !watchSampleType) {
      toast.error("Seleccione un tipo de muestra"); return;
    }
    setStep(prev => prev + 1);
  };

  const filteredAreas = useMemo(() => {
    return areas.filter(a => {
      const matchSearch = !areaSearch ||
        a.nombre.toLowerCase().includes(areaSearch.toLowerCase()) ||
        (a.codigo && a.codigo.toLowerCase().includes(areaSearch.toLowerCase()));
      const matchPlanta = !areaPlanta || a.planta_id.toString() === areaPlanta.toString();
      return matchSearch && matchPlanta;
    });
  }, [areas, areaSearch, areaPlanta]);

  const onSubmit = async (data) => {
    // Make sure we validate everything before submitting
    const isValid = await trigger();
    if (!isValid) return;

    const isUtility = data.destination === "Microbiología" && ["Agua", "HVAC", "Aire Comprimido", "Nitrógeno", "Aire dentro de equipos"].includes(data.sample_type);
    const isHisopado = data.destination === "Microbiología" && data.sample_type === "Hisopado";

    // Custom validation for Hisopado Equipos
    if (isHisopado && hisopadoType === 'Equipo') {
      const missingTotal = data.equipo_ids.some(id => {
        const selections = equipmentSelections[id] || [];
        if (selections.length === 0) return true;
        return selections.some(sel => !sel.zoneId || (sel.zoneId === 'custom' && !sel.customArea));
      });

      if (missingTotal) {
        toast.error("Por favor configure al menos un área válida para cada equipo");
        return;
      }
    } else if (isHisopado && hisopadoType === 'Superficies') {
      const missingTotal = data.areas_ids.some(id => {
        const selections = areaSelections[id] || [];
        if (selections.length === 0) return true;
        return selections.some(sel => !sel.zoneId || (sel.zoneId === 'custom' && !sel.customArea));
      });

      if (missingTotal) {
        toast.error("Por favor configure al menos un área de hisopado válida para cada sector");
        return;
      }
    } else if (isHisopado && !data.region_swabbed) {
      toast.error("Especifique la región hisopada");
      return;
    }

    setIsSubmitting(true);
    const batchId = crypto.randomUUID();
    let targets = [];

    if (isUtility && data.sampling_point_ids?.length > 0) {
      targets = data.sampling_point_ids.map(id => ({ sampling_point_id: id }));
    } else if (isHisopado) {
      if (hisopadoType === 'Equipo' && data.equipo_ids?.length > 0) {
        targets = [];
        data.equipo_ids.forEach(id => {
          const selections = equipmentSelections[id] || [];
          const equipment = equipos.find(e => e.equipo_instrumento_id.toString() === id.toString());

          selections.forEach(sel => {
            let region = '';
            if (sel.zoneId === 'custom') {
              region = sel.customArea;
            } else if (sel.zoneId) {
              const zone = equipment?.zonas?.find(z => z.zona_equipo_id.toString() === sel.zoneId.toString());
              region = zone?.nombre || '';
            }
            targets.push({ equipo_id: id, region_swabbed: region });
          });
        });
      } else if (hisopadoType === 'Superficies' && data.areas_ids?.length > 0) {
        targets = [];
        data.areas_ids.forEach(id => {
          const selections = areaSelections[id] || [];
          const areaObj = areas.find(a => a.area_id.toString() === id.toString());

          selections.forEach(sel => {
            let region = '';
            if (sel.zoneId === 'custom') {
              region = sel.customArea;
            } else if (sel.zoneId) {
              const zone = areaObj?.zonas?.find(z => z.zona_area_id.toString() === sel.zoneId.toString());
              region = zone?.nombre || '';
            }
            targets.push({ area_id: id, region_swabbed: region });
          });
        });
      } else if (hisopadoType === 'Personal' && data.operarios_muestreados_ids?.length > 0) {
        targets = data.operarios_muestreados_ids.map(id => ({ operario_muestreado_id: id }));
      }
    } else {
      // Fallback for Product/Fisico/Reten
      targets = [{}];
    }

    try {
      const promises = targets.map((target) => {
        const basePayload = {
          destination: data.destination,
          sample_type: data.sample_type || data.destination,
          start_datetime: data.start_datetime,
          end_datetime: data.end_datetime,
          product_id: data.product_id ? parseInt(data.product_id) : null,
          lot_number: data.lot_number || null,
          extracted_quantity: data.extracted_quantity ? parseFloat(data.extracted_quantity) : null,
          region_swabbed: target.region_swabbed || data.region_swabbed || null,
          batch_id: batchId,

          sampling_point_id: target.sampling_point_id ? parseInt(target.sampling_point_id) : null,
          equipo_id: target.equipo_id ? parseInt(target.equipo_id) : null,
          operario_muestreado_id: target.operario_muestreado_id ? parseInt(target.operario_muestreado_id) : null,
          area_id: target.area_id ? parseInt(target.area_id) : null,
        };

        if (mode === 'solicitud') {
          return SampleService.createSolicitud({
            ...basePayload,
            usuario_id: user?.sub || user?.usuario_id || user?.id,
            tipo: basePayload.sample_type,
            fecha_limite: basePayload.end_datetime,
            equipo_instrumento_id: basePayload.equipo_id,
            operario_id: basePayload.operario_muestreado_id,
            estado_solicitud_id: 1,
            observacion: ""
          });
        } else {
          return inspectionService.createSampling({
            ...basePayload,
            inspector_id: user?.sub || user?.usuario_id || user?.id,
            request_id: requestId,
          });
        }
      });

      await Promise.all(promises);
      toast.success(mode === 'solicitud' ? "Solicitudes creadas exitosamente" : "Muestreos registrados exitosamente");

      if (onSuccess) onSuccess();
    } catch (e) {
      toast.error(e.response?.data?.message || "Error al registrar inspección");
    } finally {
      setIsSubmitting(false);
    }
  };

  // VISTAS PARCIALES
  const renderStep1 = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <h3 className="text-xl font-black text-text-main">1. Seleccione Destino</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DESTINATIONS.map(dest => (
          <div
            key={dest.id}
            onClick={() => setValue("destination", dest.id, { shouldValidate: true })}
            className={cn(
              "cursor-pointer p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 text-center",
              watchDestination === dest.id
                ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                : "border-border-light bg-white hover:border-text-muted/30 hover:bg-bg-surface"
            )}
          >
            <div className="text-4xl">{dest.icon}</div>
            <div>
              <p className="font-black text-text-main">{dest.id}</p>
              <p className="text-xs text-text-muted font-medium mt-1">{dest.desc}</p>
            </div>
            {watchDestination === dest.id && (
              <div className="absolute top-4 right-4 text-primary"><Check size={20} /></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <h3 className="text-xl font-black text-text-main">2. ¿Qué desea muestrear?</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {MICRO_OPTIONS.map(opt => (
          <div
            key={opt.id}
            onClick={() => setValue("sample_type", opt.id, { shouldValidate: true })}
            className={cn(
              "cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center",
              watchSampleType === opt.id
                ? "border-secondary bg-secondary/5 shadow-md shadow-secondary/10"
                : "border-border-light bg-white hover:border-text-muted/30 hover:bg-bg-surface"
            )}
          >
            <div className="text-2xl">{opt.icon}</div>
            <p className="text-xs font-black text-text-main uppercase tracking-tight">{opt.id}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => {
    const isMicro = watchDestination === "Microbiología";
    const stype = watchSampleType;

    const isUtility = isMicro && ["Agua", "HVAC", "Aire Comprimido", "Nitrógeno", "Aire dentro de equipos"].includes(stype);
    const isHisopado = isMicro && stype === "Hisopado";
    const isProd = (isMicro && ["Producto", "Materia Prima"].includes(stype)) || ["Fisicoquímico", "Retén"].includes(watchDestination);

    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <h3 className="text-xl font-black text-text-main">3. Detalles Específicos</h3>

        {/* Fechas Obligatorias */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-bg-surface rounded-2xl border border-border-light">
          <FormField label="Inicio" error={errors.start_datetime}>
            <input type="datetime-local" {...register("start_datetime")} className="w-full bg-white border border-border-light rounded-lg px-3 py-2 text-sm" />
          </FormField>
          <FormField label="Fin" error={errors.end_datetime}>
            <input type="datetime-local" {...register("end_datetime")} className="w-full bg-white border border-border-light rounded-lg px-3 py-2 text-sm" />
          </FormField>
        </div>

        {/* UTILITIES */}
        {isUtility && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <Input className="pl-9 h-10 w-full" placeholder="Buscar punto..." value={utilSearch} onChange={e => setUtilSearch(e.target.value)} />
              </div>
              <select className="h-10 border border-border-light rounded-lg px-3 text-sm bg-white" value={utilPlanta} onChange={e => setUtilPlanta(e.target.value)}>
                <option value="">Planta (Todas)</option>
                {plantas.map(p => <option key={p.planta_id} value={p.planta_id}>{p.nombre}</option>)}
              </select>
              <select className="h-10 border border-border-light rounded-lg px-3 text-sm bg-white" value={utilSistema} onChange={e => setUtilSistema(e.target.value)}>
                <option value="">Sistema (Todos)</option>
                {sistemas.map(s => <option key={s.sistema_id} value={s.sistema_id}>{s.codigo}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border border-border-light rounded-xl bg-bg-surface">
              {filteredPoints.length === 0 && <p className="col-span-full text-center text-sm text-text-muted py-4">No se encontraron puntos</p>}
              {filteredPoints.map(p => {
                const isSelected = (watch("sampling_point_ids") || []).includes(p.punto_muestreo_id.toString());
                return (
                  <div
                    key={p.punto_muestreo_id}
                    onClick={() => toggleSelection("sampling_point_ids", p.punto_muestreo_id)}
                    className={cn("p-3 rounded-lg border text-xs cursor-pointer flex justify-between items-center transition-all",
                      isSelected ? "bg-secondary text-white border-secondary" : "bg-white hover:border-secondary/50 border-border-light"
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold">{p.codigo}</span>
                      <span className="opacity-80 truncate max-w-[120px]">{p.nombre}</span>
                    </div>
                    {isSelected && <Check size={16} />}
                  </div>
                )
              })}
            </div>
            {errors.sampling_point_ids && <p className="text-error text-xs">{errors.sampling_point_ids.message}</p>}
          </div>
        )}

        {/* HISOPADO */}
        {isHisopado && (
          <div className="space-y-6">
            <div className="flex p-1 bg-bg-surface rounded-xl border border-border-light">
              {HISOPADO_TYPES.map(t => (
                <button
                  key={t} type="button"
                  onClick={() => {
                    setHisopadoType(t);
                    setValue("equipo_ids", []);
                    setValue("operarios_muestreados_ids", []);
                    setValue("areas_ids", []);
                  }}
                  className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                    hisopadoType === t ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text-main"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {hisopadoType === 'Equipo' && (
                <FormField label="Seleccione Equipos" error={errors.equipo_ids}>
                  <div className="max-h-60 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2 border border-border-light p-2 rounded-xl bg-bg-surface">
                    {equipos.map(e => {
                      const isSelected = (watch("equipo_ids") || []).includes(e.equipo_instrumento_id.toString());
                      return (
                        <div
                          key={e.equipo_instrumento_id}
                          onClick={() => toggleSelection("equipo_ids", e.equipo_instrumento_id)}
                          className={cn("p-3 rounded-lg border text-xs cursor-pointer flex justify-between items-center transition-all",
                            isSelected ? "bg-primary text-white border-primary" : "bg-white hover:border-primary/50 border-border-light"
                          )}
                        >
                          <span className="truncate">{e.codigo} - {e.nombre}</span>
                          {isSelected && <Check size={16} />}
                        </div>
                      )
                    })}
                  </div>
                </FormField>
              )}

              {/* LISTA DE EQUIPOS CON SELECCION DE ZONA (PARA HISOPADO DE EQUIPOS) */}
              {hisopadoType === 'Equipo' && watch("equipo_ids")?.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border-light/50">
                  <p className="text-sm font-black text-text-main flex items-center gap-2">
                    <Check size={16} className="text-success" />
                    Configure áreas para cada equipo seleccionado:
                  </p>
                  <div className="space-y-3">
                    {watch("equipo_ids").map(eid => {
                      const eq = equipos.find(e => e.equipo_instrumento_id.toString() === eid.toString());
                      if (!eq) return null;
                      const selections = equipmentSelections[eid] || [];

                      const addZone = () => {
                        setEquipmentSelections(prev => ({
                          ...prev,
                          [eid]: [...(prev[eid] || []), { zoneId: '', customArea: '', id: crypto.randomUUID() }]
                        }));
                      };

                      const removeZone = (index) => {
                        setEquipmentSelections(prev => ({
                          ...prev,
                          [eid]: prev[eid].filter((_, i) => i !== index)
                        }));
                      };

                      const updateZone = (index, field, value) => {
                        setEquipmentSelections(prev => ({
                          ...prev,
                          [eid]: prev[eid].map((s, i) => i === index ? { ...s, [field]: value } : s)
                        }));
                      };

                      return (
                        <div key={eid} className="p-4 bg-white border border-border-light rounded-2xl shadow-sm space-y-4">
                          <div className="flex justify-between items-center border-b border-border-light pb-2">
                            <span className="text-sm font-black uppercase text-primary tracking-tight">{eq.codigo} - {eq.nombre}</span>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button" variant="ghost" size="sm"
                                onClick={addZone}
                                className="h-8 px-3 rounded-lg text-secondary hover:bg-secondary/10 font-bold text-[10px] uppercase"
                              >
                                + Agregar Zona
                              </Button>
                              <Button
                                type="button" variant="ghost" size="small"
                                onClick={() => toggleSelection("equipo_ids", eid)}
                                className="h-8 w-8 p-0 rounded-full text-text-muted hover:text-error hover:bg-error/10"
                              >
                                <X size={14} />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {selections.map((sel, idx) => (
                              <div key={sel.id} className="relative group animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-bg-surface/50 rounded-xl border border-dashed border-border-light">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-muted ml-1">Área de Hisopado {selections.length > 1 ? `#${idx + 1}` : ''}</label>
                                    <select
                                      className="w-full h-10 bg-white border border-border-light rounded-lg px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                      value={sel.zoneId}
                                      onChange={(e) => updateZone(idx, 'zoneId', e.target.value)}
                                    >
                                      <option value="">Seleccione Área...</option>
                                      {eq.zonas?.map(z => (
                                        <option key={z.zona_equipo_id} value={z.zona_equipo_id}>{z.nombre}</option>
                                      ))}
                                      <option value="custom">-- Otro (Especificar) --</option>
                                    </select>
                                  </div>

                                  {sel.zoneId === 'custom' && (
                                    <div className="space-y-1 animate-in fade-in slide-in-from-left-2 duration-200">
                                      <label className="text-[10px] font-black uppercase text-text-muted ml-1">Especifique Área</label>
                                      <Input
                                        placeholder="Ej. Pared lateral..."
                                        value={sel.customArea}
                                        onChange={(e) => updateZone(idx, 'customArea', e.target.value)}
                                        className="h-10 text-sm bg-white"
                                      />
                                    </div>
                                  )}

                                  {selections.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeZone(idx)}
                                      className="absolute -top-2 -right-2 h-6 w-6 bg-white border border-border-light rounded-full flex items-center justify-center text-text-muted hover:text-error hover:border-error shadow-sm transition-all"
                                    >
                                      <X size={12} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {hisopadoType === 'Personal' && (
                <FormField label="Seleccione Operarios" error={errors.operarios_muestreados_ids}>
                  <div className="max-h-60 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2 border border-border-light p-2 rounded-xl bg-bg-surface">
                    {operarios.map(o => {
                      const isSelected = (watch("operarios_muestreados_ids") || []).includes(o.operario_id.toString());
                      return (
                        <div
                          key={o.operario_id}
                          onClick={() => toggleSelection("operarios_muestreados_ids", o.operario_id)}
                          className={cn("p-3 rounded-lg border text-xs cursor-pointer flex justify-between items-center transition-all",
                            isSelected ? "bg-primary text-white border-primary" : "bg-white hover:border-primary/50 border-border-light"
                          )}
                        >
                          <span className="truncate">{o.nombre} {o.apellido}</span>
                          {isSelected && <Check size={16} />}
                        </div>
                      )
                    })}
                  </div>
                </FormField>
              )}

              {hisopadoType === 'Superficies' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                      <Input
                        className="pl-9 h-10 w-full"
                        placeholder="Buscar por código o nombre..."
                        value={areaSearch}
                        onChange={e => setAreaSearch(e.target.value)}
                      />
                    </div>
                    <select
                      className="h-10 border border-border-light rounded-lg px-3 text-sm bg-white"
                      value={areaPlanta}
                      onChange={e => setAreaPlanta(e.target.value)}
                    >
                      <option value="">Planta (Todas)</option>
                      {plantas.map(p => <option key={p.planta_id} value={p.planta_id}>{p.nombre}</option>)}
                    </select>
                  </div>

                  <FormField label="Seleccione Áreas" error={errors.areas_ids}>
                    <div className="max-h-60 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2 border border-border-light p-2 rounded-xl bg-bg-surface">
                      {filteredAreas.length === 0 && <p className="col-span-full text-center text-sm text-text-muted py-4">No se encontraron áreas</p>}
                      {filteredAreas.map(a => {
                        const isSelected = (watch("areas_ids") || []).includes(a.area_id.toString());
                        return (
                          <div
                            key={a.area_id}
                            onClick={() => toggleSelection("areas_ids", a.area_id)}
                            className={cn("p-3 rounded-lg border text-xs cursor-pointer flex justify-between items-center transition-all",
                              isSelected ? "bg-primary text-white border-primary" : "bg-white hover:border-primary/50 border-border-light"
                            )}
                          >
                            <div className="flex flex-col">
                              <span className="font-bold">{a.codigo || 'S/C'}</span>
                              <span className="opacity-80 truncate max-w-[150px]">{a.nombre}</span>
                            </div>
                            {isSelected && <Check size={16} />}
                          </div>
                        )
                      })}
                    </div>
                  </FormField>
                </div>
              )}

              {/* LISTA DE AREAS CON SELECCION DE ZONA (PARA HISOPADO DE SUPERFICIES) */}
              {hisopadoType === 'Superficies' && watch("areas_ids")?.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border-light/50">
                  <p className="text-sm font-black text-text-main flex items-center gap-2">
                    <Check size={16} className="text-success" />
                    Configure puntos de hisopado para cada área:
                  </p>
                  <div className="space-y-3">
                    {watch("areas_ids").map(aid => {
                      const areaObj = areas.find(a => a.area_id.toString() === aid.toString());
                      if (!areaObj) return null;
                      const selections = areaSelections[aid] || [];

                      const addZone = () => {
                        setAreaSelections(prev => ({
                          ...prev,
                          [aid]: [...(prev[aid] || []), { zoneId: '', customArea: '', id: crypto.randomUUID() }]
                        }));
                      };

                      const removeZone = (index) => {
                        setAreaSelections(prev => ({
                          ...prev,
                          [aid]: prev[aid].filter((_, i) => i !== index)
                        }));
                      };

                      const updateZone = (index, field, value) => {
                        setAreaSelections(prev => ({
                          ...prev,
                          [aid]: prev[aid].map((s, i) => i === index ? { ...s, [field]: value } : s)
                        }));
                      };

                      return (
                        <div key={aid} className="p-4 bg-white border border-border-light rounded-2xl shadow-sm space-y-4">
                          <div className="flex justify-between items-center border-b border-border-light pb-2">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase text-secondary tracking-tight">
                                Sector: <span className="text-primary">{areaObj.codigo || 'S/C'}</span>
                              </span>
                              <span className="text-sm font-black text-text-main">{areaObj.nombre}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button" variant="ghost" size="sm"
                                onClick={addZone}
                                className="h-8 px-3 rounded-lg text-primary hover:bg-primary/10 font-bold text-[10px] uppercase"
                              >
                                + Agregar Punto
                              </Button>
                              <Button
                                type="button" variant="ghost" size="small"
                                onClick={() => toggleSelection("areas_ids", aid)}
                                className="h-8 w-8 p-0 rounded-full text-text-muted hover:text-error hover:bg-error/10"
                              >
                                <X size={14} />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {selections.map((sel, idx) => (
                              <div key={sel.id} className="relative group animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-bg-surface/50 rounded-xl border border-dashed border-border-light">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-muted ml-1">Zona de Superficie {selections.length > 1 ? `#${idx + 1}` : ''}</label>
                                    <select
                                      className="w-full h-10 bg-white border border-border-light rounded-lg px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                      value={sel.zoneId}
                                      onChange={(e) => updateZone(idx, 'zoneId', e.target.value)}
                                    >
                                      <option value="">Seleccione Zona...</option>
                                      {areaObj.zonas?.map(z => (
                                        <option key={z.zona_area_id} value={z.zona_area_id}>{z.nombre}</option>
                                      ))}
                                      <option value="custom">-- Otro (Especificar) --</option>
                                    </select>
                                  </div>

                                  {sel.zoneId === 'custom' && (
                                    <div className="space-y-1 animate-in fade-in slide-in-from-left-2 duration-200">
                                      <label className="text-[10px] font-black uppercase text-text-muted ml-1">Especifique Zona</label>
                                      <Input
                                        placeholder="Ej. Pestillo, Techo..."
                                        value={sel.customArea}
                                        onChange={(e) => updateZone(idx, 'customArea', e.target.value)}
                                        className="h-10 text-sm bg-white"
                                      />
                                    </div>
                                  )}

                                  {selections.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeZone(idx)}
                                      className="absolute -top-2 -right-2 h-6 w-6 bg-white border border-border-light rounded-full flex items-center justify-center text-text-muted hover:text-error hover:border-error shadow-sm transition-all"
                                    >
                                      <X size={12} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {hisopadoType !== 'Equipo' && hisopadoType !== 'Superficies' && (
                <FormField label="Región Hisopada (Descripción)" error={errors.region_swabbed}>
                  <Input {...register("region_swabbed")} placeholder="Ej. Guante derecho, Pared inferior, Tolva..." className="h-11 bg-white" />
                </FormField>
              )}
            </div>
          </div>
        )}

        {/* PRODUCTO / FISICOQUIMICO / RETEN */}
        {isProd && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Producto" error={errors.product_id}>
              <Controller
                name="product_id" control={control}
                render={({ field }) => (
                  <SearchableSelect
                    {...field} options={products} valueField="id" labelField="displayLabel"
                    searchFields={["codigo", "nombre"]} placeholder="Buscar producto..."
                    error={!!errors.product_id}
                  />
                )}
              />
            </FormField>
            <FormField label="Lote" error={errors.lot_number}>
              <Input {...register("lot_number")} placeholder="Num Lote..." className="bg-white h-[42px]" />
            </FormField>
            <FormField label="Cantidad Extraída" error={errors.extracted_quantity}>
              <Input {...register("extracted_quantity")} type="number" step="0.01" placeholder="Ej. 10.5" className="bg-white h-[42px]" />
            </FormField>
          </div>
        )}
      </div>
    );
  };

  if (loadingContext) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-xs font-black uppercase tracking-widest text-text-muted">Cargando contexto...</p>
      </div>
    );
  }

  // Determine if we need step 2
  const maxSteps = watchDestination === "Microbiología" ? 3 : 2;

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between border-b border-border-light/50 mb-6 pb-4">
        <CardTitle className="text-2xl font-black text-text-main flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <FlaskConical size={24} />
          </div>
          {mode === 'solicitud' ? 'Nueva Solicitud de Muestreo' : 'Registro de Inspección Ad-hoc'}
        </CardTitle>
        <div className="text-xs font-black uppercase tracking-widest text-text-muted bg-bg-surface px-3 py-1.5 rounded-full">
          Paso {step} de {maxSteps}
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {step === 1 && renderStep1()}
        {step === 2 && maxSteps === 3 && renderStep2()}
        {(step === 3 || (step === 2 && maxSteps === 2)) && renderStep3()}

        <div className="flex gap-4 pt-6 border-t border-border-light/50">
          {step > 1 ? (
            <Button
              type="button" variant="outline" onClick={() => setStep(step - 1)}
              className="h-12 px-6 rounded-xl font-black uppercase text-xs tracking-widest"
            >
              <ArrowLeft size={16} className="mr-2" /> Atrás
            </Button>
          ) : (
            <Button
              type="button" variant="outline" onClick={onCancel}
              className="h-12 px-6 rounded-xl font-black uppercase text-xs tracking-widest text-text-muted"
            >
              Cancelar
            </Button>
          )}

          <div className="flex-1" />

          {(step < maxSteps) ? (
            <Button
              type="button" onClick={handleNext}
              className="h-12 px-8 bg-primary text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20"
            >
              Siguiente <ChevronRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button
              type="submit" disabled={isSubmitting}
              className="h-12 px-8 bg-success text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-success/20 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Send size={16} className="mr-2" />}
              Finalizar Carga
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
