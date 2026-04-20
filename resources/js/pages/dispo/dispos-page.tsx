import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, BookOpen, Calendar, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { ConfirmButton } from '@/components/dispo/confirm-button';
import { DispoShell } from '@/components/dispo/entete';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BreadcrumbItem } from '@/types';
import type { ChargeDispo, LigneDispo, NiveauOption, ResumeDispo, UserDispo } from '@/types/dispo';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Disponibilites', href: '/dispos' },
];

const noms: Record<number, string> = {
    1: 'Lundi',
    2: 'Mardi',
    3: 'Mercredi',
    4: 'Jeudi',
    5: 'Vendredi',
    6: 'Samedi',
    7: 'Dimanche',
};

const explications = [
    {
        titre: 'Disponibilites',
        icone: Calendar,
        contenu: "Ce sont vos creneaux libres chaque semaine. Vous indiquez quand vous etes disponible pour enseigner, avec votre preference.",
    },
    {
        titre: 'Exceptions',
        icone: AlertCircle,
        contenu: "Ce sont des changements ponctuels. Par exemple : une semaine ou vous n etes pas disponible, ou un creneau special ajoute pour une periode precise.",
    },
    {
        titre: 'Reservations',
        icone: BookOpen,
        contenu: 'Ce sont vos cours deja planifies. Une fois reserve, le creneau devient bloque et vous ne pouvez plus le modifier.',
    },
    {
        titre: 'Charges',
        icone: GraduationCap,
        contenu: "C est la limite que vous vous fixez : combien d heures maximum par jour et par semaine pour eviter d etre surcharge.",
    },
];

