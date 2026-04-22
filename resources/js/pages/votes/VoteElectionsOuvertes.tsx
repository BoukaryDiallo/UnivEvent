import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {Alert, AlertDescription} from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { candidats as votesCandidats } from '@/routes/votes';
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
    elections: Election[];
}

export default function VoteElectionsOuvertes() {
    const { elections } = usePage<Props>().props;

    return (
        <AppLayout>
            <Head title="Participez aux Élections" />
            <div className="container mt-5">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-green-600">
                            <CheckCircle2 className="inline mr-2" size={24} />
                            Élections Ouvertes
                        </CardTitle>
                        <p className="text-muted-foreground mt-2">
                            Sélectionnez une élection pour y participer et voter pour votre candidat préféré
                        </p>
                    </CardHeader>
                    <CardContent>
                        {elections.length === 0 ? (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Aucune élection ouverte disponible pour le moment.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="grid gap-4">
                                {elections.map((election) => (
                                    <div
                                        key={election.id_election}
                                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-green-600">
                                                    {election.titre}
                                                </h3>
                                                {election.description && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {election.description}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge variant="default">
                                                {election.statut === 'ouverte' ? 'En cours' : 'Second tour'}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                                            <div>
                                                <span className="text-muted-foreground">Début :</span>
                                                <p className="font-mono">
                                                    {new Date(election.date_debut).toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Fin :</span>
                                                <p className="font-mono">
                                                    {new Date(election.date_fin).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-muted-foreground">Portée :</span>
                                                <p>
                                                    {election.type === 'ufr' && election.ufr
                                                        ? `UFR: ${election.ufr.nom}`
                                                        : election.type === 'promotion' && election.filiere
                                                        ? `Promotion: ${election.filiere.nom}`
                                                        : 'Non définie'}
                                                </p>
                                            </div>
                                        </div>

                                        <Button asChild className="w-full">
                                            <Link href={votesCandidats.url({ election: election.id_election })}>
                                                Voir les candidats et voter
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}