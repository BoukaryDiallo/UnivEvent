import { Head, useForm, usePage, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { PageProps } from '@/types/app';

interface Election {
    id_election: number;
    titre: string;
    statut: string;
    votes_count: number;
    created_at: string;
}

interface Props extends PageProps {
    elections: Election[];
}

export default function Historique() {
    const { elections } = usePage<Props>().props;

    return (
        <AppLayout>
            <Head title="Historique des Résultats" />
            <div className="container">
                <h3 className="mb-4">Historique des Résultats</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {elections.map((election) => (
                        <Card key={election.id_election}>
                            <CardHeader>
                                <CardTitle>{election.titre}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Status: {election.statut}</p>
                                <p>Votes: {election.votes_count}</p>
                                <Button asChild className="w-full">
                                    <a href={route('resultats.show', election.id_election)}>
                                        Voir les résultats
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}