export default function DisposPage({
    user,
    resume,
    dispos,
    charges,
    semestres,
    anneesAcademiques,
}: {
    user: UserDispo;
    resume: ResumeDispo;
    dispos: LigneDispo[];
    charges: ChargeDispo[];
    semestres: NiveauOption[];
    anneesAcademiques: string[];
}) {
    const { flash } = usePage().props as { flash?: { charge_to_edit?: string | number } };
    const chargeToEditId = flash?.charge_to_edit ? String(flash.charge_to_edit) : null;
    const chargeToEdit = chargeToEditId ? charges.find((charge) => String(charge.id) === chargeToEditId) : null;
    const semestreInitial = chargeToEdit
        ? Array.isArray(chargeToEdit.semestre)
            ? chargeToEdit.semestre.map(String)
            : [String(chargeToEdit.semestre)]
        : [];

    const [ouvert, setOuvert] = useState(Boolean(chargeToEdit));
    const [selectedChargeId, setSelectedChargeId] = useState<string | null>(chargeToEditId);
    const [selectedSemestres, setSelectedSemestres] = useState<string[]>(semestreInitial);
    const [explicationIndex, setExplicationIndex] = useState(0);

    const limite = useForm({
        charge_id: chargeToEditId ?? '',
        semestre: semestreInitial,
        annee_academique: chargeToEdit ? String(chargeToEdit.annee_academique ?? '') : (anneesAcademiques[0] ?? ''),
        max_jour: chargeToEdit ? String(chargeToEdit.max_jour ?? '') : '',
        max_semaine: chargeToEdit ? String(chargeToEdit.max_semaine ?? '') : '',
    });

    const chargeSelectionnee = charges.find((charge) => String(charge.id) === selectedChargeId);

    const handleSemestreChange = (semestreId: string) => {
        let newSelected: string[];

        if (semestreId === 'tous_les_semestres') {
            newSelected = selectedSemestres.includes('tous_les_semestres') ? [] : ['tous_les_semestres'];
        } else {
            const filtered = selectedSemestres.filter((semestre) => semestre !== 'tous_les_semestres');

            if (selectedSemestres.includes(semestreId)) {
                newSelected = filtered.filter((semestre) => semestre !== semestreId);
            } else {
                newSelected = [...filtered, semestreId];
            }

            if (newSelected.length === 3) {
                newSelected = ['tous_les_semestres'];
            }
        }

        setSelectedSemestres(newSelected);
        limite.setData('semestre', newSelected);
    };

    const resetChargeForm = () => {
        setSelectedChargeId(null);
        setSelectedSemestres([]);
        limite.reset();
        limite.setData({
            charge_id: '',
            semestre: [],
            annee_academique: anneesAcademiques[0] ?? '',
            max_jour: '',
            max_semaine: '',
        });
    };

    const nextExplication = () => {
        if (explicationIndex < explications.length - 1) {
            setExplicationIndex(explicationIndex + 1);
        }
    };

    const prevExplication = () => {
        if (explicationIndex > 0) {
            setExplicationIndex(explicationIndex - 1);
        }
    };

    return (
        <DispoShell title="Mes disponibilites" description="Gerez vos creneaux d enseignement et vos charges pedagogiques" breadcrumbs={breadcrumbs} resume={resume} user={user} showResume={false}>
            <Head title="Mes disponibilites" />

            <div className="mb-6 grid gap-6 lg:grid-cols-3">
                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Actions rapides</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button asChild className="w-full">
                            <Link href="/dispos/ajout">Ajouter une disponibilite</Link>
                        </Button>
                        <Dialog
                            open={ouvert}
                            onOpenChange={(open) => {
                                setOuvert(open);

                                if (!open) {
                                    resetChargeForm();
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full">Definir une charge</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Definir une charge</DialogTitle>
                                    <DialogDescription>Indiquez votre volume horaire maximum par jour et par semaine.</DialogDescription>
                                </DialogHeader>
                                <form
                                    className="space-y-4"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        limite.put('/charges', {
                                            preserveScroll: true,
                                            preserveState: false,
                                            onSuccess: () => {
                                                setOuvert(false);
                                                resetChargeForm();
                                                router.reload({ only: ['charges', 'resume', 'notifications'] });
                                            },
                                        });
                                    }}
                                >
                                    <div className="grid gap-2">
                                        <Label>Semestres concernes</Label>
                                        <div className="space-y-2 rounded-md border bg-muted/30 p-3">
                                            {semestres.map((item) => (
                                                <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded p-1 hover:bg-muted">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSemestres.includes(String(item.id))}
                                                        onChange={() => handleSemestreChange(String(item.id))}
                                                        className="rounded"
                                                    />
                                                    <span className="text-sm">{item.nom}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <InputError message={limite.errors.semestre} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Annee academique</Label>
                                        <select
                                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                            value={limite.data.annee_academique}
                                            onChange={(event) => limite.setData('annee_academique', event.target.value)}
                                        >
                                            {anneesAcademiques.map((annee) => (
                                                <option key={annee} value={annee}>{annee}</option>
                                            ))}
                                        </select>
                                        <InputError message={limite.errors.annee_academique} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-2">
                                            <Label>Max par jour (heures)</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="24"
                                                placeholder="Ex: 8"
                                                value={limite.data.max_jour}
                                                onChange={(event) => limite.setData('max_jour', event.target.value)}
                                            />
                                            <InputError message={limite.errors.max_jour} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Max par semaine (heures)</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="168"
                                                placeholder="Ex: 20"
                                                value={limite.data.max_semaine}
                                                onChange={(event) => limite.setData('max_semaine', event.target.value)}
                                            />
                                            <InputError message={limite.errors.max_semaine} />
                                        </div>
                                    </div>
                                    <Button disabled={limite.processing} className="w-full">Enregistrer</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Ma charge actuelle</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {charges.length === 0 ? (
                            <p className="text-muted-foreground">Aucune charge definie.</p>
                        ) : charges.length === 1 ? (
                            <>
                                <div className="flex justify-between py-1"><span className="text-muted-foreground">Annee :</span><span className="font-medium">{charges[0].annee_academique}</span></div>
                                <div className="flex justify-between py-1"><span className="text-muted-foreground">Semestre :</span><span className="font-medium">{charges[0].nom_semestre}</span></div>
                                <div className="flex justify-between py-1"><span className="text-muted-foreground">Max/jour :</span><span className="font-medium">{charges[0].max_jour ?? '-'} h</span></div>
                                <div className="flex justify-between py-1"><span className="text-muted-foreground">Max/semaine :</span><span className="font-medium">{charges[0].max_semaine ?? '-'} h</span></div>
                            </>
                        ) : (
                            <>
                                <label className="text-sm font-medium">Selectionner une charge</label>
                                <select
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                    value={selectedChargeId ?? ''}
                                    onChange={(event) => setSelectedChargeId(event.target.value || null)}
                                >
                                    <option value="">-- Choisir --</option>
                                    {charges.map((charge) => (
                                        <option key={charge.id} value={charge.id}>
                                            Charge {charge.nom_semestre} ({charge.annee_academique})
                                        </option>
                                    ))}
                                </select>
                                {chargeSelectionnee && (
                                    <div className="mt-3 space-y-2 border-t pt-3">
                                        <div className="flex justify-between"><span className="text-muted-foreground">Semestre :</span><span className="font-medium">{chargeSelectionnee.nom_semestre}</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Annee :</span><span className="font-medium">{chargeSelectionnee.annee_academique}</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Max/jour :</span><span className="font-medium">{chargeSelectionnee.max_jour ?? '-'} h</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Max/semaine :</span><span className="font-medium">{chargeSelectionnee.max_semaine ?? '-'} h</span></div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Comprendre les notions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={prevExplication}
                                disabled={explicationIndex === 0}
                                className={`rounded-md p-1 transition ${explicationIndex === 0 ? 'cursor-not-allowed opacity-30' : 'hover:bg-white/50'}`}
                            >
                                <ChevronLeft className="size-5" />
                            </button>
                            <div className="flex-1 text-center">
                                <div className="mb-2 flex justify-center">
                                    {(() => {
                                        const Icone = explications[explicationIndex].icone;

                                        return <Icone className="size-6 text-blue-600 dark:text-blue-400" />;
                                    })()}
                                </div>
                                <h4 className="mb-2 text-base font-semibold">{explications[explicationIndex].titre}</h4>
                                <p className="text-sm text-muted-foreground">{explications[explicationIndex].contenu}</p>
                            </div>
                            <button
                                onClick={nextExplication}
                                disabled={explicationIndex === explications.length - 1}
                                className={`rounded-md p-1 transition ${explicationIndex === explications.length - 1 ? 'cursor-not-allowed opacity-30' : 'hover:bg-white/50'}`}
                            >
                                <ChevronRight className="size-5" />
                            </button>
                        </div>
                        <div className="mt-4 flex justify-center gap-1">
                            {explications.map((_, idx) => (
                                <div key={idx} className={`h-1.5 rounded-full transition ${idx === explicationIndex ? 'w-3 bg-blue-600' : 'w-1.5 bg-blue-300'}`} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-6 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Mes creneaux hebdomadaires</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Jour</TableHead>
                                    <TableHead>Plage horaire</TableHead>
                                    <TableHead>Niveau</TableHead>
                                    <TableHead>Motif</TableHead>
                                    <TableHead>Etat</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dispos.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{noms[item.jour]}</TableCell>
                                        <TableCell>{item.debut} - {item.fin}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                                                    item.niveau === 'prefere'
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                                                        : item.niveau === 'acceptable'
                                                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'
                                                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800'
                                                }`}
                                            >
                                                {item.niveau === 'prefere' ? 'Prefere' : item.niveau === 'acceptable' ? 'Acceptable' : 'Non defini'}
                                            </span>
                                        </TableCell>
                                        <TableCell>{item.motif ?? '-'}</TableCell>
                                        <TableCell>{item.verrouille ? 'Verrouille' : 'Libre'}</TableCell>
                                        <TableCell className="space-x-2">
                                            {item.verrouille ? (
                                                <Button variant="outline" disabled size="sm">Modifier</Button>
                                            ) : (
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/dispos/${item.id}/modifier`}>Modifier</Link>
                                                </Button>
                                            )}
                                            <ConfirmButton
                                                titre="Retirer cette disponibilite ?"
                                                texte={item.verrouille ? 'Des reservations existent. La disponibilite sera desactivee.' : 'Cette action desactivera la disponibilite.'}
                                                action={() => router.delete(`/dispos/${item.id}`)}
                                            >
                                                Desactiver
                                            </ConfirmButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {dispos.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                            Aucun creneau defini.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Toutes mes charges</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Annee academique</TableHead>
                                    <TableHead>Semestre</TableHead>
                                    <TableHead>Max/jour</TableHead>
                                    <TableHead>Max/semaine</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {charges.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                            Aucune charge enregistree
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    charges.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.annee_academique}</TableCell>
                                            <TableCell>{item.nom_semestre}</TableCell>
                                            <TableCell>{item.max_jour ?? '-'} h</TableCell>
                                            <TableCell>{item.max_semaine ?? '-'} h</TableCell>
                                            <TableCell className="space-x-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/charges/${item.id}/modifier`}>Modifier</Link>
                                                </Button>
                                                <ConfirmButton
                                                    titre="Retirer cette charge ?"
                                                    texte="Cette action supprimera definitivement cette charge."
                                                    action={() => router.delete(`/charges/${item.id}`)}
                                                >
                                                    Retirer
                                                </ConfirmButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </DispoShell>
    );
}
