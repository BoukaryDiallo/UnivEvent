import { router } from '@inertiajs/react';
import { MessageSquare, Shield, UserRoundPlus } from 'lucide-react';
import {  useMemo, useState } from 'react';
import type {FormEvent} from 'react';
import { ActorManager } from '@/components/evenements/manage/ActorManager';
import { EventManageLayout } from '@/components/evenements/manage/EventManageLayout';
import { InlineEditField } from '@/components/evenements/manage/InlineEditField';
import { MediaUploader } from '@/components/evenements/manage/MediaUploader';
import { SectionCard } from '@/components/evenements/manage/SectionCard';
import { SmartSubmitButton } from '@/components/evenements/manage/SmartSubmitButton';
import { PageErrorBoundary } from '@/components/page-error-boundary';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { BreadcrumbItem } from '@/types';
import type {
    EventAssignableUser,
    EventCompletionSummary,
    EventCriterion,
    EventMedia,
    EventProgramme,
    EventSummary,
    EventTeamMember,
    EventWorkflowState,
} from '@/types/evenements';

type ManageEventProps = {
    evenement: EventSummary & {
        team: Record<string, EventTeamMember[]>;
        programme: EventProgramme[];
        medias: EventMedia[];
        criteria: EventCriterion[];
        completion: EventCompletionSummary;
        workflow_state: EventWorkflowState;
        submission_errors: string[];
        suggestions: string[];
        messages_count: number;
    };
    can: {
        edit: boolean;
        manage_team: boolean;
        manage_program: boolean;
        manage_media: boolean;
        publish: boolean;
        delete: boolean;
        submit: boolean;
    };
    meta: {
        assignableUsers: EventAssignableUser[];
        audienceRoles?: Array<{ value: string; label: string }>;
        visibilities: Array<{ value: string; label: string }>;
        commentPolicies?: Array<{ value: string; label: string }>;
    };
};

function readCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

const defaultSectionStatuses = [
    { key: 'general', label: 'Informations generales', weight: 25, percentage: 0, status: 'empty' as const, missing: [] as string[] },
    { key: 'program', label: 'Programme', weight: 20, percentage: 0, status: 'empty' as const, missing: [] as string[] },
    { key: 'actors', label: 'Acteurs', weight: 20, percentage: 0, status: 'empty' as const, missing: [] as string[] },
    { key: 'media', label: 'Medias', weight: 10, percentage: 0, status: 'empty' as const, missing: [] as string[] },
    { key: 'permissions', label: 'Permissions et visibilite', weight: 10, percentage: 0, status: 'empty' as const, missing: [] as string[] },
    { key: 'interactions', label: 'Interactions', weight: 5, percentage: 0, status: 'empty' as const, missing: [] as string[] },
    { key: 'certificates', label: 'Certificats', weight: 10, percentage: 0, status: 'empty' as const, missing: [] as string[] },
];

function normalizeCompletion(completion?: EventCompletionSummary | null): EventCompletionSummary {
    const sectionsByKey = new Map((completion?.sections ?? []).map((section) => [section.key, section]));

    return {
        percentage: completion?.percentage ?? 0,
        sections: defaultSectionStatuses.map((section) => sectionsByKey.get(section.key) ?? section),
    };
}

function normalizeTeam(team?: Record<string, EventTeamMember[]> | null) {
    return {
        organisateur: team?.organisateur ?? [],
        jury: team?.jury ?? [],
        intervenant: team?.intervenant ?? [],
        participant: team?.participant ?? [],
    };
}

