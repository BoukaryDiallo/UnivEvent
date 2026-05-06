import { Head, Link, router } from '@inertiajs/react';
import { CalendarIcon, UsersIcon, MapPinIcon, ClockIcon, PlusIcon, Search, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type EventIndexProps = {
    events: {
        data: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: any;
    auth: {
        user: any;
    };
};

export default function EventIndex({ events, filters, auth }: EventIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statut, setStatut] = useState(filters.statut || 'all');
    const [debouncedSearch] = useDebounce(search, 300);

    const updateFilters = useCallback(() => {
        router.get('/module5/events', {
            search: debouncedSearch,
            statut: statut === 'all' ? undefined : statut,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [debouncedSearch, statut]);

    useEffect(() => {
        if (debouncedSearch !== filters.search || (statut !== 'all' && statut !== filters.statut) || (statut === 'all' && filters.statut)) {
            updateFilters();
        }
    }, [debouncedSearch, filters.search, filters.statut, statut, updateFilters]);

    const resetFilters = () => {
        setSearch('');
        setStatut('all');
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Module 5', href: '/module5/dashboard' },
        { title: 'Événements', href: '/module5/events' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Événements" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Événements</h1>
                        <p className="text-muted-foreground">
                            Découvrez et participez aux événements disponibles
                        </p>
                    </div>
                    {auth.user && (
                        <Button asChild>
                            <Link href="/module5/events/create">
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Créer un événement
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row items-end gap-4 bg-white p-6 rounded-4xl border border-gray-100 dark:bg-slate-950 dark:border-slate-800 shadow-sm">
                    <div className="flex-1 space-y-2 w-full">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Rechercher</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Titre, description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-11 rounded-xl border-gray-100 focus:ring-indigo-600 transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="w-full md:w-64 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Statut</label>
                        <Select value={statut} onValueChange={setStatut}>
                            <SelectTrigger className="h-11 rounded-xl border-gray-100 focus:ring-indigo-600">
                                <SelectValue placeholder="Tous les statuts" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                <SelectItem value="publie">Publiés</SelectItem>
                                <SelectItem value="brouillon">Brouillons</SelectItem>
                                <SelectItem value="en_attente">En attente</SelectItem>
                                <SelectItem value="cloture">Clôturés</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(search || statut !== 'all') && (
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

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events?.data?.map((event) => (
                        <Card key={event.id} className="group hover:shadow-xl transition-all duration-300 rounded-[2.5rem] border-0 shadow-sm overflow-hidden flex flex-col dark:bg-slate-950 dark:border dark:border-slate-800">
                            {/* Image Header */}
                            <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                                {event.cover_url ? (
                                    <img 
                                        src={event.cover_url} 
                                        alt={event.titre} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
                                        <CalendarIcon className="h-12 w-12 text-indigo-100 dark:text-slate-700" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 flex flex-col gap-2">
                                    <Badge 
                                        className={`rounded-full uppercase text-[9px] font-black px-3 py-1 border-0 shadow-sm ${
                                            event.statut === 'publie' ? 'bg-emerald-500 text-white' : 
                                            event.statut === 'brouillon' ? 'bg-slate-500 text-white' : 'bg-amber-500 text-white'
                                        }`}
                                    >
                                        {event.workflow_state_label || event.statut}
                                    </Badge>
                                    {event.statut === 'brouillon' && (
                                        <Badge className="bg-white text-rose-600 border-0 uppercase text-[8px] font-black shadow-sm">
                                            ⚠️ Action requise
                                        </Badge>
                                    )}
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] font-black uppercase tracking-tight rounded-xl px-3 border-0">
                                        {event.type}
                                    </Badge>
                                </div>
                            </div>

                            <CardHeader className="p-6 pb-2">
                                <CardTitle className="text-xl font-black text-gray-900 dark:text-white line-clamp-1 uppercase tracking-tight">
                                    {event.titre}
                                </CardTitle>
                                <div className="flex flex-col gap-1.5 mt-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <CalendarIcon className="h-3 w-3" />
                                        {event.date_debut ? new Date(event.date_debut).toLocaleDateString('fr-FR') : 'Non définie'}
                                    </div>
                                    {event.lieu && (
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <MapPinIcon className="h-3 w-3" />
                                            {event.lieu}
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            
                            <CardContent className="p-6 pt-2 flex-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-6">
                                    {event.plain_description || 'Aucune description disponible.'}
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 group/stat">
                                            <UsersIcon className="h-4 w-4 text-indigo-500" />
                                            <span className="text-xs font-black text-gray-900 dark:text-white">{event.participants_count || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 group/stat">
                                            <ClockIcon className="h-4 w-4 text-purple-500" />
                                            <span className="text-xs font-black text-gray-900 dark:text-white">{event.comments_count || 0}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        {(auth.user?.id === event.createur?.id || auth.user?.role === 'admin') && (
                                            <Button variant="ghost" size="sm" asChild className="rounded-xl h-9 px-4 font-black text-[10px] uppercase tracking-widest text-indigo-600 hover:bg-indigo-50">
                                                <Link href={`/module5/events/${event.id}/manage`}>
                                                    Gérer
                                                </Link>
                                            </Button>
                                        )}
                                        <Button size="sm" asChild className="rounded-xl h-9 px-4 font-black text-[10px] uppercase tracking-widest bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-200">
                                            <Link href={`/module5/events/${event.id}`}>
                                                Détails
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )) || []}
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
                                        ? 'bg-indigo-600 text-white shadow-lg' 
                                        : link.url 
                                            ? 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400' 
                                            : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </nav>
                    </div>
                )}

                {(!events?.data || events.data.length === 0) && (
                    <div className="text-center py-24 bg-gray-50 rounded-[3rem] dark:bg-slate-900/50">
                        <CalendarIcon className="mx-auto h-12 w-12 text-gray-200" />
                        <h3 className="mt-4 text-lg font-black uppercase tracking-tight">Aucun événement trouvé</h3>
                        <p className="text-muted-foreground text-sm max-w-md mx-auto">
                            Modifiez vos filtres ou créez un nouvel événement.
                        </p>
                        {auth.user && (
                            <Button className="mt-6 rounded-xl px-8 font-bold" asChild>
                                <Link href="/module5/events/create">
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Créer un événement
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}