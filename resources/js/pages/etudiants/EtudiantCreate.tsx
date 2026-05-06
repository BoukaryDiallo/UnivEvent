import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Upload, User, GraduationCap, Building2, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import {store as etudiantsStore} from '@/routes/etudiants';
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
        post(etudiantsStore.url());
    };

    return (
        <AppLayout>
            <Head title="Créer un Étudiant" />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 shadow-lg mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                <User className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Créer un Étudiant</h1>
                                <p className="text-blue-100 mt-2">Ajouter un nouvel étudiant au système</p>
                            </div>
                        </div>
                    </div>

                    {/* Formulaire */}
                    <Card className="shadow-xl border-0">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                            <CardTitle className="text-blue-700 flex items-center gap-2">
                                <GraduationCap className="h-5 w-5" />
                                Informations de l'Étudiant
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            {Object.keys(errors).length > 0 && (
                                <Alert className="mb-6 border-red-200 bg-red-50">
                                    <AlertDescription>
                                        <ul className="mb-0 space-y-1">
                                            {Object.values(errors).map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                            )}
                            <form onSubmit={submit} encType="multipart/form-data" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="id_user" className="text-sm font-medium text-gray-700">Utilisateur</Label>
                                    <Select value={data.id_user} onValueChange={(value) => setData('id_user', value)}>
                                        <SelectTrigger className="w-full">
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
                                <div className="space-y-2">
                                    <Label htmlFor="INE" className="text-sm font-medium text-gray-700">INE</Label>
                                    <Input
                                        id="INE"
                                        type="text"
                                        value={data.INE}
                                        onChange={(e) => setData('INE', e.target.value)}
                                        placeholder="Ex: 2026INE123"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="id_ufr" className="text-sm font-medium text-gray-700">UFR</Label>
                                    <Select value={data.id_ufr} onValueChange={(value) => setData('id_ufr', value)}>
                                        <SelectTrigger className="w-full">
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
                                <div className="space-y-2">
                                    <Label htmlFor="id_departement" className="text-sm font-medium text-gray-700">Département</Label>
                                    <Select value={data.id_departement} onValueChange={(value) => setData('id_departement', value)}>
                                        <SelectTrigger className="w-full">
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
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <div className="space-y-2">
                                    <Label htmlFor="niveau" className="text-sm font-medium text-gray-700">Niveau</Label>
                                    <Select value={data.niveau} onValueChange={(value) => setData('niveau', value)}>
                                        <SelectTrigger className="w-full">
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
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    <div className="relative">
                                        <Input
                                            id="photo"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setData('photo', e.target.files?.[0] || null)}
                                            className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <Upload className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-6">
                                <Button type="button" variant="outline" onClick={() => window.history.back()} className="px-6">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={processing} className="px-6">
                                    <User className="mr-2 h-4 w-4" />
                                    {processing ? 'Enregistrement...' : 'Enregistrer'}
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