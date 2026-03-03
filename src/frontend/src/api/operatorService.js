import api from './axios';

const BASE_URL = 'auth/operarios';

export const operatorService = {
    getAll: (skip = 0, limit = 100) =>
        api.get(BASE_URL, { params: { skip, limit } }).then(r => r.data),

    getById: (id) =>
        api.get(`${BASE_URL}/${id}`).then(r => r.data),

    create: (data) =>
        api.post(BASE_URL, data).then(r => r.data),
};
