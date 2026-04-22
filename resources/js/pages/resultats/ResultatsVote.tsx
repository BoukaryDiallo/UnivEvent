import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import type { PageProps } from '@/types/app';

interface Election {
    id_election: number;
    title: string;
    promotion?: string;
    status: string;
    votes_count: number;
    total_voters: number;
    progress: number;
}

interface Candidate {
    name: string;
    photo?: string;
    slogan: string;
    votes: number;
    vote_percentage: number;
}

interface Result {
    name: string;
    photo?: string;
    votes: number;
    percentage: number;
    isWinner: boolean;
}

interface Props extends PageProps {
    election: Election;
    candidates: Candidate[];
    finalResults: Result[] | null;
}

export default function ResultatsVote() {
    const { election, candidates, finalResults } = usePage<Props>().props;
    
    // Debug: voir les données reçues
    console.log('Élection:', election);
    console.log('Candidats:', candidates);
    console.log('Résultats finaux:', finalResults);

    return (
        <AppLayout>
            <Head title="Résultats officiels" />
            <div className="container mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="bg-gray-800 text-white">Résultats officiels - {election.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <p><strong>Statut:</strong> <Badge variant="default">{election.status}</Badge></p>
                            <p><strong>Total votes:</strong> {election.votes_count} / {election.total_voters} électeurs</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${election.progress}%` }}></div>
                            </div>
                        </div>
                        
                        {finalResults ? (
                            <>
                                <h6 className="text-lg font-semibold mb-3">Résultats finaux</h6>
                                {finalResults.map((result, index) => (
                                    <div
                                        key={index}
                                        className={`mb-3 p-2 border rounded ${result.isWinner ? 'border-green-500 bg-gray-100' : ''}`}
                                    >
                                        <div className="flex items-center">
                                            <img
                                                src={result.photo ? `/storage/${result.photo}` : 'https://via.placeholder.com/80'}
                                                alt={result.name}
                                                className="rounded-full mr-2 w-10 h-10 object-cover"
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
                                    <Badge variant="secondary">Vote terminé</Badge>
                                </div>
                            </>
                        ) : (
                            <>
                                <h6 className="text-lg font-semibold mb-3">Résultats en temps réel</h6>
                                {candidates && candidates.length > 0 ? (
                                    candidates.map((candidate, index) => (
                                        <div key={index} className="mb-3">
                                            <div className="flex items-center">
                                                <img
                                                    src={candidate.photo ? `/storage/${candidate.photo}` : 'https://via.placeholder.com/80'}
                                                    alt={candidate.name}
                                                    className="rounded-full mr-2 w-10 h-10 object-cover"
                                                />
                                                <div className="flex-grow">
                                                    <strong>{candidate.name}</strong>
                                                    {candidate.slogan && (
                                                        <small className="text-gray-600 block">{candidate.slogan}</small>
                                                    )}
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${candidate.vote_percentage}%` }}></div>
                                                    </div>
                                                    <span className="text-sm">{candidate.votes} votes ({candidate.vote_percentage}%)</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-600">Aucun candidat trouvé.</p>
                                )}
                                <p className="text-gray-600 mt-4">Résultats finaux disponibles après dépouillement.</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}