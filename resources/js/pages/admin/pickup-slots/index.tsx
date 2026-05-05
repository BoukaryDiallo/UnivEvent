import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import {
    agenda as agendaRoute,
    create as createSlot,
    destroy as destroySlot,
    edit as editSlot,
} from '@/routes/admin/pickup-slots';
import type { BreadcrumbItem } from '@/types';

type Slot = {
    id: number;
    location: string;
    starts_at: string;
    ends_at: string;
    capacity: number;
    reserved: number;
    remaining: number;
};

type Props = {
    slots: Slot[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administration', href: '#' },
    { title: 'Créneaux de retrait', href: '/admin/pickup-slots' },
];

const formatSlot = (iso: string) =>
    new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

export default function AdminPickupSlotsIndex({ slots }: Props) {
    const handleDelete = (id: number) => {
        if (!confirm('Supprimer ce créneau ?')) {
return;
}

        router.delete(destroySlot(id).url, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Créneaux de retrait" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Créneaux de retrait</h1>
                        <p className="text-sm text-muted-foreground">
                            {slots.length} créneau(x) planifié(s).
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={agendaRoute().url}>Voir l'agenda</Link>
                        </Button>
                        <Button asChild>
                            <Link href={createSlot().url}>Nouveau créneau</Link>
                        </Button>
                    </div>
                </div>

                {slots.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Aucun créneau</CardTitle>
                            <CardDescription>
                                Créez un premier créneau pour permettre aux étudiants de prendre RDV.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href={createSlot().url}>Créer un créneau</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Date & heure</th>
                                        <th className="px-4 py-3 text-left">Lieu</th>
                                        <th className="px-4 py-3 text-left">Capacité</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {slots.map((s) => (
                                        <tr
                                            key={s.id}
                                            className="border-b last:border-b-0 hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3">
                                                <div>{formatSlot(s.starts_at)}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    → {formatSlot(s.ends_at)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{s.location}</td>
                                            <td className="px-4 py-3">
                                                <span className="font-medium">
                                                    {s.reserved} / {s.capacity}
                                                </span>
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                    ({s.remaining} place(s) restante(s))
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={editSlot(s.id).url}>Modifier</Link>
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDelete(s.id)}
                                                        disabled={s.reserved > 0}
                                                        title={
                                                            s.reserved > 0
                                                                ? 'Impossible de supprimer un créneau avec des RDV.'
                                                                : undefined
                                                        }
                                                    >
                                                        Supprimer
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
