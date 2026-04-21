import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import type { PageProps } from '@/types/app';

interface Election {
    id_election: number;
    titre: string;
    description: string;
    type: string;
    ufr?: { nom: string };
    filiere?: { nom: string };
}

interface Etudiant {
    id_etudiant: number;
    matricule: string;
    INE: string;
    niveau: string;
    statut: string;
    user: {
        name: string;
        email: string;
    };
    filiere: {
        nom: string;
        departement: {
            nom: string;
            ufr: {
                nom: string;
            };
        };
    };
}

interface ListeElectoraleItem {
    id_liste_electorale: number;
    statut_snapshot: string;
    etudiant: Etudiant;
}

interface Props extends PageProps {
    election: Election;
    listeElectorale: ListeElectoraleItem[];
}

export default function ListeElectorale() {
    const { election, listeElectorale } = usePage<Props>().props;

    return (
        <AppLayout>
            <Head title={`Liste électorale - ${election.titre}`} />
            <div className="container mt-5">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-green-600">{election.titre}</CardTitle>
                        <p className="text-muted-foreground">Liste électorale générée</p>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm">
                                <strong>Portée :</strong>{' '}
                                {election.type === 'ufr' && election.ufr
                                    ? `UFR: ${election.ufr.nom}`
                                    : election.type === 'promotion' && election.filiere
                                    ? `Promotion: ${election.filiere.nom}`
                                    : 'Non définie'}
                            </span>
                            <Badge variant="default">
                                {listeElectorale.length} électeur{listeElectorale.length > 1 ? 's' : ''}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {listeElectorale.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Aucune liste électorale n'a encore été générée pour cette élection.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>INE</TableHead>
                                            <TableHead>Nom complet</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Niveau</TableHead>
                                            <TableHead>Filière</TableHead>
                                            <TableHead>Département</TableHead>
                                            <TableHead>UFR</TableHead>
                                            <TableHead>Statut</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {listeElectorale.map((item) => (
                                            <TableRow key={item.id_liste_electorale}>
                                                <TableCell className="font-mono">
                                                    {item.etudiant.INE}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {item.etudiant.user?.name || 'N/A'}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {item.etudiant.user?.email || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {item.etudiant.niveau}
                                                </TableCell>
                                                <TableCell>
                                                    {item.etudiant.filiere?.nom || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {item.etudiant.filiere?.departement?.nom || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {item.etudiant.filiere?.departement?.ufr?.nom || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={item.statut_snapshot === 'actif' ? 'default' : 'secondary'}>
                                                        {item.statut_snapshot}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="flex justify-between items-center pt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Total : {listeElectorale.length} électeur{listeElectorale.length > 1 ? 's' : ''}
                                    </div>
                                    <div className="space-x-2">
                                        <Button variant="outline" onClick={() => window.history.back()}>
                                            Retour
                                        </Button>
                                        <Button asChild>
                                            <a href={`/elections/${election.id_election}/prepare`}>
                                                Retour à la préparation
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}