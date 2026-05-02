import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Trophy, ArrowRight, Crown } from 'lucide-react'
import { useState } from 'react'
import { router } from '@inertiajs/react'
import resultatsRoutes from '@/routes/resultats'

interface Resultat {
    id_resultat: number
    id_election: number
    id_candidature: number
    tour: number
    nb_voix: number
    pourcentage: number
    rang: number
    statut_publication: string
    candidature: {
        id_candidature: number
        resultat: 'elu' | 'second_tour' | 'eliminee'
        user: {
            name: string
            email: string
        }
        programme?: string
        photo?: string
    }
}

interface Election {
    id_election: number
    titre: string
    description: string
    date_debut: string
    date_fin: string
    statut: string
    tour: number
    type: string
}

interface ResultatsOfficielsProps {
    election: Election
    resultats: Resultat[]
    totalVotes: number
    totalVoters: number
    participationRate: number
}

export default function ResultatsOfficiels({
    election,
    resultats,
    totalVotes,
    totalVoters,
    participationRate
}: ResultatsOfficielsProps) {
    // Afficher uniquement les résultats officiels, aucune logique métier
    if (!resultats || resultats.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">Aucun résultat officiel disponible.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header moderne */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 shadow-lg mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Trophy className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Résultats officiels</h1>
                            <p className="text-blue-100 mt-2">{election.titre}</p>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <p className="text-white">{election.description}</p>
                    </div>
                </div>

                {/* Résultats des candidats */}
                <Card className="shadow-xl border-0">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <CardTitle className="flex items-center gap-2 text-blue-700">
                            <Trophy className="h-5 w-5" />
                            Classement des candidats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-4">
                            {resultats.map((resultat, index) => (
                                <Card key={resultat.id_candidature} className="hover:shadow-xl transition-all duration-300 border-0 bg-white">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                {/* Rang avec icône */}
                                                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg border-2 border-white">
                                                    {resultat.rang === 1 ? (
                                                        <Crown className="h-6 w-6 text-yellow-300" />
                                                    ) : (
                                                        <span className="text-white font-bold text-lg">{resultat.rang}</span>
                                                    )}
                                                </div>
                                                
                                                {/* Photo du candidat */}
                                                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow-md border-2 border-white">
                                                    {resultat.candidature.photo ? (
                                                        <img
                                                            src={`/storage/${resultat.candidature.photo}`}
                                                            alt={resultat.candidature.user.name}
                                                            className="w-14 h-14 rounded-xl object-cover shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
                                                            {resultat.candidature.user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-lg text-gray-800">
                                                            {resultat.candidature.user.name}
                                                        </h3>
                                                        {resultat.candidature.resultat === 'elu' && (
                                                            <Badge className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300">
                                                                <Crown className="h-3 w-3 mr-1" />
                                                                Élu
                                                            </Badge>
                                                        )}
                                                        {resultat.candidature.resultat === 'second_tour' && (
                                                            <Badge className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300">
                                                                <ArrowRight className="h-3 w-3 mr-1" />
                                                                Qualifié pour 2ème tour
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {resultat.candidature.user.email}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-blue-600 mb-1">
                                                    {resultat.nb_voix}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    voix
                                                </div>
                                                <div className="text-lg font-semibold text-purple-600 mt-1">
                                                    {resultat.pourcentage}%
                                                </div>
                                            </div>
                                        </div>

                                        {/* Barre de progression */}
                                        <div className="mt-4">
                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                                                    style={{ width: `${resultat.pourcentage}%` }}
                                                >
                                                    <div className="h-full bg-white/20 animate-pulse"></div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <div className="text-xs text-gray-500">
                                                    {resultat.pourcentage}% des voix
                                                </div>
                                                {resultat.rang === 1 && (
                                                    <div className="flex items-center gap-1 text-xs text-yellow-600">
                                                        <Crown className="h-3 w-3" />
                                                        <span>Vainqueur</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Programme si disponible */}
                                        {resultat.candidature.programme && (
                                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div className="text-sm font-medium text-blue-800 mb-1">Programme</div>
                                                <p className="text-sm text-blue-700 leading-relaxed line-clamp-2">
                                                    {resultat.candidature.programme}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}