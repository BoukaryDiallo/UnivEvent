import { Link } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

type GlobalFeedPanelProps = {
    items: Array<{
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
    }>;
    title?: string;
    subtitle?: string;
    showViewAll?: boolean;
    emptyMessage?: string;
};

export function GlobalFeedPanel({
    items,
    title = 'Fil d actualite global',
    subtitle = 'Nouveaux evenements, inscriptions, programmes et resultats.',
    showViewAll = false,
    emptyMessage = 'Le fil d actualite est encore vide.',
}: GlobalFeedPanelProps) {
    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
                </div>
                {showViewAll ? (
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link href="/notifications">Ouvrir le hub</Link>
                    </Button>
                ) : null}
            </div>
            <div className="mt-5 space-y-3">
                {items.length ? (
                    items.map((item) => (
                        <Link key={item.id} href={`/evenements/${item.event_id}`} className="flex gap-3 rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-sky-300 hover:bg-sky-50 dark:border-slate-800 dark:hover:bg-slate-900">
                            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white">
                                <Sparkles className="size-4" />
                            </div>
                            <div>
                                <div className="font-medium text-slate-950 dark:text-white">{item.label} · {item.event_title}</div>
                                <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                    {item.user.name ? `${item.user.name} · ` : ''}
                                    {item.description || 'Activite recente sur la plateforme.'}
                                </div>
                                <div className="mt-2 text-xs text-slate-400">
                                    {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                                </div>
                            </div>
                        </Link>
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
