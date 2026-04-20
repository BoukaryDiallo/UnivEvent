import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import ufr from '@/routes/ufr';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gestion des UFR',
        href: ufr.index.url(),
    },
    {
        title: 'Créer',
    },
];

export default function UfrCreate() {
    const { data, setData, post, processing, errors } = useForm({
        nom: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(ufr.store.url());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Créer UFR" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Créer un UFR</h1>

                    <Button variant="outline" asChild>
                        <a href={ufr.index.url()}>
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Retour
                        </a>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informations UFR</CardTitle>
                        <CardDescription>Entrez le nom de l'unité de formation</CardDescription>
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
                                    <p className="text-sm text-destructive">{errors.nom}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <a href={ufr.index.url()}>
                                        Annuler
                                    </a>
                                </Button>

                                <Button type="submit" disabled={processing}>
                                    <SaveIcon className="mr-2 h-4 w-4" />
                                    Enregistrer
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}