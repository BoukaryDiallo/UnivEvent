import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Trophy, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { Election} from '@/types';
import { Candidature } from '@/types';
import type { PageProps } from '@/types/app';

interface Resultat {
    id_resultat: number;
    id_election: number;
    id_candidature: number;
    tour: number;
    nb_voix: number;
    pourcentage: number;
    rang: number;
    statut_publication: 'brouillon' | 'officiel';
    candidature: {
        id_candidature: number;
        user: {
            name: string;
            email: string;
            photo?: string;
        };
        resultat: 'elu' | 'second_tour' | 'eliminee';
        photo?: string;
    };
}

interface Props extends PageProps {
    election: Election;
    resultats: Resultat[];
    total: number;
    tour: number;
    secondTourRequis: boolean;
    peutPublier: boolean;
}

export default function DepouillementResults() {
    const { election, resultats, total, tour, secondTourRequis, peutPublier } = usePage<Props>().props;
    const { processing, post } = useForm();

    const handlePublier = () => {
        post(`/resultats/${election.id_election}/publier`);
    };

    const handleConfigurerSecondTour = () => {
        window.location.href = `/elections/${election.id_election}/second-tour-form`;
    };

    const handleRetour = () => {
        window.location.href = `/resultats/${election.id_election}`;
    };

    const getWinnerBadge = (index: number) => {
        if (index === 0) {
            return (
                <Badge className="bg-yellow-500">
                    <Trophy className="h-3 w-3 mr-1" />
                    1er
                </Badge>
            );
        } else if (index === 1) {
            return (
                <Badge className="bg-gray-500">
                    2ème
                </Badge>
            );
        }

        return (
            <Badge variant="outline">
                {index + 1}ème
            </Badge>
        );
    };

    return (
        <AppLayout>
            <Head title={`Dépouillement - ${election.titre}`} />

            <div className="container mt-5">
                {/* Bouton retour */}
                <div className="mb-4">
                    <Button variant="outline" onClick={handleRetour}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour aux résultats
                    </Button>
                </div>

                {/* En-tête */}
                <div className="text-center space-y-2 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Dépouillement</h1>
                    <p className="text-gray-600">Résultats provisoires du {tour === 1 ? 'premier' : 'second'} tour</p>
                    <Badge variant="outline" className="text-sm">
                        Tour {tour}
                    </Badge>
                </div>

                {/* Alertes selon le statut */}
                {secondTourRequis && (
                    <Alert className="mb-6">
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>
                            <div className="font-semibold text-orange-800 mb-2">Second tour requis</div>
                            <p className="text-sm text-orange-700">
                                Les résultats ne permettent pas de désigner un vainqueur au premier tour.
                                Un second tour devra être organisé.
                            </p>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Carte principale des résultats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Résultats du dépouillement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{total}</div>
                                <div className="text-sm text-gray-600">Votes exprimés</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{resultats.length}</div>
                                <div className="text-sm text-gray-600">Candidats</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">{tour}</div>
                                <div className="text-sm text-gray-600">Tour</div>
                            </div>
                        </div>

                        {/* Liste des résultats */}
                        <div className="space-y-4">
                            {resultats.map((resultat, index) => (
                                <div key={resultat.id_resultat} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                                            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow-md border-2 border-white">
                                                {resultat.candidature.user.photo ? (
                                                    <img
                                                        src={`/storage/${resultat.candidature.user.photo}`}
                                                        alt={resultat.candidature.user.name}
                                                        className="w-14 h-14 rounded-xl object-cover shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
                                                        {resultat.candidature.user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <strong className="text-lg">{resultat.candidature.user.name}</strong>
                                                <div className="text-sm text-gray-600">
                                                    {resultat.candidature.user.email}
                                                </div>
                                            </div>
                                            {getWinnerBadge(index)}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-600">{resultat.pourcentage}%</div>
                                            <div className="text-lg font-semibold">{resultat.nb_voix} voix</div>
                                            <div className="text-sm text-gray-500">Rang {resultat.rang}</div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 transition-all duration-500"
                                            style={{ width: `${resultat.pourcentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Boutons d'action */}
                        <div className="border-t pt-4 mt-6 flex justify-between items-center flex-wrap gap-3">
                            <div className="text-sm text-gray-600">
                                <p>Total de votes : {total}</p>
                                <p>Nombre de candidats : {resultats.length}</p>
                            </div>

                            <div className="flex gap-3 flex-wrap">
                                {secondTourRequis && (
                                    <Button
                                        onClick={handleConfigurerSecondTour}
                                        className="bg-orange-600 hover:bg-orange-700"
                                    >
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Configurer second tour
                                    </Button>
                                )}

                                {peutPublier && (
                                    <Button
                                        onClick={handlePublier}
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        {processing ? 'Publication en cours...' : 'Publier les résultats'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Informations importantes */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Informations importantes</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-3">
                        <p>
                            Ces résultats sont provisoires tant qu'ils ne sont pas publiés officiellement.
                        </p>

                        {secondTourRequis && (
                            <p className="text-orange-600">
                                Aucun candidat n'a atteint la majorité absolue. Après publication des résultats,
                                l'administrateur devra configurer les dates du second tour.
                            </p>
                        )}

                        <p className="text-gray-600">
                            Le dépouillement a été effectué le {new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()}.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
