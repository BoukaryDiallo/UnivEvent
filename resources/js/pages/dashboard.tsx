import { Head, Link, usePage } from '@inertiajs/react';
import { Building2, Calendar as CalendarIcon, Users, ArrowRight, Zap, TrendingUp, Activity, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { DiplomaStatusBadge } from '@/pages/diplomas/status-badge';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import { create as createRequest, index as diplomasIndex, show as showRequest } from '@/routes/diplomas';
<<<<<<< yombisse_module6
import type { BreadcrumbItem } from '@/types';
// Types pour le systÃ¨me de diplÃ´mes
=======

>>>>>>> main
type ActiveRequest = {
    id: number;
    tracking_code: string;
    diploma_type: string;
    academic_year: string;
    status: string;
    status_label: string;
    submitted_at: string | null;
    updated_at: string;
    rejected_reason: string | null;
};

type Slot = {
    id: number;
    location: string;
    starts_at: string;
    ends_at: string;
    capacity: number;
    remaining: number;
};

type Appointment = {
    id: number;
    confirmed_at: string | null;
    delivered_at: string | null;
    delivered_by_name: string | null;
    can_cancel: boolean;
    slot: Slot;
};

type RecentEvent = {
    id: number;
    to: string;
    tracking_code: string;
    note: string | null;
    occurred_at: string;
};

// Types pour le systÃ¨me UnivEvent original
type DashboardStats = {
    clubsCount: number;
    electionsCount: number;
    votesCount: number;
    usersCount: number;
    pendingRequests: number;
    recentActivities: Array<{
        id: number;
        type: string;
        description: string;
        createdAt: string;
    }>;
};

type Props = {
    // Props pour le systÃ¨me de diplÃ´mes
    active_request?: ActiveRequest | null;
    upcoming_appointment?: Appointment | null;
    archived_count?: number;
    recent_events?: RecentEvent[];
    
    // Props pour le systÃ¨me UnivEvent original
    stats?: DashboardStats;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
];

const DIPLOMA_TYPE_LABEL: Record<string, string> = {
    licence: 'Licence',
    master: 'Master',
    doctorat: 'Doctorat',
};

const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

const formatLongDate = (iso: string) =>
    new Date(iso).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' });

export default function Dashboard(props: Props) {
    const { auth } = usePage().props as any;
    const userRole = auth?.user?.role;
    
    // VÃ©rifier si nous avons des donnÃ©es du systÃ¨me de diplÃ´mes
    const hasDiplomaData = props.active_request !== undefined || props.upcoming_appointment !== undefined;
    
    // VÃ©rifier si nous avons des donnÃ©es du systÃ¨me UnivEvent
    const hasUnivEventData = props.stats !== undefined;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Bonjour</h1>
                    <p className="text-sm text-muted-foreground">
<<<<<<< yombisse_module6
                        {hasDiplomaData ? 'Suivi de vos retraits de diplÃ´me.' : 'Tableau de bord UnivEvent.'}
=======
                        Suivi de vos retraits de diplôme.
>>>>>>> main
                    </p>
                </div>
                
                {/* Dashboard UnivEvent si disponible */}
                {hasUnivEventData && props.stats && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Clubs</CardTitle>
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{props.stats.clubsCount}</div>
                                <p className="text-xs text-muted-foreground">Actifs</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Ã‰lections</CardTitle>
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{props.stats.electionsCount}</div>
                                <p className="text-xs text-muted-foreground">En cours</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Votes</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{props.stats.votesCount}</div>
                                <p className="text-xs text-muted-foreground">Total</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{props.stats.usersCount}</div>
                                <p className="text-xs text-muted-foreground">Inscrits</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

<<<<<<< yombisse_module6
                {/* Dashboard diplÃ´mes si disponible */}
                {hasDiplomaData && (
                    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ma demande en cours</CardTitle>
                                <CardDescription>
                                    {props.active_request
                                        ? 'Statut courant et accÃ¨s rapide Ã  la fiche.'
                                        : 'Aucune demande active.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                {props.active_request ? (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-semibold">
                                                {DIPLOMA_TYPE_LABEL[props.active_request.diploma_type] ??
                                                    props.active_request.diploma_type}
                                                {' Â· '}
                                                {props.active_request.academic_year}
                                            </span>
                                            <DiplomaStatusBadge
                                                status={props.active_request.status}
                                                label={props.active_request.status_label}
                                            />
=======
                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ma demande en cours</CardTitle>
                            <CardDescription>
                                {active_request
                                    ? 'Statut courant et accès rapide à la fiche.'
                                    : 'Aucune demande active.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {active_request ? (
                                <>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-semibold">
                                            {DIPLOMA_TYPE_LABEL[active_request.diploma_type] ?? active_request.diploma_type}
                                            {' · '}
                                            {active_request.academic_year}
                                        </span>
                                        <DiplomaStatusBadge
                                            status={active_request.status}
                                            label={active_request.status_label}
                                        />
                                    </div>
                                    <div className="font-mono text-xs text-muted-foreground">
                                        {active_request.tracking_code}
                                    </div>
                                    {active_request.submitted_at && (
                                        <div className="text-xs text-muted-foreground">
                                            Soumise le {formatDateTime(active_request.submitted_at)}
>>>>>>> main
                                        </div>
                                        <div className="font-mono text-xs text-muted-foreground">
                                            {props.active_request.tracking_code}
                                        </div>
                                        {props.active_request.submitted_at && (
                                            <div className="text-xs text-muted-foreground">
                                                Soumise le {formatDateTime(props.active_request.submitted_at)}
                                            </div>
                                        )}
                                        {props.active_request.rejected_reason && (
                                            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                                                <span className="font-medium">Motif de rejet : </span>
                                                {props.active_request.rejected_reason}
                                            </div>
                                        )}
                                        <div>
                                            <Button asChild>
                                                <Link href={showRequest(props.active_request.id).url}>
                                                    Ouvrir le dossier
                                                </Link>
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-start gap-3">
                                        <p className="text-sm text-muted-foreground">
                                            DÃ©marrez une demande pour suivre la procÃ©dure jusqu'au retrait.
                                        </p>
                                        <Button asChild>
                                            <Link href={createRequest().url}>Nouvelle demande</Link>
                                        </Button>
                                    </div>
                                )}
                                {(props.archived_count && props.archived_count > 0) && (
                                    <div className="border-t pt-3 text-xs text-muted-foreground">
                                        {props.archived_count} dossier(s) archivÃ©(s) â€”{' '}
                                        <Link
                                            href={diplomasIndex().url}
                                            className="text-primary underline-offset-4 hover:underline"
                                        >
                                            consulter l'historique
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Prochain rendez-vous</CardTitle>
                                <CardDescription>
                                    {props.upcoming_appointment
                                        ? 'Rappel du crÃ©neau confirmÃ©.'
                                        : 'Aucun rendez-vous programmÃ©.'}
                            </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2 text-sm">
                                {props.upcoming_appointment ? (
                                    <>
                                        <div className="font-medium">
                                            {formatLongDate(props.upcoming_appointment.slot.starts_at)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {props.upcoming_appointment.slot.location}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
<<<<<<< yombisse_module6
                                        Lorsque votre dossier sera prÃªt, vous pourrez rÃ©server un crÃ©neau.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ActivitÃ© rÃ©cente diplÃ´mes si disponible */}
                {hasDiplomaData && props.recent_events && (
                    <Card>
                        <CardHeader>
                            <CardTitle>ActivitÃ© rÃ©cente</CardTitle>
                            <CardDescription>5 derniers Ã©vÃ¨nements de vos demandes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {props.recent_events.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Aucune activitÃ©.</p>
                            ) : (
                                <ol className="flex flex-col gap-3">
                                    {props.recent_events.map((e) => (
                                        <li
                                            key={e.id}
                                            className="border-l-2 border-muted pl-3 text-sm"
                                        >
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-medium">{e.to}</span>
                                                <span className="font-mono text-xs text-muted-foreground">
                                                    {e.tracking_code}
                                                </span>
                                            </div>
                                            {e.note && (
                                                <div className="text-xs text-muted-foreground">
                                                    {e.note}
                                                </div>
                                            )}
                                            <div className="text-xs text-muted-foreground">
                                                {formatDateTime(e.occurred_at)}
                                            </div>
                                        </li>
                                    ))}
                                </ol>
=======
                                        Démarrez une demande pour suivre la procédure jusqu'au retrait.
                                    </p>
                                    <Button asChild>
                                        <Link href={createRequest().url}>Nouvelle demande</Link>
                                    </Button>
                                </div>
                            )}
                            {archived_count > 0 && (
                                <div className="border-t pt-3 text-xs text-muted-foreground">
                                    {archived_count} dossier(s) archivé(s) —{' '}
                                    <Link
                                        href={diplomasIndex().url}
                                        className="text-primary underline-offset-4 hover:underline"
                                    >
                                        consulter l'historique
                                    </Link>
                                </div>
>>>>>>> main
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Message par dÃ©faut si aucune donnÃ©e */}
                {!hasDiplomaData && !hasUnivEventData && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Bienvenue sur UnivEvent</CardTitle>
                            <CardDescription>
<<<<<<< yombisse_module6
                                Votre tableau de bord personnalisÃ©
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Utilisez le menu de navigation pour accÃ©der aux diffÃ©rentes fonctionnalitÃ©s.
                            </p>
                        </CardContent>
                    </Card>
                )}
=======
                                {upcoming_appointment
                                    ? 'Rappel du créneau confirmé.'
                                    : 'Aucun rendez-vous programmé.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2 text-sm">
                            {upcoming_appointment ? (
                                <>
                                    <div className="font-medium">
                                        {formatLongDate(upcoming_appointment.slot.starts_at)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {upcoming_appointment.slot.location}
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Lorsque votre dossier sera prêt, vous pourrez réserver un créneau.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Activité récente</CardTitle>
                        <CardDescription>5 derniers évènements de vos demandes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recent_events.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Aucune activité.</p>
                        ) : (
                            <ol className="flex flex-col gap-3">
                                {recent_events.map((e) => (
                                    <li key={e.id} className="border-l-2 border-muted pl-3 text-sm">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-medium">{e.to}</span>
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {e.tracking_code}
                                            </span>
                                        </div>
                                        {e.note && (
                                            <div className="text-xs text-muted-foreground">
                                                {e.note}
                                            </div>
                                        )}
                                        <div className="text-xs text-muted-foreground">
                                            {formatDateTime(e.occurred_at)}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </CardContent>
                </Card>
>>>>>>> main
            </div>
        </AppLayout>
    );
}
