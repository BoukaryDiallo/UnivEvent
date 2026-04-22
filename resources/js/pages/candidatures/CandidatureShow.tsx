import { Head, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { destroy as candidaturesDestroy, edit as candidaturesEdit, index as candidaturesIndex } from '@/routes/candidatures';
import type { PageProps } from '@/types/app';

type Candidature = {
    id_candidature: number;
    programme: string;
    statut: string;
    cnib_pdf: string;
    casier_judiciaire_pdf: string;
    attestation_inscription_pdf: string;
    user: { name: string };
    election: { titre: string };
};

type Props = PageProps<{
    candidature: Candidature;
}>;

export default function CandidatureShow() {
    const { candidature } = usePage<Props>().props;

    const handleDelete = () => {
        if (confirm('Supprimer cette candidature ?')) {
            router.delete(candidaturesDestroy.url({ candidature: candidature.id_candidature }));
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
            <Head title="Détails de la Candidature" />
            <div className="container mt-5">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-green-600">Détails de la Candidature</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h4 className="text-blue-600">Candidat : {candidature.user.name}</h4>
                        <p><strong>Élection :</strong> {candidature.election.titre}</p>
                        <ul className="list-disc pl-5 mt-3">
                            <li><strong>Programme :</strong> {candidature.programme || 'Non fourni'}</li>
                            <li><strong>Statut :</strong> {getStatusBadge(candidature.statut)}</li>
                            <li><strong>CNIB :</strong> <a href={`/storage/${candidature.cnib_pdf}`} target="_blank" className="text-blue-500">Voir PDF</a></li>
                            <li><strong>Casier judiciaire :</strong> <a href={`/storage/${candidature.casier_judiciaire_pdf}`} target="_blank" className="text-blue-500">Voir PDF</a></li>
                            <li><strong>Attestation d'inscription :</strong> <a href={`/storage/${candidature.attestation_inscription_pdf}`} target="_blank" className="text-blue-500">Voir PDF</a></li>
                        </ul>
                        <div className="mt-4 flex justify-end space-x-2">
                            <Button variant="outline" asChild>
                                <a href={candidaturesEdit.url({ candidature: candidature.id_candidature })}>Modifier</a>
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                Supprimer
                            </Button>
                            <Button variant="secondary" asChild>
                                <a href={candidaturesIndex.url()}>Retour à la liste</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}