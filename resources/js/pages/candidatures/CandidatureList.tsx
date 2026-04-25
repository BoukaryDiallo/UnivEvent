import { Head, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { index as candidaturesIndex, show as candidaturesShow, destroy as candidaturesDestroy } from '@/routes/candidatures';
import type { PageProps } from '@/types/app';

type Candidature = {
    id_candidature: number;
    programme: string;
    statut: string;
    user: { name: string };
    election: { titre: string };
};

type Props = PageProps<{
    candidatures: Candidature[];
}>;

export default function CandidatureList() {
    const { candidatures } = usePage<Props>().props;

    const handleDelete = (id: number) => {
        if (confirm('Supprimer cette candidature ?')) {
            router.delete(candidaturesDestroy.url({ candidature: id }));
        }
    };

    const handleValider = (id: number) => {
        if (confirm('Valider cette candidature ?')) {
            router.post(`/candidatures/${id}/valider`);
        }
    };

    const handleRefuser = (id: number) => {
        if (confirm('Refuser cette candidature ?')) {
            router.post(`/candidatures/${id}/refuser`);
        }
    };

    const getStatusBadge = (statut: string) => {
        switch (statut) {
            case 'validee':
                return <Badge variant="default">Validée</Badge>;
            case 'rejetee':
                return <Badge variant="destructive">Rejetée</Badge>;
            default:
                return <Badge variant="secondary">En attente</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title="Liste des Candidatures" />
            <div className="container mt-5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-green-600">Liste des Candidatures</h2>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Candidat</TableHead>
                            <TableHead>Élection</TableHead>
                            <TableHead>Programme</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {candidatures.map((candidature) => (
                            <TableRow key={candidature.id_candidature}>
                                <TableCell>{candidature.user.name}</TableCell>
                                <TableCell>{candidature.election?.titre ?? ""}</TableCell>
                                <TableCell>{candidature.programme?.slice(0, 50) || ''}</TableCell>
                                <TableCell>{getStatusBadge(candidature.statut)}</TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={candidaturesShow.url({ candidature: candidature.id_candidature })}>Voir</a>
                                    </Button>
                                    {candidature.statut === 'en_attente' && (
                                        <>
                                            <Button 
                                                variant="default" 
                                                size="sm" 
                                                onClick={() => handleValider(candidature.id_candidature)}
                                                className="ml-2 bg-green-600 hover:bg-green-700"
                                            >
                                                Valider
                                            </Button>
                                            <Button 
                                                variant="destructive" 
                                                size="sm" 
                                                onClick={() => handleRefuser(candidature.id_candidature)}
                                                className="ml-2"
                                            >
                                                Refuser
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(candidature.id_candidature)}
                                        className="ml-2"
                                    >
                                        Supprimer
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