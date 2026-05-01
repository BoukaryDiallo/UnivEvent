import { Head, Link, router, usePage } from '@inertiajs/react';
import { CalendarDays, Clock3, Edit3, ExternalLink, FileText, MapPin, MessageSquareText, Radio, ScanLine, Sparkles, Trophy, Upload, ShieldCheck, ShieldAlert, Gavel, Users, Info, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CertificateCanvasStudio } from '@/components/evenements/CertificateCanvasStudio';
import { EventAccessPassCard } from '@/components/evenements/EventAccessPassCard';
import { EventActivityTimeline } from '@/components/evenements/EventActivityTimeline';
import { EventBadge } from '@/components/evenements/EventBadge';
import { EventCommentsPanel } from '@/components/evenements/EventCommentsPanel';
import { EventMessageBoard } from '@/components/evenements/EventMessageBoard';
import { EventActorsManagement } from '@/components/evenements/EventActorsManagement';
import { EventTimeline } from '@/components/evenements/EventTimeline';
import { EventToast } from '@/components/evenements/EventToast';
import { EventTabs, type EventTabKey } from '@/components/evenements/EventTabs';
import { JuryWorkbench } from '@/components/evenements/JuryWorkbench';
import { MediaGallery } from '@/components/evenements/MediaGallery';
import { ParticipantsList } from '@/components/evenements/ParticipantsList';
import { UserAvatar } from '@/components/evenements/UserAvatar';
import { PageErrorBoundary } from '@/components/page-error-boundary';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useEventLiveChannel } from '@/hooks/use-event-live-channel';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { EventDetail, EventSummary, ParticipationStatus, User } from '@/types';

type ShowProps = {
    evenement: EventDetail;
    can: {
        manage: boolean;
        join: boolean;
        uploadMedia: boolean;
        archive?: boolean;
        delete?: boolean;
        approve?: boolean;
        changeVisibility?: boolean;
        manageParticipants?: boolean;
        manageComments?: boolean;
        manageMessages?: boolean;
        manageResults?: boolean;
        manageCertificates?: boolean;
        presidentJury?: boolean;
        juryMember?: boolean;
    };
    recommendations?: EventSummary[];
};

function normalizeTeam(team?: EventDetail['team'] | null): EventDetail['team'] {
    return {
        organisateur: [],
        jury: [],
        intervenant: [],
        participant: [],
        ...(team ?? {}),
    };
}

