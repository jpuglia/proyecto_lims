/**
 * schemas.js — Schemas Zod centralizados para el sistema LIMS.
 * Cada módulo define sus propios schemas de creación/edición.
 *
 * Convenciones:
 *   - Los mensajes de error están en español.
 *   - Los campos opcionales usan .optional() o .nullable().
 *   - Los IDs numéricos reciben strings desde inputs HTML y se coerc con z.coerce.number().
 */
import { z } from 'zod';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const requiredStr = (msg = 'Campo requerido') => z.string().min(1, msg).trim();
const positiveInt = (msg = 'Debe ser un número positivo') =>
    z.coerce.number({ invalid_type_error: msg }).int().positive(msg);
const positiveNum = (msg = 'Debe ser un número positivo') =>
    z.coerce.number({ invalid_type_error: msg }).positive(msg);

// ─── Equipos ──────────────────────────────────────────────────────────────────

export const equipoSchema = z.object({
    codigo: requiredStr('El código es obligatorio')
        .max(50, 'Máximo 50 caracteres'),
    nombre: requiredStr('El nombre es obligatorio')
        .max(100, 'Máximo 100 caracteres'),
    tipo_equipo_id: positiveInt('Tipo de equipo inválido'),
    estado_equipo_id: positiveInt('Estado de equipo inválido'),
    area_id: positiveInt('Área inválida'),
});

// ─── Plantas / Ubicaciones ────────────────────────────────────────────────────

export const plantaSchema = z.object({
    codigo: requiredStr('El código es obligatorio')
        .max(20, 'Máximo 20 caracteres'),
    nombre: requiredStr('El nombre es obligatorio')
        .max(100, 'Máximo 100 caracteres'),
    sistema_id: positiveInt('Sistema inválido'),
    activo: z.boolean().default(true),
});

// ─── Muestras / Solicitudes ───────────────────────────────────────────────────

export const solicitudMuestreoSchema = z.object({
    tipo: z.enum(['Ambiental', 'Producto', 'Proceso', 'Personal', 'Agua'], {
        errorMap: () => ({ message: 'Seleccioná un tipo de muestreo válido' }),
    }),
    equipo_instrumento_id: z.coerce.number().nullable().optional(),
    observacion: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
    estado_solicitud_id: z.coerce.number().int().default(1),
});

export const solicitudMuestreoEditSchema = z.object({
    observacion: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
});

// ─── Análisis ───────────────────────────────────────────────────────────────

export const analisisSchema = z.object({
    tipo_analisis: z.enum(['microbiologico', 'fisicoquimico', 'ambiental', 'producto'], {
        errorMap: () => ({ message: 'Seleccioná un tipo de análisis válido' }),
    }),
    operario_id: z.coerce.number().int().positive().nullable().optional()
        .transform(v => v === 0 ? null : v),
    descripcion: z.string().max(1000, 'Máximo 1000 caracteres').optional().or(z.literal('')),
});

export const analisisEditSchema = z.object({
    descripcion: z.string().max(1000, 'Máximo 1000 caracteres').optional().or(z.literal('')),
});

// ─── Inventario — Polvos ─────────────────────────────────────────────────────

export const polvoSchema = z.object({
    nombre: requiredStr('El nombre es obligatorio')
        .max(100, 'Máximo 100 caracteres'),
    codigo: z.string().max(50, 'Máximo 50 caracteres').optional().or(z.literal('')),
    unidad: requiredStr('La unidad es obligatoria')
        .max(20, 'Máximo 20 caracteres'),
});

export const polvoEditSchema = z.object({
    nombre: requiredStr('El nombre es obligatorio')
        .max(100, 'Máximo 100 caracteres'),
});

// ─── Inventario — Medios ──────────────────────────────────────────────────────

export const medioSchema = z.object({
    nombre: requiredStr('El nombre es obligatorio')
        .max(100, 'Máximo 100 caracteres'),
    tipo: z.enum(['agar', 'caldo', 'solución', 'buffer'], {
        errorMap: () => ({ message: 'Seleccioná un tipo válido' }),
    }),
    volumen_ml: positiveNum('El volumen debe ser un número positivo'),
});

// ─── Manufactura — Órdenes ────────────────────────────────────────────────────

export const ordenManufacturaSchema = z.object({
    codigo: requiredStr('El código es obligatorio')
        .max(50, 'Máximo 50 caracteres'),
    lote: requiredStr('El lote es obligatorio')
        .max(50, 'Máximo 50 caracteres'),
    fecha: requiredStr('La fecha es obligatoria'),
    producto_id: positiveInt('El ID de producto debe ser positivo'),
    cantidad: positiveNum('La cantidad debe ser un número positivo'),
    unidad: requiredStr('La unidad es obligatoria')
        .max(20, 'Máximo 20 caracteres'),
    operario_id: positiveInt('El ID de operario debe ser positivo'),
});

// ─── Manufactura — Procesos ───────────────────────────────────────────────────

export const procesoManufacturaSchema = z.object({
    orden_manufactura_id: positiveInt('El ID de orden debe ser positivo'),
    estado_manufactura_id: positiveInt('El estado debe ser positivo'),
    observacion: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
});

export const cambioEstadoSchema = z.object({
    nuevo_estado_id: positiveInt('El ID de estado debe ser positivo'),
    usuario_id: positiveInt('El ID de usuario debe ser positivo'),
});
