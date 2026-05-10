import { Head, Link, router } from '@inertiajs/react';
import { Search, X, Users, Calendar, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type ParticipantsProps = {
    inscriptions: {
        data: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        search?: string;
        statut?: string;
    };
};

export default function Participants({ inscriptions, filters }: ParticipantsProps) {
    // Filter states
    const [search, setSearch] = useState(filters.search || '');
    const [statut, setStatut] = useState(filters.statut || 'all');
    const [debouncedSearch] = useDebounce(search, 300);

    const updateFilters = useCallback(() => {
        router.get('/admin/participants', {
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
        { title: 'Administration', href: '/admin' },
        { title: 'Gestion des Participants', href: '/admin/participants' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion Globale des Participants" />

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-full">
                            <Link href="/admin">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                                Participants & Inscriptions
                            </h1>
                            <p className="text-sm text-gray-500">Vue d'ensemble de tous les inscrits à travers les événements.</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row items-end gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 dark:bg-slate-950 dark:border-slate-800 shadow-sm">
                    <div className="flex-1 space-y-2 w-full">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Rechercher</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Nom, email ou titre de l'événement..."
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
                                <SelectItem value="accepte">Accepté</SelectItem>
                                <SelectItem value="en_attente">En attente</SelectItem>
                                <SelectItem value="refuse">Refusé</SelectItem>
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

                {/* List */}
                <Card className="rounded-[2.5rem] border-0 shadow-sm overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-slate-900">
                                <TableRow className="border-0">
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest px-6 h-12">Utilisateur</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest px-6 h-12">Événement</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest px-6 h-12">Date d'inscription</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest px-6 h-12 text-center">Statut</TableHead>
                                    <TableHead className="px-6 h-12 text-right"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inscriptions.data.map((ins) => (
                                    <TableRow key={ins.id} className="border-gray-50 dark:border-slate-800 hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                                                    {ins.utilisateur?.name?.charAt(0)}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{ins.utilisateur?.name}</p>
                                                    <p className="text-xs text-gray-400">{ins.utilisateur?.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 font-medium text-sm text-gray-600 dark:text-gray-400">
                                            <Link href={`/module5/events/${ins.evenement_id}`} className="hover:text-indigo-600 underline decoration-indigo-200 underline-offset-4">
                                                {ins.evenement?.titre}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                                            {new Date(ins.created_at).toLocaleDateString('fr-FR')}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <Badge 
                                                className={`rounded-full uppercase text-[9px] font-black px-3 py-1 border-0 ${
                                                    ins.statut === 'accepte' ? 'bg-emerald-100 text-emerald-700' :
                                                    ins.statut === 'en_attente' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-rose-100 text-rose-700'
                                                }`}
                                            >
                                                {ins.statut}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" asChild className="rounded-xl font-bold text-xs text-indigo-600">
                                                <Link href={`/module5/events/${ins.evenement_id}/manage`}>
                                                    Gérer
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {inscriptions.last_page > 1 && (
                    <div className="flex justify-center pt-8">
                        <nav className="flex items-center gap-2">
                            {inscriptions.links?.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`h-10 px-4 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                                        link.active 
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                        : link.url 
                                            ? 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400' 
                                            : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </nav>
                    </div>
                )}

                {inscriptions.data.length === 0 && (
                    <div className="py-24 text-center bg-gray-50 rounded-[3rem] dark:bg-slate-900/50">
                        <Users className="mx-auto mb-4 h-12 w-12 text-gray-200" />
                        <h3 className="mb-2 text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            Aucun participant trouvé
                        </h3>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">
                            Aucune inscription ne correspond à vos critères de recherche.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
