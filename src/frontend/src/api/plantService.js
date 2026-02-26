import api from './axios';

const PlantService = {
    getAll: async () => {
        const response = await api.get('/ubicaciones/plantas');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/ubicaciones/plantas/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/ubicaciones/plantas/', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/ubicaciones/plantas/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/ubicaciones/plantas/${id}`);
        return response.data;
    }
};

export default PlantService;
