import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import InputError from '@/components/input-error'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
        <Card>
            <CardHeader>
                <CardTitle className="text-center text-green-600">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {Object.keys(errors).length > 0 && (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                        <AlertDescription>
                            <ul className="mb-0">
                                {Object.values(errors).map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Afficher les candidats qualifiés en mode second tour */}
                {mode === 'second_tour' && candidatsQualifies && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">Candidats qualifiés pour le second tour</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {candidatsQualifies.map((candidat) => (
                                <div key={candidat.id_candidature} className="border rounded-lg p-4 bg-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-200 shadow-sm bg-gray-50">
                                            {candidat.user.photo ? (
                                                <img
                                                    src={`/storage/${candidat.user.photo}`}
                                                    alt={candidat.user.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg className="w-7 h-7 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800">{candidat.user.name}</h4>
                                            {candidat.slogan && (
                                                <p className="text-sm text-gray-600 italic mt-1">"{candidat.slogan}"</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                    {/* En mode second tour, n'afficher que les dates */}
                    {mode === 'second_tour' ? (
                        <>
                            <Alert className="border-blue-200 bg-blue-50">
                                <AlertDescription>
                                    <strong>Information :</strong> Le second tour opposera uniquement les deux candidats ci-dessus. 
                                    Configurez simplement la période de vote.
                                </AlertDescription>
                            </Alert>
                            
                            <div>
                                <Label htmlFor="date_debut">Date de début du second tour</Label>
                                <Input
                                    id="date_debut"
                                    type="datetime-local"
                                    value={data.date_debut}
                                    onChange={(e) => setData('date_debut', e.target.value)}
                                    required
                                />
                                <InputError message={errors.date_debut} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="date_fin">Date de fin du second tour</Label>
                                <Input
                                    id="date_fin"
                                    type="datetime-local"
                                    value={data.date_fin}
                                    onChange={(e) => setData('date_fin', e.target.value)}
                                    required
                                />
                                <InputError message={errors.date_fin} className="mt-1" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <Label htmlFor="titre">Titre</Label>
                                <Input
                                    id="titre"
                                    type="text"
                                    value={data.titre}
                                    onChange={(e) => setData('titre', e.target.value)}
                                />
                                <InputError message={errors.titre} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                <InputError message={errors.description} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="date_debut">Date de début</Label>
                                <Input
                                    id="date_debut"
                                    type="datetime-local"
                                    value={data.date_debut}
                                    onChange={(e) => setData('date_debut', e.target.value)}
                                />
                                <InputError message={errors.date_debut} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="date_fin">Date de fin</Label>
                                <Input
                                    id="date_fin"
                                    type="datetime-local"
                                    value={data.date_fin}
                                    onChange={(e) => setData('date_fin', e.target.value)}
                                />
                                <InputError message={errors.date_fin} className="mt-1" />
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
                                <InputError message={errors.type} className="mt-1" />
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
                                    <InputError message={errors.id_ufr} className="mt-1" />
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
                                    <InputError message={errors.id_filiere} className="mt-1" />
                                </div>
                            )}
                        </>
                    )}

                    {/* Afficher le statut en mode édition */}
                    {mode === 'edit' && election?.statut && (
                        <div>
                            <Label>Statut actuel</Label>
                            <div className="mt-1 p-2 bg-gray-100 rounded border">
                                <span className="font-medium">{election.statut}</span>
                                <p className="text-sm text-gray-500 mt-1">Le statut est géré automatiquement par le système</p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {submitLabel}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
