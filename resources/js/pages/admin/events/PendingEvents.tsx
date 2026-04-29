import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle, Eye, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, EventSummary } from '@/types';

type PendingEventsProps = {
    events: {
        data: EventSummary[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
};

export default function PendingEvents({ events }: PendingEventsProps) {
    const [rejectReason, setRejectReason] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<EventSummary | null>(null);

    const approveEvent = (event: EventSummary) => {
        router.post(`/admin/events/${event.id}/approve`, {}, {
            onSuccess: () => router.reload({ only: ['events'] }),
        });
    };

    const rejectEvent = (event: EventSummary) => {
        if (!rejectReason.trim()) {
            return;
        }

        router.post(`/admin/events/${event.id}/reject`, {
            reason: rejectReason,
        }, {
            onSuccess: () => {
                setRejectReason('');
                setSelectedEvent(null);
                router.reload({ only: ['events'] });
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Administration', href: '/admin' },
        { title: 'Evenements en attente', href: '/admin/events/pending' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Evenements en attente de validation" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Evenements en attente
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {events.total} evenement(s) en attente de validation
                        </p>
                    </div>
                </div>

                <div className="grid gap-6">
                    {events.data.map((event) => (
                        <Card key={event.id} className="overflow-hidden">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <CardTitle className="text-xl">{event.titre}</CardTitle>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <span>Par {event.createur?.name ?? 'Createur inconnu'}</span>
                                            <Badge variant="outline">{event.type}</Badge>
                                            <Badge variant="secondary">{event.statut}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(event.date_debut).toLocaleDateString('fr-FR')}
                                            {event.lieu ? ` • ${event.lieu}` : ''}
                                        </p>
                                        <p className="text-xs text-amber-700 dark:text-amber-300">
                                            {event.submitted_at
                                                ? `Soumis le ${new Date(event.submitted_at).toLocaleDateString('fr-FR')}`
                                                : 'Evenement non encore soumis par le createur'}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/evenements/${event.id}`}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Voir
                                            </Link>
                                        </Button>
                                        <Button
                                            onClick={() => approveEvent(event)}
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Approuver
                                        </Button>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setSelectedEvent(event)}
                                                >
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    Rejeter
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Rejeter l evenement</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <p>Confirmez le rejet et indiquez un motif clair pour aider le createur a corriger sa soumission.</p>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">
                                                            Raison du rejet
                                                        </label>
                                                        <Textarea
                                                            value={rejectReason}
                                                            onChange={(e) => setRejectReason(e.target.value)}
                                                            placeholder="Expliquez pourquoi cet evenement est rejete..."
                                                            rows={3}
                                                        />
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                                                            Annuler
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => selectedEvent && rejectEvent(selectedEvent)}
                                                            disabled={!rejectReason.trim()}
                                                        >
                                                            Rejeter
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </CardHeader>
                            {event.description && (
                                <CardContent className="pt-0">
                                    <div
                                        className="line-clamp-3 text-sm text-gray-700 dark:text-gray-300"
                                        dangerouslySetInnerHTML={{ __html: event.description }}
                                    />
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>

                {events.data.length === 0 && (
                    <div className="py-12 text-center">
                        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                        <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                            Aucun evenement en attente
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Les brouillons non soumis n apparaissent pas ici. Seules les soumissions finales du createur arrivent dans cette file.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
