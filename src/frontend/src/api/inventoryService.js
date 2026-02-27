import api from './axios';

const POLVOS = '/inventario/polvos';
const MEDIOS = '/inventario/medios';
const STOCK = '/inventario/stock';

export const inventoryService = {
    // Polvos / Suplementos
    getPolvos: () =>
        api.get(POLVOS).then((r) => r.data),

    createPolvo: (data) =>
        api.post(POLVOS, data).then((r) => r.data),

    updatePolvo: (id, data) =>
        api.put(`${POLVOS}/${id}`, data).then((r) => r.data),

    deletePolvo: (id) =>
        api.delete(`${POLVOS}/${id}`),

    // Medios Preparados
    getMedios: () =>
        api.get(MEDIOS).then((r) => r.data),

    createMedio: (data) =>
        api.post(MEDIOS, data).then((r) => r.data),

    updateMedio: (id, data) =>
        api.put(`${MEDIOS}/${id}`, data).then((r) => r.data),

    // Stock
    getStock: () =>
        api.get(STOCK).then((r) => r.data),
};
