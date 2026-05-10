import { Link, router } from '@inertiajs/react';
import { CalendarDays, CheckCircle, FileText, MessageSquare, Trophy, Users, ClockIcon, DownloadIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { show } from '@/routes/module5';
import type { EventDetail, EventResult } from '@/types';

type ParticipantDashboardProps = {
    event: EventDetail;
    myResult?: EventResult | null;
};

export function ParticipantDashboard({ event, myResult }: ParticipantDashboardProps) {
    const myInscription = event.current_inscription;
    const isRegistered = myInscription?.backend_statut === 'accepte';
    const isWaitlisted = myInscription?.backend_statut === 'en_attente';
    const waitlistPosition = (myInscription as any)?.waitlist_position;

    const handleCancel = () => {
        if (confirm('Voulez-vous vraiment annuler votre inscription ?')) {
            router.delete(`/inscriptions/${myInscription.id}`, {
                onSuccess: () => {
                    // Page will refresh automatically with Inertia
                }
            });
        }
    };

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
                        <h2 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Mon espace participant</h2>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Consultez votre participation et accédez aux ressources.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {myInscription && (
                            <div className="flex gap-2">
                                <Button variant="outline" asChild className="rounded-xl h-10 border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold">
                                    <a href={`/module5/inscriptions/${myInscription.id}/ticket`} target="_blank" rel="noopener noreferrer">
                                        <DownloadIcon className="size-4 mr-2" /> Télécharger mon ticket
                                    </a>
                                </Button>
                                <Button variant="outline" className="rounded-xl h-10 border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-bold" onClick={handleCancel}>
                                    Annuler mon inscription
                                </Button>
                            </div>
                        )}
                        <Badge className={`rounded-full px-4 h-10 flex items-center uppercase text-[10px] font-black border-0 shadow-sm ${
                            isRegistered ? 'bg-emerald-500 text-white' : isWaitlisted ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                            {isRegistered ? '✅ Confirmé' : isWaitlisted ? '⏳ En attente' : 'Non inscrit'}
                        </Badge>
                        <Button asChild className="rounded-xl h-10 px-6 font-bold shadow-lg shadow-indigo-100">
                            <Link href={show(event.id)}>Voir l'événement</Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-[2rem] border-0 shadow-sm overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50/50 dark:bg-slate-900/50">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mon statut</CardTitle>
                        <CheckCircle className={`size-4 ${isRegistered ? 'text-emerald-500' : 'text-amber-500'}`} />
                    </CardHeader>
                    <CardContent className="pt-4 pb-6">
                        <div className="text-2xl font-black text-gray-900 dark:text-white">{isRegistered ? 'Confirmé' : isWaitlisted ? 'Attente' : 'Libre'}</div>
                        {isWaitlisted && waitlistPosition && (
                            <Badge variant="secondary" className="mt-1 bg-amber-50 text-amber-700 border-amber-100 font-black text-[9px] uppercase">Rang: #{waitlistPosition}</Badge>
                        )}
                        <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-tight">{isRegistered ? 'Participation validée' : isWaitlisted ? "Validation en cours" : 'Aucune inscription active'}</p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-0 shadow-sm overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50/50 dark:bg-slate-900/50">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sessions</CardTitle>
                        <CalendarDays className="size-4 text-blue-600" />
                    </CardHeader>
                    <CardContent className="pt-4 pb-6">
                        <div className="text-2xl font-black text-gray-900 dark:text-white">{upcomingSessions.length}</div>
                        <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-tight">À venir</p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-0 shadow-sm overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50/50 dark:bg-slate-900/50">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-400">Documents</CardTitle>
                        <FileText className="size-4 text-amber-600" />
                    </CardHeader>
                    <CardContent className="pt-4 pb-6">
                        <div className="text-2xl font-black text-gray-900 dark:text-white">{availableMedias.length}</div>
                        <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-tight">Disponibles</p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-0 shadow-sm overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50/50 dark:bg-slate-900/50">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-400">Chat</CardTitle>
                        <MessageSquare className="size-4 text-purple-600" />
                    </CardHeader>
                    <CardContent className="pt-4 pb-6">
                        <div className="text-2xl font-black text-gray-900 dark:text-white">{activeMessages.length}</div>
                        <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-tight">Messages actifs</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="rounded-[2.5rem] border-0 shadow-sm overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
                    <CardHeader className="px-8 pt-8">
                        <CardTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">
                            <CalendarDays className="size-5 text-indigo-600" />
                            Programme et accès
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        {!isRegistered && (
                            <div className="bg-amber-50 p-6 rounded-[1.5rem] border border-amber-100 flex gap-4 items-start animate-in fade-in zoom-in duration-300">
                                <ClockIcon className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Accès restreint</p>
                                    <p className="text-xs text-amber-700 font-medium leading-relaxed mt-1">Vous aurez accès au programme complet et aux ressources une fois votre inscription validée par l'organisateur.</p>
                                </div>
                            </div>
                        )}

                        {isRegistered && (
                            <div className="flex items-center justify-between rounded-2xl border border-gray-50 p-4 group hover:border-indigo-100 transition-all hover:bg-indigo-50/10">
                                <div>
                                    <p className="font-bold text-sm text-gray-900 dark:text-white">Accès à l'événement</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{new Date(event.date_debut).toLocaleDateString()} • {event.lieu || 'Lieu à confirmer'}</p>
                                </div>
                                <Button asChild size="sm" className="rounded-xl font-bold h-9">
                                    <Link href={show(event.id)}>Détails</Link>
                                </Button>
                            </div>
                        )}

                        {isRegistered && upcomingSessions.length > 0 && (
                            <div className="flex items-center justify-between rounded-2xl border border-gray-50 p-4 group hover:border-indigo-100 transition-all hover:bg-indigo-50/10">
                                <div>
                                    <p className="font-bold text-sm text-gray-900 dark:text-white">Sessions programmées</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{upcomingSessions.length} session(s) à venir</p>
                                </div>
                                <Button asChild size="sm" variant="secondary" className="rounded-xl font-bold h-9">
                                    <Link href={show(event.id)}>Consulter</Link>
                                </Button>
                            </div>
                        )}

                        {isRegistered && availableMedias.length > 0 && (
                            <div className="flex items-center justify-between rounded-2xl border border-gray-50 p-4 group hover:border-indigo-100 transition-all hover:bg-indigo-50/10">
                                <div>
                                    <p className="font-bold text-sm text-gray-900 dark:text-white">Documents & Médias</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{availableMedias.length} fichiers disponibles</p>
                                </div>
                                <Button asChild size="sm" variant="secondary" className="rounded-xl font-bold h-9">
                                    <Link href={show(event.id)}>Ouvrir</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-0 shadow-sm overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
                    <CardHeader className="px-8 pt-8">
                        <CardTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">
                            <Trophy className="size-5 text-indigo-600" />
                            Mes résultats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        {event.type === 'concours' ? (
                            myResult ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Trophy className="size-5 text-yellow-500" />
                                                <span className="font-black text-gray-900 uppercase">Classement: {myResult.classement ?? 'N/A'}</span>
                                            </div>
                                            <p className="mt-1 text-xs font-bold text-indigo-600 uppercase tracking-widest">Note: {myResult.note}/20</p>
                                        </div>
                                        {myResult.mention ? <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 font-black uppercase text-[8px]">{myResult.mention}</Badge> : null}
                                    </div>

                                    {myResult.certificate_url ? (
                                        <Button asChild className="w-full rounded-xl h-12 bg-gray-900 hover:bg-black font-black uppercase tracking-widest text-[10px]">
                                            <a href={myResult.certificate_url} target="_blank" rel="noopener noreferrer">
                                                Télécharger mon certificat
                                            </a>
                                        </Button>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-3xl dark:bg-slate-900/50">
                                    <Trophy className="mx-auto mb-4 size-10 text-gray-200" />
                                    <p className="text-xs font-black uppercase text-gray-400 tracking-widest">{event.competition_status === 'resultats_publies' ? 'Résultats non disponibles' : 'Évaluation en cours'}</p>
                                    <p className="mt-2 text-[10px] text-gray-500 font-medium px-8">
                                        {event.competition_status === 'resultats_publies'
                                            ? 'Les résultats sont publiés, mais aucun score personnel n’est encore disponible.'
                                            : "Les résultats seront disponibles à la fin de l'événement."}
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-3xl dark:bg-slate-900/50">
                                <CheckCircle className="mx-auto mb-4 size-10 text-emerald-200" />
                                <p className="text-xs font-black uppercase text-emerald-600 tracking-widest">Participation confirmée</p>
                                <p className="mt-2 text-[10px] text-gray-500 font-medium">Merci pour votre inscription à cet événement.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
