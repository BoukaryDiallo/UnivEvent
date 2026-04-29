import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Edit, Eye, Filter, Plus, Search, Settings2, Trash2, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, EventSummary } from '@/types';

type EventWithManagement = EventSummary & {
    management_role?: 'createur' | 'organisateur' | null;
    can_manage?: boolean;
    can_edit?: boolean;
    can_delete?: boolean;
    can_submit?: boolean;
    rejection_reason?: string | null;
};

type Filters = {
    search: string;
    status: string;
    type: string;
    role: string;
};

type EventManagementProps = {
    mesEvenements: EventWithManagement[];
    isAdmin: boolean;
    allEventsForAdmin: EventWithManagement[];
    pendingEventsCount: number;
    filters?: Filters;
};

const validationBadge = (event: EventWithManagement) => {
    if (event.workflow_state === 'draft') return { label: 'Brouillon', variant: 'outline' as const };
    if (event.validation_status === 'approved') return { label: 'Valide', variant: 'default' as const };
    if (event.validation_status === 'rejected') return { label: 'Rejete', variant: 'destructive' as const };
    return { label: 'En validation', variant: 'secondary' as const };
};

export default function EventManagement({
    mesEvenements = [],
    isAdmin = false,
    pendingEventsCount = 0,
    filters,
}: EventManagementProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Evenements', href: '/evenements' },
        { title: 'Mes evenements', href: '/evenements/gestion' },
    ];

    const [searchTerm, setSearchTerm] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? 'all');
    const [typeFilter, setTypeFilter] = useState(filters?.type ?? 'all');
    const [roleFilter, setRoleFilter] = useState(filters?.role ?? 'all');

    const events = mesEvenements;

    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            if (searchTerm && !`${event.titre} ${event.description ?? ''} ${event.lieu ?? ''}`.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            if (statusFilter !== 'all') {
                const matchesValidation = ['pending', 'approved', 'rejected'].includes(statusFilter) && event.validation_status === statusFilter;
                const matchesPublication = event.statut === statusFilter;

                if (!matchesValidation && !matchesPublication) {
                    return false;
                }
            }

            if (typeFilter !== 'all' && event.type !== typeFilter) {
                return false;
            }

            if (roleFilter !== 'all' && event.management_role !== roleFilter) {
                return false;
            }

            return true;
        });
    }, [events, roleFilter, searchTerm, statusFilter, typeFilter]);

    const handleDelete = (id: number) => {
        if (confirm("Supprimer définitivement cet événement ?")) {
            router.delete(`/evenements/${id}`);
        }
    };

    const handleSubmitForValidation = (id: number) => {
        if (confirm("Soumettre cet événement à validation ?")) {
            router.post(`/evenements/${id}/submit-validation`);
        }
    };

    const publishedCount = events.filter((event) => event.statut === 'publie').length;
    const draftCount = events.filter((event) => event.workflow_state === 'draft').length;
    const pendingCount = events.filter((event) => event.workflow_state === 'pending').length;
    const rejectedCount = events.filter((event) => event.validation_status === 'rejected').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mes evenements" />

            <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Centre de pilotage</p>
                            <div>
                                <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Mes evenements</h1>
                                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                                    Retrouvez ici les événements que vous avez créés ou que vous pilotez comme organisateur, puis ouvrez l’espace de gestion complet pour les acteurs, le programme, les médias et la validation.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button asChild size="lg">
                                <Link href="/evenements/gestion/conferences">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Creer une conference
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <Link href="/evenements/gestion/concours">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Creer un concours
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-5">
                    <MetricCard label="Evenements" value={events.length} />
                    <MetricCard label="Publies" value={publishedCount} />
                    <MetricCard label="Brouillons" value={draftCount} />
                    <MetricCard label="En validation" value={pendingCount} emphasis />
                    <MetricCard label="Rejetes" value={rejectedCount} />
                </section>

                {isAdmin && pendingEventsCount > 0 ? (
                    <Card>
                        <CardContent className="pt-6 text-sm text-slate-600 dark:text-slate-300">
                            {pendingEventsCount} événement(s) sont actuellement en attente côté administration.
                        </CardContent>
                    </Card>
                ) : null}

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <CardTitle>Filtres intelligents</CardTitle>
                        </div>
                        <CardDescription>Filtrez par statut, type et rôle de pilotage pour garder une vue claire quand le volume augmente.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 lg:grid-cols-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Rechercher un evenement" className="pl-9" />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value="pending">Pending validation</SelectItem>
                                    <SelectItem value="approved">Valide</SelectItem>
                                    <SelectItem value="rejected">Rejete</SelectItem>
                                    <SelectItem value="publie">Publie</SelectItem>
                                    <SelectItem value="brouillon">Brouillon</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les types</SelectItem>
                                    <SelectItem value="conference">Conference</SelectItem>
                                    <SelectItem value="concours">Concours</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les roles</SelectItem>
                                    <SelectItem value="createur">Createur</SelectItem>
                                    <SelectItem value="organisateur">Organisateur</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Liste des evenements</CardTitle>
                        <CardDescription>{filteredEvents.length} événement(s) correspondent à votre vue actuelle.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Titre</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEvents.length ? filteredEvents.map((event) => {
                                        const badge = validationBadge(event);

                                        return (
                                            <TableRow key={event.id}>
                                                <TableCell className="align-top">
                                                    <div className="space-y-1">
                                                        <div className="font-medium text-slate-950 dark:text-white">{event.titre}</div>
                                                        {event.workflow_state === 'draft' ? (
                                                            <p className="max-w-md text-xs text-amber-600">
                                                                Cet evenement est encore en brouillon. Il ne sera visible par l administration qu apres soumission.
                                                            </p>
                                                        ) : null}
                                                        {event.rejection_reason ? (
                                                            <p className="max-w-md text-xs text-rose-600">Motif du rejet: {event.rejection_reason}</p>
                                                        ) : null}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={event.type === 'concours' ? 'default' : 'secondary'}>
                                                        {event.type === 'concours' ? <Trophy className="mr-1 h-3 w-3" /> : <Calendar className="mr-1 h-3 w-3" />}
                                                        {event.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{event.management_role ?? 'lecture'}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-2">
                                                        <Badge variant={badge.variant}>{badge.label}</Badge>
                                                        <div className="text-xs text-slate-500">{event.statut}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{new Date(event.date_debut).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button asChild size="sm" variant="outline">
                                                            <Link href={`/evenements/${event.id}`}>
                                                                <Eye className="mr-1 h-4 w-4" />
                                                                Voir
                                                            </Link>
                                                        </Button>
                                                        {event.can_manage ? (
                                                            <Button asChild size="sm">
                                                                <Link href={`/evenements/${event.id}/manage`}>
                                                                    <Settings2 className="mr-1 h-4 w-4" />
                                                                    Gerer
                                                                </Link>
                                                            </Button>
                                                        ) : null}
                                                        {event.can_edit ? (
                                                            <Button asChild size="sm" variant="outline">
                                                                <Link href={`/evenements/${event.id}/edit`}>
                                                                    <Edit className="mr-1 h-4 w-4" />
                                                                    Modifier
                                                                </Link>
                                                            </Button>
                                                        ) : null}
                                                        {event.can_submit && event.workflow_state !== 'pending' ? (
                                                            <Button size="sm" variant="outline" onClick={() => handleSubmitForValidation(event.id)}>
                                                                Soumettre
                                                            </Button>
                                                        ) : null}
                                                        {event.can_delete ? (
                                                            <Button size="sm" variant="outline" className="text-rose-600" onClick={() => handleDelete(event.id)}>
                                                                <Trash2 className="mr-1 h-4 w-4" />
                                                                Supprimer
                                                            </Button>
                                                        ) : null}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                                                Aucun événement ne correspond aux filtres actifs.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="grid gap-4 md:hidden">
                            {filteredEvents.length ? filteredEvents.map((event) => {
                                const badge = validationBadge(event);

                                return (
                                    <Card key={event.id} className="border-slate-200 dark:border-slate-800">
                                        <CardContent className="space-y-4 pt-6">
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between gap-3">
                                                    <h3 className="font-semibold text-slate-950 dark:text-white">{event.titre}</h3>
                                                    <Badge variant={badge.variant}>{badge.label}</Badge>
                                                </div>
                                                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                                                    <Badge variant="outline">{event.management_role ?? 'lecture'}</Badge>
                                                    <span>{new Date(event.date_debut).toLocaleDateString()}</span>
                                                </div>
                                                {event.workflow_state === 'draft' ? (
                                                    <p className="text-xs text-amber-600">
                                                        Brouillon non soumis. L administration ne le voit pas encore.
                                                    </p>
                                                ) : null}
                                                {event.rejection_reason ? <p className="text-xs text-rose-600">Motif du rejet: {event.rejection_reason}</p> : null}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/evenements/${event.id}`}>Voir</Link>
                                                </Button>
                                                {event.can_manage ? (
                                                    <Button asChild size="sm">
                                                        <Link href={`/evenements/${event.id}/manage`}>Gerer</Link>
                                                    </Button>
                                                ) : null}
                                                {event.can_edit ? (
                                                    <Button asChild size="sm" variant="outline">
                                                        <Link href={`/evenements/${event.id}/edit`}>Modifier</Link>
                                                    </Button>
                                                ) : null}
                                                {event.can_submit && event.workflow_state !== 'pending' ? (
                                                    <Button size="sm" variant="outline" onClick={() => handleSubmitForValidation(event.id)}>
                                                        Soumettre
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            }) : (
                                <div className="py-10 text-center text-slate-500">Aucun événement ne correspond aux filtres actifs.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function MetricCard({ label, value, emphasis = false }: { label: string; value: number; emphasis?: boolean }) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className={`text-3xl font-semibold ${emphasis ? 'text-amber-600' : 'text-slate-950 dark:text-white'}`}>{value}</div>
                <div className="mt-1 text-sm text-slate-500">{label}</div>
            </CardContent>
        </Card>
    );
}
