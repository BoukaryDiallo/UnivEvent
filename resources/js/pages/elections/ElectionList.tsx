import { Head, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { index as electionsIndex, create as electionsCreate, admin as electionsAdmin } from '@/routes/elections';
import type { PageProps } from '@/types/app';

interface Election {
    id_election: number;
    titre: string;
    description: string;
    date_debut: string;
    date_fin: string;
    statut: string;
    type: string;
    ufr?: { nom: string };
    filiere?: { nom: string };
}

interface Props extends PageProps {
    elections: Election[];
}

export default function ElectionList() {
    const { elections } = usePage<Props>().props;

    const handleDelete = (id: number) => {
        if (confirm('Annuler cette élection ?')) {
            router.delete(`/elections/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Liste des Élections" />
            <div className="container mt-5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-green-600">Liste des Élections</h2>
                    <Button asChild>
                        <a href={electionsCreate.url()}>+ Créer une élection</a>
                    </Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Titre</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Date début</TableHead>
                            <TableHead>Date fin</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Portée</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {elections.map((election) => (
                            <TableRow key={election.id_election}>
                                <TableCell>{election.titre}</TableCell>
                                <TableCell>{election.description?.slice(0, 50) || ''}</TableCell>
                                <TableCell>{election.date_debut}</TableCell>
                                <TableCell>{election.date_fin}</TableCell>
                                <TableCell>
                                    <Badge variant={election.statut === 'ouverte' ? 'default' : 'secondary'}>
                                        {election.statut.charAt(0).toUpperCase() + election.statut.slice(1)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {election.type === 'ufr' && election.ufr
                                        ? `UFR: ${election.ufr.nom}`
                                        : election.type === 'promotion' && election.filiere
                                        ? `Promotion: ${election.filiere.nom}`
                                        : 'Non définie'}
                                </TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={electionsAdmin.url({ election: election.id_election })} title="Administrer">
                                            Administrer 
                                        </a>
                                    </Button>
                    
                                    <Button variant="outline" size="sm" asChild className="ml-2">
                                        <a href={`/elections/${election.id_election}/edit`} title="Modifier">
                                            Modifier
                                        </a>
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(election.id_election)}
                                        className="ml-2"
                                    >
                                        Annuler
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}