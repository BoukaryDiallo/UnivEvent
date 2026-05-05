import { Head, useForm, usePage, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
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
    listesElectorales: any[];
}

interface Props extends PageProps {
    election: Election;
}

export default function ElectionShow() {
    const { election } = usePage<Props>().props;
    const { confirm, ConfirmDialog } = useConfirmDialog();
    const { data, setData, post, processing } = useForm({
        niveau: '',
    });

    const handleDelete = () => {
        confirm({
            title: 'Annuler l\'élection',
            description: 'Êtes-vous sûr de vouloir annuler cette élection ?',
            onConfirm: () => router.delete(`/elections/${election.id_election}`),
            variant: 'destructive'
        });
    };

    const generateList = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('elections.generer-liste', election.id_election));
    };

    return (
        <AppLayout>
            <Head title="Détails de l'Élection" />
            <div className="container mt-5">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-green-600">Détails de l'Élection</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h4 className="text-blue-600">{election.titre}</h4>
                        <p>{election.description || 'Aucune description disponible.'}</p>
                        <ul className="list-disc pl-5 mt-3">
                            <li><strong>Date de début :</strong> {election.date_debut}</li>
                            <li><strong>Date de fin :</strong> {election.date_fin}</li>
                            <li><strong>Statut :</strong>
                                <Badge variant={election.statut === 'ouverte' ? 'default' : 'secondary'} className="ml-2">
                                    {election.statut.charAt(0).toUpperCase() + election.statut.slice(1)}
                                </Badge>
                            </li>
                            <li><strong>Type :</strong> {election.type ? election.type.charAt(0).toUpperCase() + election.type.slice(1) : 'Non défini'}</li>
                            {election.type === 'ufr' && election.ufr && (
                                <li><strong>UFR :</strong> {election.ufr.nom}</li>
                            )}
                            {election.type === 'promotion' && election.filiere && (
                                <li><strong>Filière :</strong> {election.filiere.nom}</li>
                            )}
                        </ul>
                        <div className="mt-3">
                            {election.listesElectorales.length === 0 && election.statut === 'brouillon' ? (
                                <form onSubmit={generateList} className="flex items-end space-x-4">
                                    {election.type === 'promotion' && (
                                        <div>
                                            <Label htmlFor="niveau">Niveau pour liste :</Label>
                                            <Input
                                                id="niveau"
                                                type="text"
                                                value={data.niveau}
                                                onChange={(e) => setData('niveau', e.target.value)}
                                                placeholder="L1, L2..."
                                                maxLength={10}
                                                required
                                            />
                                            <p className="text-sm text-gray-600">Niveau pour filtrer les étudiants</p>
                                        </div>
                                    )}
                                    <Button type="submit" disabled={processing}>
                                        🚀 Générer liste électorale
                                    </Button>
                                </form>
                            ) : (
                                <Alert className="border-blue-200 bg-blue-50">
                                    <AlertDescription>
                                        {election.listesElectorales.length > 0
                                            ? `✅ Liste électorale générée (${election.listesElectorales.length} électeurs)`
                                            : 'ℹ️ Activez l\'élection pour générer la liste'}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                            <Button variant="outline" asChild>
                                <a href={route('elections.edit', election.id_election)}>Modifier</a>
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                Annuler
                            </Button>
                            <Button variant="secondary" asChild>
                                <a href={route('elections.index')}>Retour à la liste</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        <ConfirmDialog />
        </AppLayout>
    );
}