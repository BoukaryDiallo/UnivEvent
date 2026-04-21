import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { PageProps } from '@/types/app';

interface Election {
    id_election: number;
    titre: string;
    statut: string;
}

interface Props extends PageProps {
    elections: Election[];
}

export default function LiveIndex() {
    const { elections } = usePage<Props>().props;

    return (
        <AppLayout>
            <Head title="Votes en direct" />
            <div className="container">
                <h3 className="mb-4">Votes en direct</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {elections.map((election) => (
                        <Card key={election.id_election}>
                            <CardContent>
                                <h5>{election.titre}</h5>
                                <p>Status: {election.statut}</p>
                                <Button asChild className="w-full">
                                    <a href={route('votes.live.show', election.id_election)}>
                                        Voir le live
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