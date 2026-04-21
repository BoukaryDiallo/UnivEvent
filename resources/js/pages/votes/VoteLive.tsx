import { Head, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import type { PageProps } from '@/types/app';

interface Election {
    id_election: number;
    title: string;
    promotion: string;
    status: string;
    progress: number;
    votes_count: number;
    total_voters: number;
    candidates: Candidate[];
}

interface Candidate {
    name: string;
    slogan: string;
    photo: string;
    votes: number;
    vote_percentage: number;
}

interface Props extends PageProps {
    election: Election;
}

export default function VoteLive() {
    const { election } = usePage<Props>().props;

    const handleCloturer = () => {
        router.post(route('elections.cloturer', election.id_election));
    };

    const handleDepouiller = () => {
        router.visit(route('depouillement.depouiller', election.id_election));
    };

    return (
        <AppLayout>
            <Head title="Votes en Direct" />
            <div className="container mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="bg-green-600 text-white">Votes en Direct</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h6>{election.title} - {election.promotion}</h6>
                        <p>
                            Statut : <Badge variant="default">{election.status}</Badge>
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${election.progress}%` }}></div>
                        </div>
                        <p>{election.votes_count} votes / {election.total_voters} électeurs</p>
                        <hr />
                        <h6>Votes en cours</h6>
                        {election.candidates.map((candidate, index) => (
                            <div key={index} className="mb-3">
                                <div className="flex items-center">
                                    <img
                                        src={`/storage/${candidate.photo}`}
                                        alt={candidate.name}
                                        className="rounded-full mr-2 w-10 h-10"
                                    />
                                    <div className="flex-grow">
                                        <strong>{candidate.name}</strong>
                                        <small className="text-gray-600 block">{candidate.slogan}</small>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                            <div className="bg-green-600 h-2 rounded-full" style={{ width: `${candidate.vote_percentage}%` }}></div>
                                        </div>
                                        <span className="text-sm">{candidate.votes} votes</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <hr />
                        <div className="space-y-2">
                            {election.status === 'ouverte' && (
                                <Button variant="destructive" onClick={handleCloturer} className="w-full">
                                    Clôturer le vote
                                </Button>
                            )}
                            {election.status === 'cloturee' && (
                                <Button variant="default" onClick={handleDepouiller} className="w-full">
                                    Lancer le dépouillement
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}