import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';
import { useUserLiveChannel } from '@/hooks/use-user-live-channel';
import { EventToast } from '@/modules/module5/components/EventToast';
import type { SharedNotification, SharedNotifications } from '@/types';

type NotificationCreatedPayload = {
    notification: SharedNotification;
};

type LiveNotificationsContextValue = {
    notifications: SharedNotifications;
};

const LiveNotificationsContext = createContext<LiveNotificationsContextValue | null>(null);

export function LiveNotificationsProvider({
    children,
    userId,
    initialNotifications,
}: {
    children: ReactNode;
    userId: number | null;
    initialNotifications: SharedNotifications;
}) {
    const [notifications, setNotifications] = useState<SharedNotifications>(initialNotifications);
    const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);

    useUserLiveChannel(
        userId,
        {
            'notification.created': (rawPayload) => {
                const payload = rawPayload as NotificationCreatedPayload;

                setNotifications((current) => {
                    const existing = current.items.find((item) => item.id === payload.notification.id);

                    if (existing) {
                        return current;
                    }

                    return {
                        unread_count: current.unread_count + (payload.notification.read_at ? 0 : 1),
                        items: [payload.notification, ...current.items].slice(0, 5),
                    };
                });
                setToast({ message: payload.notification.title, tone: 'success' });
            },
        },
        Boolean(userId),
    );

    const value = useMemo<LiveNotificationsContextValue>(() => ({ notifications }), [notifications]);

    return (
        <LiveNotificationsContext.Provider value={value}>
            {children}
            <EventToast message={toast?.message ?? null} tone={toast?.tone ?? 'success'} />
        </LiveNotificationsContext.Provider>
    );
}

export function useLiveNotifications() {
    const context = useContext(LiveNotificationsContext);

    if (!context) {
        throw new Error('useLiveNotifications must be used within LiveNotificationsProvider');
    }

    return context;
}
