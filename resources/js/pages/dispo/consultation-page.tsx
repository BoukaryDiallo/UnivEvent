import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { DispoShell } from '@/components/dispo/entete';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BreadcrumbItem } from '@/types';
import type { ChargeDispo, LigneDispo, LigneEcart, LigneReservation, ResumeDispo, UserDispo } from '@/types/dispo';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Consultation', href: '/consultation' },
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

const couleurs: Record<string, string> = {
    prefere: 'bg-emerald-500/70',
    acceptable: 'bg-amber-400/80',
    non_definie: 'bg-slate-200',
    reserve: 'bg-blue-500/80',
};

function formatDate(valeur: string) {
    const texte = new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(`${valeur}T00:00:00`));

    return texte.replace(/\b\p{L}/gu, (lettre) => lettre.toUpperCase());
}

function formatPeriode(date: string, dateFin?: string | null) {
    if (!dateFin || dateFin === date) {
        return formatDate(date);
    }

    return `${formatDate(date)} - ${formatDate(dateFin)}`;
}

function nomEnseignant(enseignant: UserDispo) {
    return enseignant.nom_complet ?? enseignant.name;
}

function normaliserTexte(valeur: string) {
    return valeur
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .trim()
        .toLowerCase();
}

export default function ConsultationPage({
    filtres,
    cible,
    enseignants,
    dispos,
    ecarts,
    reservations,
    grille,
    charges,
    resume,
}: {
    filtres: { nom: string; specialite: string };
    cible: UserDispo | null;
    enseignants: UserDispo[];
    dispos: LigneDispo[];
    ecarts: LigneEcart[];
    reservations: LigneReservation[];
    grille: {
        jours: string[];
        heures: string[];
        cells: Array<{ jour: string; heure: string; niveau: string }>;
    } | null;
    charges: ChargeDispo[];
    resume: ResumeDispo;
}) {
    const [voir, setVoir] = useState(false);
    const [disposOpen, setDisposOpen] = useState(false);
    const [chargesOpen, setChargesOpen] = useState(false);
    const [ecartsOpen, setEcartsOpen] = useState(false);
    const [reservationsOpen, setReservationsOpen] = useState(false);
    const [nomRecherche, setNomRecherche] = useState(cible ? nomEnseignant(cible) : filtres.nom);
    const [specialiteRecherche, setSpecialiteRecherche] = useState(filtres.specialite);

    const { auth } = usePage().props;
    const specialitesDisponibles = Array.from(
        new Set(
            enseignants
                .map((item) => item.specialite?.trim())
                .filter((value): value is string => Boolean(value)),
        ),
    ).sort((a, b) => a.localeCompare(b, 'fr'));

    const enseignantsFiltres = enseignants.filter((item) => {
        const filtreNom = normaliserTexte(nomRecherche);
        const filtreSpecialite = normaliserTexte(specialiteRecherche);
        const correspondNom = filtreNom === '' || normaliserTexte(nomEnseignant(item)).includes(filtreNom);
        const correspondSpecialite = filtreSpecialite === '' || normaliserTexte(item.specialite ?? '').includes(filtreSpecialite);

        return correspondNom && correspondSpecialite;
    });

    function consulterEnseignant(enseignantId: number) {
        router.get('/consultation', { enseignant: enseignantId }, { preserveScroll: true, replace: true });
    }

    function retirerSelection() {
        router.get('/consultation', {}, { preserveScroll: true, replace: true });
    }

    function reinitialiserRecherche() {
        setNomRecherche('');
        setSpecialiteRecherche('');
        retirerSelection();
    }

    return (
        <DispoShell title="Consultation administrateur" description="Recherchez un enseignant, puis consultez ses disponibilites." breadcrumbs={breadcrumbs} resume={resume} user={cible}>
            {auth.user.role === 'admin' && (
                <div className="flex justify-end">
                    <Button variant="outline" asChild>
                        <Link href="/consultation/notifications">Notifications admin</Link>
                    </Button>
                </div>
            )}
            <Head title="Consultation administrateur" />
            <Card>
                <CardHeader>
                    <CardTitle>Choisir un enseignant</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
                            <Input
                                list="consultation-enseignants"
                                className="pl-9"
                                placeholder="Rechercher un enseignant"
                                value={nomRecherche}
                                onChange={(event) => setNomRecherche(event.target.value)}
                            />
                            <datalist id="consultation-enseignants">
                                {enseignants.map((item) => (
                                    <option key={item.id} value={nomEnseignant(item)}>
                                        {item.specialite ? `${nomEnseignant(item)} (${item.specialite})` : nomEnseignant(item)}
                                    </option>
                                ))}
                            </datalist>
                        </div>
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
                            <Input
                                list="consultation-specialites"
                                className="pl-9"
                                placeholder="Rechercher par specialite"
                                value={specialiteRecherche}
                                onChange={(event) => setSpecialiteRecherche(event.target.value)}
                            />
                            <datalist id="consultation-specialites">
                                {specialitesDisponibles.map((specialite) => (
                                    <option key={specialite} value={specialite} />
                                ))}
                            </datalist>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button type="button" variant="outline" onClick={reinitialiserRecherche}>
                            Reinitialiser les champs
                        </Button>
                        {cible && (
                            <Button type="button" variant="ghost" onClick={retirerSelection}>
                                Retirer la selection
                            </Button>
                        )}
                    </div>
                    <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                        <div className="font-medium">Resultats enseignant</div>
                        <div className="mt-1 text-muted-foreground">
                            {enseignantsFiltres.length === 0
                                ? 'Aucun enseignant ne correspond aux filtres.'
                                : nomRecherche.trim() === '' && specialiteRecherche.trim() === ''
                                  ? `${enseignantsFiltres.length} enseignant(s) au total.`
                                  : `${enseignantsFiltres.length} enseignant(s) correspondent a la recherche.`}
                        </div>
                        {cible && (
                            <div className="mt-2 text-muted-foreground">
                                Selection actuelle : {nomEnseignant(cible)}
                                {cible.specialite ? ` - ${cible.specialite}` : ''}
                            </div>
                        )}
                    </div>
                    <div className="rounded-md border">
                        <div className="max-h-72 overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Enseignant</TableHead>
                                        <TableHead>Specialite</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {enseignantsFiltres.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                Aucun enseignant ne correspond aux filtres saisis.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        enseignantsFiltres.map((item) => {
                                            const estSelectionne = cible?.id === item.id;

                                            return (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{nomEnseignant(item)}</TableCell>
                                                    <TableCell>{item.specialite ?? '-'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            type="button"
                                                            variant={estSelectionne ? 'secondary' : 'outline'}
                                                            onClick={() => consulterEnseignant(item.id)}
                                                        >
                                                            {estSelectionne ? 'Selectionne' : 'Consulter'}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    {cible && (
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="text-sm text-muted-foreground">
                                Charges definies : {charges.length}
                            </div>
                            <Button type="button" variant="outline" onClick={() => setVoir((valeur) => !valeur)}>
                                Voir detail
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {cible && voir && (
                <Card>
                    <CardHeader>
                        <CardTitle>Fiche enseignant</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2 text-sm md:grid-cols-2">
                        <p>Nom : {cible.nom ?? '-'}</p>
                        <p>Prenom : {cible.prenom ?? '-'}</p>
                        <p>Telephone : {cible.telephone ?? '-'}</p>
                        <p>Specialite : {cible.specialite ?? '-'}</p>
                        <p>Email : {cible.email}</p>
                        <p>Charges configurees : {charges.length}</p>
                    </CardContent>
                </Card>
            )}

            {cible && grille && (
                <div className="space-y-6">
                    <Collapsible open={disposOpen} onOpenChange={setDisposOpen}>
                        <CollapsibleTrigger asChild>
                            <Card>
                                <CardHeader className="cursor-pointer">
                                    <CardTitle>Disponibilites hebdomadaires <ChevronDown className={`ml-auto size-4 transition-transform ${disposOpen ? 'rotate-180' : ''}`} /></CardTitle>
                                </CardHeader>
                            </Card>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-6">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-3 overflow-x-auto">
                                        <div className="grid min-w-[700px] gap-2" style={{ gridTemplateColumns: `80px repeat(${grille.jours.length}, minmax(70px, 1fr))` }}>
                                            <div />
                                            {grille.jours.map((jour) => (
                                                <div key={jour} className="text-center text-sm font-medium">{jour}</div>
                                            ))}
                                            {grille.heures.map((heure) => (
                                                <div key={heure} className="contents">
                                                    <div className="pt-2 text-sm text-muted-foreground">{heure}</div>
                                                    {grille.jours.map((jour) => {
                                                        const cell = grille.cells.find((item) => item.jour === jour && item.heure === heure);

                                                        return (
                                                            <div
                                                                key={`${jour}-${heure}`}
                                                                className={`h-10 rounded-md border ${couleurs[cell?.niveau ?? 'non_definie']}`}
                                                                title={`${jour} ${heure} : ${cell?.niveau === 'non_definie' ? 'non definie' : cell?.niveau ?? 'non definie'}`}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                            <span className="inline-flex items-center gap-2"><span className="size-3 rounded-sm bg-emerald-500/70" />Prefere</span>
                                            <span className="inline-flex items-center gap-2"><span className="size-3 rounded-sm bg-amber-400/80" />Acceptable</span>
                                            <span className="inline-flex items-center gap-2"><span className="size-3 rounded-sm bg-slate-300" />Non definie</span>
                                            <span className="inline-flex items-center gap-2"><span className="size-3 rounded-sm bg-blue-500/80" />Reserve</span>
                                        </div>
                                    </div>

                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Jour</TableHead>
                                                <TableHead>Plage</TableHead>
                                                <TableHead>Niveau</TableHead>
                                                <TableHead>Motif</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dispos.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{noms[item.jour]}</TableCell>
                                                    <TableCell>{item.debut} - {item.fin}</TableCell>
                                                    <TableCell>{item.niveau}</TableCell>
                                                    <TableCell>{item.motif ?? '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </CollapsibleContent>
                    </Collapsible>

                    <Collapsible open={chargesOpen} onOpenChange={setChargesOpen}>
                        <CollapsibleTrigger asChild>
                            <Card>
                                <CardHeader className="cursor-pointer">
                                    <CardTitle>Charges pedagogiques <ChevronDown className={`ml-auto size-4 transition-transform ${chargesOpen ? 'rotate-180' : ''}`} /></CardTitle>
                                </CardHeader>
                            </Card>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <Card>
                                <CardContent className="pt-6">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Annee academique</TableHead>
                                                <TableHead>Semestre</TableHead>
                                                <TableHead>Max jour</TableHead>
                                                <TableHead>Max semaine</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {charges.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                        Aucune charge n est definie.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                charges.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>{item.annee_academique}</TableCell>
                                                        <TableCell>{item.nom_semestre}</TableCell>
                                                        <TableCell>{item.max_jour ?? '-'}</TableCell>
                                                        <TableCell>{item.max_semaine ?? '-'}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </CollapsibleContent>
                    </Collapsible>

                    <Collapsible open={ecartsOpen} onOpenChange={setEcartsOpen}>
                        <CollapsibleTrigger asChild>
                            <Card>
                                <CardHeader className="cursor-pointer">
                                    <CardTitle>Exceptions <ChevronDown className={`ml-auto size-4 transition-transform ${ecartsOpen ? 'rotate-180' : ''}`} /></CardTitle>
                                </CardHeader>
                            </Card>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <Card>
                                <CardContent className="pt-6">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Periode</TableHead>
                                                <TableHead>Motif</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {ecarts.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="whitespace-nowrap font-medium">{formatPeriode(item.date, item.date_fin)}</TableCell>
                                                    <TableCell>{item.motif ?? '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </CollapsibleContent>
                    </Collapsible>

                    <Collapsible open={reservationsOpen} onOpenChange={setReservationsOpen}>
                        <CollapsibleTrigger asChild>
                            <Card>
                                <CardHeader className="cursor-pointer">
                                    <CardTitle>Reservations <ChevronDown className={`ml-auto size-4 transition-transform ${reservationsOpen ? 'rotate-180' : ''}`} /></CardTitle>
                                </CardHeader>
                            </Card>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <Card>
                                <CardContent className="pt-6">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Plage</TableHead>
                                                <TableHead>Source</TableHead>
                                                <TableHead>Niveau</TableHead>
                                                <TableHead>Etat</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reservations.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{item.date}</TableCell>
                                                    <TableCell>{item.debut} - {item.fin}</TableCell>
                                                    <TableCell>{item.source}</TableCell>
                                                    <TableCell>{item.niveau}</TableCell>
                                                    <TableCell>{item.libere_at ? 'Liberee' : 'Active'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            )}
        </DispoShell>
    );
}
