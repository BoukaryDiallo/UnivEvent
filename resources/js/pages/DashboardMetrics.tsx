import { CalendarClock, Ticket, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

interface MetricsProps {
    stats: {
        events_count: number;
        inscriptions_count: number;
        upcoming_count: number;
        participation_rate: number;
    };
}

export function DashboardMetrics({ stats }: MetricsProps) {
    const metricCards = useMemo(() => [
        {
            title: 'Événements',
            value: stats.events_count,
            note: 'Actifs sur la plateforme',
            icon: CalendarClock,
            tone: 'from-sky-500 to-cyan-400',
        },
        {
            title: 'Inscriptions',
            value: stats.inscriptions_count,
            note: 'Demandes et confirmations',
            icon: Ticket,
            tone: 'from-indigo-500 to-blue-500',
        },
        {
            title: 'À venir',
            value: stats.upcoming_count,
            note: 'Prochains rendez-vous',
            icon: TrendingUp,
            tone: 'from-emerald-500 to-teal-400',
        },
        {
            title: 'Participation',
            value: `${stats.participation_rate}%`,
            note: 'Taux moyen de validation',
            icon: Ticket,
            tone: 'from-amber-500 to-orange-400',
        },
    ], [stats]);

    return (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((metric) => (
                <div key={metric.title} className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{metric.title}</div>
                            <div className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{metric.value}</div>
                            <p className="mt-2 text-xs text-slate-500">{metric.note}</p>
                        </div>
                        <div className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${metric.tone} text-white shadow-lg`}>
                            <metric.icon className="size-5" />
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
}