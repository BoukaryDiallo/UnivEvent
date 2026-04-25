import { Head, Link } from '@inertiajs/react';
import { BellRing, CalendarClock, Radio, Ticket, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { EventAnalyticsPanel } from '@/components/evenements/EventAnalyticsPanel';
import { EventCalendarPanel } from '@/components/evenements/EventCalendarPanel';
import { EventCard } from '@/components/evenements/EventCard';
import { EventRowCarousel } from '@/components/evenements/EventRowCarousel';
import { EventToast } from '@/components/evenements/EventToast';
import { UserAvatar } from '@/components/evenements/UserAvatar';
import { DashboardHero } from '@/pages/DashboardHero';
import { DashboardMetrics } from '@/pages/DashboardMetrics';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { create as createEvent, index as evenementsIndex } from '@/routes/evenements';
import { mine as myRegistrations } from '@/routes/inscriptions';
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
};

export default function Dashboard({
    eventStats,
    analyticsSeries,
    mesEvenements,
    evenementsPopulaires,
    mesInscriptions,
    topActifs,
    recommendations,
    calendarEvents,
    notificationStats,
}: DashboardProps) {
    const [toast, setToast] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tableau de bord',
            href: dashboard(),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de bord" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <DashboardHero />
                <DashboardMetrics stats={eventStats} />

                <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <EventAnalyticsPanel series={analyticsSeries} />
                    <EventCalendarPanel events={calendarEvents} />
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_28%),linear-gradient(145deg,_rgba(255,255,255,0.96),_rgba(241,245,249,0.9))] p-6 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_24%),linear-gradient(145deg,_rgba(2,6,23,0.92),_rgba(15,23,42,0.9))] dark:shadow-black/20">
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
                                <Link href="/notifications">Ouvrir le hub</Link>
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                        <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
                            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-300">
                                <BellRing className="size-5" />
                            </div>
                            <div className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{notificationStats.unread}</div>
                            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">notification(s) non lue(s)</div>
                        </div>
                        <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
                            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950/30 dark:text-sky-300">
                                <Radio className="size-5" />
                            </div>
                            <div className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{notificationStats.total}</div>
                            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">elements disponibles dans le hub</div>
                        </div>
                        <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
                            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300">
                                <CalendarClock className="size-5" />
                            </div>
                            <div className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{notificationStats.upcoming_reminders}</div>
                            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">rappel(s) evenement a venir</div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
                    <div className="space-y-5 rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Tableau de Commandement</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Gérez vos événements et suivez votre impact sur la communauté.
                                </p>
                            </div>
                            <Button asChild variant="outline">
                                <Link href={evenementsIndex()}>Archives Missions</Link>
                            </Button>
                        </div>
                        {mesEvenements.length ? (
                            <EventRowCarousel itemsCount={mesEvenements.length} title="Missions Actives" subtitle="Événements sous votre supervision directe.">
                                {mesEvenements.map((evenement) => (
                                    <EventCard key={`mine-${evenement.id}`} evenement={evenement} onJoinSuccess={setToast} compact />
                                ))}
                            </EventRowCarousel>
                        ) : (
                            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                                Vous n'avez pas encore créé d'événement.
                            </div>
                        )}
                    </div>

                    {/* Section Spécifique Jury / Gamification */}
                    <div className="space-y-5 rounded-[2rem] border border-cyan-100 bg-cyan-50/30 p-5 dark:border-cyan-900/20 dark:bg-cyan-950/10">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-cyan-900 dark:text-cyan-100">
                            <TrendingUp className="size-4" />
                            Missions Jury
                        </h2>
                        <div className="space-y-3">
                            {mesEvenements.filter(e => e.type === 'concours').slice(0, 2).map(event => (
                                <div key={`jury-${event.id}`} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
                                    <div className="text-sm font-medium">{event.titre}</div>
                                    <Button size="sm" variant="link" className="h-auto p-0 text-cyan-600" asChild>
                                        <Link href={`/evenements/${event.id}`}>Évaluer les candidats →</Link>
                                    </Button>
                                </div>
                            ))}
                            <p className="text-center text-xs text-slate-500">Contribuez à l'excellence du campus.</p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1fr_auto]">
                    <div className="space-y-5">
                        {/* Remplacement des listes par des carrousels pour la performance et le design */}
                        <EventRowCarousel 
                            itemsCount={topActifs.length} 
                            title="À la une" 
                            subtitle="Les fiches qui génèrent le plus d'activité."
                        >
                            {topActifs.map((evenement) => (
                                <EventCard key={`active-${evenement.id}`} evenement={evenement} onJoinSuccess={setToast} compact />
                            ))}
                        </EventRowCarousel>

                        <EventRowCarousel 
                            itemsCount={recommendations.length} 
                            title="Pour vous" 
                            subtitle="Orienté par vos intérêts et votre rôle."
                        >
                            {recommendations.map((evenement) => (
                                <EventCard key={`smart-${evenement.id}`} evenement={evenement} onJoinSuccess={setToast} compact />
                            ))}
                        </EventRowCarousel>
                    </div>

                    <div className="space-y-5">
                        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Mes inscriptions</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Vos dernières activités.
                                    </p>
                                </div>
                                <Button asChild variant="outline">
                                    <Link href={myRegistrations()}>Voir tout</Link>
                                </Button>
                            </div>
                            <div className="mt-5 space-y-3">
                                {mesInscriptions.length ? (
                                    mesInscriptions.map((event) => (
                                        <Link
                                            key={`registration-${event.id}`}
                                            href={`/evenements/${event.id}`}
                                            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                                        >
                                            <div className="flex items-center gap-3">
                                                <UserAvatar name={event.createur.name} className="size-10" />
                                                <div>
                                                    <div className="font-medium text-slate-900 dark:text-white">{event.titre}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        {event.participation?.statut === 'participe' ? 'Confirmé' : 'Intéressé'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {new Date(event.date_debut).toLocaleDateString()}
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                                        Aucune inscription recente.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-5 rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Événements populaires</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Les fiches les plus consultées par la communauté.
                            </p>
                        </div>
                        <Button asChild variant="outline">
                            <Link href={evenementsIndex()}>Explorer</Link>
                        </Button>
                    </div>
                    {evenementsPopulaires.length ? (
                        <EventRowCarousel itemsCount={evenementsPopulaires.length} title="Populaires" subtitle="Succès du moment">
                            {evenementsPopulaires.map((evenement) => (
                                <EventCard key={`popular-${evenement.id}`} evenement={evenement} onJoinSuccess={setToast} compact />
                            ))}
                        </EventRowCarousel>
                    ) : (
                        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                            Aucun evenement populaire a afficher pour le moment.
                        </div>
                    )}
                </section>

                <section className="grid gap-6 xl:grid-cols-2">
                    <div className="space-y-5 rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Top evenements actifs</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Les fiches qui generent le plus d activite et de commentaires.
                            </p>
                        </div>
                        <div className="grid gap-5 md:grid-cols-2">
                            {topActifs.map((evenement) => (
                                <EventCard key={`active-${evenement.id}`} evenement={evenement} onJoinSuccess={setToast} />
                            ))}
                        </div>
                    </div>
                    <div className="space-y-5 rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Recommandations intelligentes</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Orientees par votre role et vos interactions precedentes.
                            </p>
                        </div>
                        <div className="grid gap-5 md:grid-cols-2">
                            {recommendations.map((evenement) => (
                                <EventCard key={`smart-${evenement.id}`} evenement={evenement} onJoinSuccess={setToast} />
                            ))}
                        </div>
                    </div>
                </section>
            </div>
            <EventToast message={toast} />
        </AppLayout>
    );
}
