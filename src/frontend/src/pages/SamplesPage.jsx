import { Plus, Search, RefreshCcw, FlaskConical, Calendar, Tag, FileText, X, Check, Edit2, Loader2 } from 'lucide-react';
import SampleService from '../api/sampleService';
import EquipmentService from '../api/equipmentService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';

const SamplesPage = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentSolicitud, setCurrentSolicitud] = useState(null);
    const [equipments, setEquipments] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        tipo: 'Ambiental',
        equipo_instrumento_id: '',
        observacion: '',
        estado_solicitud_id: 1
    });

    const [editFormData, setEditFormData] = useState({
        observacion: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [samplesData, eqData] = await Promise.all([
                SampleService.getAllSolicitudes(),
                EquipmentService.getAll()
            ]);
            setSolicitudes(samplesData);
            setEquipments(eqData);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSolicitud = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                usuario_id: 1,
                equipo_instrumento_id: formData.equipo_instrumento_id ? parseInt(formData.equipo_instrumento_id) : null
            };
            await SampleService.createSolicitud(payload);
            setIsModalOpen(false);
            toast.success('Solicitud creada');
            fetchData();
            setFormData({ tipo: 'Ambiental', equipo_instrumento_id: '', observacion: '', estado_solicitud_id: 1 });
        } catch (error) {
            console.error('Error creating request:', error);
            toast.error('Error al crear solicitud');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (item) => {
        setCurrentSolicitud(item);
        setEditFormData({ observacion: item.observacion || '' });
        setIsEditModalOpen(true);
    };

    const handleUpdateSolicitud = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await SampleService.updateSolicitud(currentSolicitud.solicitud_muestreo_id, {
                observacion: editFormData.observacion
            });
            setIsEditModalOpen(false);
            toast.success('Solicitud actualizada');
            fetchData();
        } catch (error) {
            console.error('Error updating request:', error);
            toast.error('Error al actualizar solicitud');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredSolicitudes = solicitudes.filter(s =>
        s.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.observacion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (statusId) => {
        const statuses = {
            1: { label: 'Pendiente', class: 'bg-accent-secondary/10 text-accent-secondary' },
            2: { label: 'En Proceso', class: 'bg-accent-primary/10 text-accent-primary' },
            3: { label: 'Completado', class: 'bg-success/10 text-success' },
            4: { label: 'Cancelado', class: 'bg-error/10 text-error' }
        };
        const status = statuses[statusId] || { label: 'Desconocido', class: 'bg-white/5 text-text-muted' };
        return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.class}`}>{status.label}</span>;
    };

    return (
        <AnimatedPage className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gradient">Solicitudes de Muestreo</h1>
                    <p className="text-text-muted mt-1">Gestione las peticiones de muestreo ambiental y de procesos.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-grad-primary hover:brightness-110 active:scale-95 text-white px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-accent-primary/20"
                >
                    <Plus size={20} />
                    Nueva Solicitud
                </button>
            </div>

            <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por tipo o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-white focus:outline-none focus:border-accent-primary transition-all"
                    />
                </div>
                <button
                    onClick={fetchData}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                >
                    <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Observación</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center">
                                    <RefreshCcw className="animate-spin text-accent-primary mx-auto" size={32} />
                                </td>
                            </tr>
                        ) : filteredSolicitudes.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-text-muted">
                                    No se encontraron solicitudes.
                                </td>
                            </tr>
                        ) : (
                            filteredSolicitudes.map((item) => (
                                <tr key={item.solicitud_muestreo_id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-xs text-text-muted">#{item.solicitud_muestreo_id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary">
                                                <FlaskConical size={16} />
                                            </div>
                                            <span className="font-medium text-white">{item.tipo}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-muted">
                                        {new Date(item.fecha).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(item.estado_solicitud_id)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-muted italic max-w-xs truncate">
                                        {item.observacion || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleEditClick(item)}
                                            className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Nueva Solicitud */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-lg p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 text-text-muted hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold text-gradient mb-6">Nueva Solicitud</h2>

                        <form onSubmit={handleCreateSolicitud} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
                                    <Tag size={14} /> Tipo de Muestreo
                                </label>
                                <select
                                    value={formData.tipo}
                                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-accent-primary transition-all appearance-none"
                                >
                                    <option className="bg-bg-dark" value="Ambiental">Ambiental</option>
                                    <option className="bg-bg-dark" value="Producto">Producto</option>
                                    <option className="bg-bg-dark" value="Proceso">Proceso</option>
                                    <option className="bg-bg-dark" value="Personal">Personal</option>
                                    <option className="bg-bg-dark" value="Agua">Agua</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
                                    <Tag size={14} /> Equipo / Instrumento (Opcional)
                                </label>
                                <select
                                    value={formData.equipo_instrumento_id}
                                    onChange={(e) => setFormData({ ...formData, equipo_instrumento_id: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-accent-primary transition-all appearance-none"
                                >
                                    <option className="bg-bg-dark" value="">Ninguno</option>
                                    {equipments.map(eq => (
                                        <option key={eq.equipo_instrumento_id} className="bg-bg-dark" value={eq.equipo_instrumento_id}>{eq.nombre} ({eq.codigo})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
                                    <FileText size={14} /> Observaciones
                                </label>
                                <textarea
                                    value={formData.observacion}
                                    onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                                    rows="3"
                                    placeholder="Detalles adicionales sobre la toma de muestra..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-accent-primary transition-all resize-none"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 px-4 rounded-xl bg-grad-primary text-white font-semibold shadow-lg shadow-accent-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                    Crear Solicitud
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Edición de Observación */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-lg p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute top-6 right-6 text-text-muted hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold text-gradient mb-6">Editar Observación</h2>
                        <p className="text-sm text-text-muted mb-6">Actualice las notas para la solicitud <span className="text-white font-mono">#{currentSolicitud?.solicitud_muestreo_id}</span>.</p>

                        <form onSubmit={handleUpdateSolicitud} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
                                    <FileText size={14} /> Observaciones
                                </label>
                                <textarea
                                    value={editFormData.observacion}
                                    onChange={(e) => setEditFormData({ ...editFormData, observacion: e.target.value })}
                                    rows="4"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-accent-primary transition-all resize-none"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 px-4 rounded-xl bg-grad-primary text-white font-semibold shadow-lg shadow-accent-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                    Actualizar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AnimatedPage>
    );
};

export default SamplesPage;
