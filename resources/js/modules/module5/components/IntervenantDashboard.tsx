import { Link } from '@inertiajs/react';
import { CalendarDays, FileText, MessageSquare, Presentation, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EventDetail } from '@/types';

type IntervenantDashboardProps = {
    event: EventDetail;
    canManageMessages: boolean;
};

export function IntervenantDashboard({ event, canManageMessages }: IntervenantDashboardProps) {
    const myInterventions =
        event.programmes?.filter(
            (programme) => programme.intervenant && event.team.intervenant.some((speaker) => speaker.name === programme.intervenant),
        ) ?? [];

    const upcomingInterventions = myInterventions.filter(
        (programme) => Boolean(programme.date_programme) && new Date(`${programme.date_programme} ${programme.heure_debut ?? '00:00'}`) > new Date(),
    );

    const totalParticipants = event.participants?.filter((participant) => participant.backend_statut === 'accepte') ?? [];
    const myMessages =
        event.messages?.filter((message) => event.team.intervenant.some((speaker) => speaker.name === message.user?.name)) ?? [];

    return (
        <div className="space-y-6">
            <div className="rounded-4xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-black/20">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-300">
                            <Presentation className="size-3.5" />
                            Intervenant
                        </div>
                        <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Espace intervenant</h2>
                        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                            Gérez vos interventions, vos supports et interagissez avec les participants.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={`/module5/events/${event.id}`}>Voir l'événement</Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mes interventions</CardTitle>
                        <Presentation className="size-4 text-violet-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myInterventions.length}</div>
                        <p className="text-xs text-muted-foreground">{upcomingInterventions.length} à venir</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Audience attendue</CardTitle>
                        <Users className="size-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalParticipants.length}</div>
                        <p className="text-xs text-muted-foreground">Participants inscrits</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Messages actifs</CardTitle>
                        <MessageSquare className="size-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myMessages.length}</div>
                        <p className="text-xs text-muted-foreground">Discussions en cours</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Supports partagés</CardTitle>
                        <FileText className="size-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{event.medias?.length ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Documents disponibles</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarDays className="size-5" />
                            Mes interventions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {myInterventions.length > 0 ? (
                            <div className="space-y-4">
                                {myInterventions.map((intervention) => {
                                    const isUpcoming =
                                        Boolean(intervention.date_programme) &&
                                        new Date(`${intervention.date_programme} ${intervention.heure_debut ?? '00:00'}`) > new Date();

                                    return (
                                        <div key={intervention.id} className="flex items-center justify-between rounded-lg border p-4">
                                            <div>
                                                <h4 className="font-medium">{intervention.titre}</h4>
                                                <p className="text-sm text-muted-foreground">{intervention.description}</p>
                                                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span>{intervention.date_programme ?? 'Date à confirmer'} à {intervention.heure_debut ?? '--:--'}</span>
                                                    {intervention.salle ? <span>Salle {intervention.salle}</span> : null}
                                                </div>
                                            </div>
                                            <Badge variant={isUpcoming ? 'default' : 'secondary'}>{isUpcoming ? 'À venir' : 'Passée'}</Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Aucune intervention programmée pour le moment.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="size-5" />
                            Interactions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <p className="font-medium">Messages et discussions</p>
                                <p className="text-sm text-muted-foreground">Participez aux échanges avec les participants</p>
                            </div>
                            <Button asChild size="sm" variant="outline">
                                <Link href={`/module5/events/${event.id}`}>Voir les messages</Link>
                            </Button>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <p className="font-medium">Partage de supports</p>
                                <p className="text-sm text-muted-foreground">Téléchargez vos présentations et documents</p>
                            </div>
                            <Button asChild size="sm" variant="outline">
                                <Link href={`/module5/events/${event.id}`}>Gérer les médias</Link>
                            </Button>
                        </div>

                        {canManageMessages ? (
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <p className="font-medium">Canal intervenant</p>
                                    <p className="text-sm text-muted-foreground">Répondez aux messages prioritaires liés à votre intervention</p>
                                </div>
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/module5/events/${event.id}`}>Ouvrir</Link>
                                </Button>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
