import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Trophy, Users, CheckCircle, AlertTriangle } from 'lucide-react'
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
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Résultats officiels - {election.titre}
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{totalVotes}</div>
                            <div className="text-sm text-gray-600">Votes exprimés</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{totalVoters}</div>
                            <div className="text-sm text-gray-600">Électeurs inscrits</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">{participationRate}%</div>
                            <div className="text-sm text-gray-600">Participation</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{resultats.length}</div>
                            <div className="text-sm text-gray-600">Candidats</div>
                        </div>
                    </div>

                    {resultats[0]?.candidature?.resultat === 'elu' && (
                        <Alert className="bg-green-50 border-green-200">
                            <AlertDescription>
                                <div className="flex items-center gap-2 font-semibold mb-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    Élu officiel
                                </div>
                                <p className="text-sm">
                                    {resultats[0].candidature.user.name} est officiellement élu.
                                </p>
                            </AlertDescription>
                        </Alert>
                    )}

                    {resultats[0]?.candidature?.resultat === 'second_tour' && (
                        <Alert className="bg-yellow-50 border-yellow-200">
                            <AlertDescription>
                                <div className="flex items-center gap-2 font-semibold mb-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    Second tour requis
                                </div>
                                <p className="text-sm">
                                    Un second tour sera organisé entre les candidats qualifiés.
                                </p>
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Classement des candidats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {resultats.map((resultat) => (
                        <Card key={resultat.id_candidature}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow-lg border-2 border-white">
                                            {resultat.candidature.photo ? (
                                                <img
                                                    src={resultat.candidature.photo}
                                                    alt={resultat.candidature.user.name}
                                                    className="w-18 h-18 rounded-xl object-cover shadow-md"
                                                />
                                            ) : (
                                                <div className="w-18 h-18 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-md">
                                                    {resultat.candidature.user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-lg">
                                                    {resultat.candidature.user.name}
                                                </h3>
                                                {resultat.candidature.resultat === 'elu' && (
                                                    <Badge className="bg-yellow-100 text-yellow-800">
                                                        <Trophy className="h-3 w-3 mr-1" />
                                                        Élu
                                                    </Badge>
                                                )}
                                                {resultat.candidature.resultat === 'second_tour' && (
                                                    <Badge className="bg-blue-100 text-blue-800">
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
                                        <div className="text-2xl font-bold text-blue-600">
                                            {resultat.rang}ème
                                        </div>
                                        <div className="text-lg font-semibold">
                                            {resultat.nb_voix} voix
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {resultat.pourcentage}%
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${resultat.pourcentage}%` }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}