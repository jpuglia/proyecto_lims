import api from './axios';

const BASE_URL = 'productos';

export const productService = {
    getAll: (skip = 0, limit = 100) =>
        api.get(BASE_URL, { params: { skip, limit } }).then(r => r.data),

    getById: (id) =>
        api.get(`${BASE_URL}/${id}`).then(r => r.data),

    create: (data) =>
        api.post(BASE_URL, data).then(r => r.data),

    update: (id, data) =>
        api.put(`${BASE_URL}/${id}`, data).then(r => r.data),

    delete: (id) =>
        api.delete(`${BASE_URL}/${id}`),
};
