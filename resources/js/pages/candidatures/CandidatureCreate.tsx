import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { store as candidaturesStore } from '@/routes/candidatures';
import type { PageProps } from '@/types/app';

type Props = PageProps<{
    etudiants?: any[];
    elections?: any[];
    etudiant?: any;
    election?: any;
    fromElection?: boolean;
}>;

export default function CandidatureCreate() {
    const { etudiants, elections, etudiant, election, fromElection } = usePage<Props>().props;
    
    // Déterminer si les PDF sont nécessaires (uniquement pour les élections de type UFR)
    const needsPdf = election?.type === 'ufr';
    
    const { data, setData, post, processing, errors } = useForm({
        id_etudiant: fromElection ? etudiant?.id : '',
        id_election: fromElection ? election?.id_election : '',
        programme: '',
        photo: null as File | null,
        cnib_pdf: null as File | null,
        casier_judiciaire_pdf: null as File | null,
        attestation_inscription_pdf: null as File | null,
        fromElection: fromElection || false,
        needsPdf: needsPdf || false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(candidaturesStore.url());
    };

    return (
        <AppLayout>
            <Head title="Déposer une Candidature" />
            <div className="container mt-5">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-green-600">Déposer une Candidature</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {Object.keys(errors).length > 0 && (
                            <Alert className="mb-4 border-red-200 bg-red-50">
                                <AlertDescription>
                                    <ul className="mb-0">
                                        {Object.values(errors).map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}
                        <form onSubmit={submit} encType="multipart/form-data" className="space-y-4">
                            {/* Afficher l'étudiant sélectionné si vient d'une élection */}
                            {fromElection && etudiant && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-800 mb-2">Informations de l'étudiant</h3>
                                    <div className="text-sm text-blue-700">
                                        <p><strong>Nom:</strong> {etudiant.user?.name}</p>
                                        <p><strong>UFR:</strong> {etudiant.ufr?.nom}</p>
                                        <p><strong>Filière:</strong> {etudiant.filiere?.nom}</p>
                                        <p><strong>Niveau:</strong> {etudiant.niveau}</p>
                                    </div>
                                </div>
                            )}
                            
                            {/* Sélection de l'étudiant (uniquement si admin) */}
                            {!fromElection && (
                                <div>
                                    <Label htmlFor="id_etudiant">Étudiant</Label>
                                    <Select value={data.id_etudiant} onValueChange={(value) => setData('id_etudiant', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="-- Sélectionner un étudiant --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {etudiants?.map((etudiant: any) => (
                                                <SelectItem key={etudiant.id} value={etudiant.id.toString()}>
                                                    {etudiant.user?.name} - {etudiant.ufr?.nom} - {etudiant.filiere?.nom} ({etudiant.niveau})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            
                            {/* Afficher l'élection sélectionnée si vient d'une élection */}
                            {fromElection && election && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-green-800 mb-2">Élection concernée</h3>
                                    <div className="text-sm text-green-700">
                                        <p><strong>Titre:</strong> {election.titre}</p>
                                        <p><strong>Type:</strong> {election.type}</p>
                                        <p><strong>Description:</strong> {election.description}</p>
                                    </div>
                                </div>
                            )}
                            
                            {/* Sélection de l'élection (uniquement si admin) */}
                            {!fromElection && (
                                <div>
                                    <Label htmlFor="id_election">Élection</Label>
                                    <Select value={data.id_election} onValueChange={(value) => setData('id_election', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="-- Sélectionner une élection --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {elections?.map((election: any) => (
                                                <SelectItem key={election.id_election} value={election.id_election.toString()}>
                                                    {election.titre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div>
                                <Label htmlFor="programme">Programme</Label>
                                <Input
                                    id="programme"
                                    value={data.programme}
                                    onChange={(e) => setData('programme', e.target.value)}
                                    placeholder="Décrivez votre programme..."
                                />
                            </div>
                            <div>
                                <Label htmlFor="photo">Photo</Label>
                                <Input
                                    id="photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('photo', e.target.files?.[0] || null)}
                                />
                            </div>
                            {/* Champs PDF - uniquement pour les élections de type UFR */}
                            {needsPdf && (
                                <>
                                    <div className="border-t pt-4">
                                        <h3 className="font-semibold text-orange-600 mb-4">Documents requis (élection UFR)</h3>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="cnib_pdf">CNIB (PDF)</Label>
                                        <Input
                                            id="cnib_pdf"
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) => setData('cnib_pdf', e.target.files?.[0] || null)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="casier_judiciaire_pdf">Casier judiciaire (PDF)</Label>
                                        <Input
                                            id="casier_judiciaire_pdf"
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) => setData('casier_judiciaire_pdf', e.target.files?.[0] || null)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="attestation_inscription_pdf">Attestation d'inscription (PDF)</Label>
                                        <Input
                                            id="attestation_inscription_pdf"
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) => setData('attestation_inscription_pdf', e.target.files?.[0] || null)}
                                        />
                                    </div>
                                </>
                            )}
                            
                            {/* Message pour les élections non-UFR */}
                            {!needsPdf && fromElection && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">
                                        <strong>Note:</strong> Pour cette élection de type {election?.type}, aucun document PDF n'est requis.
                                    </p>
                                </div>
                            )}
                            <div className="text-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Soumettre Candidature
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}