import { X, MapPin, Package, Beaker, User, Layers, Calendar, FlaskConical, Droplets, Wind, Info, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

/**
 * Modal that displays type-specific details for a sampling item.
 * Works for both SolicitudMuestreo items (solicitudes tab) and Sampling items (revisión/espera tabs).
 */
const SamplingDetailModal = ({
    item: inputItem,
    isSolicitud = false,
    onClose,
    onReviewItem,
    onReviewBatch
}) => {
    if (!inputItem) return null;

    // inputItem can be a single item or an array of items (for grouped batch)
    const items = Array.isArray(inputItem) ? inputItem : [inputItem];
    const item = items[0]; // Primary item for general info (dates, destination, etc.)

    // Normalize fields across the two data shapes
    const tipo = isSolicitud ? item.tipo : (item.sample_type || '—');
    const destino = isSolicitud ? item.destino : item.destination;
    const fecha = isSolicitud ? item.fecha : item.start_datetime;
    const fechaFin = isSolicitud ? null : item.end_datetime;
    const fechaLimite = isSolicitud ? item.fecha_limite : null;
    const observacion = isSolicitud ? item.observacion : null;
    const usuario = isSolicitud ? item.usuario : null;
    // For batching, showing ID of the first or common ID
    const itemId = isSolicitud ? item.solicitud_muestreo_id : item.id;
    const batchId = item.batch_id;

    const hasPendingItems = items.some(it => !isSolicitud && it.status === 'PENDING_REVIEW');

    // ── Determine sampling category ──
    const UTILITY_TYPES = ['Agua', 'HVAC', 'Nitrógeno', 'Aire Comprimido', 'Aire dentro de equipos'];
    const PRODUCT_TYPES = ['Producto', 'Materia Prima'];

    const isUtility = UTILITY_TYPES.includes(tipo);
    const isHisopado = tipo === 'Hisopado';
    const isProduct = PRODUCT_TYPES.includes(tipo);
    const isProductByDestino = !isUtility && !isHisopado && !isProduct &&
        (destino === 'Fisicoquímico' || destino === 'Retén');

    const getDestinoBadge = (d) => {
        if (!d) return null;
        const map = {
            'Microbiología': 'bg-purple-100 text-purple-700',
            'Fisicoquímico': 'bg-blue-100 text-blue-700',
            'Retén': 'bg-amber-100 text-amber-700'
        };
        return (
            <span className={cn('px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter', map[d] || 'bg-gray-100 text-gray-600')}>
                {d}
            </span>
        );
    };

    const getTypeIcon = () => {
        const map = { 'Agua': Droplets, 'HVAC': Wind, 'Nitrógeno': Wind, 'Aire Comprimido': Wind, 'Aire dentro de equipos': Wind, 'Hisopado': Beaker, 'Producto': Package, 'Materia Prima': Package };
        const Icon = map[tipo] || FlaskConical;
        return <Icon size={20} />;
    };

    const DetailRow = ({ label, value, icon: Icon }) => {
        if (!value && value !== 0) return null;
        return (
            <div className="flex items-start gap-3 py-2.5 border-b border-border-light/40 last:border-0">
                {Icon && <Icon size={14} className="text-primary mt-0.5 flex-shrink-0" />}
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider min-w-[120px]">{label}</span>
                <span className="text-sm font-bold text-text-main flex-1">{value}</span>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-text-main/60 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 z-10 p-2 text-text-muted hover:text-text-main hover:bg-bg-surface rounded-full transition-all"
                >
                    <X size={20} />
                </button>

                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border-light pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            {getTypeIcon()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-black">
                                {tipo}
                            </CardTitle>
                            <p className="text-[10px] text-text-muted font-black uppercase tracking-wider mt-0.5">
                                {batchId ? `LOTE DE MUESTREO #${batchId.substring(0, 8)}` : `ID #${isSolicitud ? itemId : (typeof itemId === 'string' ? itemId.substring(0, 8) : itemId)}`}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {getDestinoBadge(destino)}
                            {hasPendingItems && batchId && onReviewBatch && (
                                <Button
                                    onClick={() => onReviewBatch(batchId)}
                                    className="h-7 px-3 bg-secondary text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm"
                                >
                                    <Check size={12} className="mr-1" /> Validar Lote
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="overflow-y-auto p-6 space-y-5">
                    {/* ── Common Info ── */}
                    <div className="space-y-0.5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                            <Info size={12} /> Información General
                        </h4>
                        <div className="bg-bg-surface rounded-xl p-4 border border-border-light/50">
                            {usuario && (
                                <DetailRow icon={User} label="Solicitante" value={`${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || `ID ${usuario.usuario_id}`} />
                            )}
                            <DetailRow icon={Calendar} label="Fecha Solicitud" value={fecha ? new Date(fecha).toLocaleString('es-UY') : '—'} />
                            {fechaFin && (
                                <DetailRow icon={Calendar} label="Fecha Fin" value={new Date(fechaFin).toLocaleString('es-UY')} />
                            )}
                            {fechaLimite && (
                                <DetailRow icon={Calendar} label="Fecha Límite" value={new Date(fechaLimite).toLocaleString('es-UY')} />
                            )}
                            {observacion && (
                                <DetailRow icon={Info} label="Observación" value={observacion} />
                            )}
                        </div>
                    </div>

                    {/* ── Utility Types: Puntos de Muestreo ── */}
                    {isUtility && (
                        <div className="space-y-0.5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                                <MapPin size={12} /> Puntos de Muestreo
                            </h4>
                            <div className="bg-bg-surface rounded-xl p-4 border border-border-light/50 space-y-2">
                                {items.map((it, idx) => {
                                    let pointLabel = "";
                                    let pointValue = "Sin punto asignado";

                                    if (isSolicitud) {
                                        if (it.punto_muestreo) {
                                            pointLabel = it.punto_muestreo.codigo || "Punto";
                                            pointValue = it.punto_muestreo.nombre;
                                        } else if (it.punto_muestreo_id) {
                                            pointValue = `ID ${it.punto_muestreo_id}`;
                                        }
                                    } else {
                                        if (it.sampling_point) {
                                            pointLabel = it.sampling_point.codigo || "Punto";
                                            pointValue = it.sampling_point.nombre;
                                        } else if (it.sampling_point_id) {
                                            pointValue = `ID ${it.sampling_point_id}`;
                                        }
                                    }

                                    return (
                                        <div key={idx} className="flex flex-col group/item">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <DetailRow
                                                        icon={MapPin}
                                                        label={pointLabel || `Muestra ${idx + 1}`}
                                                        value={pointValue}
                                                    />
                                                </div>
                                                {!isSolicitud && it.status === 'PENDING_REVIEW' && onReviewItem && (
                                                    <Button
                                                        onClick={() => onReviewItem(it.id)}
                                                        className="h-6 px-2 bg-success text-white text-[8px] font-black uppercase tracking-widest rounded-md"
                                                    >
                                                        Validar
                                                    </Button>
                                                )}
                                                {!isSolicitud && it.status !== 'PENDING_REVIEW' && (
                                                    <Badge variant="outline" className="text-[8px] h-5 bg-success/10 text-success border-success/20">
                                                        Validado
                                                    </Badge>
                                                )}
                                            </div>
                                            {!isSolicitud && it.id && (
                                                <span className="text-[9px] text-text-muted font-bold uppercase ml-8 mb-1">
                                                    UUID: {it.id.substring(0, 8)}...
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Hisopado ── */}
                    {isHisopado && (
                        <div className="space-y-0.5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                                <Beaker size={12} /> Detalles del Hisopado
                            </h4>
                            <div className="bg-bg-surface rounded-xl p-4 border border-border-light/50 space-y-4">
                                {items.map((it, idx) => (
                                    <div key={idx} className={cn(idx > 0 && "pt-4 border-t border-border-light/30")}>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[9px] font-black text-primary uppercase">
                                                {items.length > 1 ? `Muestra ${idx + 1}` : 'Detalles'}
                                            </p>
                                            {!isSolicitud && it.status === 'PENDING_REVIEW' && onReviewItem && (
                                                <Button
                                                    onClick={() => onReviewItem(it.id)}
                                                    className="h-6 px-2 bg-success text-white text-[8px] font-black uppercase tracking-widest rounded-md"
                                                >
                                                    Validar Muestra
                                                </Button>
                                            )}
                                            {!isSolicitud && it.status !== 'PENDING_REVIEW' && (
                                                <Badge variant="outline" className="text-[8px] h-5 bg-success/10 text-success border-success/20">
                                                    Validado
                                                </Badge>
                                            )}
                                        </div>
                                        {isSolicitud ? (
                                            <>
                                                {it.equipamiento && it.equipamiento.length > 0 && (
                                                    <DetailRow icon={Layers} label="Equipos" value={it.equipamiento.map(eq => `Eq. #${eq.equipo_instrumento_id}`).join(', ')} />
                                                )}
                                                {it.area_id && (
                                                    <DetailRow icon={MapPin} label="Área" value={`Área #${it.area_id}`} />
                                                )}
                                                {it.region_swabbed && (
                                                    <DetailRow icon={Beaker} label="Región Hisopada" value={it.region_swabbed} />
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {it.equipo_id && (
                                                    <DetailRow icon={Layers} label="Equipo" value={`Equipo #${it.equipo_id}`} />
                                                )}
                                                {it.operario_muestreado_id && (
                                                    <DetailRow icon={User} label="Operario" value={`Operario #${it.operario_muestreado_id}`} />
                                                )}
                                                {it.area_id && (
                                                    <DetailRow icon={MapPin} label="Área" value={`Área #${it.area_id}`} />
                                                )}
                                                {it.region_swabbed && (
                                                    <DetailRow icon={Beaker} label="Región Hisopada" value={it.region_swabbed} />
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Producto / Materia Prima ── */}
                    {(isProduct || isProductByDestino) && (
                        <div className="space-y-0.5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                                <Package size={12} /> Detalles del Producto
                            </h4>
                            <div className="bg-bg-surface rounded-xl p-4 border border-border-light/50 space-y-4">
                                {items.map((it, idx) => (
                                    <div key={idx} className={cn(idx > 0 && "pt-4 border-t border-border-light/30")}>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[9px] font-black text-primary uppercase">
                                                {items.length > 1 ? `Muestra ${idx + 1}` : 'Lote Info'}
                                            </p>
                                            {!isSolicitud && it.status === 'PENDING_REVIEW' && onReviewItem && (
                                                <Button
                                                    onClick={() => onReviewItem(it.id)}
                                                    className="h-6 px-2 bg-success text-white text-[8px] font-black uppercase tracking-widest rounded-md"
                                                >
                                                    Validar
                                                </Button>
                                            )}
                                            {!isSolicitud && it.status !== 'PENDING_REVIEW' && (
                                                <Badge variant="outline" className="text-[8px] h-5 bg-success/10 text-success border-success/20">
                                                    Validado
                                                </Badge>
                                            )}
                                        </div>
                                        {isSolicitud ? (
                                            <>
                                                {it.producto_id && (
                                                    <DetailRow icon={Package} label="Producto" value={`Producto #${it.producto_id}`} />
                                                )}
                                                {it.lote_number && (
                                                    <DetailRow icon={Layers} label="Lote" value={it.lote_number} />
                                                )}
                                                {it.cantidad_extraida != null && (
                                                    <DetailRow icon={FlaskConical} label="Cant. Extraída" value={it.cantidad_extraida} />
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {it.product_id && (
                                                    <DetailRow icon={Package} label="Producto" value={`Producto #${it.product_id}`} />
                                                )}
                                                {it.lot_number && (
                                                    <DetailRow icon={Layers} label="Lote" value={it.lot_number} />
                                                )}
                                                {it.extracted_quantity != null && (
                                                    <DetailRow icon={FlaskConical} label="Cant. Extraída" value={it.extracted_quantity} />
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SamplingDetailModal;
