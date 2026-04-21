import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { PageProps } from '@/types/app';

interface Election {
    id_election: number;
    titre: string;
    description: string;
    type: string;
}

interface Ufr {
    id_ufr: number;
    nom: string;
}

interface Filiere {
    id_filiere: number;
    nom: string;
}

interface Departement {
    id_departement: number;
    nom: string;
}

interface Props extends PageProps {
    election: Election;
    ufrs: Ufr[];
    filieres: Filiere[];
    departements: Departement[];
    niveaux: Record<string, string>;
}

export default function GenererListeElectorale() {
    const { election, ufrs, filieres, departements, niveaux } = usePage<Props>().props;

    const { data, setData, post, processing } = useForm({
        id_ufr: '',
        id_departement: '',
        id_filiere: '',
        niveau: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/elections/${election.id_election}/generer-liste`);
    };

    return (
        <AppLayout>
            <Head title={`Générer liste électorale - ${election.titre}`} />
            <div className="container mt-5">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-green-600">{election.titre}</CardTitle>
                        <p className="text-muted-foreground">Configuration de la liste électorale</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            {/* Configuration pour élection UFR */}
                            {election.type === 'ufr' && (
                                <>
                                    <div>
                                        <Label htmlFor="id_ufr">UFR</Label>
                                        <Select value={data.id_ufr} onValueChange={(value) => setData('id_ufr', value)} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="-- Choisir UFR --" />
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

                                    <div>
                                        <Label htmlFor="id_departement">Département</Label>
                                        <Select value={data.id_departement} onValueChange={(value) => setData('id_departement', value)} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="-- Choisir département --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departements.map((dep) => (
                                                    <SelectItem key={dep.id_departement} value={dep.id_departement.toString()}>
                                                        {dep.nom}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            {/* Configuration pour élection Promotion */}
                            {election.type === 'promotion' && (
                                <>
                                    <div>
                                        <Label htmlFor="id_filiere">Filière</Label>
                                        <Select value={data.id_filiere} onValueChange={(value) => setData('id_filiere', value)} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="-- Choisir filière --" />
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

                                    <div>
                                        <Label htmlFor="niveau">Niveau</Label>
                                        <Select value={data.niveau} onValueChange={(value) => setData('niveau', value)} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="-- Choisir niveau --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(niveaux).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            <div className="text-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Générer la liste électorale
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}