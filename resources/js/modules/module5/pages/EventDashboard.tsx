import { Head, Link } from '@inertiajs/react';
import { BellRing, CalendarClock, Radio } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { EventAnalyticsPanel } from '@/modules/module5/components/EventAnalyticsPanel';
import { EventBadgeCarousel } from '@/modules/module5/components/EventBadgeCarousel';
import { EventCalendarPanel } from '@/modules/module5/components/EventCalendarPanel';
import { EventToast } from '@/modules/module5/components/EventToast';
import { DashboardHero } from '@/modules/module5/pages/DashboardHero';
import { DashboardMetrics } from '@/modules/module5/pages/DashboardMetrics';
import type { BreadcrumbItem, EventSummary } from '@/types';

type DashboardProps = {
    eventStats: {
        events_count: number;
        inscriptions_count: number;
        upcoming_count: number;
        participation_rate: number;
    };
    analyticsSeries: Array<{ label: string; date: string; inscriptions: number }>;
    mesEvenements: EventSummary[];
    evenementsPopulaires: EventSummary[];
    mesInscriptions: EventSummary[];
    topActifs: EventSummary[];
    recommendations: EventSummary[];
    calendarEvents: EventSummary[];
    notificationStats: {
        total: number;
        unread: number;
        upcoming_reminders: number;
    };
    isAdmin: boolean;
    dashboardMode: {
        isAdmin: boolean;
        canManageEvents: boolean;
        isParticipantView: boolean;
    };
};

export default function Dashboard({
    eventStats,
    analyticsSeries,
    recommendations,
    calendarEvents,
    notificationStats,
    isAdmin,
    dashboardMode,
}: DashboardProps) {
    const [toast, setToast] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tableau de bord',
            href: '/module5/dashboard',
        },
        {
            title: 'Événements',
            href: '/module5/dashboard',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de bord" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <DashboardHero isAdmin={isAdmin} />
                {dashboardMode.canManageEvents ? <DashboardMetrics stats={eventStats} isAdmin={isAdmin} /> : null}

                <section className={`grid gap-6 ${dashboardMode.canManageEvents ? 'xl:grid-cols-[1.2fr_0.8fr]' : ''}`}>
                    {dashboardMode.canManageEvents ? <EventAnalyticsPanel series={analyticsSeries} /> : null}
                    <EventCalendarPanel events={calendarEvents} />
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                    <div className="overflow-hidden rounded-4xl border border-slate-200 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_28%),linear-gradient(145deg,rgba(255,255,255,0.96),rgba(241,245,249,0.9))] p-6 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_24%),linear-gradient(145deg,rgba(2,6,23,0.92),rgba(15,23,42,0.9))] dark:shadow-black/20">
                        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                            <div className="max-w-2xl space-y-3">
                                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-300">
                                    <Radio className="size-3.5" />
                                    Notifications et Actualités
                                </div>
                                <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
                                    Centre de suivi en temps réel
                                </h2>
                                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                                    Consultez vos rappels, les validations d'inscriptions et toute l'activité récente de la plateforme.
                                </p>
                            </div>
                            <Button asChild size="lg" className="rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950">
                                <Link href="/notifications">Ouvrir le centre de notifications</Link>
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                        <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
                            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-300">
                                <BellRing className="size-5" />
                            </div>
                            <div className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{notificationStats.unread}</div>
                            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">notification(s) non lue(s)</div>
                        </div>
                        {dashboardMode.canManageEvents ? (
                            <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
                                <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950/30 dark:text-sky-300">
                                    <Radio className="size-5" />
                                </div>
                                <div className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{notificationStats.total}</div>
                                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">elements disponibles dans la boite de notif</div>
                            </div>
                        ) : null}
                        <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
                            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300">
                                <CalendarClock className="size-5" />
                            </div>
                            <div className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{notificationStats.upcoming_reminders}</div>
                            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">rappel(s) evenement a venir</div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
                    <div className="space-y-5 rounded-4xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                                    {dashboardMode.isParticipantView ? 'Evenements recommandes pour vous' : 'Evenements disponibles'}
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {dashboardMode.isParticipantView
                                        ? 'Retrouvez rapidement les evenements les plus pertinents pour votre profil.'
                                        : 'Decouvrez les evenements auxquels vous pouvez participer.'}
                                </p>
                            </div>
                        </div>
                        <EventBadgeCarousel events={recommendations} onJoinSuccess={setToast} />
                    </div>
                </section>
            </div>
            <EventToast message={toast} />
        </AppLayout>
    );
}
