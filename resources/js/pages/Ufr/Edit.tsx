import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import {index as ufrIndex,update as ufrUpdate} from '@/routes/ufr';
import type { BreadcrumbItem } from '@/types';
import type { PageProps } from '@/types/app';

type UfrType = {
    id_ufr: number;
    nom: string;
};

export default function UfrEdit({ ufr: ufrData }: PageProps<{ ufr: UfrType }>) {
    const { data, setData, put, processing, errors } = useForm({
        nom: ufrData.nom,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Gestion des UFR',
            href: ufrIndex.url(),
        },
        {
            title: 'Modifier',
        },
    ];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(ufrUpdate.url(ufrData.id_ufr));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier ${ufrData.nom}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Modifier l'UFR
                    </h1>

                    <Button variant="outline" asChild>
                        <a href={ufrIndex.url()}>
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Retour
                        </a>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Modifier {ufrData.nom}</CardTitle>
                        <CardDescription>
                            Mettez à jour les informations de l'UFR
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nom">
                                    Nom UFR <span className="text-destructive">*</span>
                                </Label>

                                <Input
                                    id="nom"
                                    name="nom"
                                    value={data.nom}
                                    onChange={(e) => setData('nom', e.target.value)}
                                    className={errors.nom ? 'ring-2 ring-destructive' : ''}
                                    required
                                />

                                {errors.nom && (
                                    <p className="text-sm text-destructive">
                                        {errors.nom}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href={ufrIndex.url()}>
                                        Annuler
                                    </a>
                                </Button>

                                <Button type="submit" disabled={processing}>
                                    <SaveIcon className="mr-2 h-4 w-4" />
                                    Mettre à jour
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}