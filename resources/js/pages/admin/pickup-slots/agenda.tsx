import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { show as showRequest } from '@/routes/admin/diplomas';
import { index as adminSlotsIndex } from '@/routes/admin/pickup-slots';

type Appointment = {
    id: number;
    tracking_code: string;
    request_id: number;
    student_name: string | null;
    student_email: string | null;
    delivered_at: string | null;
};

type Slot = {
    id: number;
    location: string;
    starts_at: string;
    ends_at: string;
    capacity: number;
    reserved: number;
    remaining: number;
    appointments: Appointment[];
};

type Day = {
    date: string;
    label: string;
    slots: Slot[];
};

type Props = {
    days: Day[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administration', href: '#' },
    { title: 'Créneaux de retrait', href: '/admin/pickup-slots' },
    { title: 'Agenda', href: '/admin/pickup-slots/agenda' },
];

const formatHour = (iso: string) =>
    new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

export default function AdminPickupAgenda({ days }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Agenda des retraits" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Agenda des retraits</h1>
                        <p className="text-sm text-muted-foreground">
                            Vue planifiée des créneaux à venir et des étudiants attendus.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={adminSlotsIndex().url}>Gérer les créneaux</Link>
                    </Button>
                </div>

                {days.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Aucun créneau planifié</CardTitle>
                            <CardDescription>
                                Créez un créneau pour démarrer l'agenda.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    days.map((day) => (
                        <Card key={day.date}>
                            <CardHeader>
                                <CardTitle className="capitalize">{day.label}</CardTitle>
                                <CardDescription>
                                    {day.slots.length} créneau(x) · {' '}
                                    {day.slots.reduce((acc, s) => acc + s.reserved, 0)} RDV /{' '}
                                    {day.slots.reduce((acc, s) => acc + s.capacity, 0)} places
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                {day.slots.map((slot) => (
                                    <div
                                        key={slot.id}
                                        className="rounded-md border p-3"
                                    >
                                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                                            <div>
                                                <span className="font-mono text-sm font-semibold">
                                                    {formatHour(slot.starts_at)} – {formatHour(slot.ends_at)}
                                                </span>
                                                <span className="ml-2 text-sm text-muted-foreground">
                                                    {slot.location}
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {slot.reserved} / {slot.capacity}
                                                {' '}({slot.remaining} restant(s))
                                            </span>
                                        </div>
                                        {slot.appointments.length === 0 ? (
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                Aucun RDV pour ce créneau.
                                            </p>
                                        ) : (
                                            <ul className="mt-3 flex flex-col gap-2">
                                                {slot.appointments.map((a) => (
                                                    <li
                                                        key={a.id}
                                                        className="flex flex-wrap items-center justify-between gap-2 rounded bg-muted/40 px-3 py-2 text-sm"
                                                    >
                                                        <div>
                                                            <Link
                                                                href={showRequest(a.request_id).url}
                                                                className="font-mono text-xs text-primary hover:underline"
                                                            >
                                                                {a.tracking_code}
                                                            </Link>
                                                            <span className="ml-2 font-medium">
                                                                {a.student_name}
                                                            </span>
                                                            {a.student_email && (
                                                                <span className="ml-2 text-xs text-muted-foreground">
                                                                    {a.student_email}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {a.delivered_at && (
                                                            <span className="text-xs text-emerald-600">
                                                                Remis
                                                            </span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </AppLayout>
    );
}
