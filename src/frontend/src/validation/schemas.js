/**
 * schemas.js — Schemas Zod centralizados para el sistema LIMS.
 * Cada módulo define sus propios schemas de creación/edición.
 *
 * Convenciones:
 *   - Los mensajes de error están en español.
 *   - Los campos opcionales usan .optional() o .nullable().
 *   - Los IDs numéricos reciben strings desde inputs HTML y se coerc con z.coerce.number().
 *   - Se aplica .trim() a todos los strings para evitar entradas vacías con espacios.
 */
import { z } from 'zod';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const requiredStr = (msg = 'Campo requerido', min = 1, max = 255) => 
    z.string().trim().min(min, min > 1 ? `Debe tener al menos ${min} caracteres` : msg).max(max, `Máximo ${max} caracteres`);

const positiveInt = (msg = 'Debe ser un número entero positivo') =>
    z.coerce.number({ invalid_type_error: msg }).int().min(1, msg);

const positiveNum = (msg = 'Debe ser un número positivo') =>
    z.coerce.number({ invalid_type_error: msg }).positive(msg);

const nonNegativeNum = (msg = 'No puede ser un número negativo') =>
    z.coerce.number({ invalid_type_error: msg }).min(0, msg);

// ─── Equipos ──────────────────────────────────────────────────────────────────

export const equipoSchema = z.object({
    codigo: requiredStr('El código es obligatorio', 1, 50),
    nombre: requiredStr('El nombre es obligatorio', 3, 100),
    tipo_equipo_id: positiveInt('Tipo de equipo inválido'),
    estado_equipo_id: positiveInt('Estado de equipo inválido'),
    area_id: positiveInt('Área inválida'),
});

// ─── Plantas / Ubicaciones ────────────────────────────────────────────────────

export const plantaSchema = z.object({
    codigo: requiredStr('El código es obligatorio', 1, 20),
    nombre: requiredStr('El nombre es obligatorio', 3, 100),
    sistema_id: positiveInt('Sistema inválido'),
    activo: z.boolean().default(true),
});

// ─── Muestras / Solicitudes ───────────────────────────────────────────────────

export const solicitudMuestreoSchema = z.object({
    tipo: z.enum(['Ambiental', 'Producto', 'Proceso', 'Personal', 'Agua'], {
        errorMap: () => ({ message: 'Seleccioná un tipo de muestreo válido' }),
    }),
    equipo_instrumento_id: z.coerce.number().int().positive().nullable().optional()
        .transform(v => (v === 0 || isNaN(v)) ? null : v),
    observacion: z.string().trim().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
    estado_solicitud_id: z.coerce.number().int().default(1),
});

export const solicitudMuestreoEditSchema = z.object({
    observacion: z.string().trim().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
});

// ─── Análisis ───────────────────────────────────────────────────────────────

export const analisisSchema = z.object({
    tipo_analisis: z.enum(['microbiologico', 'fisicoquimico', 'ambiental', 'producto'], {
        errorMap: () => ({ message: 'Seleccioná un tipo de análisis válido' }),
    }),
    operario_id: z.coerce.number().int().positive().nullable().optional()
        .transform(v => (v === 0 || isNaN(v)) ? null : v),
    descripcion: z.string().trim().max(1000, 'Máximo 1000 caracteres').optional().or(z.literal('')),
});

export const analisisEditSchema = z.object({
    descripcion: z.string().trim().max(1000, 'Máximo 1000 caracteres').optional().or(z.literal('')),
});

// ─── Inventario — Polvos ─────────────────────────────────────────────────────

export const polvoSchema = z.object({
    nombre: requiredStr('El nombre es obligatorio', 3, 100),
    codigo: z.string().trim().max(50, 'Máximo 50 caracteres').optional().or(z.literal('')),
    unidad: requiredStr('La unidad es obligatoria', 1, 20),
});

export const polvoEditSchema = z.object({
    nombre: requiredStr('El nombre es obligatorio', 3, 100),
});

// ─── Inventario — Medios ──────────────────────────────────────────────────────

export const medioSchema = z.object({
    nombre: requiredStr('El nombre es obligatorio', 3, 100),
    tipo: z.enum(['agar', 'caldo', 'solución', 'buffer'], {
        errorMap: () => ({ message: 'Seleccioná un tipo válido' }),
    }),
    volumen_ml: positiveNum('El volumen debe ser un número positivo'),
});

// ─── Manufactura — Órdenes ────────────────────────────────────────────────────

export const ordenManufacturaSchema = z.object({
    codigo: requiredStr('El código es obligatorio', 1, 50),
    lote: requiredStr('El lote es obligatorio', 1, 50),
    fecha: requiredStr('La fecha es obligatoria'),
    producto_id: positiveInt('El ID de producto debe ser positivo'),
    cantidad: positiveNum('La cantidad debe ser un número positivo'),
    unidad: requiredStr('La unidad es obligatoria', 1, 20),
    operario_id: positiveInt('El ID de operario debe ser positivo'),
});

// ─── Manufactura — Procesos ───────────────────────────────────────────────────

export const procesoManufacturaSchema = z.object({
    orden_manufactura_id: positiveInt('El ID de orden debe ser positivo'),
    estado_manufactura_id: positiveInt('El estado debe ser positivo'),
    observacion: z.string().trim().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
});

export const cambioEstadoSchema = z.object({
    nuevo_estado_id: positiveInt('El ID de estado debe ser positivo'),
    usuario_id: positiveInt('El ID de usuario debe ser positivo'),
});
