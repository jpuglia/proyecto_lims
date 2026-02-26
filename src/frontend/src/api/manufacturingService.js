import api from './axios';

const ORDENES = '/api/manufactura/ordenes';
const PROCESOS = '/api/manufactura/procesos';

export const manufacturingService = {
    // ─── Órdenes de Manufactura ──────────────────────────────────
    getOrdenes: (skip = 0, limit = 100) =>
        api.get(ORDENES, { params: { skip, limit } }).then((r) => r.data),

    createOrden: (data) =>
        api.post(ORDENES, data).then((r) => r.data),

    updateOrden: (id, data) =>
        api.put(`${ORDENES}/${id}`, data).then((r) => r.data),

    deleteOrden: (id) =>
        api.delete(`${ORDENES}/${id}`),

    // ─── Procesos de Manufactura ─────────────────────────────────
    getProcesos: (skip = 0, limit = 100) =>
        api.get(PROCESOS, { params: { skip, limit } }).then((r) => r.data),

    createProceso: (data) =>
        api.post(PROCESOS, data).then((r) => r.data),

    changeEstado: (manufacturaId, nuevoEstadoId, usuarioId) =>
        api.post(`${PROCESOS}/${manufacturaId}/estado`, {
            nuevo_estado_id: nuevoEstadoId,
            usuario_id: usuarioId,
        }).then((r) => r.data),
};
