import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { SearchIcon, SlidersHorizontalIcon, PlusIcon, CalendarIcon, LayoutGridIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EventCard from '@/components/m5/EventCard';
import RegistrationModal from '@/components/m5/RegistrationModal';
import useEventFilters from '@/hooks/useEventFilters';
import type { PaginatedEvents, EventSummary } from '@/types/evenements';

type EventsIndexProps = {
    events: PaginatedEvents;
    filters: any;
    auth: { user: any };
    flash: { success?: string; error?: string };
};

export default function EventsIndex({ events, filters: initialFilters, auth, flash }: EventsIndexProps) {
    const { filters, setFilter, resetFilters, isFiltered } = useEventFilters(initialFilters);
    const [selectedEvent, setSelectedEvent] = useState<EventSummary | null>(null);
    const [isRegModalOpen, setIsRegModalOpen] = useState(false);

    const handleRegister = (eventId: number) => {
        const event = events.data.find(e => e.id === eventId);
        if (event) {
            setSelectedEvent(event);
            setIsRegModalOpen(true);
        }
    };

    const breadcrumbs = [
        { title: 'UnivEvent', href: '/' },
        { title: 'Événements', href: '/m5/events' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fil d'Événements - UnivEvent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            Événements
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                            Découvrez les {events.total} conférences et concours de l'UJKZ
                        </p>
                    </div>

                    {(auth.user?.role_rbac === 'organisateur' || auth.user?.role_rbac === 'admin') && (
                        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6">
                            <Link href="/m5/events/create">
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Créer un événement
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Filters Section */}
                <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-gray-100 dark:bg-slate-950/80 dark:border-slate-800">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder="Rechercher par titre, lieu ou intervenant..." 
                                className="pl-10 h-11 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors dark:bg-slate-900 dark:border-slate-800"
                                value={filters.search}
                                onChange={(e) => setFilter('search', e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Type Filter */}
                            <div className="flex bg-gray-100 p-1 rounded-2xl dark:bg-slate-900">
                                {['all', 'conference', 'concours'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFilter('type', type)}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                                            filters.type === type 
                                            ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800' 
                                            : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'
                                        }`}
                                    >
                                        {type === 'all' ? 'Tous' : type === 'conference' ? 'Conférences' : 'Concours'}
                                    </button>
                                ))}
                            </div>

                            <Button 
                                variant="outline" 
                                className="h-11 rounded-2xl border-gray-200 dark:border-slate-800"
                                onClick={() => {/* Toggle Advanced Filters */}}
                            >
                                <SlidersHorizontalIcon className="mr-2 h-4 w-4" />
                                Filtres
                            </Button>

                            {isFiltered && (
                                <Button 
                                    variant="ghost" 
                                    className="h-11 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                    onClick={resetFilters}
                                >
                                    Réinitialiser
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Events Grid */}
                {events.data.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {events.data.map((event) => (
                            <EventCard 
                                key={event.id} 
                                event={event} 
                                isRegistered={!!event.participation}
                                onRegister={handleRegister}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                        <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center dark:bg-slate-900">
                            <LayoutGridIcon className="h-10 w-10 text-gray-200" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Aucun événement trouvé</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 max-w-xs mx-auto">
                                Nous n'avons pas trouvé d'événements correspondant à vos critères de recherche.
                            </p>
                        </div>
                        <Button variant="outline" className="rounded-2xl" onClick={resetFilters}>
                            Voir tous les événements
                        </Button>
                    </div>
                )}

                {/* Pagination */}
                {events.last_page > 1 && (
                    <div className="flex justify-center pt-8">
                        <nav className="flex items-center gap-2">
                            {events.links.map((link, i) => (
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
            </div>

            <RegistrationModal 
                isOpen={isRegModalOpen}
                onClose={() => setIsRegModalOpen(false)}
                event={selectedEvent}
                isRegistered={!!selectedEvent?.participation}
                isFull={selectedEvent ? (selectedEvent.capacite_max ? selectedEvent.participants_count >= selectedEvent.capacite_max : false) : false}
            />
        </AppLayout>
    );
}
