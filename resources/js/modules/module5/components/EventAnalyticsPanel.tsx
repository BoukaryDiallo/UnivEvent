type EventAnalyticsPanelProps = {
    series: Array<{ label: string; inscriptions: number }>;
};

export function EventAnalyticsPanel({ series }: EventAnalyticsPanelProps) {
    const max = Math.max(...series.map((item) => item.inscriptions), 1);

    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
            <div className="flex items-end justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Evolution des inscriptions</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Vue glissante sur 7 jours.</p>
                </div>
                <div className="text-sm text-slate-400">{series.reduce((sum, item) => sum + item.inscriptions, 0)} total</div>
            </div>
            <div className="mt-6 grid grid-cols-7 items-end gap-3">
                {series.map((item) => (
                    <div key={item.label} className="space-y-2 text-center">
                        <div className="flex h-44 items-end justify-center rounded-2xl bg-slate-50 p-2 dark:bg-slate-900">
                            <div
                                className="w-full rounded-xl bg-gradient-to-t from-cyan-500 to-sky-400"
                                style={{ height: `${Math.max((item.inscriptions / max) * 100, item.inscriptions > 0 ? 18 : 8)}%` }}
                            />
                        </div>
                        <div className="text-sm font-medium text-slate-950 dark:text-white">{item.inscriptions}</div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
