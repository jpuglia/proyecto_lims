import React, { useState, useEffect } from 'react';
import { Search, Loader2, Check, X, Microscope, Eye, Play, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import sampleService from '../../api/sampleService';
import { analysisService } from '../../api/analysisService';
import { masterService } from '../../api/masterService';
import api from '../../api/axios';

const ReceptionTab = () => {
    const [shipments, setShipments] = useState([]);
    const [receptions, setReceptions] = useState([]);
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [selectedShipment, setSelectedShipment] = useState(null);
    const [isReceptionModalOpen, setIsReceptionModalOpen] = useState(false);
    const [isExecuteModalOpen, setIsExecuteModalOpen] = useState(false);
    
    const [receptionForm, setReceptionForm] = useState({ decision: 'Aprobado', justificacion: '' });
    const [selectedMethods, setSelectedMethods] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [envios, recs, meths] = await Promise.all([
                api.get('/muestreo/envios'),
                api.get('/muestreo/recepciones'),
                masterService.getMetodoVersions()
            ]);
            setShipments(envios.data);
            setReceptions(recs.data);
            setMethods(meths);
        } catch (error) {
            toast.error('Error al cargar datos de recepción');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReception = (shipment) => {
        setSelectedShipment(shipment);
        setReceptionForm({ decision: 'Aprobado', justificacion: '' });
        setIsReceptionModalOpen(true);
    };

    const handleOpenExecute = (shipment, reception) => {
        setSelectedShipment({ ...shipment, reception });
        setSelectedMethods([]);
        setIsExecuteModalOpen(true);
    };

    const onSubmitReception = async () => {
        if (receptionForm.decision !== 'Aprobado' && !receptionForm.justificacion) {
            toast.error('La justificación es obligatoria.');
            return;
        }
        setSubmitting(true);
        try {
            await sampleService.receiveSample({
                envio_muestra_id: selectedShipment.envio_muestra_id,
                operario_id: 1, // Current User ID
                decision: receptionForm.decision,
                justificacion: receptionForm.justificacion,
                laboratorio_id: selectedShipment.laboratorio_id
            });
            toast.success('Muestra recibida');
            setIsReceptionModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Error al recibir muestra');
        } finally {
            setSubmitting(false);
        }
    };

    const onSubmitExecute = async () => {
        if (selectedMethods.length === 0) {
            toast.error('Seleccione al menos un método.');
            return;
        }
        setSubmitting(true);
        try {
            await analysisService.createBulk({
                muestra_id: selectedShipment.muestra_id,
                recepcion_id: selectedShipment.reception.recepcion_id,
                metodos_versions_ids: selectedMethods,
                operario_id: 1 // Current User ID
            });
            toast.success('Análisis creados correctamente');
            setIsExecuteModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Error al iniciar análisis');
        } finally {
            setSubmitting(false);
        }
    };

    const getReception = (shipmentId) => receptions.find(r => r.envio_muestra_id === shipmentId);

    const getStatusColor = (decision) => {
        switch (decision) {
            case 'Aprobado': return 'bg-green-500/20 text-green-300';
            case 'Aprobado Parcial': return 'bg-yellow-500/20 text-yellow-300';
            case 'Rechazado': return 'bg-red-500/20 text-red-300';
            default: return 'bg-blue-500/20 text-blue-300';
        }
    };

    const filteredShipments = shipments.filter(s => 
        s.envio_muestra_id.toString().includes(searchTerm) ||
        s.muestra_id.toString().includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="glass-card p-4 flex-1">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por ID de muestra o envío..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-accent-primary transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <button 
                    onClick={() => toast.info('Funcionalidad de creación rápida de muestra en desarrollo')}
                    className="h-[66px] px-8 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3"
                >
                    <Plus size={18} className="text-accent-primary" />
                    Nueva Muestra
                </button>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-white/10 text-text-muted uppercase tracking-wider text-[10px] font-black">
                            <th className="px-6 py-4">Muestra</th>
                            <th className="px-6 py-4">Envío</th>
                            <th className="px-6 py-4">Laboratorio</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan="5" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-accent-primary" /></td></tr>
                        ) : filteredShipments.length === 0 ? (
                            <tr><td colSpan="5" className="py-20 text-center text-text-muted italic">No hay muestras para recibir.</td></tr>
                        ) : filteredShipments.map((s) => {
                            const reception = getReception(s.envio_muestra_id);
                            return (
                                <tr key={s.envio_muestra_id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-bold text-accent-primary">#{s.muestra_id}</td>
                                    <td className="px-6 py-4 text-text-muted font-mono text-xs">ENV-{s.envio_muestra_id}</td>
                                    <td className="px-6 py-4 font-medium text-white">{s.laboratorio_id === 1 ? 'Microbiología' : 'Físico-Químico'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${getStatusColor(reception?.decision || 'Pendiente')}`}>
                                            {reception?.decision || 'Pendiente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {!reception ? (
                                                <button 
                                                    onClick={() => handleOpenReception(s)}
                                                    className="px-4 py-1.5 rounded-lg bg-accent-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent-primary/20 hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    Recibir
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleOpenExecute(s, reception)}
                                                    className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                                >
                                                    <Play size={10} /> Ejecutar
                                                </button>
                                            )}
                                            <button className="p-1.5 rounded-lg bg-white/5 text-text-muted hover:text-white transition-all">
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal Recepción */}
            {isReceptionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h3 className="text-xl font-black">Recepción de Muestra #{selectedShipment?.muestra_id}</h3>
                            <button onClick={() => setIsReceptionModalOpen(false)} className="p-2 text-text-muted hover:text-white transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-text-muted tracking-widest">Decisión de Calidad</label>
                                <select 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-primary outline-none transition-all font-bold"
                                    value={receptionForm.decision}
                                    onChange={(e) => setReceptionForm({...receptionForm, decision: e.target.value})}
                                >
                                    <option value="Aprobado">Aprobar Total</option>
                                    <option value="Aprobado Parcial">Aprobación Parcial</option>
                                    <option value="Rechazado">Rechazo Total</option>
                                </select>
                            </div>
                            {receptionForm.decision !== 'Aprobado' && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black uppercase text-text-muted tracking-widest">Justificación</label>
                                    <textarea 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-primary outline-none transition-all font-medium min-h-[100px]"
                                        placeholder="Indique los motivos..."
                                        value={receptionForm.justificacion}
                                        onChange={(e) => setReceptionForm({...receptionForm, justificacion: e.target.value})}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                            <button onClick={() => setIsReceptionModalOpen(false)} className="px-6 py-2 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all text-xs uppercase">Cancelar</button>
                            <button 
                                onClick={onSubmitReception} 
                                disabled={submitting}
                                className="px-8 py-2 rounded-xl bg-accent-primary text-white font-black shadow-lg shadow-accent-primary/20 hover:brightness-110 transition-all flex items-center gap-2 text-xs uppercase"
                            >
                                {submitting && <Loader2 className="animate-spin" size={14} />} Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ejecutar (Selección de Métodos) */}
            {isExecuteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div>
                                <h3 className="text-xl font-black">Planificar Análisis</h3>
                                <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Muestra #{selectedShipment?.muestra_id}</p>
                            </div>
                            <button onClick={() => setIsExecuteModalOpen(false)} className="p-2 text-text-muted hover:text-white transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <p className="text-sm text-text-muted italic">Seleccione los métodos analíticos que se aplicarán a esta muestra:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {methods.map((m) => {
                                    const isSelected = selectedMethods.includes(m.metodo_version_id);
                                    return (
                                        <div 
                                            key={m.metodo_version_id}
                                            onClick={() => {
                                                if (isSelected) setSelectedMethods(selectedMethods.filter(id => id !== m.metodo_version_id));
                                                else setSelectedMethods([...selectedMethods, m.metodo_version_id]);
                                            }}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${isSelected ? 'bg-accent-primary/20 border-accent-primary' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                        >
                                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-accent-primary text-white' : 'bg-white/10 text-text-muted'}`}>
                                                <Microscope size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-white text-sm">{m.metodo_id} (v{m.version})</h4>
                                                <p className="text-[10px] text-text-muted font-bold uppercase">{m.codigo || 'METH-X'}</p>
                                            </div>
                                            {isSelected && <Check size={18} className="text-accent-primary" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/10 flex justify-between items-center bg-white/5">
                            <span className="text-xs font-black text-accent-primary uppercase tracking-widest">{selectedMethods.length} seleccionados</span>
                            <div className="flex gap-3">
                                <button onClick={() => setIsExecuteModalOpen(false)} className="px-6 py-2 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all text-xs uppercase">Cancelar</button>
                                <button 
                                    onClick={onSubmitExecute}
                                    disabled={submitting || selectedMethods.length === 0}
                                    className="px-8 py-2 rounded-xl bg-grad-primary text-white font-black shadow-lg shadow-accent-primary/20 hover:brightness-110 transition-all flex items-center gap-2 text-xs uppercase disabled:opacity-50"
                                >
                                    {submitting && <Loader2 className="animate-spin" size={14} />} Iniciar Análisis
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceptionTab;
