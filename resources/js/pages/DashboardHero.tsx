import { Link } from '@inertiajs/react';
import { FileSearch, Flame, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeroProps {
    isAdmin?: boolean;
}

export function DashboardHero({ isAdmin = false }: DashboardHeroProps) {
    return (
        <section className="relative overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.25),transparent_35%),linear-gradient(135deg,rgba(15,23,42,1),rgba(30,41,59,0.95),rgba(8,145,178,0.6))] p-6 text-white shadow-xl">
            <div className="pointer-events-none absolute inset-0 opacity-40 blur-3xl" />

            <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100 backdrop-blur">
                        <Flame className="size-3.5" />
                        Espace personnel UnivEvent
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                            Pilotez vos evenements avec clarte et efficacite.
                        </h1>

                        <p className="max-w-2xl text-sm leading-7 text-cyan-50/80 sm:text-base">
                            Accedez a vos conferences, concours et statistiques en temps reel depuis un tableau de bord centralise.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row xl:flex-col xl:items-end">
                    <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="rounded-full border-white/20 bg-white/10 text-white transition hover:bg-white/20"
                    >
                        <Link href="/evenements/gestion">
                            <FileSearch className="size-4" />
                            Ouvrir mes evenements
                        </Link>
                    </Button>

                    {isAdmin ? (
                        <Button asChild size="lg" variant="ghost" className="rounded-full text-cyan-100 transition hover:bg-white/10">
                            <Link href="/admin/events/pending">
                                <ShieldCheck className="size-4" />
                                Validation admin
                            </Link>
                        </Button>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
