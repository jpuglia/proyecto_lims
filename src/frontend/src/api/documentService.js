import api from './axios';

const DocumentService = {
    /**
     * Sube un archivo y lo asocia a una entidad.
     * @param {File} file - El archivo a subir
     * @param {string} entidadTipo - ej: 'equipo', 'planta'
     * @param {number} entidadId - ID de la entidad
     */
    uploadDoc: async (file, entidadTipo, entidadId) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('entidad_tipo', entidadTipo);
        formData.append('entidad_id', entidadId);

        const response = await api.post('/documentos/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Obtiene los documentos asociados a una entidad.
     */
    getDocsByEntidad: async (entidadTipo, entidadId) => {
        const response = await api.get(`/documentos/${entidadTipo}/${entidadId}`);
        return response.data;
    },

    /**
     * Descarga un archivo
     */
    downloadDoc: async (docId, fileName) => {
        const response = await api.get(`/documentos/descargar/${docId}`, {
            responseType: 'blob', // Importante para manejar binarios
        });

        // Crear un link temporal para forzar la descarga en el navegador
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();

        // Cleanup
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    /**
     * Elimina un documento (requiere rol administrador)
     */
    deleteDoc: async (docId) => {
        const response = await api.delete(`/documentos/${docId}`);
        return response.data;
    }
};

export default DocumentService;
