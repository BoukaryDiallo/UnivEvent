import { Link } from '@inertiajs/react';
import { CalendarDays, CheckCircle, FileText, MessageSquare, Trophy, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { show } from '@/routes/evenements';
import type { EventDetail, EventResult } from '@/types';

type ParticipantDashboardProps = {
    event: EventDetail;
    myResult?: EventResult | null;
};

export function ParticipantDashboard({ event, myResult }: ParticipantDashboardProps) {
    const myInscription = event.current_inscription;
    const isRegistered = myInscription?.backend_statut === 'accepte';
    const isWaitlisted = myInscription?.backend_statut === 'en_attente';

    const upcomingSessions =
        event.programmes?.filter(
            (programme) => Boolean(programme.date_programme) && new Date(`${programme.date_programme} ${programme.heure_debut ?? '00:00'}`) > new Date(),
        ) ?? [];

    const availableMedias = event.medias?.filter((media) => media.type !== 'image') ?? [];
    const activeMessages = event.messages?.filter((message) => message.status === 'active') ?? [];

    return (
        <div className="space-y-6">
            <div className="rounded-4xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-black/20">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                            <Users className="size-3.5" />
                            Participant
                        </div>
                        <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Mon espace participant</h2>
                        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                            Consultez votre participation, accédez aux ressources et suivez les résultats.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant={isRegistered ? 'default' : isWaitlisted ? 'secondary' : 'outline'}>
                            {isRegistered ? 'Inscrit' : isWaitlisted ? 'En attente' : 'Non inscrit'}
                        </Badge>
                        <Button asChild>
                            <Link href={show(event.id)}>Voir l'événement</Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mon statut</CardTitle>
                        <CheckCircle className="size-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isRegistered ? 'Confirme' : isWaitlisted ? 'Attente' : 'Libre'}</div>
                        <p className="text-xs text-muted-foreground">{isRegistered ? 'Participation validée' : isWaitlisted ? "Validation en cours" : 'Aucune inscription active'}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sessions à venir</CardTitle>
                        <CalendarDays className="size-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingSessions.length}</div>
                        <p className="text-xs text-muted-foreground">Dans le programme</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ressources</CardTitle>
                        <FileText className="size-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{availableMedias.length}</div>
                        <p className="text-xs text-muted-foreground">Documents disponibles</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Discussions</CardTitle>
                        <MessageSquare className="size-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeMessages.length}</div>
                        <p className="text-xs text-muted-foreground">Messages actifs</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarDays className="size-5" />
                            Programme et accès
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isRegistered ? (
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <p className="font-medium">Accès à l'événement</p>
                                    <p className="text-sm text-muted-foreground">{new Date(event.date_debut).toLocaleDateString()} à {event.lieu || 'Lieu à confirmer'}</p>
                                </div>
                                <Button asChild size="sm">
                                    <Link href={show(event.id)}>Voir les détails</Link>
                                </Button>
                            </div>
                        ) : null}

                        {upcomingSessions.length > 0 ? (
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <p className="font-medium">Sessions programmées</p>
                                    <p className="text-sm text-muted-foreground">{upcomingSessions.length} session(s) à venir</p>
                                </div>
                                <Button asChild size="sm" variant="outline">
                                    <Link href={show(event.id)}>Voir le programme</Link>
                                </Button>
                            </div>
                        ) : null}

                        {availableMedias.length > 0 ? (
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <p className="font-medium">Ressources disponibles</p>
                                    <p className="text-sm text-muted-foreground">Supports et documents de présentation</p>
                                </div>
                                <Button asChild size="sm" variant="outline">
                                    <Link href={show(event.id)}>Télécharger</Link>
                                </Button>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="size-5" />
                            Mes résultats
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {event.type === 'concours' ? (
                            myResult ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Trophy className="size-5 text-yellow-500" />
                                                <span className="font-medium">Classement: {myResult.classement ?? 'N/A'}</span>
                                            </div>
                                            <p className="mt-1 text-sm text-muted-foreground">Note: {myResult.note}/20</p>
                                            {myResult.mention ? <Badge variant="outline" className="mt-2">{myResult.mention}</Badge> : null}
                                        </div>
                                    </div>

                                    {myResult.criteria_breakdown?.length ? (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium">Détail par critère</h4>
                                            {myResult.criteria_breakdown.map((criterion) => (
                                                <div key={criterion.criterion_id} className="flex justify-between text-sm">
                                                    <span>{criterion.nom}</span>
                                                    <span>{criterion.average}/20</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}

                                    {myResult.certificate_url ? (
                                        <Button asChild className="w-full">
                                            <a href={myResult.certificate_url} target="_blank" rel="noopener noreferrer">
                                                Télécharger mon certificat
                                            </a>
                                        </Button>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Trophy className="mx-auto mb-4 size-12 text-muted-foreground" />
                                    <p className="text-muted-foreground">{event.competition_status === 'resultats_publies' ? 'Résultats non disponibles' : 'Évaluation en cours'}</p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {event.competition_status === 'resultats_publies'
                                            ? 'Les résultats sont publiés, mais aucun score personnel n’est encore visible.'
                                            : "Les résultats seront disponibles à la fin de l'événement."}
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-8">
                                <CheckCircle className="mx-auto mb-4 size-12 text-green-500" />
                                <p className="text-muted-foreground">Participation confirmée</p>
                                <p className="mt-2 text-sm text-muted-foreground">Merci pour votre inscription à cet événement.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
