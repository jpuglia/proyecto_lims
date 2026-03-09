import api from './axios';

const BASE = '/master';

export const masterService = {
    getMetodos: () =>
        api.get(`${BASE}/metodos`).then((r) => r.data),

    getMetodoVersions: () =>
        api.get(`${BASE}/metodo-versiones`).then((r) => r.data),

    getEspecificaciones: () =>
        api.get(`${BASE}/especificaciones`).then((r) => r.data),

    getTiposSolicitud: (activo) =>
        api.get(`${BASE}/tipos-solicitud`, { params: { activo } }).then((r) => r.data),

    createTipoSolicitud: (data) =>
        api.post(`${BASE}/tipos-solicitud`, data).then((r) => r.data),

    updateTipoSolicitud: (id, data) =>
        api.put(`${BASE}/tipos-solicitud/${id}`, data).then((r) => r.data),
};
