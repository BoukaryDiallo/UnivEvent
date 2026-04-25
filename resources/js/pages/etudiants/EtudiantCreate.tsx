import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { PageProps } from '@/types/app';

type Props = PageProps<{
    users: any[];
    ufrs: any[];
    departements: any[];
    filieres: any[];
    niveaux: Record<string, string>;
}>

export default function EtudiantCreate() {
    const { users, ufrs, departements, filieres, niveaux } = usePage<Props>().props;
    const { data, setData, post, processing, errors } = useForm({
        id_user: '',
        INE: '',
        id_ufr: '',
        id_departement: '',
        id_filiere: '',
        niveau: '',
        date_naissance: '',
        photo: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(etudiants.store.url());
    };

    return (
        <AppLayout>
            <Head title="Créer un Étudiant" />
            <div className="container mt-5">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-green-600">Créer un Étudiant</CardTitle>
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
                        <form onSubmit={submit} encType="multipart/form-data" className="space-y-4">
                            <div>
                                <Label htmlFor="id_user">Utilisateur</Label>
                                <Select value={data.id_user} onValueChange={(value) => setData('id_user', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="-- Sélectionner un utilisateur --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="INE">INE</Label>
                                <Input
                                    id="INE"
                                    type="text"
                                    value={data.INE}
                                    onChange={(e) => setData('INE', e.target.value)}
                                    placeholder="Ex: 2026INE123"
                                />
                            </div>
                            <div>
                                <Label htmlFor="id_ufr">UFR</Label>
                                <Select value={data.id_ufr} onValueChange={(value) => setData('id_ufr', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="-- Sélectionner un UFR --" />
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
                                <Select value={data.id_departement} onValueChange={(value) => setData('id_departement', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="-- Sélectionner un département --" />
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
                            <div>
                                <Label htmlFor="id_filiere">Filière</Label>
                                <Select value={data.id_filiere} onValueChange={(value) => setData('id_filiere', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="-- Sélectionner une filière --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filieres.map((fil) => (
                                            <SelectItem key={fil.id_filiere} value={fil.id_filiere.toString()}>
                                                {fil.nom}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="niveau">Niveau</Label>
                                <Select value={data.niveau} onValueChange={(value) => setData('niveau', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir un niveau" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(niveaux).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="date_naissance">Date de naissance</Label>
                                <Input
                                    id="date_naissance"
                                    type="date"
                                    value={data.date_naissance}
                                    onChange={(e) => setData('date_naissance', e.target.value)}
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
                            <div className="text-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Créer Étudiant
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}