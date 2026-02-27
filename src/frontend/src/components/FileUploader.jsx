import React, { useState, useEffect, useCallback } from 'react';
import { UploadCloud, File as FileIcon, Trash2, Download, Loader2, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DocumentService from '../api/documentService';
import { useAuth } from '../context/AuthContext';

const FileUploader = ({ entidadTipo, entidadId, readOnly = false }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const { hasRole } = useAuth();

    const isAdministrador = hasRole('administrador');

    const fetchDocuments = useCallback(async () => {
        if (!entidadTipo || !entidadId) return;
        setLoading(true);
        try {
            const data = await DocumentService.getDocsByEntidad(entidadTipo, entidadId);
            setDocuments(data);
        } catch (error) {
            console.error('Error fetching documents:', error);
            // Non-blocking error since it's an accessory component
        } finally {
            setLoading(false);
        }
    }, [entidadTipo, entidadId]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validaciones básicas de tamaño (ej: máx 50MB)
        if (file.size > 50 * 1024 * 1024) {
            toast.error('El archivo excede el límite de 50MB');
            return;
        }

        setUploading(true);
        try {
            await DocumentService.uploadDoc(file, entidadTipo, entidadId);
            toast.success('Documento subido correctamente');
            fetchDocuments();
        } catch (error) {
            console.error('Error uploading document:', error);
            toast.error('Error al subir documento');
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset file input
        }
    };

    const handleDownload = async (docId, fileName) => {
        try {
            toast.loading(`Descargando ${fileName}...`, { id: 'download' });
            await DocumentService.downloadDoc(docId, fileName);
            toast.success('Descarga completada', { id: 'download' });
        } catch (error) {
            console.error('Error downloading:', error);
            toast.error('Error al descargar', { id: 'download' });
        }
    };

    const handleDelete = async (docId) => {
        if (!window.confirm('¿Está seguro de eliminar este documento de forma permanente?')) return;

        try {
            await DocumentService.deleteDoc(docId);
            toast.success('Documento eliminado');
            fetchDocuments();
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Error al eliminar. Verifique sus permisos (solo admin).');
        }
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} />
                Documentos Adjuntos
            </h3>

            {/* Upload Area */}
            {!readOnly && (
                <div className="relative border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-accent-primary/50 hover:bg-white/5 transition-all group">
                    <input
                        type="file"
                        id={`file-upload-${entidadId}`}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                    <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                        {uploading ? (
                            <Loader2 className="animate-spin text-accent-primary" size={32} />
                        ) : (
                            <UploadCloud className="text-text-muted group-hover:text-accent-primary transition-colors" size={32} />
                        )}
                        <div className="text-sm">
                            <p className="font-semibold text-white">Haz clic para subir un archivo</p>
                            <p className="text-text-muted mt-1 text-xs">Arrastra un archivo aquí (máx. 50MB)</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Documents List */}
            <div className="space-y-2">
                {loading ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-text-muted" size={24} /></div>
                ) : documents.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-text-muted p-4 bg-white/5 rounded-xl border border-white/5">
                        <AlertCircle size={16} />
                        No hay documentos adjuntos.
                    </div>
                ) : (
                    documents.map(doc => (
                        <div key={doc.documento_id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-accent-primary/10 text-accent-primary rounded-lg shrink-0">
                                    <FileIcon size={16} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium text-white truncate" title={doc.nombre}>
                                        {doc.nombre}
                                    </span>
                                    <span className="text-[10px] text-text-muted">
                                        {formatBytes(doc.tamano_bytes)} • {new Date(doc.fecha_subida).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 ml-4">
                                <button
                                    onClick={() => handleDownload(doc.documento_id, doc.nombre)}
                                    className="p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    title="Descargar"
                                >
                                    <Download size={16} />
                                </button>

                                {!readOnly && isAdministrador && (
                                    <button
                                        onClick={() => handleDelete(doc.documento_id)}
                                        className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                                        title="Eliminar (Solo Admin)"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FileUploader;
