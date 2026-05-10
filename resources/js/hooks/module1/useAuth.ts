import { usePage } from '@inertiajs/react';

// la c'est une fonction qui nous permettra de récupérer les rôles et permissions de l'utilisateur connecté

export function useAuth() {
    const { auth } = usePage().props as any;

    // Débogage : afficher la structure de auth
    console.log('Auth object:', auth);
    console.log('Auth user:', auth?.user);
    console.log('Auth user role:', auth?.user?.role);

    // Essayer différentes façons d'obtenir les rôles
    const roles = auth?.roles || auth?.user?.roles || [];
    
    // Si l'utilisateur a un rôle direct, l'ajouter aux rôles
    if (auth?.user?.role && !roles.includes(auth.user.role)) {
        roles.push(auth.user.role);
    }
    
    const permissions = auth?.permissions || auth?.user?.permissions || [];

    console.log('Final roles:', roles);
    console.log('Final permissions:', permissions);

    return {
        roles,
        permissions,

        hasRole: (role: string) => roles.includes(role),
        hasAnyRole: (r: string[]) => r.some(role => roles.includes(role)),
        can: (perm: string) => permissions.includes(perm),
    };
}