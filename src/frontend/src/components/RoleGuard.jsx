import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * RoleGuard — renderiza sus hijos solo si el usuario tiene al menos uno de los roles indicados.
 *
 * Props:
 *   roles: string[]  — lista de roles permitidos (al menos uno debe coincidir)
 *   fallback: node   — qué renderizar si no hay permiso (default: null)
 *
 * Uso:
 *   <RoleGuard roles={["administrador", "supervisor"]}>
 *     <button>Crear</button>
 *   </RoleGuard>
 */
const RoleGuard = ({ roles = [], children, fallback = null }) => {
    const { hasRole } = useAuth();

    if (!roles.length || hasRole(...roles)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};

export default RoleGuard;
