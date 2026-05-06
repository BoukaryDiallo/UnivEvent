import { Head, Link } from '@inertiajs/react';
import { CalendarDays, MapPin, ShieldCheck, Users, ImagePlus, Sparkles, Shield, ClipboardList, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventBadge } from '@/modules/module5/components/EventBadge';
import { ActorManager } from '@/modules/module5/components/manage/ActorManager';
import { EventManageLayout } from '@/modules/module5/components/manage/EventManageLayout';
import { MediaUploader } from '@/modules/module5/components/manage/MediaUploader';
import { SectionCard } from '@/modules/module5/components/manage/SectionCard';
import { SmartSubmitButton } from '@/modules/module5/components/manage/SmartSubmitButton';
import { CertificateStudio } from '@/modules/module5/components/CertificateCanvasStudio';
import type { BreadcrumbItem } from '@/types';
import type {
    EventAssignableUser,
    EventCompletionSummary,
    EventMedia,
    EventProgramme,
    EventRole,
    EventSummary,
    EventTeamMember,
} from '@/modules/module5/types/event';
import { useMemo } from 'react';

type ManageAssignment = {
    id: number;
    role: 'organisateur' | 'jury' | 'intervenant' | 'participant';
    user: {
        id: number | null;
        name: string | null;
        email: string | null;
        role: string | null;
    };
};

type ManageProps = {
    event: EventSummary & {
        assignments?: ManageAssignment[];
        programmes?: EventProgramme[];
        medias?: EventMedia[];
        comment_policy?: string;
        roles?: EventRole[];
    };
    assignable_users: EventAssignableUser[];
    completion: EventCompletionSummary;
    suggestions: string[];
    submission_errors: string[];
    auth: {
        user?: {
            id: number;
            name: string | null;
        } | null;
    };
};

const defaultPermissions = {
    can_manage_messages: false,
    can_manage_comments: false,
    can_edit_event: false,
    can_change_visibility: false,
    can_manage_participants: false,
    can_assign_jury: false,
    can_assign_organizers: false,
    can_manage_certificates: false,
    can_manage_results: false,
};

