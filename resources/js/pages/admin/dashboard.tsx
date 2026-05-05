import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { DiplomaStatusBadge } from '@/pages/diplomas/status-badge';
import { index as adminDiplomasIndex } from '@/routes/admin/diplomas';
import { index as adminPickupSlotsIndex } from '@/routes/admin/pickup-slots';
import type { BreadcrumbItem } from '@/types';

type StatusCount = { value: string; label: string; count: number };

type RecentEvent = {
    id: number;
    from: string | null;
    to: string;
    request: { id: number; tracking_code: string; owner_name: string | null };
    actor: string | null;
    note: string | null;
    occurred_at: string;
};

type Props = {
    counts: StatusCount[];
    active_queue: number;
    submitted_this_month: number;
    avg_instruction_days: number | null;
    avg_delivery_days: number | null;
    upcoming_slots: { capacity: number; reserved: number; utilization: number };
    recent_events: RecentEvent[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administration', href: '#' },
    { title: 'Tableau de bord', href: '/admin/dashboard' },
];

const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

const Metric = ({
    title,
    value,
    description,
}: {
    title: string;
    value: string | number;
    description?: string;
}) => (
    <Card>
        <CardHeader className="pb-2">
            <CardDescription>{title}</CardDescription>
            <CardTitle className="text-3xl">{value}</CardTitle>
        </CardHeader>
        {description && (
            <CardContent className="text-xs text-muted-foreground">{description}</CardContent>
        )}
    </Card>
);

export default function AdminDashboard({
    counts,
    active_queue,
    submitted_this_month,
    avg_instruction_days,
    avg_delivery_days,
    upcoming_slots,
    recent_events,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de bord scolarité" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Tableau de bord scolarité</h1>
                    <p className="text-sm text-muted-foreground">
                        Vue synthétique des demandes de retrait de diplôme.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Metric
                        title="Dossiers actifs"
                        value={active_queue}
                        description="Soumis, validés, prêts ou avec RDV"
                    />
                    <Metric
                        title="Soumis ce mois-ci"
                        value={submitted_this_month}
                    />
                    <Metric
                        title="Délai moyen d'instruction"
                        value={avg_instruction_days !== null ? `${avg_instruction_days} j` : '—'}
                        description="Temps entre soumission et validation des pièces"
                    />
                    <Metric
                        title="Délai moyen de remise"
                        value={avg_delivery_days !== null ? `${avg_delivery_days} j` : '—'}
                        description="De la soumission à la remise effective"
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Répartition par statut</CardTitle>
                            <CardDescription>
                                <Link
                                    href={adminDiplomasIndex().url}
                                    className="text-primary underline-offset-4 hover:underline"
                                >
                                    Ouvrir la file d'attente
                                </Link>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            {counts.map((c) => (
                                <div
                                    key={c.value}
                                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                                >
                                    <DiplomaStatusBadge status={c.value} label={c.label} />
                                    <span className="font-mono text-base font-semibold">
                                        {c.count}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Créneaux à venir</CardTitle>
                            <CardDescription>
                                <Link
                                    href={adminPickupSlotsIndex().url}
                                    className="text-primary underline-offset-4 hover:underline"
                                >
                                    Gérer les créneaux
                                </Link>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <div className="flex items-baseline justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Taux d'occupation
                                </span>
                                <span className="text-2xl font-semibold">
                                    {upcoming_slots.utilization} %
                                </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{
                                        width: `${Math.min(100, upcoming_slots.utilization)}%`,
                                    }}
                                />
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {upcoming_slots.reserved} RDV / {upcoming_slots.capacity} places
                                disponibles
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Activité récente</CardTitle>
                        <CardDescription>10 derniers évènements de tous les dossiers.</CardDescription>
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
                                                {e.request.tracking_code}
                                            </span>
                                            {e.request.owner_name && (
                                                <span className="text-xs text-muted-foreground">
                                                    · {e.request.owner_name}
                                                </span>
                                            )}
                                        </div>
                                        {e.note && (
                                            <div className="text-xs text-muted-foreground">
                                                {e.note}
                                            </div>
                                        )}
                                        <div className="text-xs text-muted-foreground">
                                            {formatDateTime(e.occurred_at)}
                                            {e.actor ? ` — ${e.actor}` : ''}
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
