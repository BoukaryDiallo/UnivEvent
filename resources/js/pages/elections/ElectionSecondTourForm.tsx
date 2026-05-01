import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Users, Trophy } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { PageProps } from '@/types/app';

interface Election {
    id_election: number;
    titre: string;
    description: string;
    type: string;
    date_debut: string;
    date_fin: string;
    ufr?: { nom: string };
    filiere?: { nom: string };
}

interface Candidature {
    id_candidature: number;
    user: {
        name: string;
        email: string;
        photo?: string;
    };
    programme?: string;
}

interface Props extends PageProps {
    election: Election;
    candidaturesQualifiees: Candidature[];
}

export default function ElectionSecondTourForm() {
    const { election, candidaturesQualifiees } = usePage<Props>().props;

    const { data, setData, post, processing, errors } = useForm({
        date_debut: '',
        date_fin: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/elections/${election.id_election}/second-tour-store`);
    };

    return (
        <AppLayout>
            <Head title={`Configurer second tour - ${election.titre}`} />

            <div className="container mt-5">
                {/* Bouton retour */}
                <div className="mb-4">
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Informations de l'élection (lecture seule) */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Informations de l'élection</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Titre</label>
                                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                        {election.titre}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Type</label>
                                    <div className="mt-1">
                                        <Badge variant="secondary">{election.type}</Badge>
                                    </div>
                                </div>

                                {election.description && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Description</label>
                                        <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                            {election.description}
                                        </p>
                                    </div>
                                )}

                                {election.ufr && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">UFR</label>
                                        <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                            {election.ufr.nom}
                                        </p>
                                    </div>
                                )}

                                {election.filiere && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Filière</label>
                                        <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                            {election.filiere.nom}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-medium text-gray-700">1er tour</label>
                                    <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded space-y-1">
                                        <p>Début : {new Date(election.date_debut).toLocaleDateString()}</p>
                                        <p>Fin : {new Date(election.date_fin).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Formulaire de configuration du second tour */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-orange-600" />
                                    Configuration du second tour
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Alert className="mb-6">
                                    <AlertDescription>
                                        <div className="flex items-center gap-2 font-semibold text-orange-800 mb-2">
                                            <Users className="h-4 w-4" />
                                            Candidats qualifiés pour le second tour
                                        </div>
                                        <div className="space-y-2">
                                            {candidaturesQualifiees.map((candidature) => (
                                                <div key={candidature.id_candidature} className="flex items-center gap-3 p-2 bg-orange-50 rounded">
                                                    <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center text-orange-800 font-bold text-sm">
                                                        {candidature.user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{candidature.user.name}</p>
                                                        <p className="text-xs text-gray-600">{candidature.user.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </AlertDescription>
                                </Alert>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="date_debut" className="block text-sm font-medium text-gray-700">
                                            Date de début du second tour *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            id="date_debut"
                                            value={data.date_debut}
                                            onChange={(e) => setData('date_debut', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.date_debut && (
                                            <p className="mt-1 text-sm text-red-600">{errors.date_debut}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="date_fin" className="block text-sm font-medium text-gray-700">
                                            Date de fin du second tour *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            id="date_fin"
                                            value={data.date_fin}
                                            onChange={(e) => setData('date_fin', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.date_fin && (
                                            <p className="mt-1 text-sm text-red-600">{errors.date_fin}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-orange-600 hover:bg-orange-700"
                                        >
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {processing ? 'Configuration en cours...' : 'Configurer le second tour'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => window.history.back()}
                                        >
                                            Annuler
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
