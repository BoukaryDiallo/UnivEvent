import { Link } from '@inertiajs/react';
import { show } from '@/routes/evenements';
import type { EventSummary } from '@/types';

type EventCalendarPanelProps = {
    events: EventSummary[];
};

export function EventCalendarPanel({ events }: EventCalendarPanelProps) {
    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
            <div>
                <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Calendrier interactif</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Prochains evenements cliquables sur 30 jours.</p>
            </div>
            <div className="mt-5 space-y-3">
                {events.length ? (
                    events.map((event) => (
                        <Link
                            key={event.id}
                            href={show(event.id)}
                            className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-sky-300 hover:bg-sky-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                        >
                            <div>
                                <div className="font-medium text-slate-950 dark:text-white">{event.titre}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{event.lieu || 'En ligne / campus'}</div>
                            </div>
                            <div className="text-right text-sm text-slate-400">
                                {new Date(event.date_debut).toLocaleDateString()}
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                        Aucun evenement a venir dans le calendrier.
                    </div>
                )}
            </div>
        </div>
    );
}
