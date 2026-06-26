import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Users, Building2, GraduationCap, Settings, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <Button 
                                variant="outline" 
                                onClick={() => window.history.back()}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Retour
                            </Button>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{election.titre}</h2>
                                    <p className="text-blue-100 mt-1">Configuration de la liste électorale</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulaire */}
                    <Card className="shadow-xl border-0">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                            <CardTitle className="flex items-center gap-2 text-blue-700">
                                <Settings className="h-5 w-5" />
                                Paramètres de la liste électorale
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <Alert className="mb-6 border-blue-200 bg-blue-50">
                                <Info className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800">
                                    Configurez les critères pour générer automatiquement la liste électorale. 
                                    Seuls les étudiants correspondant à ces critères pourront participer à l'élection.
                                </AlertDescription>
                            </Alert>

                            <form onSubmit={submit} className="space-y-8">
                                {/* Configuration pour élection UFR */}
                                {election.type === 'ufr' && (
                                    <div className="space-y-6">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Building2 className="h-5 w-5 text-blue-600" />
                                                <h3 className="font-semibold text-blue-800">Élection UFR</h3>
                                            </div>
                                            <p className="text-blue-700 text-sm mb-4">
                                                Sélectionnez l'UFR et le département pour générer la liste électorale
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <Label htmlFor="id_ufr" className="flex items-center gap-2 text-base font-medium text-gray-700 mb-2">
                                                    <Building2 className="h-4 w-4" />
                                                    UFR (optionnel)
                                                </Label>
                                                <Select value={data.id_ufr} onValueChange={(value) => setData('id_ufr', value)}>
                                                    <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                                        <SelectValue placeholder="-- Choisir UFR (optionnel) --" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-gray-200 shadow-lg">
                                                        {ufrs.map((ufr) => (
                                                            <SelectItem key={ufr.id_ufr} value={ufr.id_ufr.toString()} className="py-3">
                                                                {ufr.nom}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="id_departement" className="flex items-center gap-2 text-base font-medium text-gray-700 mb-2">
                                                    <Building2 className="h-4 w-4" />
                                                    Département (optionnel)
                                                </Label>
                                                <Select value={data.id_departement} onValueChange={(value) => setData('id_departement', value)}>
                                                    <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                                        <SelectValue placeholder="-- Choisir département (optionnel) --" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-gray-200 shadow-lg">
                                                        {departements.map((dep) => (
                                                            <SelectItem key={dep.id_departement} value={dep.id_departement.toString()} className="py-3">
                                                                {dep.nom}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Configuration pour élection Promotion */}
                                {election.type === 'promotion' && (
                                    <div className="space-y-6">
                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <GraduationCap className="h-5 w-5 text-purple-600" />
                                                <h3 className="font-semibold text-purple-800">Élection Promotion</h3>
                                            </div>
                                            <p className="text-purple-700 text-sm mb-4">
                                                Sélectionnez la filière et le niveau pour générer la liste électorale
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <Label htmlFor="id_filiere" className="flex items-center gap-2 text-base font-medium text-gray-700 mb-2">
                                                    <GraduationCap className="h-4 w-4" />
                                                    Filière (optionnel)
                                                </Label>
                                                <Select value={data.id_filiere} onValueChange={(value) => setData('id_filiere', value)}>
                                                    <SelectTrigger className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                                                        <SelectValue placeholder="-- Choisir filière (optionnel) --" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-gray-200 shadow-lg">
                                                        {filieres.map((filiere) => (
                                                            <SelectItem key={filiere.id_filiere} value={filiere.id_filiere.toString()} className="py-3">
                                                                {filiere.nom}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="niveau" className="flex items-center gap-2 text-base font-medium text-gray-700 mb-2">
                                                    <Users className="h-4 w-4" />
                                                    Niveau (optionnel)
                                                </Label>
                                                <Select value={data.niveau} onValueChange={(value) => setData('niveau', value)}>
                                                    <SelectTrigger className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                                                        <SelectValue placeholder="-- Choisir niveau (optionnel) --" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-gray-200 shadow-lg">
                                                        {Object.entries(niveaux).map(([key, label]) => (
                                                            <SelectItem key={key} value={key} className="py-3">
                                                                {label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                    <div className="text-sm text-gray-500">
                                        Les étudiants seront automatiquement ajoutés à la liste électorale
                                    </div>
                                    <div className="flex gap-3">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => window.history.back()}
                                            className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                                        >
                                            Annuler
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            disabled={processing}
                                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg disabled:opacity-50"
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Génération en cours...
                                                </>
                                            ) : (
                                                <>
                                                    <Users className="h-4 w-4 mr-2" />
                                                    Générer la liste électorale
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}