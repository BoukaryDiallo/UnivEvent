import { usePage } from '@inertiajs/react';

// la c'est une fonction qui nous permettra de récupérer les rôles et permissions de l'utilisateur connecté

export function useAuth() {
    const { auth } = usePage().props as any;

    const roles = auth.roles || [];
    
    const permissions = auth.permissions || [];

    return {
        roles,
        permissions,

        hasRole: (role: string) => roles.includes(role),
        hasAnyRole: (r: string[]) => r.some(role => roles.includes(role)),
        can: (perm: string) => permissions.includes(perm),
    };
}