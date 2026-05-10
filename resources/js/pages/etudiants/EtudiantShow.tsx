import { Head, usePage, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import {index as etudiantsIndex} from '@/routes/etudiants';
import type { PageProps } from '@/types/app';

interface Etudiant {
    id: number;
    INE: string;
    niveau: string;
    date_naissance: string;
    photo: string;
    user: { name: string };
    filiere: { nom: string };
    departement: { nom: string };
    ufr: { nom: string };
}

interface Props extends PageProps {
    etudiant: Etudiant;
}

export default function EtudiantShow() {
    const { etudiant } = usePage<Props>().props;

    // Vérifications de sécurité
    if (!etudiant) {
        return <div>Étudiant non trouvé</div>;
    }

    return (
        <AppLayout>
            <Head title="Détails Étudiant" />
            <div className="container mt-5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-blue-600 font-bold">Détails Étudiant</h2>
                    <Button variant="secondary" onClick={() => router.get(etudiantsIndex.url())}>
                        Retour
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <Card>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p><strong>Nom :</strong> {etudiant.user?.name || 'N/A'}</p>
                                        <p><strong>INE :</strong> {etudiant.INE || 'N/A'}</p>
                                        <p><strong>Niveau :</strong>
                                            <Badge variant="default" className="ml-2">{etudiant.niveau || 'N/A'}</Badge>
                                        </p>
                                    </div>
                                    <div>
                                        <p><strong>Filière :</strong> {etudiant.filiere?.nom || 'N/A'}</p>
                                        <p><strong>Département :</strong> {etudiant.departement?.nom || 'N/A'}</p>
                                        <p><strong>UFR :</strong> {etudiant.ufr?.nom || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div>
                        <Card className="text-center p-6">
                            <div className="relative inline-block">
                                <div className="w-32 h-32 mx-auto rounded-full border-4 border-blue-200 overflow-hidden shadow-lg bg-gray-50">
                                    {etudiant.photo ? (
                                        <img
                                            src={`/storage/${etudiant.photo}`}
                                            alt={etudiant.user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <h5 className="mt-4 text-lg font-semibold text-gray-800">{etudiant.user.name}</h5>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}