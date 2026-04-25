import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LiveNotificationsProvider } from '@/contexts/live-notifications-context';
import '../css/app.css';
import { initializeTheme } from '@/hooks/use-appearance';
import { getEcho } from '@/lib/echo';
import type { SharedNotification } from '@/types';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        const pageProps = props.initialPage.props as {
            auth?: { user?: { id?: number } | null };
            notifications?: { unread_count: number; items: SharedNotification[] };
        };

        getEcho();

        root.render(
            <StrictMode>
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
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
