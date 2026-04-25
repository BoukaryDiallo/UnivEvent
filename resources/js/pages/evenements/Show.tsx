import { Head, Link, router, usePage } from '@inertiajs/react';
import { CalendarDays, Clock3, Edit3, ExternalLink, FileText, MapPin, MessageSquareText, Radio, ScanLine, Sparkles, Trophy, Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CertificateCanvasStudio } from '@/components/evenements/CertificateCanvasStudio';
import { EventAccessPassCard } from '@/components/evenements/EventAccessPassCard';
import { EventActivityTimeline } from '@/components/evenements/EventActivityTimeline';
import { EventBadge } from '@/components/evenements/EventBadge';
import { EventCommentsPanel } from '@/components/evenements/EventCommentsPanel';
import { EventMessageBoard } from '@/components/evenements/EventMessageBoard';
import { EventTabs } from '@/components/evenements/EventTabs';
import type { EventTabKey } from '@/components/evenements/EventTabs';
import { EventTimeline } from '@/components/evenements/EventTimeline';
import { EventToast } from '@/components/evenements/EventToast';
import { JuryWorkbench } from '@/components/evenements/JuryWorkbench';
import { MediaGallery } from '@/components/evenements/MediaGallery';
import { ParticipantsList } from '@/components/evenements/ParticipantsList';
import { UserAvatar } from '@/components/evenements/UserAvatar';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useEventLiveChannel } from '@/hooks/use-event-live-channel';
import AppLayout from '@/layouts/app-layout';
import { edit, index, publier } from '@/routes/evenements';
import { destroy as leaveEvent, store as joinEvent } from '@/routes/inscriptions';
import type { BreadcrumbItem, EventDetail, EventJuryPanel, EventResult, EventSummary, ParticipationStatus, User } from '@/types';

type ShowProps = {
    evenement: EventDetail;
    can: {
        manage: boolean;
        join: boolean;
        uploadMedia: boolean;
        archive?: boolean;
        delete?: boolean;
        changeVisibility?: boolean;
        manageParticipants?: boolean;
        manageComments?: boolean;
        manageMessages?: boolean;
        manageResults?: boolean;
        manageCertificates?: boolean;
        presidentJury?: boolean;
        juryMember?: boolean;
    };
    recommendations: EventSummary[];
};

type EventStatusPayload = {
    event: {
        id: number;
        statut: EventDetail['statut'];
        competition_status?: string | null;
    };
    jury?: EventJuryPanel | null;
    actor?: { id: number; name: string | null } | null;
    message?: string | null;
};

type JuryScoresPayload = {
    event: EventStatusPayload['event'];
    jury: EventJuryPanel;
    participant_id: number;
    jury_user: { id: number; name: string | null };
    submitted: boolean;
};

type EventResultsPayload = {
    event: EventStatusPayload['event'];
    jury: EventJuryPanel;
    resultats: EventResult[];
    validator: { id: number; name: string | null };
};

type CertificateGeneratedPayload = {
    event: EventStatusPayload['event'];
    certificat: {
        id: number;
        user_id: number;
        url: string | null;
    };
};

function formatDate(date: string, end: string | null) {
    const startDate = new Date(date);
    const endDate = end ? new Date(end) : null;

    return `${startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}${endDate ? ` - ${endDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}` : ''}`;
}

