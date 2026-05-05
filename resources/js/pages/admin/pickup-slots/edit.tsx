import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { SlotForm } from './slot-form';
import { update as updateSlot } from '@/actions/App/Http/Controllers/Admin/PickupSlotController';
import { index as adminSlotsIndex } from '@/routes/admin/pickup-slots';

type Props = {
    slot: {
        id: number;
        location: string;
        starts_at: string;
        ends_at: string;
        capacity: number;
    };
};

export default function AdminPickupSlotEdit({ slot }: Props) {
    const form = useForm({
        location: slot.location,
        starts_at: slot.starts_at,
        ends_at: slot.ends_at,
        capacity: slot.capacity,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Administration', href: '#' },
        { title: 'Créneaux de retrait', href: adminSlotsIndex().url },
        { title: 'Modifier', href: '#' },
    ];

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.put(updateSlot(slot.id).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Modifier le créneau" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Modifier le créneau</h1>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Détails du créneau</CardTitle>
                        <CardDescription>
                            La capacité ne peut pas passer sous le nombre de RDV déjà confirmés.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SlotForm
                            data={form.data}
                            setData={form.setData}
                            errors={form.errors}
                            processing={form.processing}
                            onSubmit={submit}
                            submitLabel="Enregistrer"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
