import { Head } from '@inertiajs/react';
import { Ticket } from 'lucide-react';
import { EventCard } from '@/components/evenements/EventCard';
import AppLayout from '@/layouts/app-layout';
import { index as evenementsIndex } from '@/routes/evenements';
import { mine } from '@/routes/inscriptions';
import type { BreadcrumbItem, EventSummary, PaginatedEvents } from '@/types';

type InscriptionsProps = {
    inscriptions: PaginatedEvents;
};

export default function MyRegistrations({ inscriptions }: InscriptionsProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Evenements', href: evenementsIndex() },
        { title: 'Mes inscriptions', href: mine() },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mes inscriptions" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
                    <div className="flex items-start gap-4">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white">
                            <Ticket className="size-6" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Mes inscriptions</h1>
                            <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                                Retrouvez rapidement tous les evenements auxquels vous participez, avec votre statut d’inscription directement sur chaque carte.
                            </p>
                        </div>
                    </div>
                </section>

                {inscriptions.data.length ? (
                    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {inscriptions.data.map((evenement: EventSummary) => (
                            <EventCard key={evenement.id} evenement={evenement} />
                        ))}
                    </section>
                ) : (
                    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                        Vous n’avez encore aucune inscription enregistree.
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
