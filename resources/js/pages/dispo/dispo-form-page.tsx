import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { DispoShell } from '@/components/dispo/entete';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';
import type { LigneDispo, NiveauOption, ResumeDispo, UserDispo } from '@/types/dispo';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Disponibilites', href: '/dispos' },
];

type CreneauForm = {
    jour: number;
    debut: string;
    fin: string;
    niveau: string;
    motif: string;
};

function creerCreneau(jour = 1): CreneauForm {
    return {
        jour,
        debut: '',
        fin: '',
        niveau: 'prefere',
        motif: '',
    };
}

export default function DispoFormPage({
    user,
    jours,
    niveaux,
    resume,
    mode,
    dispo,
}: {
    user: UserDispo;
    jours: NiveauOption[];
    niveaux: NiveauOption[];
    resume: ResumeDispo;
    mode: 'creation' | 'edition';
    dispo: LigneDispo | null;
}) {
    const importInputRef = useRef<HTMLInputElement | null>(null);
    const form = useForm({
        jour: dispo?.jour ?? 1,
        debut: dispo?.debut ?? '',
        fin: dispo?.fin ?? '',
        niveau: dispo?.niveau ?? 'prefere',
        motif: dispo?.motif ?? '',
        creneaux: [creerCreneau(Number(jours[0]?.id ?? 1))],
    });
    const importForm = useForm<{
        fichier: File | null;
    }>({
        fichier: null,
    });
    const formErrors = form.errors as Record<string, string | undefined>;

    const setCreneau = (index: number, champ: keyof CreneauForm, valeur: string | number) => {
        const prochains = [...form.data.creneaux];
        prochains[index] = {
            ...prochains[index],
            [champ]: valeur,
        };
        form.setData('creneaux', prochains);
        form.clearErrors(`creneaux.${index}.${champ}`);
    };

    const joursUtilises = form.data.creneaux.map((item) => item.jour);

    const prochainJourDisponible = () => {
        const libre = jours.find((jour) => !joursUtilises.includes(Number(jour.id)));

        return Number(libre?.id ?? jours[0]?.id ?? 1);
    };

    const ajouterCreneau = () => {
        form.setData('creneaux', [...form.data.creneaux, creerCreneau(prochainJourDisponible())]);
        form.clearErrors('creneaux');
    };

    const retirerCreneau = (index: number) => {
        if (form.data.creneaux.length === 1) {
            return;
        }

        form.setData(
            'creneaux',
            form.data.creneaux.filter((_, position) => position !== index),
        );
    };

    const erreurCreneau = (index: number, champ: keyof CreneauForm) => form.errors[`creneaux.${index}.${champ}`];

    return (
        <DispoShell title={mode === 'creation' ? 'Ajouter une disponibilite' : 'Modifier une disponibilite'} description="Utilisez ce formulaire dedie pour enregistrer ou corriger un creneau hebdomadaire." breadcrumbs={breadcrumbs} resume={resume} user={user} showResume={false}>
            <Head title={mode === 'creation' ? 'Ajouter une disponibilite' : 'Modifier une disponibilite'} />
            <Card className="mx-auto w-full max-w-4xl">
                <CardHeader>
                    <CardTitle>{mode === 'creation' ? 'Nouveaux creneaux' : 'Mettre a jour le creneau'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        className="space-y-5"
                        onSubmit={(event) => {
                            event.preventDefault();

                            const options = {
                                preserveScroll: true,
                                preserveState: true,
                            };

                            if (mode === 'creation') {
                                form.post('/dispos', options);
                                return;
                            }

                            form.put(`/dispos/${dispo?.id}`, options);
                        }}
                    >
                        <InputError message={formErrors.dispo} className="rounded-md border border-red-200 bg-red-50 px-3 py-2" />

                        {mode === 'creation' ? (
                            <div className="space-y-4">
                                <div className="rounded-xl border border-dashed bg-muted/20 p-4">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <FileSpreadsheet className="h-4 w-4" />
                                                <p className="text-sm font-medium">Importer un fichier Excel</p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Colonnes attendues: <span className="font-medium text-foreground">jour</span>, <span className="font-medium text-foreground">debut</span>, <span className="font-medium text-foreground">fin</span>. La colonne <span className="font-medium text-foreground">motif</span> est facultative.
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Le niveau n&apos;est pas demande dans le fichier: chaque ligne importee sera en <span className="font-medium text-foreground">prefere</span>.
                                            </p>
                                            <a
                                                href="/modeles/disponibilites-import.csv"
                                                download
                                                className="inline-flex text-sm font-medium text-primary underline underline-offset-4"
                                            >
                                                Telecharger un modele CSV compatible Excel
                                            </a>
                                        </div>

                                        <div className="flex flex-col items-stretch gap-2 md:min-w-72">
                                            <input
                                                ref={importInputRef}
                                                type="file"
                                                accept=".xlsx,.csv"
                                                className="hidden"
                                                onChange={(event) => {
                                                    const file = event.target.files?.[0] ?? null;
                                                    importForm.setData('fichier', file);
                                                    importForm.clearErrors('fichier');
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => importInputRef.current?.click()}
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                Choisir un fichier
                                            </Button>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {importForm.data.fichier?.name ?? 'Aucun fichier selectionne'}
                                            </p>
                                            <Button
                                                type="button"
                                                disabled={importForm.processing || !importForm.data.fichier}
                                                onClick={() => {
                                                    importForm.post('/dispos/import', {
                                                        forceFormData: true,
                                                        preserveScroll: true,
                                                        onSuccess: () => {
                                                            importForm.reset();
                                                            if (importInputRef.current) {
                                                                importInputRef.current.value = '';
                                                            }
                                                        },
                                                    });
                                                }}
                                            >
                                                Importer le fichier
                                            </Button>
                                            <InputError message={importForm.errors.fichier} className="mt-1" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/20 px-4 py-3">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Saisie multiple</p>
                                        <p className="text-sm text-muted-foreground">Ajoutez plusieurs jours disponibles en une seule validation. Chaque jour reste unique.</p>
                                    </div>
                                    <Button type="button" variant="outline" onClick={ajouterCreneau} disabled={form.data.creneaux.length >= jours.length}>
                                        Ajouter une ligne
                                    </Button>
                                </div>

                                <InputError message={form.errors.creneaux} className="rounded-md border border-red-200 bg-red-50 px-3 py-2" />

                                {form.data.creneaux.map((creneau, index) => {
                                    const joursDejaPris = form.data.creneaux
                                        .filter((_, position) => position !== index)
                                        .map((item) => item.jour);

                                    return (
                                        <div key={index} className="space-y-4 rounded-xl border p-4">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <p className="text-sm font-medium">Creneau {index + 1}</p>
                                                <Button type="button" variant="ghost" onClick={() => retirerCreneau(index)} disabled={form.data.creneaux.length === 1}>
                                                    Retirer
                                                </Button>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label>Jour</Label>
                                                    <select
                                                        className="rounded-md border bg-background px-3 py-2 text-sm"
                                                        value={creneau.jour}
                                                        onChange={(event) => setCreneau(index, 'jour', Number(event.target.value))}
                                                    >
                                                        {jours.map((item) => (
                                                            <option key={item.id} value={item.id} disabled={joursDejaPris.includes(Number(item.id))}>
                                                                {item.nom}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <InputError message={erreurCreneau(index, 'jour')} className="mt-1" />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label>Niveau</Label>
                                                    <select
                                                        className="rounded-md border bg-background px-3 py-2 text-sm"
                                                        value={creneau.niveau}
                                                        onChange={(event) => setCreneau(index, 'niveau', event.target.value)}
                                                    >
                                                        {niveaux.map((item) => (
                                                            <option key={item.id} value={String(item.id)}>
                                                                {item.nom}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <InputError message={erreurCreneau(index, 'niveau')} className="mt-1" />
                                                </div>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label>Debut</Label>
                                                    <Input type="time" value={creneau.debut} onChange={(event) => setCreneau(index, 'debut', event.target.value)} />
                                                    <InputError message={erreurCreneau(index, 'debut')} className="mt-1" />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Fin</Label>
                                                    <Input type="time" value={creneau.fin} onChange={(event) => setCreneau(index, 'fin', event.target.value)} />
                                                    <InputError message={erreurCreneau(index, 'fin')} className="mt-1" />
                                                </div>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label>Motif</Label>
                                                <Input value={creneau.motif} onChange={(event) => setCreneau(index, 'motif', event.target.value)} />
                                                <InputError message={erreurCreneau(index, 'motif')} className="mt-1" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Jour</Label>
                                    <select
                                        className="rounded-md border bg-background px-3 py-2 text-sm"
                                        value={form.data.jour}
                                        onChange={(event) => form.setData('jour', Number(event.target.value))}
                                    >
                                        {jours.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.nom}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={form.errors.jour} className="mt-1" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Debut</Label>
                                        <Input type="time" value={form.data.debut} onChange={(event) => form.setData('debut', event.target.value)} />
                                        <InputError message={form.errors.debut} className="mt-1" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Fin</Label>
                                        <Input type="time" value={form.data.fin} onChange={(event) => form.setData('fin', event.target.value)} />
                                        <InputError message={form.errors.fin} className="mt-1" />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Niveau</Label>
                                    <select
                                        className="rounded-md border bg-background px-3 py-2 text-sm"
                                        value={form.data.niveau}
                                        onChange={(event) => form.setData('niveau', event.target.value)}
                                    >
                                        {niveaux.map((item) => (
                                            <option key={item.id} value={String(item.id)}>
                                                {item.nom}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={form.errors.niveau} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Motif</Label>
                                    <Input value={form.data.motif} onChange={(event) => form.setData('motif', event.target.value)} />
                                    <InputError message={form.errors.motif} className="mt-1" />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button type="submit" disabled={form.processing}>
                                {mode === 'creation' ? 'Enregistrer les disponibilites' : 'Mettre a jour'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                Retour
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </DispoShell>
    );
}
