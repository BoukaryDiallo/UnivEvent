import { Head, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { destroy as candidaturesDestroy, edit as candidaturesEdit, index as candidaturesIndex } from '@/routes/candidatures';
import ElectionStatusBadge from '@/components/elections/ElectionStatusBadge';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import type { PageProps } from '@/types/app';

type Candidature = {
    id_candidature: number;
    programme: string;
    statut: string;
    photo?: string;
    cnib_pdf: string;
    casier_judiciaire_pdf: string;
    attestation_inscription_pdf: string;
    user: { name: string };
    election: { titre: string };
};

type Props = PageProps<{
    candidature: Candidature;
}>;

export default function CandidatureShow() {
    const { candidature } = usePage<Props>().props;
    const { confirm, ConfirmDialog } = useConfirmDialog();

    const handleDelete = () => {
        confirm({
            title: 'Supprimer la candidature',
            description: 'Êtes-vous sûr de vouloir supprimer cette candidature ?',
            onConfirm: () => router.delete(candidaturesDestroy.url({ candidature: candidature.id_candidature })),
            variant: 'destructive'
        });
    };

    
    return (
        <AppLayout>
            <Head title="Détails de la Candidature" />
            <div className="container mt-5">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-green-600">Détails de la Candidature</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Photo du candidat */}
                            <div className="flex-shrink-0">
                                <div className="border-4 border-gray-200 rounded-xl overflow-hidden shadow-lg">
                                    {candidature.photo ? (
                                        <img
                                            src={`/storage/${candidature.photo}`}
                                            alt={`Photo de ${candidature.user.name}`}
                                            className="w-48 h-48 object-cover"
                                        />
                                    ) : (
                                        <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                            <div className="text-center text-gray-500">
                                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-2">
                                                    {candidature.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <p className="text-sm">Aucune photo</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Informations du candidat */}
                            <div className="flex-1">
                                <h4 className="text-2xl font-bold text-blue-600 mb-2">{candidature.user.name}</h4>
                                <p className="text-lg text-gray-600 mb-4"><strong>Élection :</strong> {candidature.election.titre}</p>
                                
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">Statut :</span>
                                        <ElectionStatusBadge statut={candidature.statut} />
                                    </div>
                                    
                                    <div>
                                        <span className="font-semibold">Programme :</span>
                                        <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                                            {candidature.programme || 'Non fourni'}
                                        </p>
                                    </div>
                                </div>

                                {/* Documents */}
                                <div className="mt-4">
                                    <h5 className="font-semibold mb-2">Documents :</h5>
                                    <div className="space-y-2">
                                        <a href={`/storage/${candidature.cnib_pdf}`} target="_blank" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd" />
                                            </svg>
                                            CNIB
                                        </a>
                                        <a href={`/storage/${candidature.casier_judiciaire_pdf}`} target="_blank" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 ml-4">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd" />
                                            </svg>
                                            Casier judiciaire
                                        </a>
                                        <a href={`/storage/${candidature.attestation_inscription_pdf}`} target="_blank" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 ml-4">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd" />
                                            </svg>
                                            Attestation d'inscription
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex justify-end space-x-2 border-t pt-4">
                            <Button variant="destructive" onClick={handleDelete}>
                                Supprimer
                            </Button>
                            <Button variant="secondary" asChild>
                                <a href={candidaturesIndex.url()}>Retour à la liste</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        <ConfirmDialog />
        </AppLayout>
    );
}