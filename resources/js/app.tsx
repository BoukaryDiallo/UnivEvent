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

// This will set light / dark mode on load...
initializeTheme();
