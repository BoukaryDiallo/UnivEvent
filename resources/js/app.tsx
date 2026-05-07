import { createInertiaApp } from '@inertiajs/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LiveNotificationsProvider } from '@/contexts/live-notifications-context';
import { ErrorBoundary } from '@/components/error-boundary';
import '../css/app.css';
import { initializeTheme } from '@/hooks/use-appearance';
import { getEcho } from '@/lib/echo';
import type { SharedNotification } from '@/types';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const pages = {
    ...import.meta.glob('./pages/**/*.tsx', { eager: true }),
    ...import.meta.glob('./modules/**/*.tsx', { eager: true }),
} as Record<string, any>;

let currentUserId: number | null = null;
let currentUserRole: string | null = null;

// Écouter la navigation avant/arrière du navigateur
window.addEventListener('popstate', () => {
    console.log('Navigation avant/arrière du navigateur détectée - rechargement de la page pour vérifier l\'authentification');
    window.location.reload();
});

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        console.log('[Inertia] Resolving page:', name);

        const pagePath = name.startsWith('module5/')
            ? `./modules/${name.replace(/^module5\//, 'module5/pages/')}.tsx`
            : `./pages/${name}.tsx`;

        console.log('[Inertia] Attempting page path:', pagePath);

        const page = pages[pagePath] || pages['./modules/module5/pages/NotFound.tsx'];

        if (!page) {
            console.error('[Inertia] Page introuvable pour', name, pagePath);
            return () => <div>Page introuvable</div>;
        }

        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        const pageProps = props.initialPage.props as {
            auth?: { user?: { id?: number } | null };
            notifications?: { unread_count: number; items: SharedNotification[] };
        };

        getEcho();

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
                <ErrorBoundary>
                    <LiveNotificationsProvider
                        userId={pageProps.auth?.user?.id ?? null}
                        initialNotifications={{
                            unread_count: pageProps.notifications?.unread_count ?? 0,
                            items: pageProps.notifications?.items ?? [],
                        }}
                    >
                        <TooltipProvider delayDuration={0}>
                            <App {...props} />
                        </TooltipProvider>
                    </LiveNotificationsProvider>
                </ErrorBoundary>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// Cela définira le mode clair/sombre au chargement...
initializeTheme();
