import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Plus, Eye, Edit, Trash2, Search, Filter, X, ArrowLeft } from 'lucide-react';
import { useState, useMemo } from 'react';
import { RegistrationChart } from '@/components/evenements/RegistrationChart';
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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, EventSummary } from '@/types';

type EventWithCreator = EventSummary & {
    createur?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
};

type ConferenceManagementProps = {
    mesEvenements: EventWithCreator[];
    isAdmin: boolean;
    allEventsForAdmin: EventWithCreator[];
    pendingEventsCount: number;
};

export default function ConferenceManagement({
    mesEvenements = [],
    isAdmin = false,
    allEventsForAdmin = [],
    pendingEventsCount = 0,
}: ConferenceManagementProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Événements', href: '/evenements' },
        { title: 'Gestion', href: '/evenements/gestion' },
        { title: 'Conférences', href: '/evenements/gestion/conferences' },
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [creatorFilter, setCreatorFilter] = useState<string>('');

    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette conférence ? Cette action est irréversible.')) {
            router.delete(`/evenements/${id}`);
        }
    };

    // Determine which events to show based on admin status
    const allEvents = isAdmin ? allEventsForAdmin : mesEvenements;

    // Filter events
    const filteredEvents = useMemo(() => {
        return allEvents.filter((event) => {
            // Search filter
            if (searchTerm && !event.titre.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            // Status filter
            if (statusFilter !== 'all' && event.statut !== statusFilter) {
                return false;
            }

            // Date filter
            if (dateFilter !== 'all') {
                const eventDate = new Date(event.date_debut);
                const now = new Date();

                if (dateFilter === 'past' && eventDate >= now) {
return false;
}

                if (dateFilter === 'upcoming' && eventDate < now) {
return false;
}

                if (dateFilter === 'today' && eventDate.toDateString() !== now.toDateString()) {
return false;
}
            }

            // Creator filter (admin only)
            if (isAdmin && creatorFilter && event.createur?.name !== creatorFilter) {
                return false;
            }

            return true;
        });
    }, [allEvents, searchTerm, statusFilter, dateFilter, creatorFilter, isAdmin]);

    const uniqueCreators = useMemo(() => {
        if (!isAdmin) {
return [];
}

        return [...new Set(allEvents.map((e) => e.createur?.name).filter(Boolean))];
    }, [allEvents, isAdmin]);

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDateFilter('all');
        setCreatorFilter('');
    };

    const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateFilter !== 'all' || creatorFilter;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Conférences" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/evenements/gestion">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Conférences
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Gérez vos conférences avec intervenants et programme détaillé
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button asChild size="lg" className="rounded-full">
                        <Link href="/evenements/create/conference">
                            <Plus className="h-5 w-5 mr-2" />
                            Nouvelle conférence
                        </Link>
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold">{allEvents.length}</div>
                            <div className="text-sm text-gray-500">Total</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold">{allEvents.filter((e) => e.statut === 'publie').length}</div>
                            <div className="text-sm text-gray-500">Publiées</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold">{allEvents.filter((e) => new Date(e.date_debut) > new Date()).length}</div>
                            <div className="text-sm text-gray-500">À venir</div>
                        </CardContent>
                    </Card>
                    {isAdmin && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold text-amber-600">{pendingEventsCount}</div>
                                <div className="text-sm text-gray-500">En attente</div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Registration Chart */}
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <RegistrationChart
                            data={[
                                { label: 'Lundi', date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], inscriptions: 5 },
                                { label: 'Mardi', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], inscriptions: 8 },
                                { label: 'Mercredi', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], inscriptions: 12 },
                                { label: 'Jeudi', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], inscriptions: 15 },
                                { label: 'Vendredi', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], inscriptions: 18 },
                                { label: 'Samedi', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], inscriptions: 22 },
                                { label: 'Dimanche', date: new Date().toISOString().split('T')[0], inscriptions: 25 },
                            ]}
                        />
                    </div>
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-green-600">
                                    +{allEvents.reduce((sum, event) => sum + event.participants_count, 0)}
                                </div>
                                <div className="text-sm text-gray-500">Inscriptions totales</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-blue-600">
                                    {Math.round(allEvents.reduce((sum, event) => sum + event.participants_count, 0) / Math.max(allEvents.length, 1))}
                                </div>
                                <div className="text-sm text-gray-500">Moyenne par événement</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                <CardTitle className="text-lg">Filtres</CardTitle>
                            </div>
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters}>
                                    <X className="h-4 w-4 mr-1" />
                                    Réinitialiser
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="lg:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Rechercher par nom..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value="brouillon">Brouillon</SelectItem>
                                    <SelectItem value="publie">Publié</SelectItem>
                                    <SelectItem value="en_cours">En cours</SelectItem>
                                    <SelectItem value="cloture">Clôturé</SelectItem>
                                    <SelectItem value="archive">Archivé</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={dateFilter} onValueChange={setDateFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Période" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Toutes les dates</SelectItem>
                                    <SelectItem value="today">Aujourd'hui</SelectItem>
                                    <SelectItem value="upcoming">À venir</SelectItem>
                                    <SelectItem value="past">Passé</SelectItem>
                                </SelectContent>
                            </Select>
                            {isAdmin && (
                                <Select value={creatorFilter} onValueChange={setCreatorFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Créateur" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Tous les créateurs</SelectItem>
                                        {uniqueCreators.map((creator) => (
                                            <SelectItem key={creator} value={creator}>
                                                {creator}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Events List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                            {isAdmin ? 'Toutes les conférences' : 'Mes conférences'}
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({filteredEvents.length} résultat{filteredEvents.length > 1 ? 's' : ''})
                            </span>
                        </h2>
                    </div>

                    <div className="grid gap-3">
                        {filteredEvents.length > 0 ? (
                            filteredEvents.map((event) => (
                                <ConferenceCard
                                    key={event.id}
                                    event={event}
                                    onDelete={handleDelete}
                                    isAdmin={isAdmin}
                                />
                            ))
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="py-10 text-center">
                                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {hasActiveFilters
                                            ? 'Aucune conférence ne correspond aux filtres.'
                                            : 'Aucune conférence trouvée.'}
                                    </p>
                                    <Button asChild className="mt-4">
                                        <Link href="/evenements/create/conference">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Créer votre première conférence
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// Conference Card Component
function ConferenceCard({
    event,
    onDelete,
    isAdmin,
}: {
    event: EventWithCreator;
    onDelete: (id: number) => void;
    isAdmin: boolean;
}) {
    return (
        <Card className="hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-900 dark:text-white">{event.titre}</h3>
                            <Badge
                                variant={event.statut === 'publie' ? 'default' : 'secondary'}
                                className="text-[10px] h-4"
                            >
                                {event.statut}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>{new Date(event.date_debut).toLocaleDateString()}</span>
                            {event.lieu && <span>📍 {event.lieu}</span>}
                            {event.participants_count !== undefined && (
                                <span>👥 {event.participants_count} participant(s)</span>
                            )}
                            {isAdmin && event.createur && (
                                <span className="flex items-center gap-1">
                                    • {event.createur.name}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button asChild variant="ghost" size="sm">
                        <Link href={`/evenements/${event.id}`}>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                        <Link href={`/evenements/${event.id}/edit`}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(event.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
