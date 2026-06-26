import { Link } from '@inertiajs/react';
import { CalendarDays, CheckCircle, Clock, FileText, MessageSquare, Settings, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EventDetail } from '@/types';

type OrganizerDashboardProps = {
    event: EventDetail;
    canManage: boolean;
};

export function OrganizerDashboard({ event, canManage }: OrganizerDashboardProps) {
    const pendingInscriptions = event.participants?.filter((participant) => participant.backend_statut === 'en_attente') ?? [];
    const totalParticipants = event.participants?.filter((participant) => participant.backend_statut === 'accepte') ?? [];
    const upcomingActivities =
        event.programmes?.filter(
            (programme) => Boolean(programme.date_programme) && new Date(`${programme.date_programme} ${programme.heure_debut ?? '00:00'}`) > new Date(),
        ) ?? [];

    return (
        <div className="space-y-6">
            <div className="rounded-4xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-black/20">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-300">
                            <Settings className="size-3.5" />
                            Organisateur
                        </div>
                        <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Tableau de bord organisateur</h2>
                        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                            Supervisez la programmation, les inscriptions et les résultats de votre événement.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {canManage ? (
                            <Button asChild variant="outline">
                                <Link href={`/module5/events/${event.id}/edit`}>Modifier l'événement</Link>
                            </Button>
                        ) : null}
                        <Button asChild>
                            <Link href={`/module5/events/${event.id}`}>Voir l'événement</Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inscriptions en attente</CardTitle>
                        <Clock className="size-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingInscriptions.length}</div>
                        <p className="text-xs text-muted-foreground">À valider</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Participants confirmés</CardTitle>
                        <Users className="size-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalParticipants.length}</div>
                        <p className="text-xs text-muted-foreground">Sur {event.capacite_max ?? 'illimité'}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Activités programmées</CardTitle>
                        <CalendarDays className="size-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{event.programmes?.length ?? 0}</div>
                        <p className="text-xs text-muted-foreground">{upcomingActivities.length} à venir</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Messages actifs</CardTitle>
                        <MessageSquare className="size-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{event.messages?.filter((message) => message.status === 'active').length ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Discussions en cours</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="size-5" />
                            Actions prioritaires
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pendingInscriptions.length > 0 ? (
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <p className="font-medium">Valider les inscriptions</p>
                                    <p className="text-sm text-muted-foreground">{pendingInscriptions.length} inscription(s) en attente</p>
                                </div>
                                <Button asChild size="sm">
                                    <Link href={`/module5/events/${event.id}`}>Gérer</Link>
                                </Button>
                            </div>
                        ) : null}

                        {event.statut === 'brouillon' ? (
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <p className="font-medium">Publier l'événement</p>
                                    <p className="text-sm text-muted-foreground">Rendre visible aux participants</p>
                                </div>
                                <Button asChild size="sm">
                                    <Link href={`/module5/events/${event.id}`}>Publier</Link>
                                </Button>
                            </div>
                        ) : null}

                        {event.type === 'concours' && event.jury ? (
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <p className="font-medium">Gérer le jury</p>
                                    <p className="text-sm text-muted-foreground">Configuration et délibérations</p>
                                </div>
                                <Button asChild size="sm">
                                    <Link href={`/module5/events/${event.id}`}>Accéder</Link>
                                </Button>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="size-5" />
                            État de l'événement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Statut</span>
                            <Badge variant={event.statut === 'publie' ? 'default' : 'secondary'}>{event.statut}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Type</span>
                            <Badge variant="outline">{event.type}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Visibilité</span>
                            <Badge variant="outline">{event.visibilite}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Date de début</span>
                            <span className="text-sm text-muted-foreground">{new Date(event.date_debut).toLocaleDateString()}</span>
                        </div>
                        {event.date_fin ? (
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Date de fin</span>
                                <span className="text-sm text-muted-foreground">{new Date(event.date_fin).toLocaleDateString()}</span>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
