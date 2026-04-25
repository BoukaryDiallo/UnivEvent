import { Link } from '@inertiajs/react';
import { Flame, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { create as createEvent, index as evenementsIndex } from '@/routes/evenements';

export function DashboardHero() {
    return (
        <section className="overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.28),_transparent_30%),linear-gradient(135deg,_rgba(15,23,42,1),_rgba(30,41,59,0.96)_58%,_rgba(14,116,144,0.8))] p-6 text-white shadow-xl shadow-slate-200/70 dark:shadow-black/20">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
                        <Flame className="size-3.5" />
                        Votre espace personnel UnivEvent
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-3xl font-semibold sm:text-4xl italic tracking-tight">
                            Pilotez vos conférences et concours en un coup d'œil.
                        </h1>
                        <p className="max-w-2xl text-sm leading-7 text-cyan-50/88 sm:text-base">
                            Retrouvez vos indicateurs clés et vos prochaines étapes dans une interface simplifiée.
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button asChild size="lg" className="rounded-full bg-white text-slate-950 hover:bg-cyan-50">
                        <Link href={createEvent()}>
                            <Plus className="size-4" />
                            Créer un événement
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20">
                        <Link href={evenementsIndex()}>Voir le fil</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}