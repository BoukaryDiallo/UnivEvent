import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { PageProps } from '@/types/app';

interface Election {
    title: string;
    status: string;
    votes_count: number;
    total_voters: number;
    progress: number;
}

interface Candidate {
    name: string;
    photo: string;
    slogan: string;
    votes: number;
    percent: number;
}

interface Props extends PageProps {
    election: Election;
    candidates: Candidate[];
}

export default function LiveShow() {
    const { election, candidates } = usePage<Props>().props;

    return (
        <AppLayout>
            <Head title={`Live — ${election.title}`} />
            <div className="container mt-4">
                <h3 className="mb-2">Live — {election.title}</h3>
                <p className="text-gray-600 mb-4">Statut : {election.status}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Card>
                        <CardContent className="text-center">
                            <h6>Total votes</h6>
                            <h3 className="text-blue-600">{election.votes_count}</h3>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="text-center">
                            <h6>Électeurs</h6>
                            <h3 className="text-gray-800">{election.total_voters}</h3>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="text-center">
                            <h6>Taux participation</h6>
                            <h3 className="text-green-600">{election.progress}%</h3>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {candidates.map((cand, index) => (
                        <Card key={index} className="h-full">
                            <CardContent>
                                <div className="flex items-center mb-3">
                                    <img
                                        src={cand.photo ? `/storage/${cand.photo}` : 'https://via.placeholder.com/80'}
                                        alt={cand.name}
                                        className="rounded-full mr-3 w-16 h-16 object-cover"
                                    />
                                    <div>
                                        <h5 className="mb-0">{cand.name}</h5>
                                        <small className="text-gray-600">{cand.slogan}</small>
                                    </div>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span>Votes</span>
                                    <strong>{cand.votes}</strong>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div
                                        className="bg-green-600 h-4 rounded-full"
                                        style={{ width: `${cand.percent}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm">{cand.percent}%</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}