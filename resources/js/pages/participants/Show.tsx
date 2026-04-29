import { Head, usePage } from '@inertiajs/react';
import { CalendarDays, Clock3, FileText, MapPin, MessageCircle, ShieldCheck, Trophy, Users, Download } from 'lucide-react';
import { EventBadge } from '@/components/evenements/EventBadge';
import { EventCommentsPanel } from '@/components/evenements/EventCommentsPanel';
import { EventMessageBoard } from '@/components/evenements/EventMessageBoard';
import { MediaGallery } from '@/components/evenements/MediaGallery';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EventDetail, EventResult, User } from '@/types';

type ShowProps = {
    event: EventDetail;
    can: {
        viewScores: boolean;
        downloadCertificate: boolean;
    };
};

export default function ParticipantShow({ event, can }: ShowProps) {
    const { auth } = usePage().props as unknown as { auth: { user?: User | null } };
    const currentUserId = auth.user?.id ?? null;
    const isRegistered = event.current_inscription?.backend_statut === 'accepte';
    const isWaitlisted = event.current_inscription?.backend_statut === 'en_attente';
    const myResult = event.resultats?.find((result: EventResult) => result.user?.id === currentUserId) ?? null;
    const upcomingSessions = event.programmes?.filter((programme) => programme.date_programme && new Date(`${programme.date_programme} ${programme.heure_debut}`) > new Date()) ?? [];

    return (
        <>
            <Head title={`Participant · ${event.titre}`} />
            <div className="space-y-8 py-8">
                <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
                    <div className="space-y-6">
                        <div className="rounded-4xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-black/20">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-300">
                                        <ShieldCheck className="size-4" />
                                        Participant
                                    </div>
                                    <h1 className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{event.titre}</h1>
                                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">{event.description || 'Aucune description fournie pour cet événement.'}</p>
                                </div>
                                <div className="space-y-3 text-right">
                                    <div className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <CalendarDays className="size-4" />
                                        {event.date_debut ? new Date(event.date_debut).toLocaleDateString() : 'Date à confirmer'}
                                    </div>
                                    <div className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <MapPin className="size-4" />
                                        {event.lieu || 'Lieu non défini'}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <EventBadge type={event.type} />
                                        <EventBadge status={event.statut} />
                                        {isRegistered ? <Badge>Inscrit</Badge> : isWaitlisted ? <Badge variant="secondary">En attente</Badge> : <Badge variant="outline">Non inscrit</Badge>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Statut d'inscription</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-semibold">{isRegistered ? 'Confirmé' : isWaitlisted ? 'En attente' : 'Non inscrit'}</p>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        {isRegistered ? 'Votre participation est validée.' : isWaitlisted ? 'Votre demande d’accès est en cours de traitement.' : 'Vous pouvez encore vous inscrire depuis la page de l’événement.'}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Sessions à venir</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-semibold">{upcomingSessions.length}</p>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sessions encore prévues dans le programme.</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Médias disponibles</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-semibold">{event.medias?.length ?? 0}</p>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Documents, images et ressources attachées à l’événement.</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Programme</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {event.programmes?.length ? (
                                            event.programmes.map((programme) => (
                                                <div key={programme.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80">
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-950 dark:text-white">{programme.titre}</p>
                                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                                {programme.intervenant || 'Intervenant non précisé'} · {programme.salle || 'Salle non définie'}
                                                            </p>
                                                        </div>
                                                        <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                                                            {programme.date_programme ? new Date(`${programme.date_programme}T${programme.heure_debut ?? '00:00:00'}`).toLocaleString() : 'Date indisponible'}
                                                            {programme.heure_fin ? ` • ${programme.heure_fin}` : ''}
                                                        </div>
                                                    </div>
                                                    {programme.description ? <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{programme.description}</p> : null}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                                                Aucun programme disponible pour le moment.
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Médias associés</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <MediaGallery medias={event.medias ?? []} evenementId={event.id} canUpload={false} />
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Contact organisateurs</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                                            Écrivez directement aux organisateurs via le canal de messagerie intégré. Leur réponse sera visible dans l’historique du fil de discussion.
                                        </p>
                                        <div className="mt-4">
                                            <EventMessageBoard evenementId={event.id} messages={event.messages ?? []} canManage={false} onToast={() => undefined} />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Participation & accès</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Statut</p>
                                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{isRegistered ? 'Inscription validée' : isWaitlisted ? 'En attente de validation' : 'Aucun accès confirmé'}</p>
                                        </div>
                                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Public cible</p>
                                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{event.public_cible}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Certificat / attestation</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {event.evenement_certifie ? (
                                            event.certificate ? (
                                                <div className="space-y-4">
                                                    <p className="text-sm text-slate-600 dark:text-slate-300">Votre certificat est prêt.</p>
                                                    <Button asChild>
                                                        <a href={event.certificate.url} target="_blank" rel="noreferrer">
                                                            <Download className="size-4" /> Télécharger le certificat
                                                        </a>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                                                    Certificat en attente de génération ou non disponible pour le moment.
                                                </div>
                                            )
                                        ) : (
                                            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                                                Cet événement n'est pas éligible à un certificat.
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Historique du participant</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                                    <p>Acteur principal : {event.createur.name ?? 'Organisateur'}</p>
                                    <p>Type d’événement : {event.type}</p>
                                    <p>Visibilité : {event.visibilite}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {event.type === 'concours' ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Résultats</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {myResult ? (
                                        <div className="space-y-4">
                                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80">
                                                <p className="text-sm text-slate-500">Note finale</p>
                                                <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{myResult.note}/20</p>
                                                <p className="text-sm text-slate-500">Classement {myResult.classement ?? 'N/A'}</p>
                                            </div>
                                            {myResult.criteria_breakdown?.length ? (
                                                <div className="space-y-3">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">Détail par critère</p>
                                                    <div className="space-y-2">
                                                        {myResult.criteria_breakdown.map((criterion) => (
                                                            <div key={criterion.criterion_id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-900/80">
                                                                <span>{criterion.nom}</span>
                                                                <span>{criterion.average}/20</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    ) : can.viewScores ? (
                                        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                                            Les résultats sont publiés, mais aucun score personnel n'a encore été enregistré pour vous.
                                        </div>
                                    ) : (
                                        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                                            Les résultats seront disponibles après validation par le président du jury.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : null}

                        <Card>
                            <CardHeader>
                                <CardTitle>Flux d’activité</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Suivez les dernières mises à jour, commentaires et messages publiés sur l’événement.</p>
                            </CardContent>
                        </Card>
                    </aside>
                </section>

                <section>
                    <EventCommentsPanel evenementId={event.id} comments={event.comments ?? []} canManage={false} onToast={() => undefined} />
                </section>
            </div>
        </>
    );
}
