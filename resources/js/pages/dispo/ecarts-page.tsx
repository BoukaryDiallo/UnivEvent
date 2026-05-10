import { Head, Link, router } from '@inertiajs/react';
import { ConfirmButton } from '@/components/dispo/confirm-button';
import { DispoShell } from '@/components/dispo/entete';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BreadcrumbItem } from '@/types';
import type { LigneEcart, ResumeDispo, UserDispo } from '@/types/dispo';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Exceptions', href: '/ecarts' },
];

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

export default function EcartsPage({
    user,
    resume,
    ecarts,
}: {
    user: UserDispo;
    resume: ResumeDispo;
    ecarts: LigneEcart[];
}) {
    return (
        <DispoShell 
            title="Mes exceptions" 
            description="Déclarez les indisponibilités temporaires qui remplacent votre planning habituel." 
            breadcrumbs={breadcrumbs} 
            resume={resume} 
            user={user} 
            showResume={false}
        >
            <Head title="Mes exceptions" />
            
            <div className="space-y-6">
                {/* Carte Actions */}
                <Card className="shadow-sm border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="shadow-sm">
                            <Link href="/ecarts/ajout">Ajouter une exception</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Carte Liste des exceptions */}
                <Card className="shadow-sm border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Liste des exceptions</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {ecarts.length === 0 
                                ? "Aucune exception enregistrée" 
                                : `${ecarts.length} exception${ecarts.length > 1 ? 's' : ''} trouvée${ecarts.length > 1 ? 's' : ''}`
                            }
                        </p>
                    </CardHeader>
                    <CardContent>
                        {ecarts.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
                                Vous n'avez pas encore d'exception. Cliquez sur "Ajouter une exception" pour commencer.
                            </div>
                        ) : (
                            <div className="rounded-md border border-border/50 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow>
                                            <TableHead className="font-semibold">Période</TableHead>
                                            <TableHead className="font-semibold">Motif</TableHead>
                                            <TableHead className="text-right font-semibold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ecarts.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-muted/20 transition-colors">
                                                <TableCell className="whitespace-nowrap font-medium">
                                                    {formatPeriode(item.date, item.date_fin)}
                                                </TableCell>
                                                <TableCell>
                                                    {item.motif ? (
                                                        <span className="inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 text-xs font-medium">
                                                            {item.motif}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <ConfirmButton
                                                        titre="Retirer cette exception ?"
                                                        texte="Cette action supprimera définitivement l'exception sélectionnée."
                                                        action={() => router.delete(`/ecarts/${item.id}`)}
                                                    >
                                                        Retirer
                                                    </ConfirmButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Carte d'information (optionnelle) */}
                {ecarts.length > 0 && (
                    <Card className="shadow-sm border-border/50 bg-muted/30">
                        <CardContent className="pt-4 pb-3">
                            <p className="text-xs text-muted-foreground text-center">
                                Les exceptions remplacent vos disponibilités habituelles sur les périodes indiquées.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DispoShell>
    );
}