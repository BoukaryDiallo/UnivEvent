import { Head, router, useForm } from '@inertiajs/react';
import { CalendarDays, Clock3, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Disponibilités', href: '/dispos' },
];

type Option = { id: number | string; nom: string };
type Cible = { id: number; name: string; email: string } | null;
type Enseignant = { id: number; name: string; email: string };
type Ligne = { id: number; jour?: number; date?: string; debut: string; fin: string; niveau: string; motif?: string | null };
type Charge = { max_jour: number | null; max_semaine: number | null } | null;
type Reservation = {
    id: number;
    date: string;
    debut: string;
    fin: string;
    source: string;
    ref?: string | null;
    niveau: string;
    motif?: string | null;
    libere_at?: string | null;
};

const noms: Record<number, string> = {
    1: 'Lundi',
    2: 'Mardi',
    3: 'Mercredi',
    4: 'Jeudi',
    5: 'Vendredi',
    6: 'Samedi',
    7: 'Dimanche',
};

export default function Dispos({
    admin,
    cible,
    enseignants,
    jours,
    niveaux,
    dispos,
    ecarts,
    charge,
    reservations,
}: {
    admin: boolean;
    cible: Cible;
    enseignants: Enseignant[];
    jours: Option[];
    niveaux: Option[];
    dispos: Ligne[];
    ecarts: Ligne[];
    charge: Charge;
    reservations: Reservation[];
}) {
    const bloc = useForm({
        user_id: cible?.id ?? 0,
        jour: 1,
        debut: '',
        fin: '',
        niveau: 'prefere',
        motif: '',
    });

const ecart = useForm({
    user_id: cible?.id ?? 0,
    date: '',
    debut: '',
    fin: '',
    niveau: 'acceptable',
    motif: '',
});

const [ecartErrors, setEcartErrors] = useState<Record<string, string>>({});

    const limite = useForm({
        user_id: cible?.id ?? 0,
        max_jour: charge?.max_jour?.toString() ?? '',
        max_semaine: charge?.max_semaine?.toString() ?? '',
    });

    const changer = (id: string) => {
        router.get('/dispos', { enseignant: id }, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Disponibilités" />
            <div className="space-y-6 p-4">
                <div className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Gestion des disponibilités</h1>
                        <p className="text-sm text-muted-foreground">
                            Créneaux hebdomadaires, exceptions, charge et réservations futures.
                        </p>
                    </div>
                    {admin && (
                        <div className="grid gap-2">
                            <Label htmlFor="enseignant">Enseignant</Label>
                            <select
                                id="enseignant"
                                className="rounded-md border bg-background px-3 py-2 text-sm"
                                value={cible?.id ?? ''}
                                onChange={(event) => changer(event.target.value)}
                            >
                                {enseignants.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {cible ? (
                    <>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <CalendarDays className="size-4" />
                                        Enseignant
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm">
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Clock3 className="size-4" />
                                        Créneaux
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-2xl font-semibold">{dispos.length}</CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <ShieldCheck className="size-4" />
                                        Réservations actives
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-2xl font-semibold">
                                    {reservations.filter((item) => !item.libere_at).length}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Créneau hebdomadaire</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        className="space-y-3"
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            bloc.post('/dispos');
                                        }}
                                    >
                                        <div className="grid gap-2">
                                            <Label>Jour</Label>
                                            <select
                                                className="rounded-md border bg-background px-3 py-2 text-sm"
                                                value={bloc.data.jour}
                                                onChange={(event) => bloc.setData('jour', Number(event.target.value))}
                                            >
                                                {jours.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.nom}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="grid gap-2">
                                                <Label>Début</Label>
                                                <Input type="time" value={bloc.data.debut} onChange={(event) => bloc.setData('debut', event.target.value)} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Fin</Label>
                                                <Input type="time" value={bloc.data.fin} onChange={(event) => bloc.setData('fin', event.target.value)} />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Niveau</Label>
                                            <select
                                                className="rounded-md border bg-background px-3 py-2 text-sm"
                                                value={bloc.data.niveau}
                                                onChange={(event) => bloc.setData('niveau', event.target.value)}
                                            >
                                                {niveaux.map((item) => (
                                                    <option key={item.id} value={String(item.id)}>
                                                        {item.nom}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Motif</Label>
                                            <Input value={bloc.data.motif} onChange={(event) => bloc.setData('motif', event.target.value)} />
                                        </div>
                                        <Button disabled={bloc.processing}>Ajouter</Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Exception</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        className="space-y-3"
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            
                                            // Client validation
                                            const errors: Record<string, string> = {};
                                            
                                            if (!ecart.data.date) {
                                                errors.date = 'La date est requise';
                                            } else {
                                                const existing = ecarts.some(e => e.date === ecart.data.date);

                                                if (existing) {
                                                    errors.date = 'Cette date est déjà enregistrée';
                                                }
                                            }
                                            
                                            if (!ecart.data.debut || !ecart.data.fin) {
                                                errors.time = 'Les heures de début et fin sont requises';
                                            } else {
                                                const debut = new Date(`2000-01-01T${ecart.data.debut}:00`);
                                                const fin = new Date(`2000-01-01T${ecart.data.fin}:00`);

                                                if (fin <= debut) {
                                                    errors.time = 'L\'heure de fin doit être après l\'heure de début';
                                                }
                                            }
                                            
                                            if (Object.keys(errors).length > 0) {
                                                setEcartErrors(errors);

                                                return;
                                            }
                                            
                                            setEcartErrors({});
                                            ecart.post('/ecarts', {
                                                preserveState: true,
                                                preserveScroll: true,
                                            });
                                        }}
                                    >
                                        <div className="grid gap-2">
                                            <Label>Date</Label>
                                            <Input type="date" value={ecart.data.date} onChange={(event) => {
                                                ecart.setData('date', event.target.value);

                                                if (ecartErrors.date) {
setEcartErrors({...ecartErrors, date: ''});
}
                                            }} />
                                            {ecartErrors.date && (
                                                <div className="text-sm text-destructive">{ecartErrors.date}</div>
                                            )}
                                            <InputError message={ecart.errors.date} className="mt-1" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="grid gap-2">
                                                <Label>Début</Label>
                                                <Input type="time" value={ecart.data.debut} onChange={(event) => {
                                                    ecart.setData('debut', event.target.value);

                                                    if (ecartErrors.time) {
setEcartErrors({...ecartErrors, time: ''});
}
                                                }} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Fin</Label>
                                                <Input type="time" value={ecart.data.fin} onChange={(event) => {
                                                    ecart.setData('fin', event.target.value);

                                                    if (ecartErrors.time) {
setEcartErrors({...ecartErrors, time: ''});
}
                                                }} />
                                            </div>
                                            {ecartErrors.time && (
                                                <div className="text-sm text-destructive col-span-2">{ecartErrors.time}</div>
                                            )}
                                            <InputError message={ecart.errors.debut ?? ecart.errors.fin} className="mt-1 col-span-2" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Niveau</Label>
                                            <select
                                                className="rounded-md border bg-background px-3 py-2 text-sm"
                                                value={ecart.data.niveau}
                                                onChange={(event) => ecart.setData('niveau', event.target.value)}
                                            >
                                                {niveaux.map((item) => (
                                                    <option key={item.id} value={String(item.id)}>
                                                        {item.nom}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Motif</Label>
                                            <Input value={ecart.data.motif} onChange={(event) => ecart.setData('motif', event.target.value)} />
                                        </div>
                                        <Button disabled={ecart.processing}>Ajouter</Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Charge</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        className="space-y-3"
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            limite.put('/charges');
                                        }}
                                    >
                                        <div className="grid gap-2">
                                            <Label>Max jour (h)</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="24"
                                                value={limite.data.max_jour}
                                                onChange={(event) => limite.setData('max_jour', event.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Max semaine (h)</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="168"
                                                value={limite.data.max_semaine}
                                                onChange={(event) => limite.setData('max_semaine', event.target.value)}
                                            />
                                        </div>
                                        <Button disabled={limite.processing}>Enregistrer</Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Disponibilités hebdomadaires</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Jour</TableHead>
                                                <TableHead>Plage</TableHead>
                                                <TableHead>Niveau</TableHead>
                                                <TableHead>Motif</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dispos.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{noms[item.jour ?? 1]}</TableCell>
                                                    <TableCell>{item.debut} - {item.fin}</TableCell>
                                                    <TableCell>{item.niveau}</TableCell>
                                                    <TableCell>{item.motif ?? '-'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="outline" onClick={() => router.delete(`/dispos/${item.id}`)}>
                                                            Retirer
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Exceptions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Plage</TableHead>
                                                <TableHead>Niveau</TableHead>
                                                <TableHead>Motif</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {ecarts.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{item.date}</TableCell>
                                                    <TableCell>{item.debut ?? '00:00'} - {item.fin ?? '23:59'}</TableCell>
                                                    <TableCell>{item.niveau ?? 'indisponible'}</TableCell>
                                                    <TableCell>{item.motif ?? '-'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="outline" onClick={() => router.delete(`/ecarts/${item.id}`)}>
                                                            Retirer
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Réservations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Plage</TableHead>
                                            <TableHead>Source</TableHead>
                                            <TableHead>Niveau</TableHead>
                                            <TableHead>Ref</TableHead>
                                            <TableHead>État</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reservations.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.date}</TableCell>
                                                <TableCell>{item.debut} - {item.fin}</TableCell>
                                                <TableCell>{item.source}</TableCell>
                                                <TableCell>{item.niveau}</TableCell>
                                                <TableCell>{item.ref ?? '-'}</TableCell>
                                                <TableCell>{item.libere_at ? 'Libérée' : 'Active'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <Card>
                        <CardContent className="py-10 text-center text-sm text-muted-foreground">
                            Aucun enseignant n&apos;est encore disponible dans le système.
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
