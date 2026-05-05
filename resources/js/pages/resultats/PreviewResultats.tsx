import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { ArrowLeft, Trophy, Users, BarChart3, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { publier as resultatsPublier } from '@/routes/resultats';
import type { Election, Candidature } from '@/types';
import type { PageProps } from '@/types/app';

// Type Resultat pour les résultats d'élection
export type Resultat = {
    id_resultat: number;
    id_election: number;
    id_candidature: number;
    tour: number;
    nb_voix: number;
    pourcentage: number;
    rang: number;
    statut_publication: 'brouillon' | 'officiel';
    candidature?: Candidature;
    created_at: string;
    updated_at: string;
};
import { getImageUrl } from '@/utils/image';

interface Props extends PageProps {
    election: Election;
    resultats: Resultat[];
    totalVotes: number;
    peutPublier: boolean;
    [key: string]: any; // Pour satisfaire PageProps
}

export default function PreviewResultats() {
    const { election, resultats, totalVotes, peutPublier } = usePage<Props>().props;

    return (
        <AppLayout>
            <Head title={`Prévisualisation - ${election.titre}`} />

            <div className="container mt-4 space-y-6">
                {/* Bouton retour */}
                <div className="mb-4">
                    <Button asChild variant="outline">
                        <Link href={`/elections/${election.id_election}/admin`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour à l'administration
                        </Link>
                    </Button>
                </div>

                {/* En-tête */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">{election.titre}</h1>
                    <p className="text-gray-600">Prévisualisation des résultats avant publication</p>
                    <Badge variant="outline" className="text-sm">
                        Tour {election.tour || 1}
                    </Badge>
                </div>

                {/* Alertes */}
                <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                        📊 Voici les résultats calculés qui seront publiés officiellement.
                        Ces résultats sont basés sur les votes enregistrés et ne pourront plus être modifiés après publication.
                    </AlertDescription>
                </Alert>

                {/* Statistiques */}
                <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                            <div className="text-2xl font-bold">{totalVotes}</div>
                            <div className="text-sm text-gray-600">Total votes</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                            <div className="text-2xl font-bold">{resultats.length}</div>
                            <div className="text-sm text-gray-600">Candidats</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                            <div className="text-2xl font-bold">{resultats[0]?.pourcentage || 0}%</div>
                            <div className="text-sm text-gray-600">Meilleur score</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Résultats détaillés */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            Résultats détaillés
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {resultats.map((resultat, index) => (
                            <div key={resultat.id_resultat} className="border rounded-lg p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                                        <img 
                                            src={getImageUrl(resultat.candidature?.user?.photo ?? null)} 
                                            className="w-10 h-10 rounded-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/placeholder.svg';
                                            }}
                                        />
                                        <div>
                                            <strong className="text-lg">{resultat.candidature?.user?.name}</strong>
                                            <div className="text-sm text-gray-600">
                                                {resultat.nb_voix} voix • {resultat.pourcentage}%
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-blue-600">{resultat.pourcentage}%</div>
                                        <div className="text-sm text-gray-500">Rang {resultat.rang}</div>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 transition-all duration-500"
                                        style={{ width: `${resultat.pourcentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-center gap-4">
                    {peutPublier ? (
                        <Button 
                            asChild 
                            className="bg-green-600 hover:bg-green-700 px-8"
                            size="lg"
                        >
                            <Link href={resultatsPublier.url({ election: election.id_election })} method="post">
                                <Trophy className="h-4 w-4 mr-2" />
                                Publier officiellement
                            </Link>
                        </Button>
                    ) : (
                        <Alert>
                            <AlertDescription>
                                Les résultats ne peuvent plus être publiés car ils sont déjà officiels.
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    <Button asChild variant="outline">
                        <Link href={`/resultats/${election.id_election}`}>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Voir les résultats publiés
                        </Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
