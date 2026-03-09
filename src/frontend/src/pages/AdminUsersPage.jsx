import React, { useState, useEffect } from 'react';
import { Plus, Search, User as UserIcon, Edit2, Shield, Beaker, RefreshCcw, X, Loader2, Users } from 'lucide-react';
import UserService from '../api/userService';
import { toast } from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import RoleGuard from '../components/RoleGuard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usuarioSchema, usuarioEditSchema } from '../validation/schemas';
import FormField from '../components/FormField';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [allRoles, setAllRoles] = useState([]);
    const [allLaboratorios, setAllLaboratorios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // States for checkboxes in the modal
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [selectedLabs, setSelectedLabs] = useState([]);

    const currentSchema = currentUser ? usuarioEditSchema : usuarioSchema;

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
        resolver: zodResolver(currentSchema),
        defaultValues: { nombre: '', password: '', firma: '', activo: true },
    });
    const activoValue = watch('activo');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [usersData, rolesData, labsData] = await Promise.all([
                UserService.getAll(),
                UserService.getRoles(),
                UserService.getLaboratorios()
            ]);
            setUsers(usersData);
            setAllRoles(rolesData);
            setAllLaboratorios(labsData);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            toast.error('Error al cargar datos del sistema');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setCurrentUser(user);
            reset({ nombre: user.nombre, firma: user.firma || '', activo: user.activo });
            // Set roles and labs from user relations (array of UsuarioRol and UsuarioLaboratorio objects)
            const rIds = (user.roles || []).map(ur => ur.rol_id);
            const lIds = (user.laboratorios || []).map(ul => ul.laboratorio_id);
            setSelectedRoles(rIds);
            setSelectedLabs(lIds);
        } else {
            setCurrentUser(null);
            reset({ nombre: '', password: '', firma: '', activo: true });
            setSelectedRoles([]);
            setSelectedLabs([]);
        }
        setIsModalOpen(true);
    };

    const handleRoleToggle = (rolId) => {
        setSelectedRoles(prev =>
            prev.includes(rolId) ? prev.filter(r => r !== rolId) : [...prev, rolId]
        );
    };

    const handleLabToggle = (labId) => {
        setSelectedLabs(prev =>
            prev.includes(labId) ? prev.filter(l => l !== labId) : [...prev, labId]
        );
    };

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            let uid = null;
            if (currentUser) {
                uid = currentUser.usuario_id;
                await UserService.update(uid, { nombre: data.nombre, firma: data.firma, activo: data.activo });
            } else {
                const nuevoUser = await UserService.create(data);
                uid = nuevoUser.usuario_id;
            }

            // Sync roles and laboratorios
            await Promise.all([
                UserService.syncRoles(uid, selectedRoles),
                UserService.syncLaboratorios(uid, selectedLabs)
            ]);

            toast.success(`Usuario ${currentUser ? 'actualizado' : 'creado'} correctamente`);
            setIsModalOpen(false);

            // Reload user list without reloading roles/labs
            const updatedUsers = await UserService.getAll();
            setUsers(updatedUsers);
        } catch (error) {
            toast.error('Error al procesar el usuario. Verifique los datos e intente nuevamente.');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AnimatedPage className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-text-main tracking-tight">Administración de Usuarios</h1>
                    <p className="text-text-muted font-medium italic">Gestione el acceso, roles (RBAC) y asignaciones a laboratorios.</p>
                </div>
                <div className="flex items-center gap-3">
                    <RoleGuard roles={['administrador']}>
                        <Button data-testid="btn-nuevo-usuario" onClick={() => handleOpenModal()} className="rounded-xl px-6 shadow-xl shadow-primary/20">
                            <Plus size={18} className="mr-2" /> Nuevo Usuario
                        </Button>
                    </RoleGuard>
                </div>
            </div>

            <Card className="bg-white/50 border-none shadow-none">
                <CardContent className="p-0 flex flex-col md:flex-row gap-6 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <Input
                            placeholder="Buscar por nombre de usuario..."
                            className="pl-12 h-12 bg-white shadow-sm border-border-light"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" onClick={fetchInitialData} disabled={loading} className="h-12 w-12 rounded-xl">
                        <RefreshCcw size={20} className={cn(loading && "animate-spin")} />
                    </Button>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && users.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="animate-spin rounded-xl h-12 w-12 border-t-2 border-b-2 border-primary shadow-lg shadow-primary/20"></div>
                        <p className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Cargando Usuarios...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="col-span-full py-24 text-center space-y-4 bg-white/50 border-2 border-dashed border-border-light rounded-3xl">
                        <div className="w-20 h-20 rounded-full bg-bg-surface flex items-center justify-center text-text-muted mx-auto">
                            <Users size={40} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-text-main">No se encontraron usuarios</h3>
                            <p className="text-sm text-text-muted">Ajuste la búsqueda o cree un nuevo usuario.</p>
                        </div>
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <Card key={user.usuario_id} className="group hover:border-primary/50 transition-all duration-300 flex flex-col">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-bg-surface text-primary group-hover:bg-primary/10 transition-all">
                                            <UserIcon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-text-main group-hover:text-primary transition-colors">{user.nombre}</h3>
                                            <div className="mt-1">
                                                <Badge variant={user.activo ? "success" : "destructive"} className="text-[10px] tracking-widest px-2 py-0">
                                                    {user.activo ? 'ACTIVO' : 'INACTIVO'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <RoleGuard roles={['administrador']}>
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(user)} className="h-8 w-8 text-text-muted hover:text-primary">
                                                <Edit2 size={16} />
                                            </Button>
                                        </RoleGuard>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-3 pt-2">
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-black text-text-muted uppercase tracking-widest mb-2">
                                        <Shield size={12} /> Roles
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {user.roles && user.roles.length > 0 ? (
                                            user.roles.map(ur => (
                                                <Badge key={ur.rol_id} variant="secondary" className="text-[10px]">
                                                    {ur.rol?.nombre || `Rol ${ur.rol_id}`}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-text-muted italic">Sin roles</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-black text-text-muted uppercase tracking-widest mb-2">
                                        <Beaker size={12} /> Laboratorios
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {user.laboratorios && user.laboratorios.length > 0 ? (
                                            user.laboratorios.map(ul => (
                                                <Badge key={ul.laboratorio_id} variant="outline" className="text-[10px] border-border-light text-text-main">
                                                    {ul.laboratorio?.nombre || `Lab ${ul.laboratorio_id}`}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-text-muted italic">Sin laboratorios</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-text-main/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
                        <CardHeader className="bg-bg-surface border-b border-border-light pb-6">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-black">{currentUser ? 'Editar Usuario' : 'Nuevo Usuario'}</CardTitle>
                                    <CardDescription>Configure el acceso y permisos del usuario en el sistema.</CardDescription>
                                </div>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-text-muted hover:text-text-main transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                        </CardHeader>

                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                            <CardContent className="pt-8 space-y-6 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="Nombre de Usuario" error={errors.nombre} required>
                                        <Input {...register('nombre')} placeholder="ej. JPEREZ" />
                                    </FormField>
                                    {!currentUser && (
                                        <FormField label="Contraseña" error={errors.password} required>
                                            <Input type="password" {...register('password')} placeholder="Contraseña segura" />
                                        </FormField>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="Firma/Siglas" error={errors.firma}>
                                        <Input {...register('firma')} placeholder="J.P." />
                                    </FormField>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Estado en Sistema</label>
                                        <div className="p-3.5 rounded-xl bg-bg-surface border border-border-light flex items-center justify-between">
                                            <span className="text-xs font-bold text-text-main">{activoValue ? 'Activo' : 'Inactivo'}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" {...register('activo')} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-border-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-success after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-border-light" />

                                <div>
                                    <h4 className="text-xs font-black text-text-main mb-3 flex items-center gap-2"><Shield size={16} className="text-primary" /> Asignación de Roles</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {allRoles.map(rol => (
                                            <div
                                                key={rol.rol_id}
                                                onClick={() => handleRoleToggle(rol.rol_id)}
                                                className={cn(
                                                    "cursor-pointer p-3 border rounded-xl flex items-center gap-3 transition-all",
                                                    selectedRoles.includes(rol.rol_id) ? "border-primary bg-primary/5 text-primary" : "border-border-light bg-white hover:border-gray-300"
                                                )}
                                            >
                                                <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-colors", selectedRoles.includes(rol.rol_id) ? "bg-primary border-primary" : "border-gray-300 bg-white")}>
                                                    {selectedRoles.includes(rol.rol_id) && <Check size={12} className="text-white" />}
                                                </div>
                                                <span className="text-sm font-semibold capitalize">{rol.nombre}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <hr className="border-border-light" />

                                <div>
                                    <h4 className="text-xs font-black text-text-main mb-3 flex items-center gap-2"><Beaker size={16} className="text-primary" /> Asignación de Laboratorios</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {allLaboratorios.map(lab => (
                                            <div
                                                key={lab.laboratorio_id}
                                                onClick={() => handleLabToggle(lab.laboratorio_id)}
                                                className={cn(
                                                    "cursor-pointer p-3 border rounded-xl flex items-center gap-3 transition-all",
                                                    selectedLabs.includes(lab.laboratorio_id) ? "border-primary bg-primary/5 text-primary" : "border-border-light bg-white hover:border-gray-300"
                                                )}
                                            >
                                                <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-colors", selectedLabs.includes(lab.laboratorio_id) ? "bg-primary border-primary" : "border-gray-300 bg-white")}>
                                                    {selectedLabs.includes(lab.laboratorio_id) && <Check size={12} className="text-white" />}
                                                </div>
                                                <span className="text-sm font-semibold capitalize">{lab.nombre}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </CardContent>

                            <CardFooter className="bg-bg-surface border-t border-border-light p-6 justify-end gap-3 flex-shrink-0">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl border-border-light">
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={submitting} className="rounded-xl px-8 shadow-lg shadow-primary/30">
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : (currentUser ? 'Actualizar Usuario' : 'Crear Usuario')}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </AnimatedPage>
    );
};

export default AdminUsersPage;
