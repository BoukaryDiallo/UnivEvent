import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle, Eye, XCircle, Search, Filter, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        search?: string;
        type?: string;
    };
};

export default function PendingEvents({ events, filters }: PendingEventsProps) {
    const [rejectReason, setRejectReason] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<EventSummary | null>(null);
    
    // Filter states
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || 'all');
    const [debouncedSearch] = useDebounce(search, 300);

    const updateFilters = useCallback(() => {
        router.get('/admin/events/pending', {
            search: debouncedSearch,
            type: type === 'all' ? undefined : type,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [debouncedSearch, type]);

    useEffect(() => {
        if (debouncedSearch !== filters.search || (type !== 'all' && type !== filters.type) || (type === 'all' && filters.type)) {
            updateFilters();
        }
    }, [debouncedSearch, type]);

    const resetFilters = () => {
        setSearch('');
        setType('all');
    };

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

                <div className="flex flex-col md:flex-row items-end gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 dark:bg-slate-950 dark:border-slate-800 shadow-sm">
                    <div className="flex-1 space-y-2 w-full">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Rechercher</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Titre de l'événement ou créateur..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-11 rounded-xl border-gray-100 focus:ring-indigo-600 transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="w-full md:w-64 space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Type</label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="h-11 rounded-xl border-gray-100 focus:ring-indigo-600">
                                <SelectValue placeholder="Tous les types" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">Tous les types</SelectItem>
                                <SelectItem value="conference">Conférence</SelectItem>
                                <SelectItem value="concours">Concours</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(search || type !== 'all') && (
                        <Button 
                            variant="ghost" 
                            onClick={resetFilters}
                            className="h-11 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Effacer
                        </Button>
                    )}
                </div>

                <div className="grid gap-6">
                    {events.data.map((event) => (
                        <Card key={event.id} className="overflow-hidden bg-white dark:bg-slate-950 border-gray-100 dark:border-slate-800 rounded-[2rem] shadow-sm">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <CardTitle className="text-xl font-bold">{event.titre}</CardTitle>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-medium text-indigo-600">Par {event.createur?.name ?? 'Createur inconnu'}</span>
                                            <Badge variant="outline" className="rounded-full uppercase text-[10px] font-bold px-3">{event.type}</Badge>
                                            <Badge variant="secondary" className="rounded-full uppercase text-[10px] font-bold px-3">{event.statut}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                            {new Date(event.date_debut).toLocaleDateString('fr-FR')}
                                            {event.lieu ? ` • ${event.lieu}` : ''}
                                        </p>
                                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 dark:bg-amber-950/20 px-3 py-1 rounded-full inline-block">
                                            {event.submitted_at
                                                ? `Soumis le ${new Date(event.submitted_at).toLocaleDateString('fr-FR')}`
                                                : 'Evenement non encore soumis'}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button asChild variant="outline" size="sm" className="rounded-xl border-gray-100">
                                            <Link href={`/evenements/${event.id}`}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Voir
                                            </Link>
                                        </Button>
                                        <Button
                                            onClick={() => approveEvent(event)}
                                            size="sm"
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Approuver
                                        </Button>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="rounded-xl font-bold"
                                                    onClick={() => setSelectedEvent(event)}
                                                >
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    Rejeter
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="rounded-[2.5rem]">
                                                <DialogHeader>
                                                    <DialogTitle className="text-xl font-black uppercase tracking-tight">Rejeter l'événement</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <p className="text-sm text-gray-500">Confirmez le rejet et indiquez un motif clair pour aider le créateur à corriger sa soumission.</p>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                                            Raison du rejet
                                                        </label>
                                                        <Textarea
                                                            value={rejectReason}
                                                            onChange={(e) => setRejectReason(e.target.value)}
                                                            placeholder="Expliquez pourquoi cet événement est rejeté..."
                                                            rows={4}
                                                            className="rounded-2xl border-gray-100 focus:ring-rose-500"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end gap-3 pt-4">
                                                        <Button variant="ghost" onClick={() => setSelectedEvent(null)} className="font-bold text-gray-400">
                                                            Annuler
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => selectedEvent && rejectEvent(selectedEvent)}
                                                            disabled={!rejectReason.trim()}
                                                            className="rounded-xl px-8 font-black uppercase tracking-widest text-xs"
                                                        >
                                                            Rejeter l'événement
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
                                        className="line-clamp-3 text-sm text-gray-500 dark:text-gray-400 italic"
                                        dangerouslySetInnerHTML={{ __html: event.description }}
                                    />
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>

                {/* Pagination */}
                {events.last_page > 1 && (
                    <div className="flex justify-center pt-8">
                        <nav className="flex items-center gap-2">
                            {events.links?.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`h-10 px-4 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                                        link.active 
                                        ? 'bg-indigo-600 text-white' 
                                        : link.url 
                                            ? 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400' 
                                            : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </nav>
                    </div>
                )}

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
