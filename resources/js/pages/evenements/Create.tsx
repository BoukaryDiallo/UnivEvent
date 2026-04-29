import { Head, Link, useForm } from '@inertiajs/react';
import { CalendarDays, MapPin, Sparkles, Trophy } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

type CreateProps = {
    eventType?: 'conference' | 'concours';
};

export default function EvenementsCreate({ eventType = 'conference' }: CreateProps) {
    const defaultStart = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
    const isConcours = eventType === 'concours';
    const form = useForm({
        titre: '',
        type: eventType,
        date_debut: defaultStart,
        lieu: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Evenements', href: '/evenements' },
        { title: 'Gestion', href: '/evenements/gestion' },
        { title: isConcours ? 'Creation concours' : 'Creation conference', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isConcours ? 'Creer un concours' : 'Creer une conference'} />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-6">
                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <Card className="overflow-hidden border-0 bg-[linear-gradient(145deg,#0f172a_0%,#1d4ed8_50%,#38bdf8_100%)] text-white shadow-xl">
                        <CardContent className="space-y-6 p-8">
                            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm">
                                <Sparkles className="h-4 w-4" />
                                Creation express
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-4xl font-semibold tracking-tight">
                                    {isConcours ? 'Creez un concours en moins d une minute.' : 'Lancez votre conference en moins d une minute.'}
                                </h1>
                                <p className="max-w-xl text-sm leading-6 text-white/80">
                                    Le type est deja defini. Vous posez le minimum vital maintenant, puis vous configurez librement le reste depuis la page de gestion intelligente.
                                </p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-3xl bg-white/10 p-4">
                                    <p className="text-sm text-white/70">1. Creation</p>
                                    <p className="mt-2 font-medium">Titre, date, lieu</p>
                                </div>
                                <div className="rounded-3xl bg-white/10 p-4">
                                    <p className="text-sm text-white/70">2. Configuration</p>
                                    <p className="mt-2 font-medium">Sections libres et autosave</p>
                                </div>
                                <div className="rounded-3xl bg-white/10 p-4">
                                    <p className="text-sm text-white/70">3. Validation</p>
                                    <p className="mt-2 font-medium">Controle final intelligent</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-2xl text-slate-950">
                                {isConcours ? 'Creer mon concours' : 'Creer ma conference'}
                            </CardTitle>
                            <CardDescription>
                                Vous serez redirige directement vers la console de gestion.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={(event) => {
                                event.preventDefault();
                                form.post('/evenements');
                            }} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="titre">Titre</Label>
                                    <Input
                                        id="titre"
                                        value={form.data.titre}
                                        onChange={(event) => form.setData('titre', event.target.value)}
                                        className="rounded-2xl"
                                        placeholder={isConcours ? 'Concours innovation 2026' : 'Conference IA & Recherche'}
                                    />
                                    {form.errors.titre ? <p className="text-sm text-rose-600">{form.errors.titre}</p> : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date_debut" className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4" />
                                        Date de debut
                                    </Label>
                                    <Input
                                        id="date_debut"
                                        type="datetime-local"
                                        value={form.data.date_debut}
                                        onChange={(event) => form.setData('date_debut', event.target.value)}
                                        className="rounded-2xl"
                                    />
                                    {form.errors.date_debut ? <p className="text-sm text-rose-600">{form.errors.date_debut}</p> : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lieu" className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Lieu
                                    </Label>
                                    <Input
                                        id="lieu"
                                        value={form.data.lieu}
                                        onChange={(event) => form.setData('lieu', event.target.value)}
                                        className="rounded-2xl"
                                        placeholder="Campus central, salle A2"
                                    />
                                    {form.errors.lieu ? <p className="text-sm text-rose-600">{form.errors.lieu}</p> : null}
                                </div>

                                <input type="hidden" value={form.data.type} />

                                <Button type="submit" disabled={form.processing} className="w-full rounded-2xl">
                                    <Trophy className="mr-2 h-4 w-4" />
                                    Creer mon evenement
                                </Button>
                            </form>

                            <div className="mt-6 text-sm text-slate-500">
                                <Link href="/evenements/gestion" className="text-sky-600">
                                    Revenir au tableau de gestion
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
