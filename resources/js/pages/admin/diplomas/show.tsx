import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { download as downloadDocument } from '@/actions/App/Http/Controllers/DiplomaDocumentController';
import { index as adminDiplomasIndex } from '@/routes/admin/diplomas';
import type { BreadcrumbItem } from '@/types';
import { DiplomaStatusBadge } from '@/pages/diplomas/status-badge';

type DocumentRow = {
    id: number;
    type: string;
    type_label: string;
    original_name: string;
    size: number;
    validated_at: string | null;
};

type EventRow = {
    id: number;
    from_status: string | null;
    to_status: string;
    actor_name: string | null;
    note: string | null;
    occurred_at: string;
};

type Props = {
    request: {
        id: number;
        tracking_code: string;
        diploma_type: string;
        academic_year: string;
        status: string;
        status_label: string;
        submitted_at: string | null;
        rejected_reason: string | null;
        documents: DocumentRow[];
        events: EventRow[];
        owner: { id: number; name: string; email: string };
    };
};

const DIPLOMA_TYPE_LABEL: Record<string, string> = {
    licence: 'Licence',
    master: 'Master',
    doctorat: 'Doctorat',
};

const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

export default function AdminDiplomaRequestShow({ request }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Administration', href: '#' },
        { title: 'Dossiers de retrait', href: adminDiplomasIndex().url },
        { title: request.tracking_code, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Instruction ${request.tracking_code}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold">
                                {DIPLOMA_TYPE_LABEL[request.diploma_type] ?? request.diploma_type}
                                {' · '}
                                {request.academic_year}
                            </h1>
                            <DiplomaStatusBadge
                                status={request.status}
                                label={request.status_label}
                            />
                        </div>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                            {request.tracking_code}
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={adminDiplomasIndex().url}>Retour à la file</Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Étudiant</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-1 text-sm">
                        <div>
                            <span className="font-medium">{request.owner.name}</span>
                        </div>
                        <div className="text-muted-foreground">{request.owner.email}</div>
                        {request.submitted_at && (
                            <div className="text-xs text-muted-foreground">
                                Dossier soumis le {formatDateTime(request.submitted_at)}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {request.rejected_reason && (
                    <Card className="border-destructive/40 bg-destructive/5">
                        <CardHeader>
                            <CardTitle className="text-destructive">
                                Motif de rejet enregistré
                            </CardTitle>
                            <CardDescription className="text-destructive/80">
                                {request.rejected_reason}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pièces déposées</CardTitle>
                            <CardDescription>
                                {request.documents.length === 0
                                    ? 'Aucune pièce déposée.'
                                    : `${request.documents.length} pièce(s) à contrôler.`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            {request.documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">{doc.type_label}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {doc.original_name} · {formatSize(doc.size)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            {doc.validated_at ? 'Validée' : 'En attente'}
                                        </span>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={downloadDocument([request.id, doc.id]).url}>
                                                Télécharger
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Historique</CardTitle>
                            <CardDescription>Traçabilité des actions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {request.events.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Aucun évènement.</p>
                            ) : (
                                <ol className="flex flex-col gap-3">
                                    {request.events.map((e) => (
                                        <li
                                            key={e.id}
                                            className="border-l-2 border-muted pl-3 text-sm"
                                        >
                                            <div className="font-medium">{e.to_status}</div>
                                            {e.note && (
                                                <div className="text-xs text-muted-foreground">
                                                    {e.note}
                                                </div>
                                            )}
                                            <div className="text-xs text-muted-foreground">
                                                {formatDateTime(e.occurred_at)}
                                                {e.actor_name ? ` — ${e.actor_name}` : ''}
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
