import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TextLink } from '@/components/ui/text-link'
import { Vote, Radio } from 'lucide-react'
import type { ElectionAdminVoteProps } from '@/types/election'

export default function ElectionAdminVote({
    stats,
    electionId,
    candidatsUrl,
    voteLiveUrl
}: ElectionAdminVoteProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestion du vote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{stats.totalVoters}</div>
                        <div className="text-sm text-gray-600">Électeurs inscrits</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{stats.totalVotes}</div>
                        <div className="text-sm text-gray-600">Votes exprimés</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">{stats.participationRate}%</div>
                        <div className="text-sm text-gray-600">Participation</div>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Actions</h3>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild>
                            <TextLink href={candidatsUrl}>
                                <Vote className="h-4 w-4 mr-2" />
                                Voir les candidats
                            </TextLink>
                        </Button>
                        <Button variant="outline" asChild>
                            <TextLink href={voteLiveUrl}>
                                <Radio className="h-4 w-4 mr-2" />
                                Vote en direct
                            </TextLink>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
