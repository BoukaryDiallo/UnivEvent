import type { Page as InertiaPage } from '@inertiajs/react';

export type PageProps<T = {}> = InertiaPage<{
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    errors: Record<string, string>;
}> & T;

