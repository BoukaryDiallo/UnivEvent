import { Head, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index as votesIndex } from '@/routes/votes';
import type { PageProps } from '@/types/app';

interface Election {
    title: string;
    votes_count: number;
}

interface Result {
    name: string;
    photo: string;
    isWinner: boolean;
    votes: number;
    percentage: number;
}

interface Props extends PageProps {
    election: Election;
    finalResults: Result[] | null;
}

export default function VoteResults() {
    const { election, finalResults } = usePage<Props>().props;

    return (
        <AppLayout>
            <Head title="Résultats officiels" />
            <div className="container mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="bg-gray-800 text-white">Résultats officiels - {election.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {finalResults ? (
                            <>
                                {finalResults.map((result, index) => (
                                    <div
                                        key={index}
                                        className={`mb-3 p-2 border rounded ${result.isWinner ? 'border-green-500 bg-gray-100' : ''}`}
                                    >
                                        <div className="flex items-center">
                                            <img
                                                src={`/storage/${result.photo}`}
                                                alt={result.name}
                                                className="rounded-xl mr-3 w-16 h-16 object-cover shadow-md border-2 border-white"
                                            />
                                            <div className="flex-grow">
                                                <strong>{result.name}</strong>
                                                {result.isWinner && (
                                                    <Badge variant="default" className="ml-2">GAGNANT</Badge>
                                                )}
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${result.percentage}%` }}></div>
                                                </div>
                                                <span className="text-sm">{result.votes} votes ({result.percentage}%)</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="text-center mt-4">
                                    <p>Total votes : <strong>{election.votes_count}</strong></p>
                                    <Badge variant="secondary">Vote terminé</Badge>
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-600">Résultats disponibles après dépouillement.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}