function formatTime(date: string, end: string | null) {
    const startDate = new Date(date);
    const endDate = end ? new Date(end) : null;

    return `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${endDate ? ` - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}`;
}

export default function EvenementsShow({ evenement, can, recommendations }: ShowProps) {
    const { auth } = usePage().props as unknown as { auth: { user?: User | null } };
    const [activeTab, setActiveTab] = useState<EventTabKey>('overview');
    const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);
    const [optimisticParticipation, setOptimisticParticipation] = useState<ParticipationStatus | null>(
        evenement.current_inscription?.statut ?? null,
    );
    const [liveStatus, setLiveStatus] = useState<{
        statut?: EventDetail['statut'];
        competition_status?: string | null;
    }>({});
    const [liveJury, setLiveJury] = useState<EventJuryPanel | null | undefined>(undefined);
    const [liveResults, setLiveResults] = useState<EventResult[] | null>(null);
    const currentUserId = auth.user?.id ?? null;
    const liveChannelEnabled = Boolean(can.manage || can.manageResults || can.manageCertificates || can.juryMember || can.presidentJury);

    useEffect(() => {
        if (!toast) {
            return;
        }

        const timeout = window.setTimeout(() => setToast(null), 2600);

        return () => window.clearTimeout(timeout);
    }, [toast]);

    const displayedEvent = useMemo<EventDetail>(() => ({
        ...evenement,
        statut: liveStatus.statut ?? evenement.statut,
        competition_status: liveStatus.competition_status ?? evenement.competition_status,
        jury: liveJury ?? evenement.jury,
        resultats: liveResults ?? evenement.resultats,
    }), [evenement, liveJury, liveResults, liveStatus.competition_status, liveStatus.statut]);

    useEventLiveChannel(
        evenement.id,
        {
            'jury.scores.updated': (rawPayload) => {
                const payload = rawPayload as JuryScoresPayload;

                setLiveStatus({
                    statut: payload.event.statut,
                    competition_status: payload.event.competition_status ?? null,
                });
                setLiveJury(payload.jury);

                if (payload.submitted && payload.jury_user.id !== currentUserId) {
                    setToast({
                        message: `${payload.jury_user.name ?? 'Un membre du jury'} a soumis une note.`,
                        tone: 'success',
                    });
                }
            },
            'event.status.updated': (rawPayload) => {
                const payload = rawPayload as EventStatusPayload;

                setLiveStatus({
                    statut: payload.event.statut,
                    competition_status: payload.event.competition_status ?? null,
                });

                if (payload.jury) {
                    setLiveJury(payload.jury);
                }

                if (payload.message) {
                    setToast({ message: payload.message, tone: 'success' });
                }
            },
            'event.results.published': (rawPayload) => {
                const payload = rawPayload as EventResultsPayload;

                setLiveStatus({
                    statut: payload.event.statut,
                    competition_status: payload.event.competition_status ?? null,
                });
                setLiveJury(payload.jury);
                setLiveResults(payload.resultats);
                setToast({
                    message: `Classement final valide par ${payload.validator.name ?? 'le president du jury'}.`,
                    tone: 'success',
                });
            },
            'certificate.generated': (rawPayload) => {
                const payload = rawPayload as CertificateGeneratedPayload;

                setLiveStatus({
                    statut: payload.event.statut,
                    competition_status: payload.event.competition_status ?? null,
                });
                setLiveResults((current) => {
                    const base = current ?? displayedEvent.resultats;

                    return base.map((result) =>
                        result.user.id === payload.certificat.user_id
                            ? { ...result, certificate_url: payload.certificat.url }
                            : result,
                    );
                });
                setToast({ message: 'Un certificat vient d etre genere.', tone: 'success' });
            },
        },
        liveChannelEnabled,
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Evenements', href: index() },
        { title: displayedEvent.titre, href: '#' },
    ];

    const join = (mode: ParticipationStatus = 'interesse') => {
        setOptimisticParticipation(mode);
        router.post(joinEvent(), { evenement_id: evenement.id, mode }, {
            preserveScroll: true,
            onSuccess: () =>
                setToast({
                    message: mode === 'participe' ? 'Participation enregistree.' : 'Interet enregistre pour cet evenement.',
                    tone: 'success',
                }),
            onError: () => {
                setOptimisticParticipation(displayedEvent.current_inscription?.statut ?? null);
                setToast({ message: "Impossible de s inscrire a cet evenement pour le moment.", tone: 'error' });
            },
        });
    };

    const leave = () => {
        if (!displayedEvent.current_inscription?.id) {
            return;
        }

        setOptimisticParticipation(null);
        router.delete(leaveEvent(displayedEvent.current_inscription.id), {
            preserveScroll: true,
            onSuccess: () => setToast({ message: 'Participation annulee.', tone: 'success' }),
            onError: () => {
                setOptimisticParticipation(displayedEvent.current_inscription?.statut ?? null);
                setToast({ message: "Impossible d annuler la participation.", tone: 'error' });
            },
        });
    };

    const publish = () => {
        router.post(publier(displayedEvent.id), undefined, {
            preserveScroll: true,
            onSuccess: () => setToast({ message: 'Evenement publie.', tone: 'success' }),
        });
    };

    const topThree = displayedEvent.resultats
        .slice()
        .sort((a, b) => (a.classement ?? 999) - (b.classement ?? 999))
        .slice(0, 3);
    const imageMedias = displayedEvent.medias.filter((media) => media.type === 'image');
    const documentMedias = displayedEvent.medias.filter((media) => media.type !== 'image');
    const teamSections = [
        { key: 'organisateur', label: 'Organisateurs', members: displayedEvent.team.organisateur },
        { key: 'intervenant', label: 'Intervenants', members: displayedEvent.team.intervenant },
        { key: 'jury', label: 'Jury', members: displayedEvent.team.jury },
        { key: 'participant', label: 'Participants assignes', members: displayedEvent.team.participant },
    ].filter((section) => section.members.length);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={displayedEvent.titre} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20">
                    <div className="relative aspect-[16/7] overflow-hidden bg-gradient-to-br from-slate-950 via-sky-800 to-cyan-500">
                        {displayedEvent.cover_url ? (
                            <img src={displayedEvent.cover_url} alt={displayedEvent.titre} className="size-full object-cover opacity-90" />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                                <div className="max-w-3xl space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        <EventBadge type={displayedEvent.type} />
                                        <EventBadge status={displayedEvent.statut} />
                                        {optimisticParticipation ? <EventBadge participation={optimisticParticipation} /> : null}
                                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200/80 bg-rose-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                                            <Radio className="size-3.5" />
                                            Live
                                        </span>
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-semibold text-white sm:text-4xl">{displayedEvent.titre}</h1>
                                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-200">
                                            <span className="inline-flex items-center gap-2">
                                                <CalendarDays className="size-4" />
                                                {formatDate(displayedEvent.date_debut, displayedEvent.date_fin)}
                                            </span>
                                            <span className="inline-flex items-center gap-2">
                                                <Clock3 className="size-4" />
                                                {formatTime(displayedEvent.date_debut, displayedEvent.date_fin)}
                                            </span>
                                            <span className="inline-flex items-center gap-2">
                                                <MapPin className="size-4" />
                                                {displayedEvent.lieu || 'Lieu a confirmer'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {can.join ? (
                                        optimisticParticipation ? (
                                            <Button type="button" size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20" onClick={leave}>
                                                Se desinscrire
                                            </Button>
                                        ) : (
                                            <>
                                                <Button type="button" size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20" onClick={() => join('interesse')}>
                                                    Interesse
                                                </Button>
                                                <Button type="button" size="lg" className="bg-white text-slate-950 hover:bg-cyan-50" onClick={() => join('participe')}>
                                                    Je participe
                                                </Button>
                                            </>
                                        )
                                    ) : null}
                                    {can.manage ? (
                                        <>
                                            <Button asChild type="button" size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                                                <Link href={edit(evenement.id)}>
                                                    <Edit3 className="size-4" />
                                                    Modifier
                                                </Link>
                                            </Button>
                                            {displayedEvent.statut !== 'publie' ? (
                                                <Button type="button" size="lg" className="bg-emerald-400 text-slate-950 hover:bg-emerald-300" onClick={publish}>
                                                    Publier
                                                </Button>
                                            ) : null}
                                            {can.archive && displayedEvent.statut !== 'cloture' && displayedEvent.statut !== 'archive' ? (
                                                <Button
                                                    type="button"
                                                    size="lg"
                                                    variant="outline"
                                                    className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                                                    onClick={() => router.post(`/evenements/${displayedEvent.id}/archiver`, {}, { preserveScroll: true })}
                                                >
                                                    <Edit3 className="size-4" />
                                                    Archiver
                                                </Button>
                                            ) : null}
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-6 border-t border-slate-100 p-6 lg:grid-cols-[1.5fr_0.9fr] dark:border-slate-800">
                        <div className="space-y-5">
                            <EventTabs activeTab={activeTab} onChange={setActiveTab} showResults={displayedEvent.type === 'concours'} />
                            {activeTab === 'overview' ? (
                                <div className="space-y-6">
                                    <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900/40">
                                        <div
                                            className="prose prose-slate max-w-none [&_b]:font-bold [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 dark:prose-invert"
                                            dangerouslySetInnerHTML={{ __html: displayedEvent.description || '<p>Aucun apercu n a encore ete ajoute.</p>' }}
                                        />
                                    </div>
                                    {teamSections.length ? (
                                        <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 dark:border-slate-800 dark:bg-slate-950/70">
                                            <div className="mb-4 text-sm font-medium text-slate-500 dark:text-slate-400">Equipe et personnes affectees</div>
                                            <div className="grid gap-4 xl:grid-cols-2">
                                                {teamSections.map((section) => (
                                                    <div key={section.key} className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                                                        <div className="text-sm font-semibold text-slate-950 dark:text-white">{section.label}</div>
                                                        <div className="mt-3 space-y-3">
                                                            {section.members.map((member) => (
                                                                <div key={`${section.key}-${member.id}`} className="flex items-center gap-3">
                                                                    <UserAvatar name={member.name} />
                                                                    <div className="min-w-0">
                                                                        <div className="truncate font-medium text-slate-900 dark:text-white">{member.name || 'Utilisateur'}</div>
                                                                        <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                                                                            {[member.email, member.role].filter(Boolean).join(' - ')}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}
                                    {imageMedias.length ? (
                                        <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 dark:border-slate-800 dark:bg-slate-950/70">
                                            <div className="mb-4 text-sm font-medium text-slate-500 dark:text-slate-400">Galerie visuelle</div>
                                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                                {imageMedias.map((media) => (
                                                    <a
                                                        key={media.id}
                                                        href={media.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                                                    >
                                                        <div className="aspect-[4/3] overflow-hidden">
                                                            <img src={media.url} alt={media.name ?? 'Illustration de l evenement'} className="size-full object-cover transition duration-500 group-hover:scale-105" />
                                                        </div>
                                                        <div className="truncate px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                                                            {media.name || 'Image evenement'}
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}
                                    {documentMedias.length ? (
                                        <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 dark:border-slate-800 dark:bg-slate-950/70">
                                            <div className="mb-4 text-sm font-medium text-slate-500 dark:text-slate-400">Documents attaches</div>
                                            <div className="space-y-3">
                                                {documentMedias.map((media) => (
                                                    <a
                                                        key={media.id}
                                                        href={media.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center justify-between rounded-3xl border border-slate-200/80 bg-slate-50 px-4 py-4 transition hover:border-sky-300 hover:bg-sky-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-800 dark:hover:bg-slate-800"
                                                    >
                                                        <span className="inline-flex min-w-0 items-center gap-3">
                                                            <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-white text-slate-600 dark:bg-slate-950 dark:text-slate-200">
                                                                <FileText className="size-4" />
                                                            </span>
                                                            <span className="min-w-0">
                                                                <span className="block truncate font-medium text-slate-900 dark:text-white">{media.name || 'Document evenement'}</span>
                                                                <span className="block text-xs text-slate-500 dark:text-slate-400">{media.type.toUpperCase()}</span>
                                                            </span>
                                                        </span>
                                                        <span className="text-sm font-semibold text-sky-600 dark:text-sky-300">Ouvrir</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}
                                    <EventActivityTimeline activities={displayedEvent.activities} />
                                    <EventCommentsPanel evenementId={displayedEvent.id} comments={displayedEvent.comments} canManage={Boolean(can.manageComments || can.manage)} onToast={(message, tone = 'success') => setToast({ message, tone })} />
                                </div>
                            ) : null}
                            {activeTab === 'program' ? <EventTimeline programmes={displayedEvent.programmes} /> : null}
                            {activeTab === 'participants' ? (
                                <ParticipantsList participants={displayedEvent.participants} canManage={Boolean(can.manageParticipants || can.manage)} onToast={(message) => setToast({ message, tone: 'success' })} />
                            ) : null}
                            {activeTab === 'media' ? (
                                <MediaGallery medias={displayedEvent.medias} evenementId={displayedEvent.id} canUpload={can.uploadMedia} onToast={(message) => setToast({ message, tone: 'success' })} />
                            ) : null}
                            {activeTab === 'chat' ? (
                                <EventMessageBoard evenementId={displayedEvent.id} messages={displayedEvent.messages} canManage={Boolean(can.manageMessages || can.manage)} onToast={(message, tone = 'success') => setToast({ message, tone })} />
                            ) : null}
                            {activeTab === 'results' && displayedEvent.type === 'concours' ? (
                                <div className="space-y-6">
                                    {displayedEvent.jury ? (
                                        <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 dark:border-slate-800 dark:bg-slate-950/70">
                                            <div className="mb-4 text-sm font-medium text-slate-500 dark:text-slate-400">Deliberation et configuration jury</div>
                                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                                <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">Seuil admission</div>
                                                    <div className="mt-1 font-semibold text-slate-950 dark:text-white">{displayedEvent.jury.admission_average ?? '-'}</div>
                                                </div>
                                                <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">Places</div>
                                                    <div className="mt-1 font-semibold text-slate-950 dark:text-white">{displayedEvent.jury.seats_count ?? 'Illimite'}</div>
                                                </div>
                                                <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">Mode</div>
                                                    <div className="mt-1 font-semibold text-slate-950 dark:text-white">{displayedEvent.jury.ranking_mode || '-'}</div>
                                                </div>
                                                <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">Ex aequo</div>
                                                    <div className="mt-1 font-semibold text-slate-950 dark:text-white">{displayedEvent.jury.tie_break_rule || '-'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                    <JuryWorkbench
                                        key={`jury-live-${displayedEvent.id}-${displayedEvent.jury?.validated_at ?? 'draft'}-${displayedEvent.jury?.deliberations.length ?? 0}-${displayedEvent.jury?.computed_results.length ?? 0}-${displayedEvent.jury?.scoring_closed_at ?? 'open'}`}
                                        evenementId={displayedEvent.id}
                                        competitionStatus={displayedEvent.competition_status}
                                        panel={displayedEvent.jury}
                                        participants={displayedEvent.team.participant}
                                        juryMembers={displayedEvent.team.jury}
                                        registrants={displayedEvent.participants}
                                        canPresident={Boolean(can.presidentJury)}
                                        canJuryMember={Boolean(can.juryMember)}
                                        onToast={(message, tone = 'success') => setToast({ message, tone })}
                                    />
                                    <CertificateCanvasStudio
                                        evenementId={displayedEvent.id}
                                        eventTitle={displayedEvent.titre}
                                        eventDate={displayedEvent.date_debut}
                                        enabled={Boolean(displayedEvent.evenement_certifie)}
                                        version={displayedEvent.certificate_template_version}
                                        template={displayedEvent.certificate_template_schema ?? null}
                                        participants={displayedEvent.participants}
                                        results={displayedEvent.resultats}
                                        canManage={Boolean(can.manageCertificates || can.manageResults || can.manage)}
                                        onToast={(message, tone = 'success') => setToast({ message, tone })}
                                    />
                                    <div className="grid gap-4 md:grid-cols-3">
                                        {topThree.map((result, indexValue) => (
                                            <div
                                                key={result.id}
                                                className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950/70"
                                            >
                                                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-lg font-bold text-slate-950">
                                                    {result.classement || indexValue + 1}
                                                </div>
                                                <div className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">
                                                    {result.user.name || 'Participant'}
                                                </div>
                                                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                    Score {result.note}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                        <div className="mb-4 flex justify-end">
                                            <a href={`/evenements/${displayedEvent.id}/classement/export`} className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950">
                                                Exporter PDF
                                            </a>
                                        </div>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Rang</TableHead>
                                                    <TableHead>Nom</TableHead>
                                                    <TableHead>Score</TableHead>
                                                    <TableHead>Admission</TableHead>
                                                    <TableHead>Certificat</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {displayedEvent.resultats.map((result) => (
                                                    <TableRow key={result.id}>
                                                        <TableCell>{result.classement ?? '-'}</TableCell>
                                                        <TableCell>{result.user.name || 'Participant'}</TableCell>
                                                        <TableCell>{result.note}</TableCell>
                                                        <TableCell>{result.admission ?? '-'}</TableCell>
                                                        <TableCell>
                                                            {result.certificate_url ? (
                                                                <a href={result.certificate_url} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline dark:text-sky-300">
                                                                    Telecharger
                                                                </a>
                                                            ) : (
                                                                <span className="text-slate-400">Indisponible</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        <aside className="space-y-4">
                            <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Organisateur</div>
                                <div className="mt-4 flex items-center gap-3">
                                    <UserAvatar name={displayedEvent.createur.name} className="size-12" />
                                    <div>
                                        <div className="font-medium text-slate-950 dark:text-white">{displayedEvent.createur.name || 'Organisateur'}</div>
                                        <div className="text-sm capitalize text-slate-500 dark:text-slate-400">{displayedEvent.createur.role || 'Responsable'}</div>
                                    </div>
                                </div>
                            </div>
                            <EventAccessPassCard access={displayedEvent.access} />
                            {can.manage && displayedEvent.checkin_active ? (
                                <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                    <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                        <ScanLine className="size-4" />
                                        Scanner admin
                                    </div>
                                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                        Accedez a l interface de scan ergonomique pour controler rapidement les check-ins depuis un mobile ou un poste d accueil.
                                    </p>
                                    <Button asChild className="mt-4 w-full rounded-full">
                                        <Link href="/admin/scanner-acces">Ouvrir le scanner QR</Link>
                                    </Button>
                                </div>
                            ) : null}
                            <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Informations rapides</div>
                                <div className="mt-4 grid gap-3">
                                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Participants</span>
                                        <span className="font-semibold text-slate-950 dark:text-white">{displayedEvent.participants_count}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Commentaires</span>
                                        <span className="font-semibold text-slate-950 dark:text-white">{displayedEvent.comments_count}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Activite</span>
                                        <span className="font-semibold text-slate-950 dark:text-white">{displayedEvent.activity_count}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Capacite</span>
                                        <span className="font-semibold text-slate-950 dark:text-white">{displayedEvent.capacite_max ?? 'Illimitee'}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Visibilite</span>
                                        <span className="font-semibold capitalize text-slate-950 dark:text-white">{displayedEvent.visibilite}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Roles autorises</span>
                                        <span className="text-right font-semibold text-slate-950 dark:text-white">{displayedEvent.roles.length ? displayedEvent.roles.join(', ') : 'Ouvert a tous'}</span>
                                    </div>
                                    {displayedEvent.lien_live ? (
                                        <a href={displayedEvent.lien_live} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-sky-50 dark:bg-slate-900 dark:hover:bg-slate-800">
                                            <span className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                <ExternalLink className="size-4" />
                                                Rejoindre le live
                                            </span>
                                            <span className="font-semibold text-sky-600 dark:text-sky-300">Ouvrir</span>
                                        </a>
                                    ) : null}
                                </div>
                            </div>
                            <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    {evenement.type === 'concours' ? <Trophy className="size-4" /> : <Upload className="size-4" />}
                                    Point fort
                                </div>
                                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                    {displayedEvent.type === 'concours'
                                        ? 'Le mode concours met en avant le classement, les certificats et la comparaison des participants dans un seul espace.'
                                        : 'Le mode conference privilegie la lisibilite du programme, la visibilite des intervenants et le suivi des medias.'}
                                </p>
                            </div>
                            {recommendations.length ? (
                                <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                    <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                        <Sparkles className="size-4" />
                                        A voir aussi
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {recommendations.map((item) => (
                                            <Link key={item.id} href={`/evenements/${item.id}`} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-sky-300 hover:bg-sky-50 dark:border-slate-800 dark:hover:bg-slate-900">
                                                <div>
                                                    <div className="font-medium text-slate-950 dark:text-white">{item.titre}</div>
                                                    <div className="text-xs text-slate-400">{item.roles.length ? item.roles.join(', ') : 'Acces libre'}</div>
                                                </div>
                                                <div className="inline-flex items-center gap-1 text-xs text-slate-400">
                                                    <MessageSquareText className="size-3.5" />
                                                    {item.comments_count}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </aside>
                    </div>
                </section>
            </div>
            <EventToast message={toast?.message ?? null} tone={toast?.tone ?? 'success'} />
        </AppLayout>
    );
}
