import { 
    Calendar, 
    MapPin, 
    Users, 
    Award, 
    AlertCircle,
    Info,
    Clock,
    CheckCircle
} from 'lucide-react'
import InputError from '@/components/input-error'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { 
    Election, 
    ElectionFormData, 
    ElectionFormProps, 
    Ufr, 
    Filiere, 
    CandidatQualifie 
} from '@/types/election'

export default function ElectionForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    ufrs,
    filieres,
    mode = 'create',
    election,
    candidatsQualifies,
    submitLabel,
    title,
    onCancel
}: ElectionFormProps) {
    return (
        <div className="space-y-6">
            {/* Header moderne */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3">
                    {mode === 'second_tour' ? (
                        <Clock className="h-6 w-6" />
                    ) : (
                        <Calendar className="h-6 w-6" />
                    )}
                    <h2 className="text-2xl font-bold">{title}</h2>
                </div>
                <p className="text-blue-100 mt-2">
                    {mode === 'second_tour' 
                        ? 'Configurez la période de vote pour le second tour'
                        : mode === 'edit' 
                        ? 'Modifiez les informations de cette élection'
                        : 'Créez une nouvelle élection'
                    }
                </p>
            </div>

            {/* Carte du formulaire */}
            <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                        {mode === 'second_tour' ? (
                            <Clock className="h-5 w-5" />
                        ) : (
                            <Calendar className="h-5 w-5" />
                        )}
                        {mode === 'second_tour' ? 'Configuration du second tour' : 'Informations de l\'élection'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {Object.keys(errors).length > 0 && (
                        <Alert className="mb-6 border-red-200 bg-red-50 shadow-lg">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <AlertDescription className="text-red-800">
                                <div className="font-semibold mb-2">Erreurs de validation</div>
                                <ul className="mb-0 space-y-1">
                                    {Object.values(errors).map((error, index) => (
                                        <li key={index} className="text-sm">• {error}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Afficher les candidats qualifiés en mode second tour */}
                    {mode === 'second_tour' && candidatsQualifies && (
                        <div className="mb-6">
                            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-orange-700">
                                    <Award className="h-5 w-5" />
                                    Candidats qualifiés pour le second tour
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {candidatsQualifies.map((candidat) => (
                                        <div key={candidat.id_candidature} className="bg-white rounded-lg p-4 border border-orange-200 shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-orange-200 shadow-sm bg-gradient-to-br from-orange-100 to-red-100">
                                                    {candidat.user.photo ? (
                                                        <img
                                                            src={`/storage/${candidat.user.photo}`}
                                                            alt={candidat.user.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Users className="w-7 h-7 text-orange-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-gray-800">{candidat.user.name}</h4>
                                                    {candidat.slogan && (
                                                        <p className="text-sm text-gray-600 italic mt-1">"{candidat.slogan}"</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* En mode second tour, n'afficher que les dates */}
                        {mode === 'second_tour' ? (
                            <>
                                <Alert className="border-blue-200 bg-blue-50 shadow-lg">
                                    <Info className="h-5 w-5 text-blue-600" />
                                    <AlertDescription className="text-blue-800">
                                        <div className="font-semibold mb-2">Information importante</div>
                                        <p className="text-base">
                                            Le second tour opposera uniquement les deux candidats ci-dessus. 
                                            Configurez simplement la période de vote.
                                        </p>
                                    </AlertDescription>
                                </Alert>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="date_debut" className="text-sm font-medium text-gray-700">
                                            <Calendar className="h-4 w-4 inline mr-2 text-blue-600" />
                                            Date de début du second tour
                                        </Label>
                                        <Input
                                            id="date_debut"
                                            type="datetime-local"
                                            value={data.date_debut}
                                            onChange={(e) => setData('date_debut', e.target.value)}
                                            className="h-11 border-blue-200 focus:border-blue-500"
                                            required
                                        />
                                        <InputError message={errors.date_debut} className="mt-1" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="date_fin" className="text-sm font-medium text-gray-700">
                                            <Calendar className="h-4 w-4 inline mr-2 text-red-600" />
                                            Date de fin du second tour
                                        </Label>
                                        <Input
                                            id="date_fin"
                                            type="datetime-local"
                                            value={data.date_fin}
                                            onChange={(e) => setData('date_fin', e.target.value)}
                                            className="h-11 border-red-200 focus:border-red-500"
                                            required
                                        />
                                        <InputError message={errors.date_fin} className="mt-1" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="titre" className="text-sm font-medium text-gray-700">
                                            Titre de l'élection
                                        </Label>
                                        <Input
                                            id="titre"
                                            type="text"
                                            value={data.titre}
                                            onChange={(e) => setData('titre', e.target.value)}
                                            className="h-11 border-gray-200 focus:border-blue-500"
                                            placeholder="Entrez le titre de l'élection"
                                        />
                                        <InputError message={errors.titre} className="mt-1" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                                            Description
                                        </Label>
                                        <textarea
                                            id="description"
                                            className="w-full h-11 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            rows={3}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Décrivez l'élection..."
                                        />
                                        <InputError message={errors.description} className="mt-1" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="date_debut" className="text-sm font-medium text-gray-700">
                                            <Calendar className="h-4 w-4 inline mr-2 text-green-600" />
                                            Date de début
                                        </Label>
                                        <Input
                                            id="date_debut"
                                            type="datetime-local"
                                            value={data.date_debut}
                                            onChange={(e) => setData('date_debut', e.target.value)}
                                            className="h-11 border-green-200 focus:border-green-500"
                                            required
                                        />
                                        <InputError message={errors.date_debut} className="mt-1" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="date_fin" className="text-sm font-medium text-gray-700">
                                            <Calendar className="h-4 w-4 inline mr-2 text-red-600" />
                                            Date de fin
                                        </Label>
                                        <Input
                                            id="date_fin"
                                            type="datetime-local"
                                            value={data.date_fin}
                                            onChange={(e) => setData('date_fin', e.target.value)}
                                            className="h-11 border-red-200 focus:border-red-500"
                                            required
                                        />
                                        <InputError message={errors.date_fin} className="mt-1" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-medium text-gray-700">
                                        <MapPin className="h-4 w-4 inline mr-2 text-purple-600" />
                                        Type d'élection
                                    </Label>
                                    <div className="flex space-x-6">
                                        <label className="flex items-center cursor-pointer bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 hover:bg-blue-100 transition-colors">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="ufr"
                                                checked={data.type === 'ufr'}
                                                onChange={(e) => setData('type', e.target.value)}
                                                className="mr-3 text-blue-600"
                                            />
                                            <div>
                                                <div className="font-medium text-blue-700">UFR</div>
                                                <div className="text-xs text-blue-600">Élection par UFR</div>
                                            </div>
                                        </label>
                                        <label className="flex items-center cursor-pointer bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 hover:bg-purple-100 transition-colors">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="promotion"
                                                checked={data.type === 'promotion'}
                                                onChange={(e) => setData('type', e.target.value)}
                                                className="mr-3 text-purple-600"
                                            />
                                            <div>
                                                <div className="font-medium text-purple-700">Promotion</div>
                                                <div className="text-xs text-purple-600">Élection par promotion</div>
                                            </div>
                                        </label>
                                    </div>
                                    <InputError message={errors.type} className="mt-2" />
                                </div>

                                {data.type === 'ufr' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="id_ufr" className="text-sm font-medium text-gray-700">
                                            <MapPin className="h-4 w-4 inline mr-2 text-blue-600" />
                                            UFR concernée
                                        </Label>
                                        <Select value={data.id_ufr} onValueChange={(value) => setData('id_ufr', value)}>
                                            <SelectTrigger className="h-11 border-blue-200">
                                                <SelectValue placeholder="-- Sélectionner une UFR --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ufrs.map((ufr) => (
                                                    <SelectItem key={ufr.id_ufr} value={ufr.id_ufr.toString()}>
                                                        {ufr.nom}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.id_ufr} className="mt-1" />
                                    </div>
                                )}

                                {data.type === 'promotion' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="id_filiere" className="text-sm font-medium text-gray-700">
                                            <MapPin className="h-4 w-4 inline mr-2 text-purple-600" />
                                            Filière concernée
                                        </Label>
                                        <Select value={data.id_filiere} onValueChange={(value) => setData('id_filiere', value)}>
                                            <SelectTrigger className="h-11 border-purple-200">
                                                <SelectValue placeholder="-- Sélectionner une filière --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filieres.map((filiere) => (
                                                    <SelectItem key={filiere.id_filiere} value={filiere.id_filiere.toString()}>
                                                        {filiere.nom}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.id_filiere} className="mt-1" />
                                    </div>
                                )}
                            </>
                        )}

                        {/* Afficher le statut en mode édition */}
                        {mode === 'edit' && election?.statut && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                    <Info className="h-4 w-4 inline mr-2 text-gray-600" />
                                    Statut actuel
                                </Label>
                                <div className="bg-white rounded p-3 border border-gray-300">
                                    <span className="font-medium text-gray-900">{election.statut}</span>
                                    <p className="text-sm text-gray-500 mt-1">Le statut est géré automatiquement par le système</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between pt-6 border-t border-gray-200">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={onCancel}
                                className="h-12 px-6 border-gray-200 text-gray-700 hover:bg-gray-50"
                            >
                                Annuler
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                            >
                                {processing ? 'Enregistrement...' : submitLabel}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
