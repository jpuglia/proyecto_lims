import api from './axios';

const EquipmentService = {
    getAll: async () => {
        const response = await api.get('/equipos/');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/equipos/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/equipos/', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/equipos/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/equipos/${id}`);
        return response.data;
    }
};

export default EquipmentService;
