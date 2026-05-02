import { Link, router } from '@inertiajs/react';
import { BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';

type NotificationPanelProps = {
    notifications: Array<{
        id: number;
        type: string;
        title: string;
        message: string;
        read_at: string | null;
        created_at: string | null;
        event_id: number | null;
    }>;
    title?: string;
    subtitle?: string;
    showViewAll?: boolean;
    emptyMessage?: string;
};

export function NotificationPanel({
    notifications,
    title = 'Notifications intelligentes',
    subtitle = 'Rappels, validations et resultats.',
    showViewAll = false,
    emptyMessage = 'Aucune notification pour le moment.',
}: NotificationPanelProps) {
    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                    {showViewAll ? (
                        <Button asChild variant="outline" size="sm" className="rounded-full">
                            <Link href="/notifications">Voir tout</Link>
                        </Button>
                    ) : null}
                    <button
                        type="button"
                        className="text-sm text-sky-600 hover:underline dark:text-sky-300"
                        onClick={() => router.post('/notifications/read-all', {}, { preserveScroll: true })}
                    >
                        Tout marquer lu
                    </button>
                </div>
            </div>
            <div className="mt-5 space-y-3">
                {notifications.length ? (
                    notifications.map((notification) => (
                        <button
                            key={notification.id}
                            type="button"
                            onClick={() =>
                                router.post(`/notifications/${notification.id}/read`, {}, {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        if (notification.event_id) {
                                            router.visit(`/evenements/${notification.event_id}`);
                                        }
                                    },
                                })
                            }
                            className={`w-full rounded-2xl border px-4 py-3 text-left transition ${notification.read_at ? 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900' : 'border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/20'}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex size-9 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-sm dark:bg-slate-950">
                                    <BellRing className="size-4" />
                                </div>
                                <div>
                                    <div className="font-medium text-slate-950 dark:text-white">{notification.title}</div>
                                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{notification.message}</div>
                                    <div className="mt-2 text-xs text-slate-400">
                                        {notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                        {emptyMessage}
                    </div>
                )}
            </div>
        </div>
    );
}
