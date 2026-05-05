import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TooltipProvider } from '@/components/ui/tooltip';
import '../css/app.css';
import { initializeTheme } from '@/hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

let currentUserId: number | null = null;
let currentUserRole: string | null = null;

// Écouter la navigation avant/arrière du navigateur
window.addEventListener('popstate', () => {
    console.log('Navigation avant/arrière du navigateur détectée - rechargement de la page pour vérifier l\'authentification');
    window.location.reload();
});

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Vérifier si l'utilisateur a changé entre les navigations
        const newUserId = props.initialPage.props.auth?.user?.id || null;
        const newUserRole = props.initialPage.props.auth?.user?.role || null;

        if (currentUserId !== null && newUserId !== null && currentUserId !== newUserId) {
            // Utilisateur changé, redirection vers la page de connexion
            console.log('Utilisateur changé de', currentUserId, 'à', newUserId, '- redirection vers la page de connexion');
            window.location.href = '/login';

            return;
        }

        if (currentUserRole !== null && newUserRole !== null && currentUserRole !== newUserRole) {
            // Rôle changé, redirection vers la page de connexion
            console.log('Rôle changé de', currentUserRole, 'à', newUserRole, '- redirection vers la page de connexion');
            window.location.href = '/login';

            return;
        }

        currentUserId = newUserId;
        currentUserRole = newUserRole;

        // Vérifier si l'utilisateur est null mais était précédemment connecté
        if (currentUserId === null && props.initialPage.url !== '/login' && props.initialPage.url !== '/' && props.initialPage.url !== '/register') {
            console.log('Aucun utilisateur connecté mais tentative d\'accès à une page protégée - redirection vers la page de connexion');
            window.location.href = '/login';

            return;
        }

        root.render(
            <StrictMode>
                <TooltipProvider delayDuration={0}>
                    <App {...props} />
                </TooltipProvider>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// Cela définira le mode clair/sombre au chargement...
initializeTheme();