function formatDate(date?: string | null) {
    if (!date) {
        return 'Indisponible';
    }

    return new Date(date).toLocaleString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function EventManage({ event, assignable_users, completion, suggestions, submission_errors }: ManageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Module 5', href: '/module5/dashboard' },
        { title: 'Événements', href: '/module5/events' },
        { title: event.titre, href: `/module5/events/${event.id}` },
        { title: 'Gestion', href: `#/` },
    ];

    const team = useMemo(() => {
        const base = {
            organisateur: [] as EventTeamMember[],
            jury: [] as EventTeamMember[],
            intervenant: [] as EventTeamMember[],
            participant: [] as EventTeamMember[],
        };

        (event.assignments ?? []).forEach((assignment) => {
            const user = assignment.user;
            const member: EventTeamMember = {
                id: assignment.id,
                user_id: user.id ?? 0,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: defaultPermissions,
            };

            if (assignment.role === 'organisateur') {
                base.organisateur.push(member);
            }

            if (assignment.role === 'jury') {
                base.jury.push(member);
            }

            if (assignment.role === 'intervenant') {
                base.intervenant.push(member);
            }

            if (assignment.role === 'participant') {
                base.participant.push(member);
            }
        });

        return base;
    }, [event.assignments]);

    const audience = event.roles?.length ? event.roles.join(', ') : event.public_cible;

    const isCertified = !!event.evenement_certifie;

    return (
        <EventManageLayout
            evenement={event}
            workflowState={event.workflow_state ?? 'draft'}
            completion={completion}
            breadcrumbs={breadcrumbs}
            suggestions={suggestions}
            actions={
                <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                        <Button asChild variant="outline" className="flex-1 rounded-2xl h-12 font-black uppercase text-[10px] border-indigo-100 text-indigo-600">
                            <Link href={`/admin/scanner-acces?target=${event.id}`}>
                                <UsersIcon className="mr-2 h-4 w-4" /> Scanner les entrées
                            </Link>
                        </Button>
                        
                        {isCertified && event.workflow_state === 'published' && (
                            <Button 
                                className="flex-1 rounded-2xl bg-amber-600 hover:bg-amber-700 font-black uppercase tracking-widest text-[10px] h-12 shadow-lg shadow-amber-100 text-white"
                                onClick={() => {
                                    if (confirm("Générer et envoyer les certificats à tous les participants validés ?")) {
                                        router.post('/module5/certificats/bulk-generate', { evenement_id: event.id });
                                    }
                                }}
                            >
                                <Trophy className="mr-2 h-4 w-4" /> Délivrer Certificats
                            </Button>
                        )}
                    </div>

                    <SmartSubmitButton
                        eventId={event.id}
                        initialErrors={submission_errors}
                        onSuccess={() => window.location.reload()}
                        onNavigate={(section) => {
                            const element = document.getElementById(section);
                            element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                    />
                </div>
            }
        >
            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
                <div className="space-y-6">
                    <SectionCard
                        id="general"
                        title="Informations générales"
                        description="Vue d’ensemble des données essentielles de l’événement."
                        status={completion.sections.find((section) => section.key === 'general')?.status ?? 'empty'}
                        action={
                            <Button asChild size="sm" variant="outline">
                                <Link href={`/module5/events/${event.id}/edit`}>Modifier</Link>
                            </Button>
                        }
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">Titre</p>
                                <p className="font-medium text-slate-900">{event.titre}</p>
                            </div>
                            <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">Statut</p>
                                <Badge>{event.statut}</Badge>
                            </div>
                            <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">Visibilité</p>
                                <Badge variant="outline">{event.visibilite}</Badge>
                            </div>
                            <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">Public cible</p>
                                <p className="font-medium text-slate-900">{audience}</p>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-3xl border border-slate-200 bg-white p-4">
                                <p className="text-sm text-slate-500">Date de début</p>
                                <p className="font-medium text-slate-900">{formatDate(event.date_debut)}</p>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-white p-4">
                                <p className="text-sm text-slate-500">Date de fin</p>
                                <p className="font-medium text-slate-900">{formatDate(event.date_fin)}</p>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-4">
                            <p className="text-sm text-slate-500">Lieu</p>
                            <p className="font-medium text-slate-900">{event.lieu || 'Non défini'}</p>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-4">
                            <p className="text-sm text-slate-500">Description</p>
                            <p className="whitespace-pre-line text-slate-700">{event.description || 'Aucune description.'}</p>
                        </div>
                    </SectionCard>

                    <SectionCard
                        id="program"
                        title={event.type === 'concours' ? 'Critères / Evaluation' : 'Programme'}
                        description={
                            event.type === 'concours'
                                ? 'Configurez les critères du jury et le déroulé de l’épreuve.'
                                : 'Liste des sessions, ateliers et présentations prévues.'
                        }
                        status={completion.sections.find((section) => section.key === 'program')?.status ?? 'empty'}
                    >
                        {event.type === 'concours' ? (
                            <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                                <p>Les critères de notation sont gérés dans le panneau jury.</p>
                                <p>Ajoutez des membres du jury et attribuez les rôles.</p>
                            </div>
                        ) : event.programmes && event.programmes.length > 0 ? (
                            <div className="space-y-3">
                                {event.programmes.map((programme) => (
                                    <div key={programme.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-slate-900">{programme.titre}</p>
                                                <p className="text-sm text-slate-500">{programme.intervenant || 'Intervenant non défini'}</p>
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                {programme.date_programme || 'Date inconnue'}
                                                {programme.heure_debut ? ` • ${programme.heure_debut}` : ''}
                                            </p>
                                        </div>
                                        {programme.description ? <p className="mt-3 text-sm text-slate-600">{programme.description}</p> : null}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                                Aucun élément de programme trouvé.
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard
                        id="actors"
                        title="Acteurs"
                        description="Ajoutez, supprimez et visualisez les organisateurs, intervenants, jury et participants."
                        status={completion.sections.find((section) => section.key === 'actors')?.status ?? 'empty'}
                    >
                        <div className="space-y-6">
                            {event.allow_organizer && (
                                <ActorManager
                                    eventId={event.id}
                                    role="organisateur"
                                    title="Organisateurs"
                                    members={team.organisateur}
                                    assignableUsers={assignable_users}
                                />
                            )}
                            {event.allow_intervenant && (
                                <ActorManager
                                    eventId={event.id}
                                    role={event.allow_jury ? 'jury' : 'intervenant'}
                                    title={event.allow_jury ? 'Jury' : 'Intervenants'}
                                    members={event.allow_jury ? team.jury : team.intervenant}
                                    assignableUsers={assignable_users}
                                />
                            )}
                            {event.allow_participant && (
                                <ActorManager
                                    eventId={event.id}
                                    role="participant"
                                    title="Participants"
                                    members={team.participant}
                                    assignableUsers={assignable_users}
                                />
                            )}
                        </div>
                    </SectionCard>

                    <SectionCard
                        id="media"
                        title="Médias"
                        description="Téléversez des visuels et documents ressources pour l’événement."
                        status={completion.sections.find((section) => section.key === 'media')?.status ?? 'empty'}
                    >
                        <MediaUploader eventId={event.id} medias={event.medias ?? []} />
                    </SectionCard>

                    {isCertified && (
                        <SectionCard
                            id="certificate-design"
                            title="Design du Certificat"
                            description="Personnalisez le rendu visuel des certificats (Canvas Studio)."
                            status="complete"
                        >
                            <CertificateStudio event={event} />
                        </SectionCard>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle>Résumé rapide</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {event.cover_url && (
                                <div className="relative h-32 w-full rounded-2xl overflow-hidden mb-2">
                                    <img src={event.cover_url} className="w-full h-full object-cover" alt="Poster" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>
                            )}
                            <div className="flex items-center gap-2 rounded-3xl bg-slate-50 p-4">
                                <ShieldCheck className="h-5 w-5 text-sky-500" />
                                <div>
                                    <p className="text-sm text-slate-500">État de workflow</p>
                                    <p className="font-medium text-slate-900">{event.workflow_state_label || 'Brouillon'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-3xl bg-slate-50 p-4">
                                <Users className="h-5 w-5 text-emerald-500" />
                                <div>
                                    <p className="text-sm text-slate-500">Participants inscrits</p>
                                    <p className="font-medium text-slate-900">{event.participants_count}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-3xl bg-slate-50 p-4">
                                <ImagePlus className="h-5 w-5 text-violet-500" />
                                <div>
                                    <p className="text-sm text-slate-500">Médias disponibles</p>
                                    <p className="font-medium text-slate-900">{event.medias?.length ?? 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <SectionCard
                        id="permissions"
                        title="Permissions & Visibilité"
                        description="Vérifiez la visibilité et les audiences autorisées."
                        status={completion.sections.find((section) => section.key === 'permissions')?.status ?? 'empty'}
                    >
                        <div className="space-y-4 text-sm text-slate-600">
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                <p className="font-medium text-slate-900">Visibilité</p>
                                <p>{event.visibilite}</p>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                <p className="font-medium text-slate-900">Public cible</p>
                                <p>{audience}</p>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                <p className="font-medium text-slate-900">Politique de commentaires</p>
                                <p>{event.comment_policy || 'Non défini'}</p>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard
                        id="interactions"
                        title="Interactions"
                        description="Indiquez si le chat et les commentaires sont ouverts."
                        status={completion.sections.find((section) => section.key === 'interactions')?.status ?? 'empty'}
                        action={
                            <Button asChild size="sm" variant="outline">
                                <Link href={`/module5/events/${event.id}/edit`}>Modifier</Link>
                            </Button>
                        }
                    >
                        <div className="space-y-3 text-sm text-slate-600">
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                <p className="font-medium text-slate-900">Commentaires</p>
                                <p>{event.comments_enabled ? '✅ Activés' : '❌ Désactivés'}</p>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                <p className="font-medium text-slate-900">Messagerie</p>
                                <p>{event.messages_enabled ? '✅ Activés' : '❌ Désactivés'}</p>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                <p className="font-medium text-slate-900">Politique de commentaires</p>
                                <p>{event.comment_policy === 'all' ? '🌍 Tout le monde' : 
                                   event.comment_policy === 'registered' ? '📝 Inscrits' :
                                   event.comment_policy === 'accepted_participants' ? '✅ Participants validés' : '🚫 Lecture seule'}</p>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard
                        id="certificates"
                        title="Certificats"
                        description="Statut du mode certifiant pour cet événement."
                        status={completion.sections.find((section) => section.key === 'certificates')?.status ?? 'empty'}
                        action={
                            <Button asChild size="sm" variant="outline">
                                <Link href={`/module5/events/${event.id}/edit`}>Modifier</Link>
                            </Button>
                        }
                    >
                        <div className="space-y-3 text-sm text-slate-600">
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                <p className="font-medium text-slate-900">Mode certifiant</p>
                                <p>{event.evenement_certifie ? '✅ Activé' : '❌ Désactivé'}</p>
                            </div>
                            {event.evenement_certifie ? (
                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="font-medium text-slate-900">Version modèle</p>
                                    <p>{event.certificate_template_version || 'Non configurée'}</p>
                                </div>
                            ) : null}
                        </div>
                    </SectionCard>

                    <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle>Aller plus loin</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3 text-sm text-slate-600">
                                <p>Vous pouvez également accéder à l’écran public, ou continuer la configuration dans la page d’édition complète.</p>
                            </div>
                            <div className="grid gap-3">
                                <Button asChild variant="outline">
                                    <Link href={`/module5/events/${event.id}`}>Voir la fiche publique</Link>
                                </Button>
                                <Button asChild>
                                    <Link href={`/module5/events/${event.id}/edit`}>Éditer l'événement</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </EventManageLayout>
    );
}
