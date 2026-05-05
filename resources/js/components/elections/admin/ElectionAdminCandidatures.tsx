import { Users, Award, FileText, Eye, UserCheck } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Candidature, ElectionAdminCandidaturesProps } from '@/types/election'

export default function ElectionAdminCandidatures({
    candidatures,
    totalCandidatures,
    candidaturesIndexUrl
}: ElectionAdminCandidaturesProps) {
    return (
        <div className="space-y-6">
            {/* Header moderne */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                    <Users className="h-6 w-6" />
                    <h2 className="text-2xl font-bold">Candidatures ({totalCandidatures})</h2>
                </div>
                <p className="text-blue-100">
                    Gérez les candidatures validées pour cette élection
                </p>
            </div>

            {/* Carte des candidatures */}
            <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                        <UserCheck className="h-5 w-5" />
                        Candidatures validées
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {candidatures.length > 0 ? (
                        <div className="space-y-4">
                            {candidatures.map((candidature) => (
                                <div 
                                    key={candidature.id_candidature} 
                                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-gradient-to-r from-white to-gray-50"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                                    <span className="text-blue-600 font-bold text-lg">
                                                        {candidature.user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-lg text-gray-900">{candidature.user.name}</h4>
                                                    <p className="text-sm text-gray-600">{candidature.user.email}</p>
                                                </div>
                                            </div>
                                            {candidature.programme && (
                                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FileText className="h-4 w-4 text-blue-600" />
                                                        <span className="text-sm font-medium text-blue-700">Programme</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 leading-relaxed">{candidature.programme}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1">
                                                <Award className="h-3 w-3 mr-1 inline" />
                                                Validée
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Alert className="bg-yellow-50 border-yellow-200 shadow-lg">
                            <UserCheck className="h-5 w-5 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                                <div className="font-semibold mb-2">Aucune candidature validée</div>
                                <p className="text-base">
                                    Il n'y a aucune candidature validée pour le moment.
                                </p>
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    {/* Bouton d'action */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <Button 
                            asChild 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg h-12 text-base font-medium"
                        >
                            <a href={candidaturesIndexUrl} className="no-underline">
                                <Eye className="h-5 w-5 mr-2" />
                                Voir toutes les candidatures
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
