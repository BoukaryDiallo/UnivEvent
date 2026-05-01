import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import ElectionStatusBadge from '@/components/elections/ElectionStatusBadge'
import {
    UserCheck, Users, CheckCircle, TrendingUp, Settings,
    Calendar, MapPin, Info, FileText, Eye
} from 'lucide-react'
import type { Election, ElectionAdminInformationsProps } from '@/types/election'

export default function ElectionAdminInformations({
    election,
    onGenererListe,
    onVoirListe,
    onCloturerCandidatures,
    onOuvrir,
    onCloturer
}: ElectionAdminInformationsProps) {
    return (
        <div className="space-y-6">
            {/* Header moderne */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                    <Info className="h-6 w-6" />
                    <h2 className="text-2xl font-bold">Informations générales</h2>
                </div>
                <p className="text-blue-100">
                    Détails et configuration de l'élection
                </p>
            </div>

            {/* Carte d'informations */}
            <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                        <FileText className="h-5 w-5" />
                        Détails de l'élection
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Type d'élection</label>
                            <div className="flex items-center gap-2">
                                <Badge className={election.type === 'ufr' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                                    {election.type === 'ufr' ? 'UFR' : 'Promotion'}
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Statut actuel</label>
                            <div className="flex items-center gap-2">
                                <ElectionStatusBadge statut={election.statut} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Date de début</label>
                            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                {new Date(election.date_debut).toLocaleDateString('fr-FR')}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Date de fin</label>
                            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <Calendar className="h-5 w-5 text-red-600" />
                                {new Date(election.date_fin).toLocaleDateString('fr-FR')}
                            </div>
                        </div>
                        {election.ufr && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">UFR concernée</label>
                                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                    <MapPin className="h-5 w-5 text-green-600" />
                                    {election.ufr.nom}
                                </div>
                            </div>
                        )}
                        {election.filiere && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">Filière concernée</label>
                                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                    <MapPin className="h-5 w-5 text-purple-600" />
                                    {election.filiere.nom}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Actions administratives */}
            <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardTitle className="flex items-center gap-2 text-purple-700">
                        <Settings className="h-5 w-5" />
                        Actions administratives
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {election.statut === 'planifiee' && (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600 mb-3">Élection en cours de préparation :</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Button 
                                        onClick={onGenererListe} 
                                        variant="outline" 
                                        className="border-blue-200 text-blue-700 hover:bg-blue-50 h-12"
                                    >
                                        <UserCheck className="h-5 w-5 mr-2" />
                                        Générer liste électorale
                                    </Button>
                                    <Button 
                                        onClick={onVoirListe} 
                                        variant="outline" 
                                        className="border-green-200 text-green-700 hover:bg-green-50 h-12"
                                    >
                                        <Eye className="h-5 w-5 mr-2" />
                                        Voir liste électorale
                                    </Button>
                                </div>
                            </div>
                        )}

                        {election.statut === 'liste_generee' && (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600 mb-3">Liste électorale générée, actions disponibles :</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <Button 
                                        onClick={onVoirListe} 
                                        variant="outline" 
                                        className="border-blue-200 text-blue-700 hover:bg-blue-50 h-12"
                                    >
                                        <Eye className="h-5 w-5 mr-2" />
                                        Voir liste
                                    </Button>
                                    <Button 
                                        onClick={onCloturerCandidatures} 
                                        className="bg-orange-600 hover:bg-orange-700 text-white h-12"
                                    >
                                        <CheckCircle className="h-5 w-5 mr-2" />
                                        Clôturer candidatures
                                    </Button>
                                    <Button 
                                        onClick={onOuvrir} 
                                        className="bg-green-600 hover:bg-green-700 text-white h-12"
                                    >
                                        <TrendingUp className="h-5 w-5 mr-2" />
                                        Ouvrir l'élection
                                    </Button>
                                </div>
                            </div>
                        )}

                        {election.statut === 'ouverte' && (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600 mb-3">Élection en cours de vote :</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Button 
                                        onClick={onVoirListe} 
                                        variant="outline" 
                                        className="border-blue-200 text-blue-700 hover:bg-blue-50 h-12"
                                    >
                                        <Eye className="h-5 w-5 mr-2" />
                                        Voir liste électorale
                                    </Button>
                                    <Button 
                                        onClick={onCloturer} 
                                        variant="destructive" 
                                        className="bg-red-600 hover:bg-red-700 h-12"
                                    >
                                        <Settings className="h-5 w-5 mr-2" />
                                        Clôturer l'élection
                                    </Button>
                                </div>
                            </div>
                        )}

                        {election.statut === 'terminee' && (
                            <Alert className="bg-blue-50 border-blue-200 shadow-lg">
                                <Info className="h-5 w-5 text-blue-600" />
                                <AlertDescription className="text-blue-800">
                                    <div className="font-semibold mb-2">Élection terminée</div>
                                    <p className="text-base">
                                        Les résultats sont disponibles dans l'onglet <span className="font-bold bg-blue-100 px-2 py-1 rounded">"Résultats"</span>.
                                    </p>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Action toujours disponible */}
                        <div className="pt-4 border-t">
                            <Button 
                                onClick={onVoirListe} 
                                variant="outline" 
                                className="border-gray-200 text-gray-700 hover:bg-gray-50 h-12"
                            >
                                <Users className="h-5 w-5 mr-2" />
                                Consulter la liste électorale
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
