import { Vote, Radio, Users, TrendingUp, BarChart3, Activity, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TextLink } from '@/components/ui/text-link'
import type { ElectionAdminVoteProps } from '@/types/election'

export default function ElectionAdminVote({
    stats,
    electionId,
    candidatsUrl,
    voteLiveUrl
}: ElectionAdminVoteProps) {
    return (
        <div className="space-y-6">
            {/* Header moderne */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                    <Activity className="h-6 w-6" />
                    <h2 className="text-2xl font-bold">Gestion du vote</h2>
                </div>
                <p className="text-blue-100">
                    Suivez en temps réel l'évolution du vote et accédez aux statistiques
                </p>
            </div>

            {/* Carte de statistiques */}
            <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                        <BarChart3 className="h-5 w-5" />
                        Statistiques de participation
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-3xl font-bold text-blue-600 mb-1">{stats.totalVoters}</div>
                            <div className="text-sm font-medium text-blue-700">Électeurs inscrits</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-3xl font-bold text-green-600 mb-1">{stats.totalVotes}</div>
                            <div className="text-sm font-medium text-green-700">Votes exprimés</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="text-3xl font-bold text-orange-600 mb-1">{stats.participationRate}%</div>
                            <div className="text-sm font-medium text-orange-700">Taux de participation</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Carte d'actions */}
            <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardTitle className="flex items-center gap-2 text-purple-700">
                        <Settings className="h-5 w-5" />
                        Actions de monitoring
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 mb-4">Accédez aux détails du vote et au monitoring en temps réel :</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button 
                                asChild 
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg h-12 text-base font-medium"
                            >
                                <TextLink href={candidatsUrl} className="no-underline">
                                    <Users className="h-5 w-5 mr-2" />
                                    Voir les candidats
                                </TextLink>
                            </Button>
                            <Button 
                                variant="outline" 
                                asChild 
                                className="border-green-200 text-green-700 hover:bg-green-50 h-12 text-base font-medium"
                            >
                                <TextLink href={voteLiveUrl} className="no-underline">
                                    <Radio className="h-5 w-5 mr-2" />
                                    Vote en direct
                                </TextLink>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
