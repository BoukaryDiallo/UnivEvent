import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { index as adminDiplomasIndex, show as adminDiplomasShow } from '@/routes/admin/diplomas';
import type { BreadcrumbItem } from '@/types';
import { DiplomaStatusBadge } from '@/pages/diplomas/status-badge';

type Option = { value: string; label: string };

type Row = {
    id: number;
    tracking_code: string;
    diploma_type: string;
    academic_year: string;
    status: string;
    status_label: string;
    submitted_at: string | null;
    updated_at: string;
    owner: { id: number; name: string; email: string };
};

type Props = {
    requests: Row[];
    filter: { status: string | null };
    statusOptions: Option[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administration', href: '#' },
    { title: 'Dossiers de retrait', href: '/admin/diplomas' },
];

const DIPLOMA_TYPE_LABEL: Record<string, string> = {
    licence: 'Licence',
    master: 'Master',
    doctorat: 'Doctorat',
};

const ALL_VALUE = '__all__';

export default function AdminDiplomasIndex({ requests, filter, statusOptions }: Props) {
    const handleStatusChange = (value: string) => {
        const next = value === ALL_VALUE ? undefined : value;
        router.get(adminDiplomasIndex().url, next ? { status: next } : {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dossiers à instruire" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Dossiers à instruire</h1>
                        <p className="text-sm text-muted-foreground">
                            {requests.length} dossier(s) en cours hors brouillons.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Filtrer :</span>
                        <Select value={filter.status ?? ALL_VALUE} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-56">
                                <SelectValue placeholder="Tous les statuts" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>Tous les statuts</SelectItem>
                                {statusOptions.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {requests.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Aucun dossier dans la file</CardTitle>
                            <CardDescription>
                                Aucune demande ne correspond au filtre courant.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Dossier</th>
                                        <th className="px-4 py-3 text-left">Étudiant</th>
                                        <th className="px-4 py-3 text-left">Diplôme</th>
                                        <th className="px-4 py-3 text-left">Statut</th>
                                        <th className="px-4 py-3 text-left">Soumise le</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((r) => (
                                        <tr
                                            key={r.id}
                                            className="border-b last:border-b-0 hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={adminDiplomasShow(r.id).url}
                                                    className="font-mono text-xs text-primary hover:underline"
                                                >
                                                    {r.tracking_code}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{r.owner.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {r.owner.email}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {DIPLOMA_TYPE_LABEL[r.diploma_type] ?? r.diploma_type}
                                                {' · '}
                                                <span className="text-xs text-muted-foreground">
                                                    {r.academic_year}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <DiplomaStatusBadge
                                                    status={r.status}
                                                    label={r.status_label}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground">
                                                {r.submitted_at
                                                    ? new Date(r.submitted_at).toLocaleString('fr-FR', {
                                                          dateStyle: 'short',
                                                          timeStyle: 'short',
                                                      })
                                                    : '—'}
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
