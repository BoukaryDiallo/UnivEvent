import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { create as createRoute, index as diplomasIndex, show as showRoute } from '@/routes/diplomas';
import type { BreadcrumbItem } from '@/types';
import { DiplomaStatusBadge } from './status-badge';

type DiplomaRequestRow = {
    id: number;
    tracking_code: string;
    diploma_type: string;
    academic_year: string;
    status: string;
    status_label: string;
    submitted_at: string | null;
    updated_at: string;
};

type Props = {
    requests: DiplomaRequestRow[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Retraits de diplômes', href: diplomasIndex().url },
];

const DIPLOMA_TYPE_LABEL: Record<string, string> = {
    licence: 'Licence',
    master: 'Master',
    doctorat: 'Doctorat',
};

export default function DiplomasIndex({ requests }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Retraits de diplômes" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Retraits de diplômes</h1>
                        <p className="text-sm text-muted-foreground">
                            Suivez vos demandes de retrait et déposez vos pièces justificatives.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={createRoute().url}>Nouvelle demande</Link>
                    </Button>
                </div>

                {requests.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Aucune demande pour le moment</CardTitle>
                            <CardDescription>
                                Créez votre première demande pour déposer les pièces requises.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href={createRoute().url}>Démarrer une demande</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {requests.map((r) => (
                            <Link
                                key={r.id}
                                href={showRoute(r.id).url}
                                className="group"
                            >
                                <Card className="h-full transition-colors group-hover:border-primary/40">
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex flex-col gap-1">
                                                <CardTitle className="text-base">
                                                    {DIPLOMA_TYPE_LABEL[r.diploma_type] ?? r.diploma_type}
                                                    {' · '}
                                                    {r.academic_year}
                                                </CardTitle>
                                                <CardDescription className="font-mono text-xs">
                                                    {r.tracking_code}
                                                </CardDescription>
                                            </div>
                                            <DiplomaStatusBadge
                                                status={r.status}
                                                label={r.status_label}
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="text-xs text-muted-foreground">
                                        {r.submitted_at
                                            ? `Soumise le ${new Date(r.submitted_at).toLocaleDateString('fr-FR')}`
                                            : 'Brouillon — non soumis'}
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