function ManageEventContent({ evenement: initialEvent, can, meta }: ManageEventProps) {
    // Debug: Afficher les données reçues
    console.log('ManageEvent props:', { evenement: initialEvent, can, meta });

    // Vérifier que les propriétés requises sont présentes
    if (!initialEvent || !can || !meta) {
        console.error('Missing required props:', { evenement: !!initialEvent, can: !!can, meta: !!meta });
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Erreur de chargement</h1>
                    <p className="text-gray-600">Les données de l'événement sont manquantes.</p>
                </div>
            </div>
        );
    }

    // Vérifier les propriétés spécifiques d'événement
    const requiredEventProps = ['id', 'titre', 'type', 'completion', 'workflow_state'];
    const missingProps = requiredEventProps.filter(prop => !(prop in initialEvent));
    if (missingProps.length > 0) {
        console.error('Missing event properties:', missingProps);
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Erreur de données</h1>
                    <p className="text-gray-600">Propriétés manquantes: {missingProps.join(', ')}</p>
                </div>
            </div>
        );
    }

    const [evenement, setEvenement] = useState(() => ({
        ...initialEvent,
        team: normalizeTeam(initialEvent.team),
        programme: initialEvent.programme ?? [],
        medias: initialEvent.medias ?? [],
        criteria: initialEvent.criteria ?? [],
        suggestions: initialEvent.suggestions ?? [],
        submission_errors: initialEvent.submission_errors ?? [],
        comments_count: initialEvent.comments_count ?? 0,
        messages_count: initialEvent.messages_count ?? 0,
        completion: normalizeCompletion(initialEvent.completion),
    }));
    const [programForm, setProgramForm] = useState({
        titre: '',
        description: '',
        intervenant: '',
        date_programme: '',
        heure_debut: '',
        heure_fin: '',
        salle: '',
        type_section: 'session',
    });
    const [criteriaDraft, setCriteriaDraft] = useState<EventCriterion[]>(initialEvent.criteria ?? []);
    const [visibility, setVisibility] = useState(initialEvent.visibilite);
    const [publicCible, setPublicCible] = useState(initialEvent.public_cible);
    const [interactions, setInteractions] = useState({
        comments_enabled: initialEvent.comments_enabled,
        comment_replies_enabled: initialEvent.comment_replies_enabled,
        comment_reactions_enabled: initialEvent.comment_reactions_enabled,
        messages_enabled: initialEvent.messages_enabled,
        comment_policy: initialEvent.comment_policy,
    });
    const [certificates, setCertificates] = useState({
        evenement_certifie: initialEvent.evenement_certifie,
        certificate_template_version: initialEvent.certificate_template_version ?? 'template_v1',
    });

    const sectionStatus = useMemo(
        () => Object.fromEntries(evenement.completion.sections.map((section) => [section.key, section.status])),
        [evenement.completion.sections],
    );

    const audienceRoles = meta.audienceRoles ?? [
        { value: 'tous', label: 'Tous' },
        { value: 'etudiant', label: 'Etudiant' },
        { value: 'enseignant', label: 'Enseignant' },
    ];
    const commentPolicies = meta.commentPolicies ?? [
        { value: 'accepted_participants', label: 'Participants acceptes' },
        { value: 'all_registered', label: 'Tous les inscrits' },
        { value: 'organizers_jury_only', label: 'Organisateurs et jury' },
        { value: 'readonly', label: 'Lecture seule' },
    ];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Evenements', href: '/evenements' },
        { title: 'Gestion', href: '/evenements/gestion' },
        { title: evenement.titre, href: `/evenements/${evenement.id}/manage` },
    ];

    async function saveSection(section: string, payload: Record<string, unknown>) {
        const response = await fetch(`/evenements/${evenement.id}/manage/${section}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': readCsrfToken(),
            },
            credentials: 'same-origin',
            body: JSON.stringify(payload),
        });

        const data = (await response.json().catch(() => null)) as
            | {
                  event?: Partial<typeof initialEvent>;
                  completion?: EventCompletionSummary;
                  workflow_state?: EventWorkflowState;
                  submission_errors?: string[];
                  suggestions?: string[];
              }
            | null;

        if (!response.ok) {
            throw new Error('La sauvegarde a echoue.');
        }

        if (data?.event) {
            setEvenement((current) => ({
                ...current,
                ...data.event,
                team: normalizeTeam(((data.event as Partial<typeof initialEvent> | undefined)?.team ?? current.team) as typeof current.team),
                programme: ((data.event as Partial<typeof initialEvent> | undefined)?.programme ?? current.programme) as typeof current.programme,
                medias: ((data.event as Partial<typeof initialEvent> | undefined)?.medias ?? current.medias) as typeof current.medias,
                criteria: ((data.event as Partial<typeof initialEvent> | undefined)?.criteria ?? current.criteria) as typeof current.criteria,
                completion: normalizeCompletion(data.completion ?? current.completion),
                workflow_state: data.workflow_state ?? current.workflow_state,
                submission_errors: data.submission_errors ?? current.submission_errors,
                suggestions: data.suggestions ?? current.suggestions,
            }));
        }
    }

    function scrollToSection(sectionId: string) {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function addProgramme(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.post(`/evenements/${evenement.id}/program`, programForm, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['evenement'] }),
        });
    }

    function saveCriteria() {
        void saveSection('criteria', { criteria: criteriaDraft });
    }

    return (
        <EventManageLayout
            evenement={evenement}
            workflowState={evenement.workflow_state}
            completion={evenement.completion}
            breadcrumbs={breadcrumbs}
            suggestions={evenement.suggestions}
            actions={
                can.submit ? (
                    <SmartSubmitButton
                        eventId={evenement.id}
                        initialErrors={evenement.submission_errors}
                        onNavigate={scrollToSection}
                        onSuccess={() => router.reload({ only: ['evenement'] })}
                    />
                ) : null
            }
        >
            {evenement.validation_status === 'approved' ? (
                <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Toute modification necessite une nouvelle validation.
                </div>
            ) : null}

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-6">
                    <SectionCard
                        id="general"
                        title="Informations generales"
                        description="Les champs essentiels sont sauves automatiquement."
                        status={sectionStatus.general}
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <InlineEditField label="Titre" value={evenement.titre} onSave={(value) => saveSection('general', { ...evenement, titre: value, lieu: evenement.lieu, date_debut: evenement.date_debut })} />
                            <InlineEditField label="Lieu" value={evenement.lieu ?? ''} onSave={(value) => saveSection('general', { ...evenement, lieu: value, titre: evenement.titre, date_debut: evenement.date_debut })} />
                            <InlineEditField label="Date de debut" type="datetime-local" value={evenement.date_debut?.slice(0, 16) ?? ''} onSave={(value) => saveSection('general', { titre: evenement.titre, lieu: evenement.lieu, date_debut: value, description: evenement.description, date_fin: evenement.date_fin, lien_live: evenement.lien_live })} />
                            <InlineEditField label="Date de fin" type="datetime-local" value={evenement.date_fin?.slice(0, 16) ?? ''} onSave={(value) => saveSection('general', { titre: evenement.titre, lieu: evenement.lieu, date_debut: evenement.date_debut, date_fin: value, description: evenement.description, lien_live: evenement.lien_live })} />
                            <div className="md:col-span-2">
                                <InlineEditField label="Description" textarea value={evenement.description ?? ''} onSave={(value) => saveSection('general', { titre: evenement.titre, lieu: evenement.lieu, date_debut: evenement.date_debut, date_fin: evenement.date_fin, description: value, lien_live: evenement.lien_live })} />
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard
                        id="program"
                        title={evenement.type === 'concours' ? 'Criteres' : 'Programme / Sessions'}
                        description={evenement.type === 'concours' ? 'Les criteres par defaut sont precharges et editables.' : 'Ajoutez des sessions sans quitter la page.'}
                        status={sectionStatus.program}
                        action={evenement.type === 'concours' ? <Button onClick={saveCriteria}>Sauver les criteres</Button> : undefined}
                    >
                        {evenement.type === 'concours' ? (
                            <div className="space-y-3">
                                {criteriaDraft.map((criterion, index) => (
                                    <div key={criterion.id ?? index} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-4">
                                        <Input
                                            value={criterion.nom}
                                            onChange={(event) =>
                                                setCriteriaDraft((current) =>
                                                    current.map((item, itemIndex) => (itemIndex === index ? { ...item, nom: event.target.value } : item)),
                                                )
                                            }
                                            placeholder="Nom du critere"
                                        />
                                        <Input
                                            type="number"
                                            value={criterion.bareme ?? 20}
                                            onChange={(event) =>
                                                setCriteriaDraft((current) =>
                                                    current.map((item, itemIndex) => (itemIndex === index ? { ...item, bareme: Number(event.target.value) } : item)),
                                                )
                                            }
                                        />
                                        <Input
                                            type="number"
                                            value={criterion.coefficient ?? 1}
                                            onChange={(event) =>
                                                setCriteriaDraft((current) =>
                                                    current.map((item, itemIndex) => (itemIndex === index ? { ...item, coefficient: Number(event.target.value) } : item)),
                                                )
                                            }
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setCriteriaDraft((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                                        >
                                            Retirer
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setCriteriaDraft((current) => [
                                            ...current,
                                            { nom: '', description: null, bareme: 20, coefficient: 1, ordre: current.length + 1, actif: true },
                                        ])
                                    }
                                >
                                    Ajouter un critere
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <form onSubmit={addProgramme} className="grid gap-3 rounded-3xl bg-slate-50 p-4 md:grid-cols-2">
                                    <Input value={programForm.titre} onChange={(event) => setProgramForm((current) => ({ ...current, titre: event.target.value }))} placeholder="Titre de session" />
                                    <Input value={programForm.intervenant} onChange={(event) => setProgramForm((current) => ({ ...current, intervenant: event.target.value }))} placeholder="Intervenant" />
                                    <Input type="date" value={programForm.date_programme} onChange={(event) => setProgramForm((current) => ({ ...current, date_programme: event.target.value }))} />
                                    <Input value={programForm.salle} onChange={(event) => setProgramForm((current) => ({ ...current, salle: event.target.value }))} placeholder="Salle" />
                                    <div className="md:col-span-2">
                                        <Textarea value={programForm.description} onChange={(event) => setProgramForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" />
                                    </div>
                                    <Button type="submit" className="md:col-span-2">Ajouter une session</Button>
                                </form>
                                <div className="space-y-3">
                                    {evenement.programme.map((programme) => (
                                        <div key={programme.id} className="rounded-2xl border border-slate-200 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-medium text-slate-900">{programme.titre}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {programme.date_programme ?? 'Date libre'} • {programme.intervenant ?? 'Intervenant a definir'}
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.delete(`/evenements/${evenement.id}/program/${programme.id}`, {
                                                            preserveScroll: true,
                                                            onSuccess: () => router.reload({ only: ['evenement'] }),
                                                        })
                                                    }
                                                >
                                                    Supprimer
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard id="actors" title="Acteurs" description="Organisateurs, jury, intervenants et participants." status={sectionStatus.actors}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <ActorManager eventId={evenement.id} role="organisateur" title="Organisateurs" members={evenement.team.organisateur ?? []} assignableUsers={meta.assignableUsers} />
                            <ActorManager eventId={evenement.id} role={evenement.type === 'concours' ? 'jury' : 'intervenant'} title={evenement.type === 'concours' ? 'Jury' : 'Intervenants'} members={evenement.team[evenement.type === 'concours' ? 'jury' : 'intervenant'] ?? []} assignableUsers={meta.assignableUsers} />
                        </div>
                    </SectionCard>

                    <SectionCard id="media" title="Medias" description="Ajoutez les visuels et documents sans interrompre la configuration." status={sectionStatus.media}>
                        <MediaUploader eventId={evenement.id} medias={evenement.medias} />
                    </SectionCard>
                </div>

                <div className="space-y-6">
                    <SectionCard
                        id="permissions"
                        title="Permissions / visibilite"
                        description="Controlez l exposition et l audience cible."
                        status={sectionStatus.permissions}
                        action={<Button onClick={() => void saveSection('permissions', { visibilite: visibility, public_cible: publicCible, roles: evenement.roles })}>Sauver</Button>}
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Visibilite</Label>
                                <Select value={visibility} onValueChange={(value) => setVisibility(value as typeof visibility)}>
                                    <SelectTrigger className="rounded-2xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {meta.visibilities.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Public cible</Label>
                                <Select value={publicCible} onValueChange={setPublicCible}>
                                    <SelectTrigger className="rounded-2xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {audienceRoles.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard
                        id="interactions"
                        title="Commentaires & interactions"
                        description="Parametrez les echanges sans bloquer la publication."
                        status={sectionStatus.interactions}
                        action={<Button onClick={() => void saveSection('interactions', interactions)}>Sauver</Button>}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                <div>
                                    <p className="font-medium text-slate-800">Commentaires actifs</p>
                                    <p className="text-sm text-slate-500">{evenement.comments_count} commentaire(s)</p>
                                </div>
                                <Checkbox checked={interactions.comments_enabled} onCheckedChange={(checked) => setInteractions((current) => ({ ...current, comments_enabled: checked === true }))} />
                            </div>
                            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                <div>
                                    <p className="font-medium text-slate-800">Messages actifs</p>
                                    <p className="text-sm text-slate-500">{evenement.messages_count} message(s)</p>
                                </div>
                                <Checkbox checked={interactions.messages_enabled} onCheckedChange={(checked) => setInteractions((current) => ({ ...current, messages_enabled: checked === true }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Politique de commentaires</Label>
                                <Select value={interactions.comment_policy} onValueChange={(value) => setInteractions((current) => ({ ...current, comment_policy: value }))}>
                                    <SelectTrigger className="rounded-2xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {commentPolicies.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard
                        id="certificates"
                        title="Certificats"
                        description="Activez le mode certifiant quand l evenement est pret."
                        status={sectionStatus.certificates}
                        action={<Button onClick={() => void saveSection('certificates', certificates)}>Sauver</Button>}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                <div>
                                    <p className="font-medium text-slate-800">Evenement certifiant</p>
                                    <p className="text-sm text-slate-500">Peut declencher un certificat participant.</p>
                                </div>
                                <Checkbox
                                    checked={certificates.evenement_certifie}
                                    onCheckedChange={(checked) => setCertificates((current) => ({ ...current, evenement_certifie: checked === true }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Version du modele</Label>
                                <Input
                                    value={certificates.certificate_template_version}
                                    onChange={(event) => setCertificates((current) => ({ ...current, certificate_template_version: event.target.value }))}
                                    className="rounded-2xl"
                                />
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard
                        id="comments"
                        title="Suivi intelligent"
                        description="Raccourcis vers les espaces collaboratifs et alertes de gestion."
                        status="partial"
                    >
                        <div className="space-y-3">
                            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                                <div className="flex items-center gap-2 font-medium text-slate-800">
                                    <MessageSquare className="h-4 w-4" />
                                    Commentaires: {evenement.comments_count}
                                </div>
                                <div className="mt-1 flex items-center gap-2 font-medium text-slate-800">
                                    <UserRoundPlus className="h-4 w-4" />
                                    Participants: {evenement.participants_count}
                                </div>
                                <div className="mt-1 flex items-center gap-2 font-medium text-slate-800">
                                    <Shield className="h-4 w-4" />
                                    Validation: {evenement.workflow_state}
                                </div>
                            </div>
                            <Button asChild variant="outline" className="w-full">
                                <a href={`/evenements/${evenement.id}`}>Ouvrir les interactions detaillees</a>
                            </Button>
                        </div>
                    </SectionCard>
                </div>
            </div>
        </EventManageLayout>
    );
}

export default function ManageEvent(props: ManageEventProps) {
    return (
        <PageErrorBoundary page="evenements/Manage">
            <ManageEventContent {...props} />
        </PageErrorBoundary>
    );
}
