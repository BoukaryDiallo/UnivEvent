import { Head } from '@inertiajs/react';
import { ArrowLeft, Pencil, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import {index as ufrIndex,edit as ufrEdit} from '@/routes/ufr';
import type { BreadcrumbItem } from '@/types';
import type { PageProps } from '@/types/app';

type UfrType = {
    id_ufr: number;
    nom: string;
    departements_count: number;
    departements: Array<{
        id_departement: number;
        nom: string;
        filieres_count: number;
    }>;
};

type Props = PageProps<{ ufr: UfrType }>;

export default function UfrShow({ ufr }: Props) {

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Gestion des UFR',
            href: ufrIndex.url(),
        },
        {
            title: ufr.nom,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`UFR - ${ufr.nom}`} />

            <div className="space-y-6">

                {/* HEADER */}
                <div className="flex items-center justify-between">

                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {ufr.nom}
                        </h1>

                        <Badge variant="secondary" className="mt-2">
                            {ufr.departements_count} département
                            {ufr.departements_count > 1 ? 's' : ''}
                        </Badge>
                    </div>

                    <div className="flex gap-2">

                        <Button variant="outline" asChild>
                            <a href={ufrIndex.url()}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour
                            </a>
                        </Button>

                        <Button asChild>
                            <a href={ufrEdit.url(ufr.id_ufr)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Modifier
                            </a>
                        </Button>

                    </div>

                </div>

                {/* GRID */}
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* INFO */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3">
                            <Building2 className="h-6 w-6 text-green-600" />
                            <CardTitle className="text-xl">
                                Informations générales
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <h3 className="text-lg font-semibold">Nom</h3>
                            <p className="text-2xl font-bold">{ufr.nom}</p>
                        </CardContent>
                    </Card>

                    {/* STATS */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Départements</CardTitle>
                            <CardDescription>Total rattaché</CardDescription>
                        </CardHeader>

                        <CardContent className="text-center">
                            <div className="text-3xl font-bold text-primary">
                                {ufr.departements_count}
                            </div>
                        </CardContent>
                    </Card>

                    {/* LISTE */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Départements</CardTitle>
                        </CardHeader>

                        <CardContent>
                            {ufr.departements?.length ? (
                                <div className="space-y-2">

                                    {ufr.departements.map((dept) => (
                                        <div
                                            key={dept.id_departement}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div>
                                                <h4 className="font-medium">
                                                    {dept.nom}
                                                </h4>

                                                <p className="text-sm text-gray-500">
                                                    {dept.filieres_count} filière
                                                    {dept.filieres_count > 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                </div>
                            ) : (
                                <p className="text-center py-8 text-gray-500">
                                    Aucun département rattaché
                                </p>
                            )}
                        </CardContent>
                    </Card>

                </div>

            </div>
        </AppLayout>
    );
}