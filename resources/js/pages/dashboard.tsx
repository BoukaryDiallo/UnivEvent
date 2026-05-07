import { Head, Link } from '@inertiajs/react';
import { Calendar, LayoutDashboard, Settings, Users, GraduationCap, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { DiplomaStatusBadge } from '@/pages/diplomas/status-badge';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import { create as createRequest, index as diplomasIndex, show as showRequest } from '@/routes/diplomas';

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

type DashboardProps = {
    isAdmin: boolean;
    active_request: ActiveRequest | null;
    upcoming_appointment: Appointment | null;
    archived_count: number;
    recent_events: RecentEvent[];
};

const DIPLOMA_TYPE_LABEL: Record<string, string> = {
    licence: 'Licence',
    master: 'Master',
    doctorat: 'Doctorat',
};

const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

export default function Dashboard({
    isAdmin,
    active_request,
    upcoming_appointment,
    archived_count,
    recent_events,
}: DashboardProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tableau de bord',
            href: dashboard(),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de bord" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Bienvenue sur votre portail</h1>
                    <p className="text-muted-foreground">
                        Accédez aux différents modules de la plateforme UnivEvent.
                    </p>
                </div>

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

                    {/* Module Diplômes */}
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
                                <Link href="/diplomas">
                                    <ClipboardCheck className="mr-2 size-4" />
                                    Mes Demandes
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

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
                {active_request && (
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
                                                Rendez-vous : {new Date(upcoming_appointment.slot.starts_at).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
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
            </div>
        </AppLayout>
    );
}
