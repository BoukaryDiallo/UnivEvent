import { Head, Link, router } from '@inertiajs/react';
import { CalendarRange, Plus, Sparkles, Users } from 'lucide-react';
import { useDeferredValue, useEffect, useState } from 'react';
import { EventCard } from '@/components/evenements/EventCard';
import { EventFilters } from '@/components/evenements/EventFilters';
import { EventRowCarousel } from '@/components/evenements/EventRowCarousel';
import { EventToast } from '@/components/evenements/EventToast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/layouts/app-layout';
import { gestion, index } from '@/routes/evenements';
import type { BreadcrumbItem, EventFilterState, EventSummary, PaginatedEvents } from '@/types';

type IndexProps = {
    evenements: PaginatedEvents;
    filters: EventFilterState;
    stats: {
        total: number;
        published: number;
        upcoming: number;
    };
    catalogMode: {
        isAdmin: boolean;
        canManageEvents: boolean;
        isParticipantView: boolean;
    };
    recommendations: EventSummary[];
    recentEvents: EventSummary[];
    influentialEvents: EventSummary[];
};

export default function EvenementsIndex({ evenements, filters, stats, catalogMode, recommendations, recentEvents, influentialEvents }: IndexProps) {
    const [localFilters, setLocalFilters] = useState<EventFilterState>(filters);
    const deferredFilters = useDeferredValue(localFilters);
    const [isFiltering, setIsFiltering] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            if (JSON.stringify(deferredFilters) === JSON.stringify(filters)) {
                setIsFiltering(false);

                return;
            }

            setIsFiltering(true);
            router.get(index(), deferredFilters, {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onFinish: () => setIsFiltering(false),
            });
        }, 250);

        return () => window.clearTimeout(timeout);
    }, [deferredFilters, filters]);

    useEffect(() => {
        if (!toast) {
            return;
        }

        const timeout = window.setTimeout(() => setToast(null), 2500);

        return () => window.clearTimeout(timeout);
    }, [toast]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Evenements', href: index() },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Evenements" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <section className="overflow-hidden rounded-4xl bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_32%),linear-gradient(135deg,rgba(15,23,42,1),rgba(8,47,73,0.96)_55%,rgba(8,145,178,0.86))] p-6 text-white shadow-xl shadow-slate-200/70 dark:shadow-black/20">
                    <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
                                <Sparkles className="size-3.5" />
                                Gérer - Conferences & Concours
                            </div>
                            <div className="space-y-3">
                                <h1 className="max-w-2xl text-3xl font-semibold sm:text-4xl">
                                    {catalogMode.isParticipantView
                                        ? 'Trouvez rapidement les evenements les plus utiles pour vous et rejoignez-les en quelques clics.'
                                        : 'Explorez les evenements comme un catalogue premium avec recommandations, rangs thematiques et actions immediates.'}
                                </h1>
                                <p className="max-w-2xl text-sm leading-7 text-cyan-50/88 sm:text-base">
                                    {catalogMode.isParticipantView
                                        ? 'Conferences, concours et rendez-vous campus presentes dans une experience plus lisible, plus rapide et plus orientee inscription.'
                                        : 'Conferences, concours et rendez-vous campus dans une experience plus visuelle, plus rapide et plus engageante.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            {catalogMode.canManageEvents ? (
                                <div className="grid min-w-0 flex-1 grid-cols-3 gap-3 rounded-3xl border border-white/15 bg-white/10 p-3 backdrop-blur">
                                    <div className="rounded-2xl bg-white/10 p-3">
                                        <div className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">Total</div>
                                        <div className="mt-2 text-2xl font-semibold">{stats.total}</div>
                                    </div>
                                    <div className="rounded-2xl bg-white/10 p-3">
                                        <div className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">Publies</div>
                                        <div className="mt-2 text-2xl font-semibold">{stats.published}</div>
                                    </div>
                                    <div className="rounded-2xl bg-white/10 p-3">
                                        <div className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">A venir</div>
                                        <div className="mt-2 text-2xl font-semibold">{stats.upcoming}</div>
                                    </div>
                                </div>
                            ) : null}
                            <Button asChild size="lg" className="h-auto rounded-3xl bg-white px-5 py-4 text-slate-950 hover:bg-cyan-50">
                                <Link href={gestion()}>
                                    <Plus className="size-4" />
                                    Creer un evenement
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                <EventFilters filters={localFilters} onChange={setLocalFilters} />

                <section className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-slate-200 bg-white/85 p-5 dark:border-slate-800 dark:bg-slate-950/70">
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            <CalendarRange className="size-4" />
                            Vue temporelle
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                            Filtrez le catalogue par periode pour passer des sorties recentes aux temps forts a venir.
                        </p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white/85 p-5 dark:border-slate-800 dark:bg-slate-950/70">
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            <Users className="size-4" />
                            Recommandations intelligentes
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                            Le score prend en compte le role, l historique d inscriptions et les signaux d engagement de la plateforme.
                        </p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white/85 p-5 dark:border-slate-800 dark:bg-slate-950/70">
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            <Sparkles className="size-4" />
                            Carousel immersif
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                            Drag horizontal avec inertia pour une navigation plus fluide, proche d une experience Netflix ou SaaS editorialise.
                        </p>
                    </div>
                </section>

                <section className="space-y-6">
                    {recommendations.length ? (
                        <EventRowCarousel
                            title="Recommandes pour vous"
                            subtitle="Selection priorisee selon votre profil et vos affinites d usage."
                            itemsCount={recommendations.length}
                        >
                            {recommendations.map((evenement) => (
                                <EventCard key={`rec-${evenement.id}`} evenement={evenement} onJoinSuccess={setToast} compact />
                            ))}
                        </EventRowCarousel>
                    ) : null}

                    {recentEvents.length ? (
                        <EventRowCarousel
                            title="Ajoutes recemment"
                            subtitle="Les derniers evenements publies a parcourir sans quitter le fil principal."
                            itemsCount={recentEvents.length}
                        >
                            {recentEvents.map((evenement) => (
                                <EventCard key={`recent-${evenement.id}`} evenement={evenement} onJoinSuccess={setToast} compact />
                            ))}
                        </EventRowCarousel>
                    ) : null}

                    {influentialEvents.length ? (
                        <EventRowCarousel
                            title="Les plus influents"
                            subtitle="Ceux qui concentrent le plus d inscriptions, d activite et de conversations."
                            itemsCount={influentialEvents.length}
                        >
                            {influentialEvents.map((evenement) => (
                                <EventCard key={`influential-${evenement.id}`} evenement={evenement} onJoinSuccess={setToast} compact />
                            ))}
                        </EventRowCarousel>
                    ) : null}

                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Fil des evenements</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {evenements.total} evenement{evenements.total > 1 ? 's' : ''} correspondent aux filtres actuels.
                            </p>
                        </div>
                    </div>

                    {isFiltering ? (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, indexValue) => (
                                <div key={indexValue} className="space-y-4 rounded-4xl border border-slate-200 bg-white/90 p-5 dark:border-slate-800 dark:bg-slate-950/70">
                                    <Skeleton className="aspect-16/10 rounded-3xl" />
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-8 w-5/6" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            ))}
                        </div>
                    ) : evenements.data.length ? (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {evenements.data.map((evenement) => (
                                <EventCard key={evenement.id} evenement={evenement} onJoinSuccess={setToast} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-4xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-900/50">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {filters.statut === 'publie'
                                    ? 'Aucun evenement publie a decouvrir pour le moment.'
                                    : 'Aucun evenement ne correspond a ces filtres.'}
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                {filters.search || filters.type !== 'all' || filters.scope !== 'upcoming' || filters.date !== 'all'
                                    ? 'Essayez d elargir les filtres ou de revenir a la vue par defaut.'
                                    : 'Les prochains evenements apparaitront ici des qu ils seront publies et valides.'}
                            </p>
                            <div className="mt-6 flex justify-center gap-3">
                                <Button type="button" variant="outline" onClick={() => setLocalFilters({ search: '', scope: 'upcoming', type: 'all', statut: 'all', date: 'all' })}>
                                    Reinitialiser les filtres
                                </Button>
                                <Button asChild>
                                    <Link href={gestion()}>Ouvrir la gestion</Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </section>

                {evenements.last_page > 1 ? (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {evenements.links.map((link, linkIndex) => (
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
            </div>
            <EventToast message={toast} />
        </AppLayout>
    );
}
