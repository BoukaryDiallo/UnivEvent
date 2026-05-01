import { Head, Link, router } from '@inertiajs/react';
import AppLayout  from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BarChart3, TrendingUp, User,Trophy, CheckCircle, ArrowLeft } from 'lucide-react';
import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { PageProps, Election, Candidature } from '@/types';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

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
    secondTourRequis: boolean;
    peutPublier: boolean;
}

export default function Depouillement() {
    const { election, resultats, total, tour, secondTourRequis, peutPublier } = usePage<Props>().props;
    const { confirm, ConfirmDialog } = useConfirmDialog();
    const { processing, post } = useForm();

    const handlePublier = () => {
        confirm({
            title: 'Publier les résultats',
            description: 'Êtes-vous sûr de vouloir publier ces résultats ?',
            onConfirm: () => post(`/resultats/${election.id_election}/publier`),
            variant: 'default'
        });
    };

    const handleConfigurerSecondTour = () => {
        router.get(`/elections/${election.id_election}/second-tour-form`);
    };

    const handleRetour = () => {
        router.get(`/resultats/${election.id_election}`);
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
                                                            style={{ width: `${Number(resultat.pourcentage)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        {Number(resultat.pourcentage).toFixed(2)}%
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

                                {peutPublier && (
                                    <Button
                                        onClick={handlePublier}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Publier les résultats
                                    </Button>
                                )}
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
        <ConfirmDialog />
        </AppLayout>
    );
}