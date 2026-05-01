import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trophy, TrendingUp, Clock, Info, Eye } from 'lucide-react'
import type { ElectionAdminResultatsProps } from '@/types/election'

export default function ElectionAdminResultats({
    electionStatut,
    resultatsUrl
}: ElectionAdminResultatsProps) {
    return (
        <div className="space-y-6">
            {/* Header moderne */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                    <Trophy className="h-6 w-6" />
                    <h2 className="text-2xl font-bold">Résultats de l'élection</h2>
                </div>
                <p className="text-blue-100">
                    Consultez les résultats et les statistiques détaillées de cette élection
                </p>
            </div>

            {/* Carte de résultats */}
            <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                        <TrendingUp className="h-5 w-5" />
                        Statut des résultats
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {electionStatut === 'terminee' ? (
                        <div className="space-y-6">
                            {/* Alert succès */}
                            <Alert className="bg-green-50 border-green-200 shadow-lg">
                                <Trophy className="h-5 w-5 text-green-600" />
                                <AlertDescription className="text-green-800">
                                    <div className="font-semibold mb-2">Élection terminée</div>
                                    <p className="text-base">
                                        L'élection est terminée. Vous pouvez consulter les résultats détaillés et analyser les statistiques de participation.
                                    </p>
                                </AlertDescription>
                            </Alert>

                            {/* Carte d'action */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Trophy className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-green-800 mb-2">Résultats disponibles</h3>
                                    <p className="text-sm text-green-700 mb-4">
                                        Accédez aux résultats complets avec les détails des votes, pourcentages et statistiques.
                                    </p>
                                    <Button 
                                        asChild 
                                        className="bg-green-600 hover:bg-green-700 text-white shadow-lg h-12 text-base font-medium px-8"
                                    >
                                        <a href={resultatsUrl} className="no-underline">
                                            <Eye className="h-5 w-5 mr-2" />
                                            Voir les résultats détaillés
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Alert attente */}
                            <Alert className="bg-yellow-50 border-yellow-200 shadow-lg">
                                <Clock className="h-5 w-5 text-yellow-600" />
                                <AlertDescription className="text-yellow-800">
                                    <div className="font-semibold mb-2">Élection en cours</div>
                                    <p className="text-base">
                                        Les résultats seront disponibles après la fin de l'élection. Veuillez patienter jusqu'à la clôture officielle.
                                    </p>
                                </AlertDescription>
                            </Alert>

                            {/* Carte d'information */}
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Clock className="h-8 w-8 text-yellow-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Résultats en attente</h3>
                                    <p className="text-sm text-yellow-700">
                                        L'élection est toujours en cours. Les résultats seront publiés dès la fin de la période de vote.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
