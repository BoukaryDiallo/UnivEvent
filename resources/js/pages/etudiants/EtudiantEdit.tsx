import { Head, useForm, usePage, router } from '@inertiajs/react';
import { ArrowLeft, User, GraduationCap, Calendar, Camera } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import {index as etudiantsIndex,update as etudiantsUpdate} from '@/routes/etudiants';
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
        put(etudiantsUpdate.url(etudiant.id));
    };

    return (
        <AppLayout>
            <Head title="Modifier un Étudiant" />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 shadow-lg mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                <User className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Modifier un Étudiant</h1>
                                <p className="text-blue-100 mt-2">Mettre à jour les informations de l'étudiant</p>
                            </div>
                        </div>
                    </div>

                    {/* Formulaire */}
                    <Card className="shadow-xl border-0">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                            <CardTitle className="text-blue-700 flex items-center gap-2">
                                <GraduationCap className="h-5 w-5" />
                                Modifier les informations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            {Object.keys(errors).length > 0 && (
                                <Alert className="mb-6 border-red-200 bg-red-50">
                                    <AlertDescription>
                                        <ul className="mb-0 space-y-1">
                                            {Object.values(errors).map((error, index) => (
                                                <li key={index} className="text-red-700">{error}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}
                            <form onSubmit={submit} encType="multipart/form-data" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nom complet</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Nom de l'étudiant"
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="id_filiere" className="text-sm font-medium text-gray-700">Filière</Label>
                                        <Select value={data.id_filiere} onValueChange={(value) => setData('id_filiere', value)}>
                                            <SelectTrigger className="w-full">
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
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="INE" className="text-sm font-medium text-gray-700">INE</Label>
                                    <Input
                                        id="INE"
                                        type="text"
                                        value={etudiant.INE}
                                        readOnly
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="niveau" className="text-sm font-medium text-gray-700">Niveau</Label>
                                    <Select value={data.niveau} onValueChange={(value) => setData('niveau', value)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Sélectionner un niveau" />
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
                                <div className="space-y-2">
                                    <Label htmlFor="date_naissance" className="text-sm font-medium text-gray-700">Date de naissance</Label>
                                    <Input
                                        id="date_naissance"
                                        type="date"
                                        value={data.date_naissance}
                                        onChange={(e) => setData('date_naissance', e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="photo" className="text-sm font-medium text-gray-700">Photo</Label>
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
                                        onChange={(e) => setData('photo', e.target.files?.[0] || null)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-6">
                                    <Button type="button" variant="outline" onClick={() => router.get(etudiantsIndex.url())} className="px-6">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Retour à la liste
                                    </Button>
                                    <Button type="submit" disabled={processing} className="px-6">
                                        <User className="mr-2 h-4 w-4" />
                                        {processing ? 'Mise à jour...' : 'Mettre à jour'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}