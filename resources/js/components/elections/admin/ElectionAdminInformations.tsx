import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ElectionStatusBadge from '@/components/elections/ElectionStatusBadge'
import {
    UserCheck, Users, CheckCircle, TrendingUp, Settings,
    Calendar, MapPin
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
        <Card>
            <CardHeader>
                <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-500">Type</label>
                        <p className="text-lg">{election.type === 'ufr' ? 'UFR' : 'Promotion'}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Statut</label>
                        <div className="text-lg"><ElectionStatusBadge statut={election.statut} /></div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Date de début</label>
                        <p className="text-lg flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(election.date_debut).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Date de fin</label>
                        <p className="text-lg flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(election.date_fin).toLocaleDateString()}
                        </p>
                    </div>
                    {election.ufr && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">UFR</label>
                            <p className="text-lg flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {election.ufr.nom}
                            </p>
                        </div>
                    )}
                    {election.filiere && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Filière</label>
                            <p className="text-lg flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {election.filiere.nom}
                            </p>
                        </div>
                    )}
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Actions administratives</h3>
                    <div className="flex flex-wrap gap-2">
                        {election.statut === 'brouillon' && (
                            <>
                                <Button onClick={onGenererListe} variant="outline">
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Générer liste électorale
                                </Button>
                                <Button onClick={onVoirListe} variant="outline">
                                    <Users className="h-4 w-4 mr-2" />
                                    Voir liste électorale
                                </Button>
                            </>
                        )}

                        {election.statut === 'liste_generee' && (
                            <>
                                <Button onClick={onVoirListe} variant="outline">
                                    <Users className="h-4 w-4 mr-2" />
                                    Voir liste électorale
                                </Button>
                                <Button onClick={onCloturerCandidatures} className="bg-orange-600 hover:bg-orange-700">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Clôturer les candidatures
                                </Button>
                                <Button onClick={onOuvrir} className="bg-green-600 hover:bg-green-700">
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    Ouvrir l'élection
                                </Button>
                            </>
                        )}

                        {election.statut === 'ouverte' && (
                            <>
                                <Button onClick={onVoirListe} variant="outline">
                                    <Users className="h-4 w-4 mr-2" />
                                    Voir liste électorale
                                </Button>
                                <Button onClick={onCloturer} variant="destructive">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Clôturer l'élection
                                </Button>
                            </>
                        )}

                        {election.statut === 'terminee' && (
                            <Alert className="mt-2 mb-2 bg-blue-50 border-blue-200">
                                <AlertDescription>
                                    L'élection est terminée. Les résultats sont disponibles dans l'onglet <strong>"Résultats"</strong>.
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button onClick={onVoirListe} variant="outline">
                            <Users className="h-4 w-4 mr-2" />
                            Voir liste électorale
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
