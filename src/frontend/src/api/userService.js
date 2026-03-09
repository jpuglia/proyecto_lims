import api from './axios';

const UserService = {
    getAll: async () => {
        const response = await api.get('/usuarios');
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/usuarios', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/usuarios/${id}`, data);
        return response.data;
    },
    syncRoles: async (id, rolesIds) => {
        const response = await api.put(`/usuarios/${id}/roles`, { roles_ids: rolesIds });
        return response.data;
    },
    syncLaboratorios: async (id, laboratoriosIds) => {
        const response = await api.put(`/usuarios/${id}/laboratorios`, { laboratorios_ids: laboratoriosIds });
        return response.data;
    },
    getRoles: async () => {
        const response = await api.get('/roles');
        return response.data;
    },
    getLaboratorios: async () => {
        const response = await api.get('/laboratorios');
        return response.data;
    }
};

export default UserService;
