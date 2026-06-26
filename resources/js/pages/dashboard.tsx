import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    Building2,
    Calendar,
    Calendar as CalendarIcon,
    ClipboardCheck,
    GraduationCap,
    LayoutDashboard,
    Settings,
    Star,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { DiplomaStatusBadge } from '@/pages/diplomas/status-badge';
import { dashboard } from '@/routes';
import { create as createRequest, index as diplomasIndex, show as showRequest } from '@/routes/diplomas';
import type { BreadcrumbItem } from '@/types';

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
    isAdmin?: boolean;
    active_request?: ActiveRequest | null;
    upcoming_appointment?: Appointment | null;
    archived_count?: number;
    recent_events?: RecentEvent[];
    stats?: DashboardStats;
};

const DIPLOMA_TYPE_LABEL: Record<string, string> = {
    licence: 'Licence',
    master: 'Master',
    doctorat: 'Doctorat',
};

const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

const formatLongDate = (iso: string) =>
    new Date(iso).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' });

export default function Dashboard({
    isAdmin = false,
    active_request = null,
    upcoming_appointment = null,
    archived_count = 0,
    recent_events = [],
    stats,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tableau de bord',
            href: dashboard(),
        },
    ];

    const showStudentDiplomas = !isAdmin;
    const hasDiplomaData = showStudentDiplomas && (!!active_request || !!upcoming_appointment);
    const hasUnivEventData = !!stats;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de bord" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Bienvenue sur votre portail</h1>
                    <p className="text-muted-foreground">
                        {hasDiplomaData ? 'Suivi de vos retraits de diplôme.' : 'Accédez aux différents modules de la plateforme UnivEvent.'}
                    </p>
                </div>

                {/* Dashboard Stats if available */}
                {hasUnivEventData && stats && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Clubs</CardTitle>
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.clubsCount}</div>
                                <p className="text-xs text-muted-foreground">Actifs</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Élections</CardTitle>
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.electionsCount}</div>
                                <p className="text-xs text-muted-foreground">En cours</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Votes</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.votesCount}</div>
                                <p className="text-xs text-muted-foreground">Total</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.usersCount}</div>
                                <p className="text-xs text-muted-foreground">Inscrits</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Module 5: Événements */}
                    <Card className="flex flex-col justify-between rounded-3xl border-slate-200 shadow-sm transition-all hover:shadow-md dark:border-slate-800">
                        <CardHeader>
                            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950/30 dark:text-sky-300">
                                <Calendar className="size-6" />
                            </div>
                            <CardTitle className="mt-4 text-xl">Gestion des Événements</CardTitle>
                            <CardDescription>
                                Consultez les conférences, concours, et gérez vos participations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full rounded-full" variant="outline">
                                <Link href="/module5/dashboard">
                                    <LayoutDashboard className="mr-2 size-4" />
                                    Dashboard Événements
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {showStudentDiplomas && (
                        <Card className="flex flex-col justify-between rounded-3xl border-slate-200 shadow-sm transition-all hover:shadow-md dark:border-slate-800">
                            <CardHeader>
                                <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-300">
                                    <GraduationCap className="size-6" />
                                </div>
                                <CardTitle className="mt-4 text-xl">Retrait de Diplômes</CardTitle>
                                <CardDescription>
                                    Suivez l'état de vos demandes et prenez rendez-vous pour le retrait.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild className="w-full rounded-full" variant="outline">
                                    <Link href={diplomasIndex().url}>
                                        <ClipboardCheck className="mr-2 size-4" />
                                        Mes Demandes
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Administration */}
                    {isAdmin && (
                        <Card className="flex flex-col justify-between rounded-3xl border-slate-200 shadow-sm transition-all hover:shadow-md dark:border-slate-800">
                            <CardHeader>
                                <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300">
                                    <Users className="size-6" />
                                </div>
                                <CardTitle className="mt-4 text-xl">Administration</CardTitle>
                                <CardDescription>
                                    Gérez les utilisateurs, les rôles et les paramètres système.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild className="w-full rounded-full" variant="outline">
                                    <Link href="/admin/users">
                                        <Settings className="mr-2 size-4" />
                                        Gérer les rôles
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Section active diploma request if exists */}
                {showStudentDiplomas && active_request && (
                    <div className="mt-4">
                        <h2 className="mb-4 text-xl font-semibold">Ma demande de diplôme active</h2>
                        <Card className="border-indigo-100 bg-indigo-50/30 dark:border-indigo-900/30 dark:bg-indigo-950/10">
                            <CardContent className="pt-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-semibold">
                                                {DIPLOMA_TYPE_LABEL[active_request.diploma_type] ?? active_request.diploma_type}
                                                {' — '}
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
                                        {upcoming_appointment && (
                                            <div className="mt-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                                Rendez-vous : {formatLongDate(upcoming_appointment.slot.starts_at)}
                                            </div>
                                        )}
                                    </div>
                                    <Button asChild>
                                        <Link href={showRequest(active_request.id).url}>
                                            Voir les détails
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Recent Activity for Diplomas */}
                {showStudentDiplomas && recent_events.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Activité récente</CardTitle>
                            <CardDescription>Derniers évènements de vos demandes de diplômes.</CardDescription>
                        </CardHeader>
                        <CardContent>
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
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