function EvenementsShowContent({ evenement, can, recommendations = [] }: ShowProps) {
    const { auth } = usePage<{ auth: { user?: User | null } }>().props;
    const [activeTab, setActiveTab] = useState<EventTabKey>('overview');
    const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);
    
    // Live updates state
    const [liveStatus, setLiveStatus] = useState<{
        statut?: EventDetail['statut'];
        competition_status?: string | null;
    }>({});

    const displayedEvent = useMemo<EventDetail>(() => ({
        ...evenement,
        roles: Array.isArray(evenement.roles) ? evenement.roles : [],
        team: normalizeTeam(evenement.team),
        programmes: evenement.programmes ?? [],
        medias: evenement.medias ?? [],
        participants: evenement.participants ?? [],
        activities: evenement.activities ?? [],
        comments: evenement.comments ?? [],
        messages: evenement.messages ?? [],
        resultats: evenement.resultats ?? [],
        statut: liveStatus.statut ?? evenement.statut,
        competition_status: liveStatus.competition_status ?? evenement.competition_status,
        participants_count: Number(evenement.participants_count ?? 0),
        comments_count: Number(evenement.comments_count ?? 0),
        activity_count: Number(evenement.activity_count ?? 0),
    }), [evenement, liveStatus]);

    const isOrganisateur = auth.user?.id === displayedEvent.createur.id || (displayedEvent.team.organisateur?.some(m => m.user_id === auth.user?.id));
    const isIntervenant = displayedEvent.team.intervenant?.some(m => m.user_id === auth.user?.id);
    const isJuryMember = can.juryMember || displayedEvent.team.jury?.some(m => m.user_id === auth.user?.id);
    const publicCibleLabel = displayedEvent.roles?.length ? displayedEvent.roles.join(', ') : displayedEvent.public_cible;

    const handleJoin = (mode: ParticipationStatus = 'participe') => {
        router.post('/inscriptions', { evenement_id: displayedEvent.id, mode }, {
            onSuccess: () => setToast({ message: mode === 'participe' ? 'Inscription réussie !' : 'Intérêt enregistré.', tone: 'success' }),
        });
    };

    const handleApprove = () => {
        router.post(`/evenements/${displayedEvent.id}/approve`, {}, {
            onSuccess: () => setToast({ message: 'Événement approuvé.', tone: 'success' }),
        });
    };

    const handleReject = () => {
        const reason = window.prompt('Raison du rejet :');
        if (reason) {
            router.post(`/evenements/${displayedEvent.id}/reject`, { reason }, {
                onSuccess: () => setToast({ message: 'Événement rejeté.', tone: 'success' }),
            });
        }
    };

    const breadcrumbs = [
        { title: 'Événements', href: '/evenements' },
        { title: displayedEvent.titre, href: '#' },
    ];

    useEventLiveChannel(displayedEvent.id, {
        'event.status.updated': () => {
            router.reload({ only: ['evenement', 'can'] });
            setToast({ message: 'L evenement a ete mis a jour.', tone: 'success' });
        },
        'jury.scores.updated': () => {
            router.reload({ only: ['evenement'] });
        },
        'event.results.published': () => {
            router.reload({ only: ['evenement'] });
            setToast({ message: 'Les resultats viennent d etre actualises.', tone: 'success' });
        },
    }, Boolean(auth.user));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={displayedEvent.titre} />

            <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8">
                {/* Admin/Validation Bar */}
                {can.approve && displayedEvent.validation_status === 'pending' && (
                    <div className="mb-8 overflow-hidden rounded-[2rem] border border-amber-200 bg-amber-50 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20">
                        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="rounded-2xl bg-amber-100 p-3 dark:bg-amber-900/40">
                                    <ShieldAlert className="size-6 text-amber-700 dark:text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300">Demande de validation</h3>
                                    <p className="text-sm text-amber-700/80 dark:text-amber-400/80">Vérifiez les détails avant de rendre cet événement public.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" className="rounded-xl border-amber-200 bg-white hover:bg-amber-100" onClick={handleReject}>Rejeter</Button>
                                <Button className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white" onClick={handleApprove}>Approuver</Button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-8">
                        {/* Header Section */}
                        <header className="space-y-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <EventBadge status={displayedEvent.statut} />
                                <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-3 py-1 text-xs font-medium dark:border-slate-800 dark:bg-slate-950">
                                    {displayedEvent.type === 'concours' ? <Trophy className="mr-1.5 size-3" /> : <Users className="mr-1.5 size-3" />}
                                    {displayedEvent.type === 'concours' ? 'Concours' : 'Conférence'}
                                </Badge>
                                {isOrganisateur && <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">Organisateur</Badge>}
                                {isIntervenant && <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">Intervenant</Badge>}
                                {isJuryMember && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Jury</Badge>}
                            </div>

                            <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white md:text-5xl">
                                {displayedEvent.titre}
                            </h1>

                            <div className="flex flex-wrap gap-6 text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="size-5 text-sky-500" />
                                    <span className="font-medium">{new Date(displayedEvent.date_debut).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="size-5 text-rose-500" />
                                    <span className="font-medium">{displayedEvent.lieu || 'Lieu à confirmer'}</span>
                                </div>
                                {displayedEvent.lien_live && (
                                    <a href={displayedEvent.lien_live} target="_blank" className="flex items-center gap-2 text-sky-600 hover:underline">
                                        <Radio className="size-5 animate-pulse" />
                                        <span className="font-medium">Direct live</span>
                                    </a>
                                )}
                            </div>
                        </header>

                        {/* Navigation Tabs */}
                        <EventTabs 
                            activeTab={activeTab} 
                            onChange={setActiveTab} 
                            showResults={displayedEvent.type === 'concours' && (can.manageResults || displayedEvent.competition_status === 'resultats_publies')} 
                            showActors={can.manage || can.manageParticipants || can.manageMessages || can.manageResults || can.uploadMedia} 
                        />

                        {/* Tab Content */}
                        <main className="min-h-96">
                            {activeTab === 'overview' && (
                                <div className="space-y-8">
                                    <div 
                                        className="prose prose-slate max-w-none rounded-[2rem] bg-slate-50 p-8 dark:prose-invert dark:bg-slate-900/50"
                                        dangerouslySetInnerHTML={{ __html: displayedEvent.description || '<p className="italic">Aucune description disponible.</p>' }}
                                    />

                                    {/* Stats Grid */}
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                                            <p className="text-sm font-medium text-slate-500">Participants</p>
                                            <p className="mt-2 text-3xl font-bold">{displayedEvent.participants_count}</p>
                                        </div>
                                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                                            <p className="text-sm font-medium text-slate-500">Interactions</p>
                                            <p className="mt-2 text-3xl font-bold">{displayedEvent.comments_count}</p>
                                        </div>
                                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                                            <p className="text-sm font-medium text-slate-500">Mises à jour</p>
                                            <p className="mt-2 text-3xl font-bold">{displayedEvent.activity_count}</p>
                                        </div>
                                    </div>

                                    <EventActivityTimeline activities={displayedEvent.activities} />
                                </div>
                            )}

                            {activeTab === 'program' && <EventTimeline programmes={displayedEvent.programmes} />}
                            
                            {activeTab === 'participants' && (
                                <div id="participants">
                                    <ParticipantsList 
                                        participants={displayedEvent.participants} 
                                        canManage={Boolean(can.manageParticipants || can.manage)} 
                                        onToast={(msg) => setToast({ message: msg, tone: 'success' })} 
                                    />
                                </div>
                            )}

                            {activeTab === 'actors' && (can.manage || can.manageParticipants || can.manageMessages || can.manageResults || can.uploadMedia) && (
                                <EventActorsManagement 
                                    event={displayedEvent} 
                                    canManage={can.manage} 
                                    onToast={(msg) => setToast({ message: msg, tone: 'success' })} 
                                />
                            )}

                            {activeTab === 'media' && (
                                <MediaGallery 
                                    medias={displayedEvent.medias} 
                                    evenementId={displayedEvent.id} 
                                    canUpload={can.uploadMedia} 
                                    onToast={(msg) => setToast({ message: msg, tone: 'success' })} 
                                />
                            )}

                            {activeTab === 'chat' && (
                                <EventCommentsPanel 
                                    evenementId={displayedEvent.id} 
                                    comments={displayedEvent.comments} 
                                    canManage={Boolean(can.manageComments || can.manage)} 
                                    onToast={(msg, tone) => setToast({ message: msg, tone: tone ?? 'success' })} 
                                />
                            )}

                            {activeTab === 'results' && displayedEvent.type === 'concours' && (
                                <div className="space-y-8">
                                    {(can.juryMember || can.presidentJury) && (
                                        <JuryWorkbench
                                            evenementId={displayedEvent.id}
                                            competitionStatus={displayedEvent.competition_status}
                                            panel={displayedEvent.jury}
                                            participants={displayedEvent.team.participant}
                                            juryMembers={displayedEvent.team.jury}
                                            registrants={displayedEvent.participants}
                                            canPresident={Boolean(can.presidentJury)}
                                            canJuryMember={Boolean(can.juryMember)}
                                            onToast={(msg, tone) => setToast({ message: msg, tone: tone ?? 'success' })}
                                        />
                                    )}

                                    {(can.manageResults || can.manageCertificates) && displayedEvent.evenement_certifie && (
                                        <CertificateCanvasStudio
                                            evenementId={displayedEvent.id}
                                            eventTitle={displayedEvent.titre}
                                            eventDate={displayedEvent.date_debut}
                                            enabled={Boolean(displayedEvent.evenement_certifie)}
                                            version={displayedEvent.certificate_template_version}
                                            template={displayedEvent.certificate_template_schema ?? null}
                                            participants={displayedEvent.participants}
                                            results={displayedEvent.resultats}
                                            canManage={true}
                                            onToast={(msg, tone) => setToast({ message: msg, tone: tone ?? 'success' })}
                                        />
                                    )}

                                    {/* Final Ranking for everyone if published */}
                                    {displayedEvent.competition_status === 'resultats_publies' && (
                                        <div className="rounded-[2rem] border border-amber-200 bg-white p-8 shadow-md dark:border-amber-900/30 dark:bg-slate-950">
                                            <div className="mb-6 flex items-center gap-3">
                                                <Trophy className="size-6 text-amber-500" />
                                                <h2 className="text-2xl font-bold">Classement Final</h2>
                                            </div>
                                            <div className="space-y-4">
                                                {displayedEvent.resultats.map((result) => (
                                                    <div key={result.id} className={cn(
                                                        "flex items-center justify-between rounded-3xl border p-5",
                                                        result.user.id === auth.user?.id ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20" : "border-slate-100 bg-slate-50 dark:bg-slate-900/50"
                                                    )}>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex size-10 items-center justify-center rounded-2xl bg-white font-bold shadow-sm dark:bg-slate-800">{result.classement}</div>
                                                            <div>
                                                                <p className="font-bold">{result.user.name}</p>
                                                                <p className="text-xs text-slate-500 capitalize">{result.mention || 'Mention simple'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-black text-sky-600">{result.note}/20</div>
                                                            {result.certificate_url && (
                                                                <a href={result.certificate_url} className="text-xs font-medium text-sky-500 hover:underline">Certificat PDF</a>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </main>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        {/* Registration Card */}
                        <Card className="overflow-hidden rounded-[2.5rem] border-0 bg-slate-950 text-white shadow-2xl">
                            <CardContent className="p-8">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-white/10 p-2.5">
                                            <ScanLine className="size-6 text-sky-400" />
                                        </div>
                                        <h3 className="font-bold">Pass Événement</h3>
                                    </div>

                                    {!displayedEvent.participation && can.join ? (
                                        <div className="space-y-4">
                                            <p className="text-sm text-white/70 leading-relaxed">Rejoignez cet événement pour accéder aux contenus exclusifs et recevoir votre certificat.</p>
                                            <Button className="w-full rounded-2xl bg-white py-6 font-bold text-slate-950 hover:bg-slate-100" onClick={() => handleJoin('participe')} disabled={!can.join}>
                                                S'inscrire
                                            </Button>
                                        </div>
                                    ) : !displayedEvent.participation ? (
                                        <div className="space-y-4">
                                            <p className="text-sm text-white/70 leading-relaxed">
                                                {isOrganisateur
                                                    ? 'Vous pilotez deja cet evenement. Le bouton d inscription est masque pour eviter les doubles statuts.'
                                                    : isIntervenant
                                                      ? 'Vous etes deja affecte comme intervenant sur cet evenement.'
                                                      : isJuryMember
                                                        ? 'Vous etes deja affecte comme membre du jury sur cet evenement.'
                                                        : 'Cet evenement n accepte pas une inscription directe pour votre profil.'}
                                            </p>
                                            {(can.manageParticipants || can.manage) ? (
                                                <Button variant="secondary" className="w-full rounded-2xl border-0 bg-sky-500 text-white hover:bg-sky-600" asChild>
                                                    <Link href={`/evenements/${displayedEvent.id}/manage#actors`}>Inscrire des participants</Link>
                                                </Button>
                                            ) : null}
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-white/60">Mon statut</span>
                                                <Badge className="bg-emerald-500 text-white border-0">{displayedEvent.participation.statut}</Badge>
                                            </div>
                                            {displayedEvent.access && (
                                                <div className="space-y-4 rounded-3xl bg-white/5 p-4">
                                                    <div className="flex items-center justify-center rounded-2xl bg-white p-3">
                                                        <img src={displayedEvent.access.qr_url} alt="QR" className="size-full" />
                                                    </div>
                                                    <Button variant="secondary" className="w-full rounded-xl bg-sky-500 hover:bg-sky-600 text-white border-0" asChild>
                                                        <a href={displayedEvent.access.scan_url} target="_blank">Ouvrir mon Pass</a>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {can.manage && (
                                        <div className="grid gap-2 border-t border-white/10 pt-6">
                                            <Button variant="outline" className="justify-start rounded-2xl border-white/20 text-white hover:bg-white/10" asChild>
                                                <Link href={`/evenements/${displayedEvent.id}/manage`}>
                                                    <Edit3 className="mr-2 size-4" /> Console de gestion
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Info Sidebar */}
                        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
                            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Informations</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">Capacité</span>
                                    <span className="text-sm font-bold">{displayedEvent.capacite_max || 'Illimitée'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">Public</span>
                                    <span className="text-sm font-bold capitalize">{publicCibleLabel}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">Visibilité</span>
                                    <span className="text-sm font-bold capitalize">{displayedEvent.visibilite}</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Organisé par</h4>
                                <div className="flex items-center gap-3">
                                    <UserAvatar name={displayedEvent.createur.name} className="size-8" />
                                    <div className="min-w-0">
                                        <p className="truncate font-bold text-sm">{displayedEvent.createur.name}</p>
                                        <p className="text-xs text-slate-500 capitalize">{displayedEvent.createur.role}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recommendations */}
                        {recommendations.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="px-2 text-xs font-bold uppercase tracking-widest text-slate-400">À découvrir</h4>
                                <div className="space-y-3">
                                    {recommendations.slice(0, 3).map((item) => (
                                        <Link key={item.id} href={`/evenements/${item.id}`} className="group block rounded-3xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-sky-200 hover:bg-sky-50/30 dark:border-slate-800 dark:bg-slate-900/50">
                                            <p className="font-bold text-sm group-hover:text-sky-600 transition-colors truncate">{item.titre}</p>
                                            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                                                <span>{new Date(item.date_debut).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1"><MessageSquareText className="size-3" /> {item.comments_count}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>

            <EventToast message={toast?.message ?? null} tone={toast?.tone ?? 'success'} />
        </AppLayout>
    );
}

export default function EvenementsShow(props: ShowProps) {
    return (
        <PageErrorBoundary page="evenements/Show">
            <EvenementsShowContent {...props} />
        </PageErrorBoundary>
    );
}
