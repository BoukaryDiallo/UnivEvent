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
import { AlertCircle, CheckCircle2 } from 'lucide-react';
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
            <div className="container mt-5">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-green-600">{election.titre}</CardTitle>
                        {election.description && (
                            <p className="text-muted-foreground mt-2">{election.description}</p>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {dejaVote && (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Vous avez déjà voté pour cette élection. Vous ne pourrez pas voter à nouveau.
                                </AlertDescription>
                            </Alert>
                        )}

                        {candidatures.length === 0 ? (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Aucun candidat disponible pour cette élection pour le moment.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle2 className="text-green-600" size={20} />
                                    <span className="text-sm font-medium">
                                        {candidatures.length} candidat{candidatures.length > 1 ? 's' : ''} en lice
                                    </span>
                                </div>

                                <div className="grid gap-3">
                                    {candidatures.map((candidature) => (
                                        <div
                                            key={candidature.id_candidature}
                                            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-lg">
                                                        {candidature.user.name}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {candidature.user.email}
                                                    </p>
                                                </div>
                                            </div>

                                            {candidature.programme && (
                                                <div className="mb-3 p-3 bg-slate-50 rounded border border-slate-200">
                                                    <p className="text-sm">
                                                        <strong className="block text-muted-foreground mb-1">
                                                            Programme :
                                                        </strong>
                                                        {candidature.programme}
                                                    </p>
                                                </div>
                                            )}

                                            <Button
                                                onClick={() => handleVoteClick(candidature)}
                                                disabled={dejaVote || processing}
                                                className="w-full"
                                            >
                                                Voter pour ce candidat
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        <div className="pt-4">
                            <Button
                                variant="outline"
                                onClick={() => window.history.back()}
                                className="w-full"
                            >
                                Retour
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Dialogue de confirmation */}
                <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="text-green-600">Confirmer votre vote</DialogTitle>
                            <DialogDescription>
                                Êtes-vous certain de vouloir voter pour ce candidat ?
                            </DialogDescription>
                        </DialogHeader>

                        {selectedCandidate && (
                            <div className="my-4 p-4 bg-muted rounded-lg">
                                <p className="font-semibold text-lg">{selectedCandidate.user.name}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {selectedCandidate.user.email}
                                </p>
                                {selectedCandidate.programme && (
                                    <p className="text-sm mt-3 italic">
                                        <strong>Programme :</strong> {selectedCandidate.programme}
                                    </p>
                                )}
                            </div>
                        )}

                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                ⚠️ Attention : Vous ne pourrez voter qu'une seule fois pour cette élection.
                            </AlertDescription>
                        </Alert>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowConfirmation(false)}
                                disabled={processing}
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={handleConfirmVote}
                                disabled={processing}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {processing ? 'Enregistrement...' : 'Confirmer mon vote'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}