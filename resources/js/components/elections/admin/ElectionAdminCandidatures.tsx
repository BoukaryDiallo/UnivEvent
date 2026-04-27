import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import type { Candidature, ElectionAdminCandidaturesProps } from '@/types/election'

export default function ElectionAdminCandidatures({
    candidatures,
    totalCandidatures,
    candidaturesIndexUrl
}: ElectionAdminCandidaturesProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Candidatures ({totalCandidatures})</CardTitle>
            </CardHeader>
            <CardContent>
                {candidatures.length > 0 ? (
                    <div className="space-y-4">
                        {candidatures.map((candidature) => (
                            <div key={candidature.id_candidature} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold">{candidature.user.name}</h4>
                                        <p className="text-sm text-gray-600">{candidature.user.email}</p>
                                        {candidature.programme && (
                                            <p className="text-sm mt-2">{candidature.programme}</p>
                                        )}
                                    </div>
                                    <Badge variant="default">Validée</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Alert>
                        <AlertDescription>
                            Aucune candidature validée pour le moment.
                        </AlertDescription>
                    </Alert>
                )}
                <div className="mt-4">
                    <Button variant="outline" asChild className="w-full">
                        <a href={candidaturesIndexUrl}>
                            Voir toutes les candidatures
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
