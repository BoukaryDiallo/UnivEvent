import { Head } from '@inertiajs/react';
import { AppLayout } from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BarChart3, TrendingUp, Users, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { PageProps, Election, Candidature } from '@/types';

interface Resultat {
    id_candidature: number;
    nb_voix: number;
    pourcentage: number;
    candidature: Candidature;
}

interface Props extends PageProps {
    election: Election;
    resultats: Resultat[];
    total: number;
    tour: number;
}

export default function Depouillement() {
    const { election, resultats, total, tour } = usePage<Props>().props;

    const secondTourRequis =
        tour === 1 &&
        resultats.length > 0 &&
        resultats[0].pourcentage < 50;

    const handlePublier = () => {
        const message = secondTourRequis
            ? "Êtes-vous sûr de vouloir publier les résultats du 1er tour ?"
            : "Êtes-vous sûr de vouloir publier ces résultats ? Cette action est irréversible.";

        if (confirm(message)) {
            router.post(depouillementPublier.url({ election: election.id_election }));
        }
    };

    const handleConfigurerSecondTour = () => {
        if (
            confirm(
                "Configurer le second tour avec les deux premiers candidats ? Vous devrez définir les dates du nouveau vote."
            )
        ) {
            router.get(`/elections/${election.id_election}/second-tour`);
        }
    };

    const handleRetour = () => {
        router.get(resultatsShow.url({ election: election.id_election }));
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
                <Badge className="bg-gray-400">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    2ème
                </Badge>
            );
        } else if (index === 2) {
            return (
                <Badge className="bg-orange-600">
                    <User className="h-3 w-3 mr-1" />
                    3ème
                </Badge>
            );
        }
        return null;
    };

    return (
        <AppLayout>
            <Head title={`Dépouillement - ${election.titre}`} />

            <div className="container mt-5">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Dépouillement - {election.titre}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Tour {tour} • {total} votes exprimés
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge className="bg-red-600">Élection clôturée</Badge>
                        <Button variant="outline" onClick={handleRetour}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                    </div>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Résultats du dépouillement
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-4">
                            {resultats.length === 0 ? (
                                <div className="text-center py-8">
                                    <Alert className="bg-blue-50 border-blue-200">
                                        <AlertDescription>
                                            <div className="flex items-center justify-center gap-2">
                                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                                <span className="text-blue-800">
                                                    Aucun vote enregistré pour cette élection.
                                                </span>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            ) : (
                                resultats.map((resultat, index) => (
                                    <div key={resultat.id_candidature} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {resultat.candidature.user.photo ? (
                                                    <img
                                                        src={`/storage/${resultat.candidature.user.photo}`}
                                                        alt={resultat.candidature.user.name}
                                                        className="w-12 h-12 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                                                        <User className="h-6 w-6 text-gray-600" />
                                                    </div>
                                                )}

                                                <div>
                                                    <h3 className="font-semibold text-lg">
                                                        {resultat.candidature.user.name}
                                                    </h3>
                                                    {resultat.candidature.slogan && (
                                                        <p className="text-sm text-gray-600">
                                                            {resultat.candidature.slogan}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {getWinnerBadge(index)}
                                                    <span className="text-2xl font-bold text-blue-600">
                                                        {resultat.nb_voix}
                                                    </span>
                                                    <span className="text-sm text-gray-500">votes</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${resultat.pourcentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        {resultat.pourcentage.toFixed(2)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

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

                                <Button
                                    onClick={handlePublier}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {secondTourRequis
                                        ? "Publier résultats du 1er tour"
                                        : "Publier les résultats"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Informations importantes</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-3">
                        <p>
                            Ces résultats sont provisoires tant qu’ils ne sont pas publiés.
                        </p>

                        {secondTourRequis && (
                            <p className="text-orange-600">
                                Aucun candidat n’a atteint 50%. Après publication des résultats
                                du 1er tour, l’administrateur devra configurer les dates du
                                second tour.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}