import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { PageProps } from '@/types/app';

interface Election {
    id_election: number;
    titre: string;
    description: string;
    date_debut: string;
    date_fin: string;
    type: string;
    id_ufr?: number;
    id_filiere?: number;
    statut: string;
}

interface Ufr {
    id_ufr: number;
    nom: string;
}

interface Filiere {
    id_filiere: number;
    nom: string;
}

interface Props extends PageProps {
    election: Election;
    ufrs: Ufr[];
    filieres: Filiere[];
}

export default function ElectionEdit() {
    const { election, ufrs, filieres } = usePage<Props>().props;
    const { data, setData, put, processing, errors } = useForm({
        titre: election.titre,
        description: election.description,
        date_debut: new Date(election.date_debut).toISOString().slice(0, 16),
        date_fin: new Date(election.date_fin).toISOString().slice(0, 16),
        type: election.type,
        id_ufr: election.id_ufr?.toString() || '',
        id_filiere: election.id_filiere?.toString() || '',
        statut: election.statut,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('elections.update', election.id_election));
    };

    return (
        <AppLayout>
            <Head title="Modifier une Élection" />
            <div className="container mt-5">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-green-600">Modifier une Élection</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {Object.keys(errors).length > 0 && (
                            <div className="alert alert-danger mb-4">
                                <ul className="mb-0">
                                    {Object.values(errors).map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <Label htmlFor="titre">Titre</Label>
                                <Input
                                    id="titre"
                                    type="text"
                                    value={data.titre}
                                    onChange={(e) => setData('titre', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    className="form-control"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="date_debut">Date de début</Label>
                                <Input
                                    id="date_debut"
                                    type="datetime-local"
                                    value={data.date_debut}
                                    onChange={(e) => setData('date_debut', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="date_fin">Date de fin</Label>
                                <Input
                                    id="date_fin"
                                    type="datetime-local"
                                    value={data.date_fin}
                                    onChange={(e) => setData('date_fin', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Type d'élection</Label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="ufr"
                                            checked={data.type === 'ufr'}
                                            onChange={(e) => setData('type', e.target.value)}
                                            className="mr-2"
                                        />
                                        UFR
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="promotion"
                                            checked={data.type === 'promotion'}
                                            onChange={(e) => setData('type', e.target.value)}
                                            className="mr-2"
                                        />
                                        Promotion
                                    </label>
                                </div>
                            </div>
                            {data.type === 'ufr' && (
                                <div>
                                    <Label htmlFor="id_ufr">UFR</Label>
                                    <Select value={data.id_ufr} onValueChange={(value) => setData('id_ufr', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="-- Sélectionner UFR --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ufrs.map((ufr) => (
                                                <SelectItem key={ufr.id_ufr} value={ufr.id_ufr.toString()}>
                                                    {ufr.nom}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {data.type === 'promotion' && (
                                <div>
                                    <Label htmlFor="id_filiere">Filière</Label>
                                    <Select value={data.id_filiere} onValueChange={(value) => setData('id_filiere', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="-- Sélectionner filière --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filieres.map((filiere) => (
                                                <SelectItem key={filiere.id_filiere} value={filiere.id_filiere.toString()}>
                                                    {filiere.nom}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div>
                                <Label htmlFor="statut">Statut</Label>
                                <Select value={data.statut} onValueChange={(value) => setData('statut', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ouverte">Ouverte</SelectItem>
                                        <SelectItem value="fermee">Fermée</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="text-end">
                                <Button type="submit" disabled={processing}>
                                    Mettre à jour
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}