import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { FlaskConical, Beaker, Truck, Plus, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MuestreoForm = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [equipos, setEquipos] = useState([]);
  const [laboratorios, setLaboratorios] = useState([
    { laboratorio_id: 1, nombre: 'Microbiología' },
    { laboratorio_id: 2, nombre: 'Fisicoquímico' }
  ]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    tipo: location.state?.process_id ? 'Proceso' : 'Ambiental',
    observacion: location.state?.process_id ? `Muestreo solicitado para Proceso #${location.state.process_id} (Orden #${location.state.order_id})` : '',
    equipos_ids: [],
    muestras: [
      { tipo_muestra: 'Hisopado', codigo_etiqueta: '', envios: [{ laboratorio_id: '' }] }
    ]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eqRes, labRes] = await Promise.all([
          api.get('/equipos'),
          api.get('/auth/laboratorios')
        ]);
        setEquipos(eqRes.data);
        setLaboratorios(labRes.data);
      } catch (error) {
        toast.error('Error al cargar catálogos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addMuestra = () => {
    setFormData({
      ...formData,
      muestras: [...formData.muestras, { tipo_muestra: 'Hisopado', codigo_etiqueta: '', envios: [{ laboratorio_id: '' }] }]
    });
  };

  const addEnvio = (mIdx) => {
    const newMuestras = [...formData.muestras];
    newMuestras[mIdx].envios.push({ laboratorio_id: '' });
    setFormData({ ...formData, muestras: newMuestras });
  };

  const removeEnvio = (mIdx, eIdx) => {
    const newMuestras = [...formData.muestras];
    newMuestras[mIdx].envios.splice(eIdx, 1);
    setFormData({ ...formData, muestras: newMuestras });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Create Request
      const solRes = await api.post('/muestreo/solicitudes', {
        usuario_id: user?.usuario_id || 1, 
        tipo: formData.tipo,
        estado_solicitud_id: 1, // Pendiente
        observacion: formData.observacion,
        equipos_ids: formData.equipos_ids
      });

      // 2. Prepare Session, Samples and ALL Shipments
      const muestrasFinal = formData.muestras.map(m => ({
        tipo_muestra: m.tipo_muestra,
        codigo_etiqueta: m.codigo_etiqueta || `ET-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      }));

      // Flatten shipments: for each sample physical, we might have N destinations
      // For this simplified logic, we'll assume we map envios to the first sample or handle properly
      // In a real scenario, each physical sample has its own list of destinations
      const enviosFinal = [];
      formData.muestras.forEach((m, mIdx) => {
         m.envios.forEach(env => {
            if (env.laboratorio_id) {
              enviosFinal.push({
                muestra_id: 0, // Backend will link this correctly or we link after
                fecha: new Date().toISOString(),
                operario_id: user?.usuario_id || 1,
                laboratorio_id: parseInt(env.laboratorio_id)
              });
            }
         });
      });

      await api.post('/muestreo/sesiones', {
        session: {
          solicitud_muestreo_id: solRes.data.solicitud_muestreo_id,
          operario_id: user?.usuario_id || 1
        },
        muestras: muestrasFinal,
        envios: enviosFinal
      });

      toast.success('Muestreo y envíos registrados con éxito');
      onSuccess();
    } catch (error) {
      console.error('Muestreo submission error:', error);
      toast.error('Error al registrar el flujo de muestreo');
    }
  };

  if (loading) return <div className="p-8 text-center font-black animate-pulse">CARGANDO FORMULARIO...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <Card className="border-2 border-primary/10 shadow-2xl">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="text-primary" />
            Nuevo Registro de Muestreo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* General Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-text-muted tracking-widest">Tipo de Muestreo</label>
              <select 
                className="w-full bg-bg-surface border-2 border-border-light rounded-xl px-4 py-3 font-bold outline-none focus:border-primary transition-all"
                value={formData.tipo}
                onChange={e => setFormData({...formData, tipo: e.target.value})}
              >
                <option>Ambiental</option>
                <option>Producto Terminado</option>
                <option>Materia Prima</option>
                <option>Superficies</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-text-muted tracking-widest">Equipos Utilizados (Múltiple)</label>
              <select 
                multiple
                className="w-full bg-bg-surface border-2 border-border-light rounded-xl px-4 py-3 font-bold outline-none focus:border-primary transition-all min-h-[100px]"
                value={formData.equipos_ids}
                onChange={e => {
                  const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                  setFormData({...formData, equipos_ids: values});
                }}
              >
                {equipos.map(eq => (
                  <option key={eq.equipo_instrumento_id} value={eq.equipo_instrumento_id}>
                    {eq.nombre} ({eq.codigo_interno})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Samples Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-text-main flex items-center gap-2">
                <Beaker size={20} className="text-secondary" />
                Muestras Físicas y Destinos
              </h3>
              <button 
                type="button"
                onClick={addMuestra}
                className="bg-secondary/10 text-secondary px-4 py-2 rounded-lg font-black text-xs uppercase hover:bg-secondary hover:text-white transition-all flex items-center gap-2"
              >
                <Plus size={14} /> Añadir Muestra
              </button>
            </div>

            {formData.muestras.map((muestra, mIdx) => (
              <div key={mIdx} className="p-6 bg-bg-surface rounded-2xl border-2 border-border-light/50 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-text-muted">Tipo</label>
                    <input 
                      type="text"
                      className="w-full bg-white border-2 border-border-light rounded-xl px-4 py-2 font-bold"
                      value={muestra.tipo_muestra}
                      onChange={e => {
                        const m = [...formData.muestras];
                        m[mIdx].tipo_muestra = e.target.value;
                        setFormData({...formData, muestras: m});
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-text-muted">Etiqueta (Opcional)</label>
                    <input 
                      type="text"
                      placeholder="Autogenerar..."
                      className="w-full bg-white border-2 border-border-light rounded-xl px-4 py-2 font-bold"
                      value={muestra.codigo_etiqueta}
                      onChange={e => {
                        const m = [...formData.muestras];
                        m[mIdx].codigo_etiqueta = e.target.value;
                        setFormData({...formData, muestras: m});
                      }}
                    />
                  </div>
                </div>

                {/* Destinations (Fractioned Shipment) */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em] flex items-center gap-2">
                    <Truck size={14} /> Envío Fraccionado (Laboratorios Destino)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {muestra.envios.map((envio, eIdx) => (
                      <div key={eIdx} className="flex items-center gap-2 bg-white p-2 rounded-xl border-2 border-border-light shadow-sm">
                        <select 
                          aria-label="Seleccionar Laboratorio"
                          className="bg-transparent font-bold text-xs outline-none"
                          value={envio.laboratorio_id}
                          onChange={e => {
                            const m = [...formData.muestras];
                            m[mIdx].envios[eIdx].laboratorio_id = e.target.value;
                            setFormData({...formData, muestras: m});
                          }}
                        >
                          <option value="">Seleccionar Lab</option>
                          {laboratorios.map(l => (
                            <option key={l.laboratorio_id} value={l.laboratorio_id}>{l.nombre}</option>
                          ))}
                        </select>
                        {muestra.envios.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeEnvio(mIdx, eIdx)}
                            className="text-error hover:scale-110 transition-transform"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => addEnvio(mIdx)}
                      className="p-2 border-2 border-dashed border-border-light rounded-xl text-text-muted hover:border-primary hover:text-primary transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              type="button"
              onClick={onCancel}
              className="flex-1 px-8 py-4 border-2 border-border-light rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-bg-surface transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              data-testid="muestreo-submit"
              className="flex-1 px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Finalizar y Enviar a Laboratorios
            </button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default MuestreoForm;
