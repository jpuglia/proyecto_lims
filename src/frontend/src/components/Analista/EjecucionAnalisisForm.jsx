import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { FlaskConical, Beaker, Zap, Save, CheckCircle2 } from 'lucide-react';

const EjecucionAnalisisForm = ({ analysis, onSuccess, onCancel }) => {
  const [equipos, setEquipos] = useState([]);
  const [medios, setMedios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [resultData, setResultData] = useState({
    valor: '',
    valor_numerico: '',
    unidad: '',
    observacion: ''
  });

  const [usage, setUsage] = useState({
    equipo_id: '',
    medio_id: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eqRes, medRes] = await Promise.all([
          api.get('/equipos'),
          api.get('/inventario') // Simplified endpoint
        ]);
        setEquipos(eqRes.data);
        // Assuming inventory returns some stock items
        setMedios(medRes.data?.filter(i => i.tipo === 'Medio') || []);
      } catch (error) {
        toast.error('Error al cargar recursos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const registerUsage = async () => {
    try {
      if (usage.equipo_id) {
        await api.post('/analisis/uso-equipos', {
          analisis_id: analysis.analisis_id,
          equipo_instrumento_id: parseInt(usage.equipo_id)
        });
      }
      toast.success('Recursos vinculados correctamente');
    } catch (error) {
      toast.error('Error al vincular recursos');
    }
  };

  const submitResult = async (isFinal = false) => {
    try {
      await api.post('/analisis/resultados', {
        analisis_id: analysis.analisis_id,
        operario_id: 1, // Current
        valor: resultData.valor,
        valor_numerico: resultData.valor_numerico ? parseFloat(resultData.valor_numerico) : null,
        unidad: resultData.unidad,
        observacion: resultData.observacion
      }, {
        params: { is_final: isFinal }
      });

      toast.success(isFinal ? 'Resultado FINAL registrado' : 'Resultado PRELIMINAR guardado');
      onSuccess();
    } catch (error) {
      toast.error('Error al registrar resultado');
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-text-main">Ejecución de Análisis #{analysis.analisis_id}</h2>
          <p className="text-text-muted font-medium">Muestra vinculada: M-{analysis.muestra_id}</p>
        </div>
        <button onClick={onCancel} className="text-text-muted font-black hover:text-text-main transition-colors">ESCERRAR</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Step 1: Resources */}
        <Card className="border-l-4 border-l-info shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="text-info" size={20} />
              1. Vincular Recursos Utilizados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-text-muted">Equipo / Instrumento</label>
              <select 
                className="w-full bg-bg-surface border-2 border-border-light rounded-xl px-4 py-3 font-bold outline-none focus:border-info transition-all"
                value={usage.equipo_id}
                onChange={e => setUsage({...usage, equipo_id: e.target.value})}
              >
                <option value="">Seleccionar Equipo...</option>
                {equipos.map(eq => (
                  <option key={eq.equipo_instrumento_id} value={eq.equipo_instrumento_id}>{eq.nombre}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={registerUsage}
              className="w-full py-3 bg-info text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-info/20 hover:scale-105 active:scale-95 transition-all"
            >
              Registrar Uso
            </button>
          </CardContent>
        </Card>

        {/* Step 2: Results */}
        <Card className="border-l-4 border-l-primary shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="text-primary" size={20} />
              2. Ingreso de Resultados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text-muted">Valor Numérico</label>
                <input 
                  type="number"
                  className="w-full bg-bg-surface border-2 border-border-light rounded-xl px-4 py-3 font-bold outline-none focus:border-primary"
                  value={resultData.valor_numerico}
                  onChange={e => setResultData({...resultData, valor_numerico: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text-muted">Unidad</label>
                <input 
                  type="text"
                  placeholder="ej. UFC/g"
                  className="w-full bg-bg-surface border-2 border-border-light rounded-xl px-4 py-3 font-bold outline-none focus:border-primary"
                  value={resultData.unidad}
                  onChange={e => setResultData({...resultData, unidad: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-text-muted">Dictamen Textual</label>
              <select 
                className="w-full bg-bg-surface border-2 border-border-light rounded-xl px-4 py-3 font-bold outline-none focus:border-primary"
                value={resultData.valor}
                onChange={e => setResultData({...resultData, valor: e.target.value})}
              >
                <option value="">Seleccionar Dictamen...</option>
                <option value="CUMPLE">CUMPLE</option>
                <option value="NO CUMPLE">NO CUMPLE</option>
                <option value="FUERA DE ESPECIFICACION">OOS (Fuera de Espec.)</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => submitResult(false)}
                className="flex-1 py-4 border-2 border-primary text-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Save size={16} /> Guardar Preliminar
              </button>
              <button 
                onClick={() => submitResult(true)}
                className="flex-1 py-4 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} /> Finalizar Análisis
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EjecucionAnalisisForm;
