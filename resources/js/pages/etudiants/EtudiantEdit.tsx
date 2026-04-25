import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import etudiants from '@/routes/etudiants';
import type { PageProps } from '@/types/app';

interface Etudiant {
    id: number;
    INE: string;
    id_filiere: number;
    niveau: string;
    date_naissance: string;
    photo: string;
    user: { name: string };
}

interface Filiere {
    id_filiere: number;
    nom: string;
}

interface Props extends PageProps {
    etudiant: Etudiant;
    filieres: Filiere[];
    niveaux: Record<string, string>;
}

export default function EtudiantEdit() {
    const { etudiant, filieres, niveaux } = usePage<Props>().props;
    
    // Vérifications de sécurité
    if (!etudiant) {
        return <div>Étudiant non trouvé</div>;
    }
    
    const { data, setData, put, processing, errors } = useForm({
        name: etudiant.user?.name || '',
        id_filiere: etudiant.id_filiere?.toString() || '',
        niveau: etudiant.niveau || '',
        date_naissance: etudiant.date_naissance || '',
        photo: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(etudiants.update.url({ etudiant: etudiant.id }));
    };

    return (
        <AppLayout>
            <Head title="Modifier un Étudiant" />
            <div className="container mt-5">
                {/* Boutons retour et annuler */}
                <div className="mb-4 flex gap-2">
                    <Button variant="outline" onClick={() => router.get(etudiants.index.url())}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour à la liste
                    </Button>
                    <Button variant="secondary" onClick={() => router.get(etudiants.show.url({ etudiant: etudiant.id }))}>
                        Annuler
                    </Button>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-green-600">Modifier un Étudiant</CardTitle>
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
                                <Label htmlFor="name">Nom</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="INE">INE</Label>
                                <Input
                                    id="INE"
                                    type="text"
                                    value={etudiant.INE}
                                    readOnly
                                />
                            </div>
                            <div>
                                <Label htmlFor="id_filiere">Filière</Label>
                                <Select value={data.id_filiere} onValueChange={(value) => setData('id_filiere', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="-- Choisir --" />
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
                                        <SelectValue />
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
                                {etudiant.photo && (
                                    <div className="mb-3">
                                        <p className="text-sm text-gray-600 mb-2">Photo actuelle :</p>
                                        <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                                            <img
                                                src={`/storage/${etudiant.photo}`}
                                                alt="Photo actuelle"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                                <Input
                                    id="photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('photo', e.target.files?.[0] || null)}
                                />
                            </div>
                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => router.get(etudiants.index.url())}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Retour
                                </Button>
                                <div className="flex gap-2">
                                    <Button variant="secondary" onClick={() => router.get(etudiants.show.url({ etudiant: etudiant.id }))}>
                                        Annuler
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        Mettre à jour
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}