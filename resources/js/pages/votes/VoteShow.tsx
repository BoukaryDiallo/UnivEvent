import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { PageProps } from '@/types/app';

interface Vote {
    id_vote: number;
    date_vote: string;
    user: { name: string };
    election: { titre: string };
    candidature: { user: { name: string } };
}

interface Props extends PageProps {
    vote: Vote;
}

export default function VoteShow() {
    const { vote } = usePage<Props>().props;

    return (
        <AppLayout>
            <Head title="Détails du Vote" />
            <div className="container mt-5">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-green-600">Détails du Vote</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5">
                            <li><strong>Électeur :</strong> {vote.user.name}</li>
                            <li><strong>Élection :</strong> {vote.election.titre}</li>
                            <li><strong>Candidat choisi :</strong> {vote.candidature.user.name}</li>
                            <li><strong>Date du vote :</strong> {vote.date_vote}</li>
                        </ul>
                        <div className="mt-4 flex justify-end">
                            <Button variant="secondary" asChild>
                                <a href={route('votes.index')}>Retour à la liste</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}