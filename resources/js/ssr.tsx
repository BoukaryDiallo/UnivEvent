import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import ReactDOMServer from 'react-dom/server';
import { TooltipProvider } from '@/components/ui/tooltip';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const pages = {
    ...import.meta.glob('./pages/**/*.tsx', { eager: true }),
    ...import.meta.glob('./modules/**/*.tsx', { eager: true }),
} as Record<string, any>;

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) => {
            const pagePath = name.startsWith('module5/')
                ? `./modules/${name.replace(/^module5\//, 'module5/pages/')}.tsx`
                : `./pages/${name}.tsx`;

            return pages[pagePath] || pages['./modules/module5/pages/NotFound.tsx'];
        },
        setup: ({ App, props }) => {
            return (
                <TooltipProvider delayDuration={0}>
                    <App {...props} />
                </TooltipProvider>
            );
        },
    }),
);
