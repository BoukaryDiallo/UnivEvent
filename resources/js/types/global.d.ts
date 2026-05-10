import type { Auth } from '@/types/auth';

export type NotificationItem = {
    id: string;
    title: string;
    tracking_code: string | null;
    status_label: string | null;
    created_at: string;
};

export type NotificationsShare = {
    unread_count: number;
    recent: NotificationItem[];
};

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            notifications: NotificationsShare;
            [key: string]: unknown;
        };
    }
}
