import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
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

    return (
        <AppLayout>
            <Head title="Détails Étudiant" />
            <div className="container mt-5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-blue-600 font-bold">Détails Étudiant</h2>
                    <Button variant="secondary" asChild>
                        <a href={route('etudiants.index')}>
                            Retour
                        </a>
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <Card>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p><strong>Nom :</strong> {etudiant.user.name}</p>
                                        <p><strong>INE :</strong> {etudiant.INE}</p>
                                        <p><strong>Niveau :</strong>
                                            <Badge variant="default" className="ml-2">{etudiant.niveau}</Badge>
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
                        <Card className="text-center p-4">
                            {etudiant.photo ? (
                                <img
                                    src={`/storage/${etudiant.photo}`}
                                    alt={etudiant.user.name}
                                    className="rounded-full mx-auto w-32 h-32"
                                />
                            ) : (
                                <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-4xl">👤</span>
                                </div>
                            )}
                            <h5 className="mt-3">{etudiant.user.name}</h5>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}