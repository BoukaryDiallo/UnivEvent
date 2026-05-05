import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Calendar, MapPin, CheckCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { calculer as depouillementCalculer } from '@/routes/depouillement';
import AppLayout from '@/layouts/app-layout';
import ElectionStatusBadge from '@/components/elections/ElectionStatusBadge';
import type { PageProps } from '@/types/app';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Election {
    id_election: number;
    titre: string;
    description: string;
    statut: string;
    date_debut: string;
    date_fin: string;
    type: string;
    ufr?: { nom: string };
    filiere?: { nom: string };
}

interface Props extends PageProps {
    election: Election;
}

export default function PrepareElection() {
    const { election } = usePage<Props>().props;

    return (
        <AppLayout>
            <Head title={`Préparation - ${election.titre}`} />
            <div className="container mt-5">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-green-600">{election.titre}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {election.description && (
                            <p className="text-muted-foreground">{election.description}</p>
                        )}

                        <div className="flex items-center gap-2">
                            <span className="font-medium">Statut :</span>
                            <ElectionStatusBadge statut={election.statut} />
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Date début :</span> {new Date(election.date_debut).toLocaleString()}
                            </div>
                            <div>
                                <span className="font-medium">Date fin :</span> {new Date(election.date_fin).toLocaleString()}
                            </div>
                        </div>

                        <div>
                            <span className="font-medium">Portée :</span>{' '}
                            {election.type === 'ufr' && election.ufr
                                ? `UFR: ${election.ufr.nom}`
                                : election.type === 'promotion' && election.filiere
                                ? `Promotion: ${election.filiere.nom}`
                                : 'Non définie'}
                        </div>

                        {/* Statut : Brouillon */}
                        {election.statut === 'brouillon' && (
                            <Alert>
                                <AlertDescription>
                                    Configuration de la liste électorale requise.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Statut : Liste générée */}
                        {election.statut === 'liste_generee' && (
                            <Alert>
                                <AlertDescription>
                                    Liste électorale générée ✔
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Statut : Vote ouvert */}
                        {election.statut === 'ouverte' && (
                            <Alert>
                                <AlertDescription>
                                    Le vote est en cours.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Statut : Second tour */}
                        {election.statut === 'second_tour' && (
                            <Alert>
                                <AlertDescription>
                                    Second tour en cours.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Statut : Terminée */}
                        {election.statut === 'terminee' && (
                            <Alert>
                                <AlertDescription>
                                    Cette élection est terminée.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Actions selon le statut */}
                        <div className="flex gap-2 pt-4">
                            {election.statut === 'brouillon' && (
                                <Button asChild>
                                    <a href={`/elections/${election.id_election}/generer-liste`}>
                                        Configurer la liste électorale
                                    </a>
                                </Button>
                            )}

                            {election.statut === 'liste_generee' && (
                                <>
                                    <Button asChild>
                                        <a href={`/elections/${election.id_election}/liste-electorale`}>
                                            Voir la liste électorale
                                        </a>
                                    </Button>
                                    <Button asChild>
                                        <a href={`/elections/${election.id_election}/ouvrir`}>
                                            Ouvrir le vote
                                        </a>
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <a href={`/elections/${election.id_election}/cloturer`}>
                                            Clôturer l'élection
                                        </a>
                                    </Button>
                                </>
                            )}

                            {(election.statut === 'ouverte' || election.statut === 'second_tour') && (
                                <>
                                    <Button asChild>
                                        <a href={`/elections/${election.id_election}/liste-electorale`}>
                                            Voir la liste électorale
                                        </a>
                                    </Button>
                                    <Button variant="destructive" asChild>
                                        <a href={depouillementCalculer.url({ election: election.id_election })}>
                                            Lancer le dépouillement
                                        </a>
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <a href={`/elections/${election.id_election}/cloturer`}>
                                            Clôturer l'élection
                                        </a>
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}