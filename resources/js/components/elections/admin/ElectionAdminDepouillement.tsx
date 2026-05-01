import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
    Trophy, 
    BarChart3, 
    Calendar, 
    Users, 
    CheckCircle, 
    Settings,
    TrendingUp,
    Clock,
    AlertCircle,
    Eye
} from 'lucide-react'
import type { ElectionAdminDepouillementProps } from '@/types/election'
import { router } from '@inertiajs/react'
import resultatsRoutes from '@/routes/resultats'

export default function ElectionAdminDepouillement({
    election,
    stats,
    onDepouiller,
    onVoirResultatsDepouillement,
    onConfigurerSecondTour,
    resultatsUrl
}: ElectionAdminDepouillementProps) {
    
    const handlePublier = () => {
        const url = resultatsRoutes.publier.url({ election: election.id_election });
        router.post(url);
    };

    return (
        <div className="space-y-6">
            {/* Header moderne */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                    <Trophy className="h-6 w-6" />
                    <h2 className="text-2xl font-bold">Dépouillement de l'élection</h2>
                </div>
                <p className="text-blue-100">
                    Gérez les résultats et le processus de dépouillement de cette élection
                </p>
            </div>

            {election.statut === 'cloturee' ? (
                <div className="space-y-6">
                    {/* Carte de statistiques */}
                    <Card className="shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                            <CardTitle className="flex items-center gap-2 text-blue-700">
                                <BarChart3 className="h-5 w-5" />
                                Statistiques actuelles
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="text-3xl font-bold text-blue-600 mb-1">{stats.totalVotes}</div>
                                    <div className="text-sm font-medium text-blue-700">Votes exprimés</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="text-3xl font-bold text-green-600 mb-1">{stats.totalVoters}</div>
                                    <div className="text-sm font-medium text-green-700">Électeurs inscrits</div>
                                </div>
                                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                                    <div className="text-3xl font-bold text-orange-600 mb-1">{stats.participationRate}%</div>
                                    <div className="text-sm font-medium text-orange-700">Taux de participation</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions de dépouillement */}
                    <Card className="shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                            <CardTitle className="flex items-center gap-2 text-purple-700">
                                <Settings className="h-5 w-5" />
                                Actions de dépouillement
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button 
                                    onClick={onDepouiller} 
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg h-12 text-base font-medium"
                                >
                                    <Trophy className="h-5 w-5 mr-2" />
                                    Dépouiller l'élection
                                </Button>
                                <Button 
                                    onClick={onVoirResultatsDepouillement} 
                                    variant="outline" 
                                    className="border-blue-200 text-blue-700 hover:bg-blue-50 h-12 text-base font-medium"
                                >
                                    <Eye className="h-5 w-5 mr-2" />
                                    Voir les résultats
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Consulter les résultats */}
                    <Card className="shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <CardTitle className="flex items-center gap-2 text-green-700">
                                <TrendingUp className="h-5 w-5" />
                                Résultats détaillés
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg h-12 text-base font-medium">
                                <a href={resultatsUrl}>
                                    <Trophy className="h-5 w-5 mr-2" />
                                    Voir les résultats détaillés et le vainqueur
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            ) : election.statut === 'second_tour_requis' ? (
                <div className="space-y-6">
                    {/* Alert second tour requis */}
                    <Alert className="bg-orange-50 border-orange-200 shadow-lg">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                            <div className="font-bold text-lg mb-3 flex items-center gap-2">
                                <Calendar className="h-6 w-6 text-orange-600" />
                                Second tour requis !
                            </div>
                            <p className="text-base mb-4">
                                Aucun candidat n'a obtenu plus de 50% des voix au premier tour. 
                                Un second tour doit être organisé entre les deux candidats en tête.
                            </p>
                            <div className="bg-orange-100 rounded-lg p-4">
                                <p className="text-sm font-medium text-orange-700">
                                    ⚠️ Action requise : Configurez les dates du second tour pour que les électeurs puissent voter à nouveau.
                                </p>
                            </div>
                        </AlertDescription>
                    </Alert>

                    {/* Configuration du second tour */}
                    <Card className="shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                            <CardTitle className="flex items-center gap-2 text-orange-700">
                                <Calendar className="h-5 w-5" />
                                Configuration du second tour
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Button 
                                onClick={onConfigurerSecondTour} 
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg h-12 text-base font-medium"
                            >
                                <Calendar className="h-5 w-5 mr-2" />
                                Configurer le second tour
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Résultats du premier tour */}
                    <Card className="shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <CardTitle className="flex items-center gap-2 text-green-700">
                                <Trophy className="h-5 w-5" />
                                Résultats du premier tour
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg h-12 text-base font-medium">
                                <a href={resultatsUrl}>
                                    <Trophy className="h-5 w-5 mr-2" />
                                    Voir les résultats du premier tour
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            ) : election.statut === 'second_tour_planifie' ? (
                <div className="space-y-6">
                    {/* Alert second tour planifié */}
                    <Alert className="bg-purple-50 border-purple-200 shadow-lg">
                        <Clock className="h-5 w-5 text-purple-600" />
                        <AlertDescription className="text-purple-800">
                            <div className="font-bold text-lg mb-3">Second tour en attente de configuration</div>
                            <p className="text-base mb-4">
                                Les résultats du premier tour ont été publiés. Veuillez configurer les dates du second tour pour que les électeurs puissent voter à nouveau.
                            </p>
                            <div className="bg-purple-100 rounded-lg p-4">
                                <p className="text-sm font-medium text-purple-700">
                                    📋 Étape suivante : Définissez les dates de début et de fin du second tour.
                                </p>
                            </div>
                        </AlertDescription>
                    </Alert>

                    {/* Configuration du second tour */}
                    <Card className="shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                            <CardTitle className="flex items-center gap-2 text-purple-700">
                                <Calendar className="h-5 w-5" />
                                Configuration des dates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Button 
                                onClick={onConfigurerSecondTour} 
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg h-12 text-base font-medium"
                            >
                                <Calendar className="h-5 w-5 mr-2" />
                                Configurer les dates du second tour
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Résultats du premier tour */}
                    <Card className="shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <CardTitle className="flex items-center gap-2 text-green-700">
                                <Trophy className="h-5 w-5" />
                                Résultats du premier tour
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg h-12 text-base font-medium">
                                <a href={resultatsUrl}>
                                    <Trophy className="h-5 w-5 mr-2" />
                                    Voir les résultats du premier tour
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            ) : election.statut === 'second_tour' ? (
                <div className="space-y-6">
                    {/* Alert second tour en cours */}
                    <Alert className="bg-orange-50 border-orange-200 shadow-lg">
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                            <div className="font-bold text-lg mb-3">Second tour en cours !</div>
                            <p className="text-base mb-4">
                                L'élection est en phase de second tour. Les électeurs peuvent actuellement voter pour les candidats qualifiés.
                            </p>
                            <div className="bg-orange-100 rounded-lg p-4">
                                <p className="text-sm font-medium text-orange-700">
                                    🗳️ Action possible : Consultez les résultats en temps réel du second tour.
                                </p>
                            </div>
                        </AlertDescription>
                    </Alert>

                    {/* Résultats du second tour */}
                    <Card className="shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                            <CardTitle className="flex items-center gap-2 text-orange-700">
                                <Trophy className="h-5 w-5" />
                                Résultats du second tour
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg h-12 text-base font-medium">
                                <a href={resultatsUrl}>
                                    <Trophy className="h-5 w-5 mr-2" />
                                    Voir les résultats du second tour
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <Alert className="bg-yellow-50 border-yellow-200 shadow-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                        <div className="font-bold text-lg mb-3">Statut actuel : {election.statut}</div>
                        <p className="text-base mb-4">
                            L'élection est actuellement en statut <span className="font-mono bg-yellow-100 px-2 py-1 rounded">"{election.statut}"</span>.
                        </p>
                        <div className="bg-yellow-100 rounded-lg p-4">
                            <p className="text-sm font-medium text-yellow-700">
                                ⚠️ Le dépouillement ne peut être effectué que lorsque l'élection est <span className="font-bold">clôturée</span>.
                            </p>
                        </div>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    )
}
