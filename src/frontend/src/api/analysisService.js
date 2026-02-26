import api from './axios';

const BASE = '/api/analisis';

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
};
