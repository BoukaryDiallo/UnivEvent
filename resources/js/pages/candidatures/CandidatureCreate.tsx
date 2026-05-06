import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, User, Users, FileText, Upload, AlertCircle, CheckCircle, Info, GraduationCap, Building2 } from 'lucide-react';
import {useState} from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { store as candidaturesStore } from '@/routes/candidatures';
import type { PageProps } from '@/types/app';

type Props = PageProps<{
    etudiants?: any[];
    elections?: any[];
    etudiant?: any;
    election?: any;
    fromElection?: boolean;
}>;

export default function CandidatureCreate() {
    const { etudiants, elections, etudiant, election, fromElection } = usePage<Props>().props;
    
    // Déterminer si les PDF sont nécessaires (uniquement pour les élections de type UFR)
    const needsPdf = election?.type === 'ufr';
    
    // État pour l'aperçu de l'image
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    
    const { data, setData, post, processing, errors } = useForm({
        id_etudiant: fromElection ? etudiant?.id : '',
        id_election: fromElection ? election?.id_election : '',
        programme: '',
        photo: null as File | null,
        cnib_pdf: null as File | null,
        casier_judiciaire_pdf: null as File | null,
        attestation_inscription_pdf: null as File | null,
        fromElection: fromElection || false,
        needsPdf: needsPdf || false,
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('photo', file);
        
        // Créer un aperçu de l'image
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPhotoPreview(null);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(candidaturesStore.url());
    };

    return (
        <AppLayout>
            <Head title="Déposer une Candidature" />
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
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">Déposer une Candidature</h2>
                                    <p className="text-blue-100 mt-1">
                                        {fromElection ? 'Candidature pour une élection spécifique' : 'Nouvelle candidature'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulaire */}
                    <Card className="shadow-xl border-0">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                            <CardTitle className="flex items-center gap-2 text-blue-700">
                                <FileText className="h-5 w-5" />
                                Formulaire de candidature
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            {Object.keys(errors).length > 0 && (
                                <Alert className="mb-6 border-red-200 bg-red-50">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">
                                        <div className="font-semibold mb-2">Veuillez corriger les erreurs suivantes :</div>
                                        <ul className="list-disc list-inside space-y-1">
                                            {Object.values(errors).map((error, index) => (
                                                <li key={index} className="text-sm">{error}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}

                            <form onSubmit={submit} encType="multipart/form-data" className="space-y-8">
                                {/* Informations de l'étudiant */}
                                {fromElection && etudiant && (
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <User className="h-5 w-5 text-blue-600" />
                                                <h3 className="font-semibold text-blue-800">Informations de l'étudiant</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-blue-700">Nom:</span>
                                                    <span className="text-sm text-blue-600">{etudiant.user?.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-blue-500" />
                                                    <span className="text-sm font-medium text-blue-700">UFR:</span>
                                                    <span className="text-sm text-blue-600">{etudiant.ufr?.nom}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap className="h-4 w-4 text-blue-500" />
                                                    <span className="text-sm font-medium text-blue-700">Filière:</span>
                                                    <span className="text-sm text-blue-600">{etudiant.filiere?.nom}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-blue-700">Niveau:</span>
                                                    <span className="text-sm text-blue-600">{etudiant.niveau}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            
                                {/* Sélection de l'étudiant (admin) */}
                                {!fromElection && (
                                    <div className="space-y-2">
                                        <Label htmlFor="id_etudiant" className="flex items-center gap-2 text-base font-medium text-gray-700">
                                            <Users className="h-4 w-4" />
                                            Étudiant
                                        </Label>
                                        <Select value={data.id_etudiant} onValueChange={(value) => setData('id_etudiant', value)}>
                                            <SelectTrigger className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                                                <SelectValue placeholder="-- Sélectionner un étudiant --" />
                                            </SelectTrigger>
                                            <SelectContent className="border-gray-200 shadow-lg">
                                                {etudiants?.map((etudiant: any) => (
                                                    <SelectItem key={etudiant.id} value={etudiant.id.toString()} className="py-3">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-gray-400" />
                                                            <div>
                                                                <div className="font-medium">{etudiant.user?.name}</div>
                                                                <div className="text-sm text-gray-500">
                                                                    {etudiant.ufr?.nom} - {etudiant.filiere?.nom} ({etudiant.niveau})
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            
                                {/* Informations de l'élection */}
                                {fromElection && election && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <h3 className="font-semibold text-green-800">Élection concernée</h3>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-green-700">Titre:</span>
                                                <span className="text-sm text-green-600">{election.titre}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-green-700">Type:</span>
                                                <span className="text-sm text-green-600">{election.type}</span>
                                            </div>
                                            <div className="text-sm text-green-600">
                                                <span className="font-medium text-green-700">Description:</span> {election.description}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            
                                {/* Sélection de l'élection (admin) */}
                                {!fromElection && (
                                    <div className="space-y-2">
                                        <Label htmlFor="id_election" className="flex items-center gap-2 text-base font-medium text-gray-700">
                                            <FileText className="h-4 w-4" />
                                            Élection
                                        </Label>
                                        <Select value={data.id_election} onValueChange={(value) => setData('id_election', value)}>
                                            <SelectTrigger className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                                                <SelectValue placeholder="-- Sélectionner une élection --" />
                                            </SelectTrigger>
                                            <SelectContent className="border-gray-200 shadow-lg">
                                                {elections?.map((election: any) => (
                                                    <SelectItem key={election.id_election} value={election.id_election.toString()} className="py-3">
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-gray-400" />
                                                            <div>
                                                                <div className="font-medium">{election.titre}</div>
                                                                <div className="text-sm text-gray-500">Type: {election.type}</div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                {/* Programme */}
                                <div className="space-y-2">
                                    <Label htmlFor="programme" className="flex items-center gap-2 text-base font-medium text-gray-700">
                                        <FileText className="h-4 w-4" />
                                        Programme
                                    </Label>
                                    <Alert className="border-purple-200 bg-purple-50">
                                        <Info className="h-4 w-4 text-purple-600" />
                                        <AlertDescription className="text-purple-800 text-sm">
                                            Décrivez en détail votre programme, vos motivations et ce que vous souhaitez accomplir si vous êtes élu.
                                        </AlertDescription>
                                    </Alert>
                                    <Input
                                        id="programme"
                                        value={data.programme}
                                        onChange={(e) => setData('programme', e.target.value)}
                                        placeholder="Décrivez votre programme en détail..."
                                        className="min-h-[120px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                    />
                                </div>
                                {/* Photo */}
                                <div className="space-y-2">
                                    <Label htmlFor="photo" className="flex items-center gap-2 text-base font-medium text-gray-700">
                                        <Upload className="h-4 w-4" />
                                        Photo
                                    </Label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-400 transition-colors">
                                        {photoPreview ? (
                                            <div className="text-center">
                                                <div className="mb-4">
                                                    <img 
                                                        src={photoPreview} 
                                                        alt="Aperçu de la photo" 
                                                        className="mx-auto h-32 w-32 object-cover rounded-lg shadow-md"
                                                    />
                                                </div>
                                                <div className="text-sm text-gray-600 mb-2">
                                                    <span className="font-medium text-green-600">Photo sélectionnée</span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => document.getElementById('photo')?.click()}
                                                    className="mt-2"
                                                >
                                                    Changer la photo
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                                <div className="text-sm text-gray-600 mb-2">
                                                    Cliquez pour télécharger ou glissez-déposez votre photo
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Formats acceptés: JPG, PNG (max 5MB)
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => document.getElementById('photo')?.click()}
                                                    className="mt-3"
                                                >
                                                    Choisir une photo
                                                </Button>
                                            </div>
                                        )}
                                        <Input
                                            id="photo"
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                                {/* Documents PDF - élections UFR */}
                                {needsPdf && (
                                    <div className="space-y-6">
                                        <div className="border-t pt-6">
                                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <AlertCircle className="h-5 w-5 text-orange-600" />
                                                    <h3 className="font-semibold text-orange-800">Documents requis (élection UFR)</h3>
                                                </div>
                                                <p className="text-orange-700 text-sm">
                                                    Pour les élections de type UFR, les documents suivants sont obligatoires.
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="cnib_pdf" className="flex items-center gap-2 text-base font-medium text-gray-700">
                                                    <FileText className="h-4 w-4" />
                                                    CNIB (PDF)
                                                </Label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-orange-400 transition-colors">
                                                    <div className="text-center">
                                                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                        <div className="text-sm text-gray-600">
                                                            Carte nationale d'identité burkinabè
                                                        </div>
                                                        <Input
                                                            id="cnib_pdf"
                                                            type="file"
                                                            accept="application/pdf"
                                                            onChange={(e) => setData('cnib_pdf', e.target.files?.[0] || null)}
                                                            className="hidden"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => document.getElementById('cnib_pdf')?.click()}
                                                            className="mt-2"
                                                        >
                                                            Choisir un fichier
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="casier_judiciaire_pdf" className="flex items-center gap-2 text-base font-medium text-gray-700">
                                                    <FileText className="h-4 w-4" />
                                                    Casier judiciaire (PDF)
                                                </Label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-orange-400 transition-colors">
                                                    <div className="text-center">
                                                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                        <div className="text-sm text-gray-600">
                                                            Extrait de casier judiciaire
                                                        </div>
                                                        <Input
                                                            id="casier_judiciaire_pdf"
                                                            type="file"
                                                            accept="application/pdf"
                                                            onChange={(e) => setData('casier_judiciaire_pdf', e.target.files?.[0] || null)}
                                                            className="hidden"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => document.getElementById('casier_judiciaire_pdf')?.click()}
                                                            className="mt-2"
                                                        >
                                                            Choisir un fichier
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="attestation_inscription_pdf" className="flex items-center gap-2 text-base font-medium text-gray-700">
                                                    <FileText className="h-4 w-4" />
                                                    Attestation d'inscription (PDF)
                                                </Label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-orange-400 transition-colors">
                                                    <div className="text-center">
                                                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                        <div className="text-sm text-gray-600">
                                                            Attestation d'inscription universitaire
                                                        </div>
                                                        <Input
                                                            id="attestation_inscription_pdf"
                                                            type="file"
                                                            accept="application/pdf"
                                                            onChange={(e) => setData('attestation_inscription_pdf', e.target.files?.[0] || null)}
                                                            className="hidden"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => document.getElementById('attestation_inscription_pdf')?.click()}
                                                            className="mt-2"
                                                        >
                                                            Choisir un fichier
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            
                                {/* Message pour les élections non-UFR */}
                                {!needsPdf && fromElection && (
                                    <Alert className="border-gray-200 bg-gray-50">
                                        <Info className="h-4 w-4 text-gray-600" />
                                        <AlertDescription className="text-gray-800">
                                            <div className="font-medium mb-1">Documents non requis</div>
                                            <div className="text-sm">
                                                Pour cette élection de type <span className="font-semibold">{election?.type}</span>, 
                                                aucun document PDF n'est requis. Seuls votre programme et votre photo sont nécessaires.
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                    <div className="text-sm text-gray-500">
                                        Votre candidature sera soumise pour validation
                                    </div>
                                    <div className="flex gap-3">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => window.history.back()}
                                            className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Annuler
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            disabled={processing}
                                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg disabled:opacity-50"
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Soumission en cours...
                                                </>
                                            ) : (
                                                <>
                                                    <User className="h-4 w-4 mr-2" />
                                                    Soumettre Candidature
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