import { Link } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Clock, Gavel, Trophy, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { show } from '@/routes/module5';
import type { EventDetail, EventJuryPanel } from '@/types';

type JuryDashboardProps = {
    event: EventDetail;
    juryPanel: EventJuryPanel | null;
    canJuryMember: boolean;
    canPresident: boolean;
};

export function JuryDashboard({ event, juryPanel, canJuryMember, canPresident }: JuryDashboardProps) {
    const participants = event.participants?.filter((participant) => participant.backend_statut === 'accepte') ?? [];
    const juryMembers = event.team?.jury ?? [];
    const totalCriteria = juryPanel?.criteria.length ?? 0;
    const scoringOpen = Boolean(juryPanel?.scoring_opened_at && !juryPanel.scoring_closed_at);
    const deliberations = juryPanel?.deliberations ?? [];
    const pendingDeliberations = deliberations.filter((item) => item.status !== 'resolved');

    const getScoringProgress = () => {
        if (!juryPanel || !participants.length || !totalCriteria) {
            return 0;
        }

        const totalExpected = participants.length * totalCriteria * Math.max(juryMembers.length, 1);
        const totalScored = juryPanel.score_entries?.length ?? 0;

        return totalExpected > 0 ? Math.round((totalScored / totalExpected) * 100) : 0;
    };

    return (
        <div className="space-y-6">
            <div className="rounded-4xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-black/20">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                            <Gavel className="size-3.5" />
                            Jury
                        </div>
                        <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Cockpit jury et délibérations</h2>
                        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                            Évaluez les candidats, participez aux délibérations et validez les résultats finaux.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={show(event.id)}>Accéder au jury</Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Candidats à évaluer</CardTitle>
                        <Users className="size-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{participants.length}</div>
                        <p className="text-xs text-muted-foreground">Participants inscrits</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critères d'évaluation</CardTitle>
                        <CheckCircle className="size-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCriteria}</div>
                        <p className="text-xs text-muted-foreground">Critères configurés</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Progression notation</CardTitle>
                        <Trophy className="size-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{getScoringProgress()}%</div>
                        <Progress value={getScoringProgress()} className="mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Délibérations</CardTitle>
                        <AlertTriangle className="size-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingDeliberations.length}</div>
                        <p className="text-xs text-muted-foreground">En attente de résolution</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="size-5" />
                            État de la notation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Notation ouverte</span>
                            <Badge variant={scoringOpen ? 'default' : 'secondary'}>{scoringOpen ? 'Oui' : 'Non'}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Résultats validés</span>
                            <Badge variant={juryPanel?.validated_at ? 'default' : 'secondary'}>{juryPanel?.validated_at ? 'Oui' : 'Non'}</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Gavel className="size-5" />
                            Actions jury
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {canJuryMember && scoringOpen ? (
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <p className="font-medium">Évaluer les candidats</p>
                                    <p className="text-sm text-muted-foreground">Noter selon les critères définis</p>
                                </div>
                                <Button asChild size="sm">
                                    <Link href={show(event.id)}>Évaluer</Link>
                                </Button>
                            </div>
                        ) : null}

                        {canPresident ? (
                            <>
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div>
                                        <p className="font-medium">Gérer la notation</p>
                                        <p className="text-sm text-muted-foreground">Ouvrir ou fermer la phase d'évaluation</p>
                                    </div>
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={show(event.id)}>Gérer</Link>
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div>
                                        <p className="font-medium">Finaliser les résultats</p>
                                        <p className="text-sm text-muted-foreground">Valider et publier le classement</p>
                                    </div>
                                    <Button asChild size="sm">
                                        <Link href={show(event.id)}>Finaliser</Link>
                                    </Button>
                                </div>
                            </>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
