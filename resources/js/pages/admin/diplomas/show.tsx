import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { download as downloadDocument } from '@/actions/App/Http/Controllers/DiplomaDocumentController';
import { validateDocument as validateDocumentAction } from '@/actions/App/Http/Controllers/Admin/DiplomaDocumentController';
import {
    archive as archiveAction,
    deliver as deliverAction,
    markReadyForPickup as markReadyAction,
    reject as rejectAction,
    validateDossier as validateDossierAction,
} from '@/actions/App/Http/Controllers/Admin/DiplomaRequestController';
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
    validated_by_name: string | null;
    can_validate: boolean;
};

type EventRow = {
    id: number;
    from_status: string | null;
    to_status: string;
    actor_name: string | null;
    note: string | null;
    occurred_at: string;
};

type Appointment = {
    id: number;
    confirmed_at: string | null;
    delivered_at: string | null;
    delivered_by_name: string | null;
    slot: {
        id: number;
        location: string;
        starts_at: string;
        ends_at: string;
        capacity: number;
        remaining: number;
    };
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
        appointment: Appointment | null;
        owner: { id: number; name: string; email: string };
    };
    can: {
        validateDossier: boolean;
        reject: boolean;
        markReadyForPickup: boolean;
        deliver: boolean;
        archive: boolean;
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

export default function AdminDiplomaRequestShow({ request, can }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Administration', href: '#' },
        { title: 'Dossiers de retrait', href: adminDiplomasIndex().url },
        { title: request.tracking_code, href: '#' },
    ];

    const [rejectOpen, setRejectOpen] = useState(false);
    const rejectForm = useForm({ reason: '' });

    const [deliverOpen, setDeliverOpen] = useState(false);
    const deliverForm = useForm<{ receipt: File | null }>({ receipt: null });

    const hasUnvalidatedDocuments = request.documents.some((d) => !d.validated_at);

    const handleValidateDocument = (documentId: number) => {
        router.post(
            validateDocumentAction([request.id, documentId]).url,
            {},
            { preserveScroll: true },
        );
    };

    const handleValidateDossier = () => {
        if (!confirm('Valider ce dossier ? L\'étudiant pourra ensuite être informé de son statut.')) return;
        router.post(validateDossierAction(request.id).url, {}, { preserveScroll: true });
    };

    const handleMarkReady = () => {
        if (!confirm('Marquer ce dossier comme prêt à retirer ?')) return;
        router.post(markReadyAction(request.id).url, {}, { preserveScroll: true });
    };

    const handleReject = (e: FormEvent) => {
        e.preventDefault();
        rejectForm.post(rejectAction(request.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                rejectForm.reset();
                setRejectOpen(false);
            },
        });
    };

    const handleDeliver = (e: FormEvent) => {
        e.preventDefault();
        deliverForm.post(deliverAction(request.id).url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                deliverForm.reset();
                setDeliverOpen(false);
            },
        });
    };

    const handleArchive = () => {
        if (!confirm('Archiver ce dossier ? Les pièces resteront consultables.')) return;
        router.post(archiveAction(request.id).url, {}, { preserveScroll: true });
    };

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
                    <div className="flex flex-wrap items-center gap-2">
                        {can.validateDossier && (
                            <Button
                                onClick={handleValidateDossier}
                                disabled={hasUnvalidatedDocuments}
                                title={
                                    hasUnvalidatedDocuments
                                        ? 'Validez toutes les pièces avant de valider le dossier.'
                                        : undefined
                                }
                            >
                                Valider le dossier
                            </Button>
                        )}
                        {can.markReadyForPickup && (
                            <Button onClick={handleMarkReady}>Marquer prêt à retirer</Button>
                        )}
                        {can.deliver && (
                            <Button onClick={() => setDeliverOpen(true)}>
                                Acter la remise
                            </Button>
                        )}
                        {can.archive && (
                            <Button variant="secondary" onClick={handleArchive}>
                                Archiver
                            </Button>
                        )}
                        {can.reject && (
                            <Button
                                variant="destructive"
                                onClick={() => setRejectOpen(true)}
                            >
                                Rejeter
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href={adminDiplomasIndex().url}>Retour à la file</Link>
                        </Button>
                    </div>
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

                {request.appointment && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Rendez-vous de retrait</CardTitle>
                            <CardDescription>
                                {new Date(request.appointment.slot.starts_at).toLocaleString(
                                    'fr-FR',
                                    { dateStyle: 'full', timeStyle: 'short' },
                                )}
                                {' · '}
                                {request.appointment.slot.location}
                            </CardDescription>
                        </CardHeader>
                        {request.appointment.delivered_at && (
                            <CardContent className="text-sm text-emerald-600">
                                Diplôme remis le{' '}
                                {formatDateTime(request.appointment.delivered_at)}
                                {request.appointment.delivered_by_name
                                    ? ` par ${request.appointment.delivered_by_name}`
                                    : ''}
                                .
                            </CardContent>
                        )}
                    </Card>
                )}

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
                                        {doc.validated_at && (
                                            <span className="text-xs text-emerald-600">
                                                Validée le {formatDateTime(doc.validated_at)}
                                                {doc.validated_by_name
                                                    ? ` par ${doc.validated_by_name}`
                                                    : ''}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={downloadDocument([request.id, doc.id]).url}>
                                                Télécharger
                                            </a>
                                        </Button>
                                        {doc.can_validate && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleValidateDocument(doc.id)}
                                            >
                                                Valider
                                            </Button>
                                        )}
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

            <Dialog open={deliverOpen} onOpenChange={setDeliverOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Acter la remise</DialogTitle>
                        <DialogDescription>
                            Vous pouvez joindre le reçu signé par l'étudiant (PDF/JPG/PNG, 5 Mo max).
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={handleDeliver}
                        className="flex flex-col gap-4"
                        encType="multipart/form-data"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="receipt">Reçu (optionnel)</Label>
                            <input
                                id="receipt"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="text-sm"
                                onChange={(e) =>
                                    deliverForm.setData('receipt', e.target.files?.[0] ?? null)
                                }
                            />
                            <InputError message={deliverForm.errors.receipt} />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDeliverOpen(false)}
                            >
                                Annuler
                            </Button>
                            <Button type="submit" disabled={deliverForm.processing}>
                                {deliverForm.processing && <Spinner />}
                                Confirmer la remise
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rejeter le dossier</DialogTitle>
                        <DialogDescription>
                            L'étudiant sera informé du motif. Cette action est définitive.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleReject} className="flex flex-col gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Motif du rejet</Label>
                            <textarea
                                id="reason"
                                rows={4}
                                className="flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                value={rejectForm.data.reason}
                                onChange={(e) => rejectForm.setData('reason', e.target.value)}
                                required
                                minLength={3}
                                maxLength={500}
                            />
                            <InputError message={rejectForm.errors.reason} />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setRejectOpen(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={rejectForm.processing}
                            >
                                {rejectForm.processing && <Spinner />}
                                Confirmer le rejet
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
