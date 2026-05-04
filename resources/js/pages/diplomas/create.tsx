import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { store } from '@/actions/App/Http/Controllers/DiplomaRequestController';
import { index as diplomasIndex } from '@/routes/diplomas';
import type { BreadcrumbItem } from '@/types';

type Option = { value: string; label: string };

type Props = {
    diplomaTypes: Option[];
    academicYears: Option[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Retraits de diplômes', href: diplomasIndex().url },
    { title: 'Nouvelle demande', href: '#' },
];

export default function CreateDiplomaRequest({ diplomaTypes, academicYears }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        diploma_type: diplomaTypes[0]?.value ?? '',
        academic_year: academicYears[academicYears.length - 1]?.value ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(store().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouvelle demande de retrait" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Nouvelle demande de retrait</h1>
                    <p className="text-sm text-muted-foreground">
                        Renseignez le diplôme concerné pour ouvrir un brouillon. Vous pourrez ensuite
                        téléverser vos pièces justificatives.
                    </p>
                </div>

                <Card className="max-w-xl">
                    <CardHeader>
                        <CardTitle>Informations du diplôme</CardTitle>
                        <CardDescription>
                            Ces informations sont figées après la soumission de la demande.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="diploma_type">Type de diplôme</Label>
                                <Select
                                    value={data.diploma_type}
                                    onValueChange={(v) => setData('diploma_type', v)}
                                >
                                    <SelectTrigger id="diploma_type" className="w-full">
                                        <SelectValue placeholder="Sélectionner un diplôme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {diplomaTypes.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.diploma_type} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="academic_year">Année académique</Label>
                                <Select
                                    value={data.academic_year}
                                    onValueChange={(v) => setData('academic_year', v)}
                                >
                                    <SelectTrigger id="academic_year" className="w-full">
                                        <SelectValue placeholder="Sélectionner une année" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.academic_year} />
                            </div>

                            <div className="flex items-center gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Créer le brouillon
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
