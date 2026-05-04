import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { store as storeSlot } from '@/actions/App/Http/Controllers/Admin/PickupSlotController';
import { index as adminSlotsIndex } from '@/routes/admin/pickup-slots';
import type { BreadcrumbItem } from '@/types';
import { SlotForm } from './slot-form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administration', href: '#' },
    { title: 'Créneaux de retrait', href: adminSlotsIndex().url },
    { title: 'Nouveau créneau', href: '#' },
];

export default function AdminPickupSlotCreate() {
    const form = useForm({
        location: '',
        starts_at: '',
        ends_at: '',
        capacity: 10,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(storeSlot().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouveau créneau" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Nouveau créneau</h1>
                    <p className="text-sm text-muted-foreground">
                        Planifiez une plage de retrait ouverte aux étudiants dont le dossier est prêt.
                    </p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Détails du créneau</CardTitle>
                        <CardDescription>
                            Les créneaux ne peuvent pas se chevaucher sur un même lieu.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SlotForm
                            data={form.data}
                            setData={form.setData}
                            errors={form.errors}
                            processing={form.processing}
                            onSubmit={submit}
                            submitLabel="Créer le créneau"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
