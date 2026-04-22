import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Users, Settings, Calendar, MapPin, UserCheck, TrendingUp } from 'lucide-react';
import { admin as electionsAdmin, ouvrir as electionsOuvrir, cloturer as electionsCloturer } from '@/routes/elections';
import { router } from '@inertiajs/react';
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
    election: Election;
    totalVotes: number;
    totalVoters: number;
    totalCandidatures: number;
    candidaturesValidees: any[];
}

export default function ElectionAdminSimple() {
    const { election, totalVotes, totalVoters, totalCandidatures, candidaturesValidees } = usePage<Props>().props;

    console.log('ElectionAdminSimple - Données reçues:', {
        election,
        totalVotes,
        totalVoters,
        totalCandidatures,
        candidaturesValidees
    });

    const handleOuvrir = () => {
        if (confirm('Êtes-vous sûr de vouloir ouvrir cette élection ?')) {
            router.post(electionsOuvrir.url({ election: election.id_election }));
        }
    };

    const handleCloturer = () => {
        if (confirm('Êtes-vous sûr de vouloir clôturer cette élection ?')) {
            router.post(electionsCloturer.url({ election: election.id_election }));
        }
    };

    const getStatutBadge = (statut: string) => {
        switch (statut) {
            case 'brouillon':
                return <Badge variant="secondary">Brouillon</Badge>;
            case 'liste_generee':
                return <Badge variant="default" className="bg-blue-500">Liste générée</Badge>;
            case 'ouverte':
                return <Badge variant="default" className="bg-green-500">Ouverte</Badge>;
            case 'second_tour':
                return <Badge variant="default" className="bg-orange-500">Second tour</Badge>;
            case 'terminee':
                return <Badge variant="destructive">Terminée</Badge>;
            default:
                return <Badge variant="outline">{statut}</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title={`Administration - ${election.titre}`} />
            <div className="container mt-5">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{election.titre}</h1>
                        <p className="text-gray-600 mt-1">{election.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatutBadge(election.statut)}
                        <Button variant="outline" onClick={() => window.history.back()}>
                            Retour
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informations générales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Type</label>
                                <p className="text-lg">{election.type === 'ufr' ? 'UFR' : 'Promotion'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Statut</label>
                                <div className="text-lg">{getStatutBadge(election.statut)}</div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Date de début</label>
                                <p className="text-lg flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(election.date_debut).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Date de fin</label>
                                <p className="text-lg flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(election.date_fin).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold mb-3">Actions administratives</h3>
                            <div className="flex flex-wrap gap-2">
                                {election.statut === 'brouillon' && (
                                    <Button onClick={handleOuvrir} className="bg-green-600 hover:bg-green-700">
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Ouvrir l'élection
                                    </Button>
                                )}
                                {election.statut === 'ouverte' && (
                                    <Button onClick={handleCloturer} variant="destructive">
                                        <Settings className="h-4 w-4 mr-2" />
                                        Clôturer l'élection
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
