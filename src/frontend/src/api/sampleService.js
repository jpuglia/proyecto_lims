import api from './axios';

const SampleService = {
    getAllSolicitudes: async () => {
        const response = await api.get('/muestreo/solicitudes');
        return response.data;
    },

    createSolicitud: async (data) => {
        const response = await api.post('/muestreo/solicitudes', data);
        return response.data;
    },

    updateSolicitud: async (id, data) => {
        const response = await api.put(`/muestreo/solicitudes/${id}`, data);
        return response.data;
    },

    deleteSolicitud: async (id) => {
        const response = await api.delete(`/muestreo/solicitudes/${id}`);
        return response.data;
    }
};

export default SampleService;
