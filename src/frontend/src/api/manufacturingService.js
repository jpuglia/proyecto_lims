import api from './axios';

const ORDENES = '/manufactura/ordenes';
const PROCESOS = '/manufactura/procesos';
const ESTADOS = '/manufactura/estados';

export const manufacturingService = {
    // ─── Estados de Manufactura (catálogo) ───────────────────────────────
    getEstados: () =>
        api.get(ESTADOS).then((r) => r.data),

    // ─── Órdenes de Manufactura ──────────────────────────────────────────
    getOrdenes: (skip = 0, limit = 100) =>
        api.get(ORDENES, { params: { skip, limit } }).then((r) => r.data),

    getOrden: (id) =>
        api.get(`${ORDENES}/${id}`).then((r) => r.data),

    createOrden: (data) =>
        api.post(ORDENES, data).then((r) => r.data),

    updateOrden: (id, data) =>
        api.put(`${ORDENES}/${id}`, data).then((r) => r.data),

    deleteOrden: (id) =>
        api.delete(`${ORDENES}/${id}`),

    // ─── Trazabilidad: Procesos de una Orden ─────────────────────────────
    getProcesosOrden: (ordenId) =>
        api.get(`${ORDENES}/${ordenId}/procesos`).then((r) => r.data),

    // ─── Procesos de Manufactura ─────────────────────────────────────────
    getProcesos: (skip = 0, limit = 100) =>
        api.get(PROCESOS, { params: { skip, limit } }).then((r) => r.data),

    createProceso: (data) =>
        api.post(PROCESOS, data).then((r) => r.data),

    // ─── Historial de un Proceso ─────────────────────────────────────────
    getHistorialProceso: (manufacturaId) =>
        api.get(`${PROCESOS}/${manufacturaId}/historial`).then((r) => r.data),

    // ─── Cambio de Estado ────────────────────────────────────────────────
    changeEstado: (manufacturaId, nuevoEstadoId, usuarioId) =>
        api.post(`${PROCESOS}/${manufacturaId}/estado`, {
            nuevo_estado_id: nuevoEstadoId,
            usuario_id: usuarioId,
        }).then((r) => r.data),
};
