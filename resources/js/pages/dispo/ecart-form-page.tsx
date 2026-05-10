import { Head, useForm } from '@inertiajs/react';
import { DispoShell } from '@/components/dispo/entete';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';
import type { ResumeDispo, UserDispo } from '@/types/dispo';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Exceptions', href: '/ecarts' },
];

export default function EcartFormPage({
    user,
    resume,
}: {
    user: UserDispo;
    resume: ResumeDispo;
}) {
    const form = useForm({
        date: '',
        date_fin: '',
        motif: '',
    });

    return (
        <DispoShell title="Ajouter une exception" description="Bloquez une date unique ou une plage complete." breadcrumbs={breadcrumbs} resume={resume} user={user} showResume={false}>
            <Head title="Ajouter une exception" />
            <Card className="mx-auto w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Formulaire d exception</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post('/ecarts', { preserveScroll: true, preserveState: true });
                        }}
                    >
                        <div className="grid gap-2">
                            <Label>Date de debut</Label>
                            <Input type="date" value={form.data.date} onChange={(event) => form.setData('date', event.target.value)} />
                            <InputError message={form.errors.date} className="mt-1" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Date de fin</Label>
                            <Input type="date" value={form.data.date_fin} min={form.data.date || undefined} onChange={(event) => form.setData('date_fin', event.target.value)} />
                            <p className="text-sm text-muted-foreground">Laissez vide pour bloquer une seule date.</p>
                            <InputError message={form.errors.date_fin} className="mt-1" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Motif</Label>
                            <Input value={form.data.motif} onChange={(event) => form.setData('motif', event.target.value)} />
                            <InputError message={form.errors.motif} className="mt-1" />
                        </div>
                        <div className="flex gap-3">
                            <Button type="submit" disabled={form.processing}>Enregistrer</Button>
                            <Button type="button" variant="outline" onClick={() => window.history.back()}>Retour</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </DispoShell>
    );
}
