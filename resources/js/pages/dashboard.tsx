import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { create as createRequest, index as diplomasIndex, show as showRequest } from '@/routes/diplomas';
import type { BreadcrumbItem } from '@/types';
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
    active_request: ActiveRequest | null;
    upcoming_appointment: Appointment | null;
    archived_count: number;
    recent_events: RecentEvent[];
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

export default function Dashboard({
    active_request,
    upcoming_appointment,
    archived_count,
    recent_events,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Bonjour 👋</h1>
                    <p className="text-sm text-muted-foreground">
                        Suivi de vos retraits de diplôme.
                    </p>
                </div>

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
        </AppLayout>
    );
}
