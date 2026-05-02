import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { AlertCircle, CheckCircle2, ArrowLeft, Vote, User, FileText, Clock, Users } from 'lucide-react';
import { useState } from 'react';
import type { PageProps } from '@/types/app';

interface Election {
    id_election: number;
    titre: string;
    description: string;
    type: string;
    ufr?: { nom: string };
    filiere?: { nom: string };
}

interface User {
    name: string;
    email: string;
}

interface Candidature {
    id_candidature: number;
    programme: string;
    statut: string;
    photo?: string;
    user: User;
}

interface Props extends PageProps {
    election: Election;
    candidatures: Candidature[];
    dejaVote: boolean;
}

export default function VoteCandidats() {
    const { election, candidatures, dejaVote } = usePage<Props>().props;
    const [selectedCandidate, setSelectedCandidate] = useState<Candidature | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const { data, setData, post, processing } = useForm({
        id_election: election.id_election,
        id_candidature: '',
    });

    const handleVoteClick = (candidature: Candidature) => {
        setSelectedCandidate(candidature);
        setData('id_candidature', candidature.id_candidature.toString());
        setShowConfirmation(true);
    };

    const handleConfirmVote = () => {
        post('/votes/enregistrer', {
            onSuccess: () => {
                setShowConfirmation(false);
                setSelectedCandidate(null);
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Voter - ${election.titre}`} />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <Button 
                                variant="outline" 
                                onClick={() => window.history.back()}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Retour
                            </Button>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 shadow-lg">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Vote className="h-8 w-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">{election.titre}</h1>
                                    <p className="text-blue-100 mt-2">
                                        Votez pour votre candidat préféré
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <p className="text-white mb-2">{election.description}</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-blue-300" />
                                        <span className="text-white text-sm">
                                            {candidatures.length} candidat{candidatures.length > 1 ? 's' : ''} en lice
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-blue-300" />
                                        <span className="text-white text-sm">
                                            {dejaVote ? 'Déjà voté' : 'Vote en attente'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contenu principal */}
                    <Card className="shadow-xl border-0">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                            <CardTitle className="flex items-center gap-2 text-blue-700">
                                <Users className="h-5 w-5" />
                                Candidats disponibles
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            {dejaVote && (
                                <Alert className="mb-6 border-red-200 bg-red-50">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">
                                        <div className="font-semibold mb-1">Vote déjà enregistré</div>
                                        <div className="text-sm">
                                            Vous avez déjà voté pour cette élection. Vous ne pourrez pas voter à nouveau.
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {candidatures.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                        <User className="h-12 w-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                        Aucun candidat disponible
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        Aucun candidat n'est encore disponible pour cette élection.
                                    </p>
                                    <Alert className="border-orange-200 bg-orange-50 max-w-md mx-auto">
                                        <Clock className="h-4 w-4 text-orange-600" />
                                        <AlertDescription className="text-orange-800">
                                            Revenez plus tard pour voir les candidats inscrits.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            ) : (

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {candidatures.map((candidature) => (
                                        <Card key={candidature.id_candidature} className="hover:shadow-xl transition-all duration-300 border-0 bg-white">
                                            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                                                <div className="flex items-start gap-4">
                                                    {/* Photo du candidat */}
                                                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow-md border-2 border-white flex-shrink-0">
                                                        {candidature.photo ? (
                                                            <img 
                                                                src={`/storage/${candidature.photo}`} 
                                                                alt={candidature.user.name}
                                                                className="w-14 h-14 rounded-xl object-cover shadow-sm"
                                                            />
                                                        ) : (
                                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
                                                                {candidature.user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex-1">
                                                        <CardTitle className="text-lg text-gray-800">
                                                            {candidature.user.name}
                                                        </CardTitle>
                                                        <p className="text-sm text-gray-600">
                                                            {candidature.user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-4">
                                                {candidature.programme && (
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <FileText className="h-4 w-4 text-blue-600" />
                                                            <span className="font-semibold text-blue-800">Programme</span>
                                                        </div>
                                                        <p className="text-sm text-blue-700 leading-relaxed">
                                                            {candidature.programme}
                                                        </p>
                                                    </div>
                                                )}

                                                <Button
                                                    onClick={() => handleVoteClick(candidature)}
                                                    disabled={dejaVote || processing}
                                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg disabled:opacity-50"
                                                >
                                                    {processing ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                            Traitement en cours...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Vote className="h-4 w-4 mr-2" />
                                                            {dejaVote ? 'Déjà voté' : 'Voter pour ce candidat'}
                                                        </>
                                                    )}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                <div className="text-sm text-gray-500">
                                    Votre vote est confidentiel et ne pourra être modifié
                                </div>
                                <Button 
                                    variant="outline" 
                                    onClick={() => window.history.back()}
                                    className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Retour
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialogue de confirmation */}
            <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-blue-700">
                            <Vote className="h-5 w-5" />
                            Confirmer votre vote
                        </DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Êtes-vous certain de vouloir voter pour ce candidat ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedCandidate && (
                        <div className="my-6">
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                        {selectedCandidate.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-lg text-gray-800">
                                            {selectedCandidate.user.name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {selectedCandidate.user.email}
                                        </div>
                                    </div>
                                </div>
                                {selectedCandidate.programme && (
                                    <div className="bg-white rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                            <span className="font-semibold text-blue-800 text-sm">Programme</span>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                                            {selectedCandidate.programme}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmation(false)}
                            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleConfirmVote}
                            disabled={processing}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Vote en cours...
                                </>
                            ) : (
                                <>
                                    <Vote className="h-4 w-4" />
                                    Confirmer le vote
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}