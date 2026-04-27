import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trophy } from 'lucide-react'
import type { ElectionAdminResultatsProps } from '@/types/election'

export default function ElectionAdminResultats({
    electionStatut,
    resultatsUrl
}: ElectionAdminResultatsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Résultats de l'élection</CardTitle>
            </CardHeader>
            <CardContent>
                {electionStatut === 'terminee' ? (
                    <div className="space-y-4">
                        <Alert>
                            <AlertDescription>
                                L'élection est terminée. Vous pouvez consulter les résultats détaillés.
                            </AlertDescription>
                        </Alert>
                        <Button asChild className="w-full">
                            <a href={resultatsUrl}>
                                <Trophy className="h-4 w-4 mr-2" />
                                Voir les résultats détaillés
                            </a>
                        </Button>
                    </div>
                ) : (
                    <Alert>
                        <AlertDescription>
                            Les résultats seront disponibles après la fin de l'élection.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    )
}
