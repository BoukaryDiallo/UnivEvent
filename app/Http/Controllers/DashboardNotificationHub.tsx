import { BellRing, Radio, CalendarClock } from 'lucide-react';

export function DashboardNotificationHub({ stats }: { stats: any }) {
    return (
        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-300">
                    <BellRing className="size-5" />
                </div>
                <div className="mt-4 text-3xl font-bold text-slate-950 dark:text-white">{stats.unread}</div>
                <div className="mt-1 text-sm text-slate-500">Notifications non lues</div>
            </div>
            {/* Répéter pour les autres metrics... */}
        </div>
    );
}
