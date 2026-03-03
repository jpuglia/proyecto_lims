import api from './axios';

const BASE = '/analisis';

export const analysisService = {
    getAll: (skip = 0, limit = 100) =>
        api.get(BASE + '/', { params: { skip, limit } }).then((r) => r.data),

    getById: (id) =>
        api.get(`${BASE}/${id}`).then((r) => r.data),

    create: (data) =>
        api.post(BASE + '/', data).then((r) => r.data),

    update: (id, data) =>
        api.put(`${BASE}/${id}`, data).then((r) => r.data),

    delete: (id) =>
        api.delete(`${BASE}/${id}`),

    registerIncubation: (data) =>
        api.post(`${BASE}/incubaciones`, data).then((r) => r.data),

    registerResult: (data) =>
        api.post(`${BASE}/resultados`, data).then((r) => r.data),

    registerUsageMedia: (data) =>
        api.post(`${BASE}/uso-medios`, data).then((r) => r.data),

    registerUsageStrain: (data) =>
        api.post(`${BASE}/uso-cepas`, data).then((r) => r.data),

    getReport: (solicitudId) =>
        api.get(`${BASE}/report/${solicitudId}`).then((r) => r.data),
};
