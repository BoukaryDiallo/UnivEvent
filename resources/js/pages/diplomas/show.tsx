import { Head, Link, router, useForm } from '@inertiajs/react';
import type { FormEvent} from 'react';
import { useRef } from 'react';
import {
    destroy as destroyDocument,
    download as downloadDocument,
    store as storeDocument,
} from '@/actions/App/Http/Controllers/DiplomaDocumentController';
import {
    exportPdf as exportRequest,
    submit as submitRequest,
} from '@/actions/App/Http/Controllers/DiplomaRequestController';
import {
    destroy as destroyAppointment,
    store as bookAppointment,
} from '@/actions/App/Http/Controllers/PickupAppointmentController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { index as diplomasIndex } from '@/routes/diplomas';
import type { BreadcrumbItem } from '@/types';
import { DiplomaStatusBadge } from './status-badge';

type Option = { value: string; label: string };

type DocumentRow = {
    id: number;
    type: string;
    type_label: string;
    original_name: string;
    size: number;
    validated_at: string | null;
    can_delete: boolean;
};

type EventRow = {
    id: number;
    from_status: string | null;
    to_status: string;
    actor_name: string | null;
    note: string | null;
    occurred_at: string;
};

type PickupSlot = {
    id: number;
    location: string;
    starts_at: string;
    ends_at: string;
    capacity: number;
    remaining: number;
};

type Appointment = {
    id: number;
    confirmed_at: string | null;
    can_cancel: boolean;
    slot: PickupSlot;
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
    };
    can: {
        addDocument: boolean;
        submit: boolean;
        book: boolean;
    };
    documentTypes: Option[];
    availableSlots: PickupSlot[];
};

const DIPLOMA_TYPE_LABEL: Record<string, string> = {
    licence: 'Licence',
    master: 'Master',
    doctorat: 'Doctorat',
};

const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

const formatSize = (bytes: number): string => {
    if (bytes < 1024) {
return `${bytes} o`;
}

    if (bytes < 1024 * 1024) {
return `${(bytes / 1024).toFixed(0)} Ko`;
}

    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

export default function DiplomaRequestShow({
    request,
    can,
    documentTypes,
    availableSlots,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Retraits de diplômes', href: diplomasIndex().url },
        { title: request.tracking_code, href: '#' },
    ];

    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadForm = useForm<{ type: string; file: File | null }>({
        type: documentTypes[0]?.value ?? '',
        file: null,
    });

    const handleUpload = (e: FormEvent) => {
        e.preventDefault();
        uploadForm.post(storeDocument(request.id).url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                uploadForm.reset('file');

                if (fileInputRef.current) {
fileInputRef.current.value = '';
}
            },
        });
    };

    const handleDelete = (documentId: number) => {
        if (!confirm('Supprimer cette pièce ?')) {
return;
}

        router.delete(destroyDocument([request.id, documentId]).url, {
            preserveScroll: true,
        });
    };

    const handleSubmit = () => {
        if (!confirm('Soumettre cette demande ? Vous ne pourrez plus la modifier.')) {
return;
}

        router.post(submitRequest(request.id).url, {}, { preserveScroll: true });
    };

    const handleBook = (slotId: number) => {
        if (!confirm('Réserver ce créneau ?')) {
return;
}

        router.post(bookAppointment([request.id, slotId]).url, {}, { preserveScroll: true });
    };

    const handleCancelAppointment = (appointmentId: number) => {
        if (!confirm('Annuler ce rendez-vous ?')) {
return;
}

        router.delete(destroyAppointment([request.id, appointmentId]).url, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Demande ${request.tracking_code}`} />

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
                    <div className="flex items-center gap-2">
                        {can.submit && (
                            <Button onClick={handleSubmit}>Soumettre la demande</Button>
                        )}
                        <Button variant="outline" asChild>
                            <a href={exportRequest(request.id).url}>Exporter PDF</a>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={diplomasIndex().url}>Retour à la liste</Link>
                        </Button>
                    </div>
                </div>

                {request.rejected_reason && (
                    <Card className="border-destructive/40 bg-destructive/5">
                        <CardHeader>
                            <CardTitle className="text-destructive">Demande rejetée</CardTitle>
                            <CardDescription className="text-destructive/80">
                                {request.rejected_reason}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pièces justificatives</CardTitle>
                                <CardDescription>
                                    {request.documents.length === 0
                                        ? 'Aucune pièce déposée pour le moment.'
                                        : `${request.documents.length} pièce(s) déposée(s).`}
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
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <a
                                                    href={downloadDocument([request.id, doc.id]).url}
                                                >
                                                    Télécharger
                                                </a>
                                            </Button>
                                            {doc.can_delete && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(doc.id)}
                                                >
                                                    Supprimer
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
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
                                {request.appointment.can_cancel && (
                                    <CardContent>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                handleCancelAppointment(request.appointment!.id)
                                            }
                                        >
                                            Annuler le rendez-vous
                                        </Button>
                                    </CardContent>
                                )}
                            </Card>
                        )}

                        {can.book && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Créneaux de retrait disponibles</CardTitle>
                                    <CardDescription>
                                        Votre dossier est prêt. Choisissez un créneau pour retirer
                                        votre diplôme.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-2">
                                    {availableSlots.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            Aucun créneau disponible pour le moment. Revenez plus
                                            tard.
                                        </p>
                                    ) : (
                                        availableSlots.map((slot) => (
                                            <div
                                                key={slot.id}
                                                className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {new Date(slot.starts_at).toLocaleString(
                                                            'fr-FR',
                                                            {
                                                                dateStyle: 'full',
                                                                timeStyle: 'short',
                                                            },
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {slot.location} · {slot.remaining} place(s)
                                                        restante(s)
                                                    </span>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleBook(slot.id)}
                                                >
                                                    Réserver
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {can.addDocument && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Déposer une pièce</CardTitle>
                                    <CardDescription>
                                        PDF, JPG ou PNG. 5 Mo maximum par fichier.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        onSubmit={handleUpload}
                                        className="flex flex-col gap-4"
                                        encType="multipart/form-data"
                                    >
                                        <div className="grid gap-2">
                                            <Label htmlFor="type">Type de pièce</Label>
                                            <Select
                                                value={uploadForm.data.type}
                                                onValueChange={(v) => uploadForm.setData('type', v)}
                                            >
                                                <SelectTrigger id="type" className="w-full">
                                                    <SelectValue placeholder="Sélectionner un type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {documentTypes.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={uploadForm.errors.type} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="file">Fichier</Label>
                                            <Input
                                                id="file"
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) =>
                                                    uploadForm.setData('file', e.target.files?.[0] ?? null)
                                                }
                                            />
                                            <InputError message={uploadForm.errors.file} />
                                        </div>
                                        <div>
                                            <Button
                                                type="submit"
                                                disabled={uploadForm.processing || !uploadForm.data.file}
                                            >
                                                {uploadForm.processing && <Spinner />}
                                                Téléverser
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Historique</CardTitle>
                            <CardDescription>Traçabilité des actions sur la demande.</CardDescription>
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
