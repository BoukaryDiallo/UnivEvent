import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { create as createRequest, index as diplomasIndex, show as showRequest } from '@/routes/diplomas';
import type { BreadcrumbItem } from '@/types';
import { Building2, Calendar as CalendarIcon, Users, ArrowRight, Zap, TrendingUp, Activity, Star } from 'lucide-react';
import { DiplomaStatusBadge } from '@/pages/diplomas/status-badge';

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

type Props = {
    activites?: any[];
    stats?: {
        clubsCount: number;
        activitiesCount: number;
        membersCount: number;
    };
    active_request?: ActiveRequest | null;
    upcoming_appointment?: Appointment | null;
    archived_count?: number;
    recent_events?: RecentEvent[];
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
];

export default function Dashboard({ 
    activites = [], 
    stats = { clubsCount: 0, activitiesCount: 0, membersCount: 0 },
    active_request = null,
    upcoming_appointment = null,
    archived_count = 0,
    recent_events = []
}: Props) {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const isAdmin = user?.role === 'admin';
    const isStudent = user?.role === 'student';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-8 rounded-xl p-8 bg-slate-50">
                {/* Welcome Section */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 p-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Zap className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold tracking-tight text-slate-900">Bienvenue</h1>
                                <p className="text-base text-slate-500 font-medium mt-1">
                                    Plateforme de gestion des clubs et activités universitaires
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 flex gap-4">
                            {isAdmin && (
                                <Link
                                    href="/gestion"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                                >
                                    <Activity className="w-5 h-5" />
                                    Accéder à la gestion
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            )}
                            <Link
                                href="/clubs"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-300 font-semibold"
                            >
                                <Building2 className="w-5 h-5" />
                                Voir les clubs
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-indigo-200 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.clubsCount}</h3>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Clubs Actifs</p>
                    </div>

                    <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-emerald-200 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                <CalendarIcon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.activitiesCount}</h3>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Activités</p>
                    </div>

                    <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-amber-200 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.membersCount}</h3>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Membres</p>
                    </div>
                </div>
                {/* Ongoing Activities Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-900">Activités en cours</h2>
                        <Link href="/clubs" className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1">
                            Tous les clubs <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {activites.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activites.map((activite) => (
                                <div key={activite.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                                                {activite.club?.nom}
                                            </span>
                                            <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                                                <CalendarIcon className="w-3 h-3" />
                                                {new Date(activite.date_debut).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                            {activite.titre}
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-2 mb-6">
                                            {activite.description}
                                        </p>
                                        <Link 
                                            href={`/clubs/${activite.club?.id}`}
                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 text-slate-900 rounded-xl hover:bg-slate-900 hover:text-white transition-all font-bold text-xs"
                                        >
                                            Voir le club
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center">
                            <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold">Aucune activité en cours pour le moment</p>
                            <Link href="/clubs" className="text-indigo-600 text-sm font-bold mt-2 inline-block hover:underline">
                                Explorer les clubs
                            </Link>
                        </div>
                    )}
                </div>


                </div>

                {/* Diplomas Section (Student only) */}
                {isStudent && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Suivi de diplômes</h2>
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
                                                    {DIPLOMA_TYPE_LABEL[active_request.diploma_type] ??
                                                        active_request.diploma_type}
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
                                                </div>
                                            )}
                                            {active_request.rejected_reason && (
                                                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                                                    <span className="font-medium">Motif de rejet : </span>
                                                    {active_request.rejected_reason}
                                                </div>
                                            )}
                                            <div>
                                                <Button asChild>
                                                    <Link href={showRequest(active_request.id).url}>
                                                        Ouvrir le dossier
                                                    </Link>
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-start gap-3">
                                            <p className="text-sm text-muted-foreground">
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
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Prochain rendez-vous</CardTitle>
                                    <CardDescription>
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

                        <Card className="mt-6">
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
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
        </AppLayout>
    );
}
