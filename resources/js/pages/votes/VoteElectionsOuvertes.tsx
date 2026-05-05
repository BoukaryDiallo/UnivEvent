import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { CheckCircle2, AlertCircle, Vote, Calendar, Clock, Users, ArrowRight, Building2, GraduationCap } from 'lucide-react';
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
    elections: Election[] | Record<string, Election>;
}

export default function VoteElectionsOuvertes() {
    const { elections } = usePage<Props>().props;

    // ✅ FIX IMPORTANT : normaliser en tableau
    const electionsArray: Election[] = Array.isArray(elections)
        ? elections
        : Object.values(elections ?? {});

    return (
        <AppLayout>
            <Head title="Participez aux Élections" />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 shadow-lg">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Vote className="h-8 w-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">Élections Ouvertes</h1>
                                    <p className="text-blue-100 mt-2">
                                        Sélectionnez une élection pour y participer et voter pour votre candidat préféré
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-300" />
                                    <span className="text-white font-medium">
                                        {electionsArray.length} élection{electionsArray.length > 1 ? 's' : ''} ouverte{electionsArray.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contenu principal */}
                    <Card className="shadow-xl border-0">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                            <CardTitle className="flex items-center gap-2 text-blue-700">
                                <Vote className="h-5 w-5" />
                                Listes des élections disponibles
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            {electionsArray.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                        <AlertCircle className="h-12 w-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                        Aucune élection ouverte
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        Aucune élection n'est actuellement disponible pour le vote.
                                    </p>
                                    <Alert className="border-orange-200 bg-orange-50 max-w-md mx-auto">
                                        <Clock className="h-4 w-4 text-orange-600" />
                                        <AlertDescription className="text-orange-800">
                                            Revenez plus tard pour vérifier les nouvelles élections ouvertes.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {electionsArray.map((election) => (
                                        <Card key={election.id_election} className="hover:shadow-xl transition-all duration-300 border-0 bg-white">
                                            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-lg text-gray-800 mb-2">
                                                            {election.titre}
                                                        </CardTitle>
                                                        {election.description && (
                                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                                {election.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Badge 
                                                        variant={election.statut === 'ouverte' ? 'default' : 'secondary'}
                                                        className={election.statut === 'ouverte' 
                                                            ? 'bg-green-100 text-green-800 border-green-200' 
                                                            : 'bg-orange-100 text-orange-800 border-orange-200'
                                                        }
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            {election.statut === 'ouverte' ? (
                                                                <CheckCircle2 className="h-3 w-3" />
                                                            ) : (
                                                                <Clock className="h-3 w-3" />
                                                            )}
                                                            {election.statut === 'ouverte' ? 'En cours' : 'Second tour'}
                                                        </div>
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3 text-sm">
                                                        <Calendar className="h-4 w-4 text-blue-500" />
                                                        <div>
                                                            <span className="text-gray-500">Début :</span>
                                                            <span className="font-medium text-gray-700 ml-1">
                                                                {new Date(election.date_debut).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm">
                                                        <Clock className="h-4 w-4 text-red-500" />
                                                        <div>
                                                            <span className="text-gray-500">Fin :</span>
                                                            <span className="font-medium text-gray-700 ml-1">
                                                                {new Date(election.date_fin).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm">
                                                        {election.type === 'ufr' ? (
                                                            <Building2 className="h-4 w-4 text-purple-500" />
                                                        ) : (
                                                            <GraduationCap className="h-4 w-4 text-purple-500" />
                                                        )}
                                                        <div>
                                                            <span className="text-gray-500">Portée :</span>
                                                            <span className="font-medium text-gray-700 ml-1">
                                                                {election.type === 'ufr' && election.ufr
                                                                    ? `UFR: ${election.ufr.nom}`
                                                                    : election.type === 'promotion' && election.filiere
                                                                    ? `Promotion: ${election.filiere.nom}`
                                                                    : 'Non définie'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="pt-4 border-t border-gray-100">
                                                    <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg">
                                                        <Link href={votesCandidats.url({ election: election.id_election })} className="flex items-center justify-center gap-2">
                                                            <Vote className="h-4 w-4" />
                                                            Voir les candidats et voter
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}