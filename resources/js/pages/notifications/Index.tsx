import { Head, Link, router } from '@inertiajs/react';
import { BellRing, CalendarClock, Radio, Sparkles } from 'lucide-react';
import { GlobalFeedPanel } from '@/components/evenements/GlobalFeedPanel';
import { NotificationPanel } from '@/components/evenements/NotificationPanel';
import { Button } from '@/components/ui/button';
import { useLiveNotifications } from '@/contexts/live-notifications-context';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PaginationLink, SharedNotification } from '@/types';

type FeedItem = {
    id: number;
    event_id: number;
    event_title: string;
    label: string;
    description: string | null;
    created_at: string | null;
    user: {
        name?: string | null;
        role?: string | null;
    };
};

type NotificationsPageProps = {
    stats: {
        total: number;
        unread: number;
        feed_count: number;
    };
    notifications: {
        data: SharedNotification[];
        current_page: number;
        last_page: number;
        links: PaginationLink[];
        total: number;
    };
    feed: FeedItem[];
};

export default function NotificationsIndex({ stats, notifications, feed }: NotificationsPageProps) {
    const { notifications: liveNotifications } = useLiveNotifications();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Notifications', href: '/notifications' },
    ];
    const mergedNotifications = [
        ...liveNotifications.items,
        ...notifications.data.filter((item) => !liveNotifications.items.some((liveItem) => liveItem.id === item.id)),
    ];
    const unreadCount = Math.max(stats.unread, liveNotifications.unread_count);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications / Actualites" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <section className="overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_28%),linear-gradient(135deg,_rgba(15,23,42,1),_rgba(30,41,59,0.96)_52%,_rgba(8,145,178,0.9))] p-6 text-white shadow-xl shadow-slate-200/70 dark:shadow-black/20">
                    <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
                                <Radio className="size-3.5" />
                                Hub de suivi
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-3xl font-semibold sm:text-4xl">
                                    Toutes les notifications utiles et les actualites recentes sont maintenant centralisees ici.
                                </h1>
                                <p className="max-w-2xl text-sm leading-7 text-cyan-50/88 sm:text-base">
                                    Rappels planifies, validations, activites recentes et mouvement global de la plateforme dans une page dediee.
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            size="lg"
                            variant="outline"
                            className="border-white/25 bg-white/10 text-white hover:bg-white/20"
                            onClick={() => router.post('/notifications/read-all', {}, { preserveScroll: true })}
                        >
                            Tout marquer lu
                        </Button>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
                        <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-300">
                            <BellRing className="size-5" />
                        </div>
                        <div className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{unreadCount}</div>
                        <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">non lues</div>
                    </div>
                    <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
                        <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950/30 dark:text-sky-300">
                            <CalendarClock className="size-5" />
                        </div>
                        <div className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{stats.total}</div>
                        <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">notifications archivees</div>
                    </div>
                    <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
                        <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300">
                            <Sparkles className="size-5" />
                        </div>
                        <div className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{stats.feed_count}</div>
                        <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">actualites recentes</div>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                    <NotificationPanel
                        notifications={mergedNotifications}
                        title="Notifications personnelles"
                        subtitle="Rappels planifies, validations d inscriptions, publications et resultats."
                        emptyMessage="Aucune notification personnelle pour le moment."
                    />
                    <GlobalFeedPanel
                        items={feed}
                        title="Actualites de la plateforme"
                        subtitle="Ce qui bouge sur les evenements, commentaires, programmes et resultats."
                        emptyMessage="Aucune actualite recente n est disponible."
                    />
                </section>

                {notifications.last_page > 1 ? (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {notifications.links.map((link, linkIndex) => (
                            <Button
                                key={`${link.label}-${linkIndex}`}
                                type="button"
                                variant={link.active ? 'default' : 'outline'}
                                disabled={!link.url}
                                onClick={() => {
                                    if (!link.url) {
                                        return;
                                    }

                                    router.visit(link.url, {
                                        preserveScroll: true,
                                        preserveState: true,
                                    });
                                }}
                                className="rounded-full"
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Button>
                        ))}
                    </div>
                ) : null}

                <div className="flex justify-center">
                    <Button asChild variant="outline" className="rounded-full">
                        <Link href="/dashboard">Retour au tableau de bord</Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
