import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trophy, BarChart3, Calendar } from 'lucide-react'
import type { ElectionAdminDepouillementProps } from '@/types/election'

export default function ElectionAdminDepouillement({
    election,
    stats,
    onDepouiller,
    onVoirResultatsDepouillement,
    onConfigurerSecondTour,
    resultatsUrl
}: ElectionAdminDepouillementProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Dépouillement de l'élection</CardTitle>
            </CardHeader>
            <CardContent>
                {election.statut === 'cloturee' ? (
                    <div className="space-y-4">
                        <Alert className="bg-blue-50 border-blue-200">
                            <AlertDescription>
                                <div className="font-semibold mb-2">Statistiques actuelles</div>
                                <div className="grid grid-cols-3 gap-4 text-center mt-3">
                                    <div>
                                        <div className="text-2xl font-bold text-blue-600">{stats.totalVotes}</div>
                                        <div className="text-sm text-gray-600">Votes exprimés</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-600">{stats.totalVoters}</div>
                                        <div className="text-sm text-gray-600">Électeurs inscrits</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-orange-600">{stats.participationRate}%</div>
                                        <div className="text-sm text-gray-600">Participation</div>
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>

                        <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold mb-4">Actions de dépouillement</h3>
                            <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Button onClick={onDepouiller} className="bg-blue-600 hover:bg-blue-700 w-full">
                                    <Trophy className="h-4 w-4 mr-2" />
                                    Dépouiller l'élection
                                </Button>
                                <Button onClick={onVoirResultatsDepouillement} variant="outline" className="w-full">
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Voir les résultats du dépouillement
                                </Button>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold mb-3">Consulter les résultats</h3>
                            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                                <a href={resultatsUrl}>
                                    <Trophy className="h-4 w-4 mr-2" />
                                    Voir les résultats détaillés et le vainqueur
                                </a>
                            </Button>
                        </div>
                    </div>
                ) : election.statut === 'second_tour_planifie' ? (
                    <div className="space-y-4">
                        <Alert className="bg-purple-50 border-purple-200">
                            <AlertDescription>
                                <div className="font-semibold mb-2">Second tour en attente de configuration</div>
                                <p className="text-sm text-purple-700">
                                    Les résultats du premier tour ont été publiés. Veuillez configurer les dates du second tour pour que les électeurs puissent voter à nouveau.
                                </p>
                            </AlertDescription>
                        </Alert>

                        <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold mb-4">Configuration du second tour</h3>
                            <div className="space-y-2">
                                <Button onClick={onConfigurerSecondTour} className="bg-purple-600 hover:bg-purple-700 w-full">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Configurer les dates du second tour
                                </Button>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold mb-3">Consulter les résultats du premier tour</h3>
                            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                                <a href={resultatsUrl}>
                                    <Trophy className="h-4 w-4 mr-2" />
                                    Voir les résultats du premier tour
                                </a>
                            </Button>
                        </div>
                    </div>
                ) : election.statut === 'second_tour' ? (
                    <div className="space-y-4">
                        <Alert className="bg-orange-50 border-orange-200">
                            <AlertDescription>
                                <strong>Second tour en cours !</strong><br />
                                L'élection est en phase de second tour. Vous pouvez consulter les résultats du premier tour.
                            </AlertDescription>
                        </Alert>
                        <Button asChild className="w-full">
                            <a href={resultatsUrl}>
                                <Trophy className="h-4 w-4 mr-2" />
                                Voir les résultats du second tour
                            </a>
                        </Button>
                    </div>
                ) : (
                    <Alert className="bg-yellow-50 border-yellow-200">
                        <AlertDescription>
                            L'élection est actuellement en statut <strong>"{election.statut}"</strong>.<br />
Le dépouillement ne peut être effectué que lorsque l'élection est <strong>clôturée</strong>.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    )
}
