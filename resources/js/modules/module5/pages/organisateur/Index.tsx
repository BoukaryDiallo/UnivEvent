import { Head, Link, router } from '@inertiajs/react';
import { 
    CalendarCheckIcon, 
    ClockIcon, 
    UsersIcon, 
    ListOrderedIcon, 
    PlusIcon,
    ArrowRightIcon,
    MoreHorizontalIcon,
    BarChart3Icon,
    UserIcon,
    DownloadIcon,
    CheckCircle2Icon,
    ArrowLeftIcon,
    CalendarIcon,
    MapPinIcon,
    ActivityIcon,
    XCircleIcon,
    CheckIcon,
    AlertCircleIcon
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { EventBadge } from '@/modules/module5/components/EventBadge';

type OrganizerDashboardProps = {
    mes_evenements: any[];
    inscriptions: any[];
    stats: {
        total_events: number;
        total_inscriptions: number;
        upcoming_count: number;
        validation_rate: number;
    };
    prochains_evenements: any[];
    actualites: any[];
};

export default function OrganizerDashboard({ mes_evenements, inscriptions, stats, prochains_evenements, actualites }: OrganizerDashboardProps) {
    const [view, setView] = useState<'overview' | 'events' | 'inscriptions' | 'upcoming' | 'analytics' | 'news'>('overview');
    const [selectedParticipant, setSelectedParticipant] = useState<any | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/module5/dashboard' },
        { title: view === 'overview' ? 'Gestionnaire' : view === 'inscriptions' ? 'Inscriptions' : 'Événements', href: '#' },
    ];

    const handleApprove = (id: number) => {
        setIsProcessing(true);
        router.patch(`/inscriptions/${id}/valider`, {}, { 
            onSuccess: () => {
                setSelectedParticipant(null);
                setIsProcessing(false);
            },
            onError: () => setIsProcessing(false),
            preserveScroll: true
        });
    };

    const handleReject = (id: number) => {
        if (confirm('Refuser cette candidature ?')) {
            setIsProcessing(true);
            router.patch(`/inscriptions/${id}/refuser`, {}, { 
                onSuccess: () => {
                    setSelectedParticipant(null);
                    setIsProcessing(false);
                },
                onError: () => setIsProcessing(false),
                preserveScroll: true
            });
        }
    };

    const handleBatchApprove = () => {
        if (selectedIds.length === 0) return;
        if (confirm(`Valider les ${selectedIds.length} inscriptions sélectionnées ?`)) {
            selectedIds.forEach(id => {
                router.patch(`/inscriptions/${id}/valider`, {}, { preserveScroll: true });
            });
            setSelectedIds([]);
        }
    };

    const handleAutoFill = (event: any) => {
        const availableSeats = event.capacite_max - event.participants_count;
        if (availableSeats <= 0 && event.capacite_max) {
            alert('La capacité maximale est déjà atteinte.');
            return;
        }

        const pending = inscriptions.filter(i => i.event_id === event.id && i.statut === 'en_attente');
        const toApprove = event.capacite_max ? pending.slice(0, availableSeats) : pending;

        if (toApprove.length === 0) {
            alert('Aucun candidat en attente pour cet événement.');
            return;
        }

        if (confirm(`Valider automatiquement les ${toApprove.length} premiers inscrits pour "${event.titre}" ?`)) {
            toApprove.forEach(i => router.patch(`/inscriptions/${i.id}/valider`, {}, { preserveScroll: true }));
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === inscriptions.filter(i => i.statut === 'en_attente').length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(inscriptions.filter(i => i.statut === 'en_attente').map(i => i.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion Événements - UnivEvent" />

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        {view !== 'overview' && (
                            <Button variant="ghost" size="icon" onClick={() => setView('overview')} className="rounded-full">
                                <ArrowLeftIcon className="h-5 w-5" />
                            </Button>
                        )}
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                                {view === 'overview' ? 'Console Organisateur' : view === 'inscriptions' ? 'Gestion des Inscriptions' : 'Mes Événements'}
                            </h1>
                            <p className="text-sm text-gray-500 font-medium">Contrôlez vos inscriptions et gérez vos événements.</p>
                        </div>
                    </div>
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 h-12 shadow-lg">
                        <Link href="/module5/events/create">
                            <PlusIcon className="mr-2 h-5 w-5" /> Créer
                        </Link>
                    </Button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InteractiveStatCard title="Événements" value={stats.total_events} hint="Mes créations" icon={<CalendarCheckIcon className="h-6 w-6" />} color="bg-indigo-600" active={view === 'events'} onClick={() => setView('events')} />
                    <InteractiveStatCard title="Inscriptions" value={stats.total_inscriptions} hint="Candidatures reçues" icon={<UsersIcon className="h-6 w-6" />} color="bg-emerald-600" active={view === 'inscriptions'} onClick={() => setView('inscriptions')} />
                    <InteractiveStatCard title="À venir" value={stats.upcoming_count} hint="Rendez-vous" icon={<ClockIcon className="h-6 w-6" />} color="bg-amber-500" active={view === 'upcoming'} onClick={() => setView('upcoming')} />
                    <InteractiveStatCard title="Actualités" value={actualites.length} hint="Nouveaux flux" icon={<Bell className="h-6 w-6" />} color="bg-rose-500" active={view === 'news'} onClick={() => setView('news')} />
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {view === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-2 space-y-10">
                                <ActualitesFeed activities={actualites} title="Actualités de mes événements" showSearch={false} />
                            </div>
                            <div className="space-y-6">
                                <SectionHeader title="Événements proches" onSeeAll={() => setView('upcoming')} />
                                <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
                                    <div className="space-y-6">
                                        {prochains_evenements.slice(0, 4).map((event) => (
                                            <div key={event.id} className="flex gap-4">
                                                <div className="h-12 w-12 bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center shrink-0 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                                                    <span className="text-[9px] font-black text-indigo-600 uppercase">{new Date(event.date_debut).toLocaleDateString('fr', {month: 'short'})}</span>
                                                    <span className="text-lg font-black leading-none">{new Date(event.date_debut).getDate()}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{event.titre}</p>
                                                    <p className="text-[9px] text-gray-400 uppercase font-bold">{event.lieu || 'Non défini'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'news' && (
                        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <ActualitesFeed activities={actualites} title="Historique d'activité" />
                        </div>
                    )}

                    {view === 'upcoming' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight px-2">Prochains Événements</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {prochains_evenements.map((event) => (
                                    <div key={event.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex gap-4 items-center dark:bg-slate-950">
                                        <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex flex-col items-center justify-center text-white shrink-0">
                                            <span className="text-[10px] font-black uppercase">{new Date(event.date_debut).toLocaleDateString('fr', {month: 'short'})}</span>
                                            <span className="text-xl font-black">{new Date(event.date_debut).getDate()}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-gray-900 dark:text-white truncate uppercase">{event.titre}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{event.lieu || 'En ligne'}</p>
                                            <Link href={`/module5/events/${event.id}/manage`} className="text-[10px] font-black text-indigo-600 hover:underline uppercase mt-2 block">Administrer</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {view === 'inscriptions' && (
                        <div className="space-y-8">
                            {/* Toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 mr-2">
                                        <Checkbox 
                                            checked={selectedIds.length > 0 && selectedIds.length === inscriptions.filter(i => i.statut === 'en_attente').length}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Sélectionner tout</span>
                                    </div>
                                    {selectedIds.length > 0 && (
                                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 font-bold text-xs uppercase" onClick={handleBatchApprove}>
                                            Valider les {selectedIds.length} sélectionnés
                                        </Button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {mes_evenements.filter(e => e.statut === 'publie').map(event => (
                                        <Button key={event.id} variant="outline" size="sm" className="rounded-xl font-black text-[9px] uppercase tracking-widest border-indigo-100 text-indigo-600 hover:bg-indigo-50" onClick={() => handleAutoFill(event)}>
                                            Valider auto: {event.titre.substring(0, 15)}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Table */}
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden dark:bg-slate-950 dark:border-slate-800">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
                                        <tr>
                                            <th className="px-8 py-5 w-10"></th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Participant</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Événement</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Statut</th>
                                            <th className="px-8 py-5 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-slate-900">
                                        {inscriptions.map((ins) => (
                                            <tr key={ins.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={() => setSelectedParticipant(ins)}>
                                                <td className="px-8 py-6" onClick={(e) => e.stopPropagation()}>
                                                    {ins.statut === 'en_attente' && (
                                                        <Checkbox 
                                                            checked={selectedIds.includes(ins.id)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) setSelectedIds([...selectedIds, ins.id]);
                                                                else setSelectedIds(selectedIds.filter(id => id !== ins.id));
                                                            }}
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                                                            {ins.user.name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-gray-900 dark:text-white">{ins.user.name}</p>
                                                            <p className="text-[10px] text-gray-400">{ins.user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-xs font-bold text-gray-500 uppercase">{ins.event_title}</p>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <EventBadge status={ins.statut} size="sm" />
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <Button variant="ghost" className="rounded-lg h-8 text-indigo-600 font-bold text-[10px] uppercase tracking-widest" onClick={(e) => { e.stopPropagation(); setSelectedParticipant(ins); }}>Gérer</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {view === 'events' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {mes_evenements.map((event) => (
                                <Card key={event.id} className="rounded-[2.5rem] border-0 shadow-sm overflow-hidden hover:shadow-xl transition-all group dark:bg-slate-950 dark:border dark:border-slate-800">
                                    <div className="h-32 bg-gray-100 relative">
                                        {event.cover_url ? <img src={event.cover_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-linear-to-br from-indigo-500/20 to-purple-500/20" />}
                                        <div className="absolute top-4 right-4"><EventBadge status={event.statut} size="sm" /></div>
                                    </div>
                                    <CardContent className="p-8 space-y-6">
                                        <div className="space-y-2">
                                            <Badge variant="outline" className="rounded-full text-[8px] font-black uppercase border-gray-100">{event.type}</Badge>
                                            <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight line-clamp-1">{event.titre}</h4>
                                        </div>
                                        <div className="flex items-center gap-6 pt-2">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase"><UsersIcon className="h-4 w-4" /> {event.participants_count}</div>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase"><ActivityIcon className="h-4 w-4" /> {event.comments_count}</div>
                                        </div>
                                        <div className="pt-4 flex gap-2">
                                            <Button asChild className="flex-1 rounded-xl bg-gray-900 hover:bg-black text-xs font-bold uppercase h-11">
                                                <Link href={`/module5/events/${event.id}/manage`}>Gérer</Link>
                                            </Button>
                                            <Button variant="outline" asChild size="icon" className="h-11 w-11 rounded-xl">
                                                <Link href={`/module5/events/${event.id}`}><ArrowRightIcon className="h-4 w-4" /></Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            <Dialog open={!!selectedParticipant} onOpenChange={() => setSelectedParticipant(null)}>
                <DialogContent className="sm:max-w-xl rounded-[3rem] p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="h-32 bg-linear-to-br from-indigo-600 to-indigo-800 relative">
                        <div className="absolute -bottom-8 left-8 p-1 bg-white rounded-[2rem] dark:bg-slate-900">
                            <div className="h-20 w-20 bg-indigo-100 rounded-[1.8rem] flex items-center justify-center text-2xl font-black text-indigo-600">{selectedParticipant?.user.name[0]}</div>
                        </div>
                    </div>
                    <div className="p-10 pt-12 space-y-8">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{selectedParticipant?.user.name}</h3>
                                <p className="text-sm font-medium text-gray-500">{selectedParticipant?.user.email}</p>
                            </div>
                            <EventBadge status={selectedParticipant?.statut} size="md" />
                        </div>
                        <div className="grid grid-cols-2 gap-8 bg-gray-50 p-6 rounded-3xl dark:bg-slate-900">
                            <DetailItem label="Inscription" value={selectedParticipant?.registered_at} icon={<CalendarIcon className="h-3.5 w-3.5" />} />
                            <DetailItem label="Événement" value={selectedParticipant?.event_title} icon={<ActivityIcon className="h-3.5 w-3.5" />} />
                        </div>
                        <div className="flex gap-3">
                            {selectedParticipant?.statut === 'en_attente' ? (
                                <>
                                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-14 font-black uppercase text-xs shadow-lg shadow-emerald-100" onClick={() => handleApprove(selectedParticipant.id)} disabled={isProcessing}>
                                        <CheckIcon className="mr-2 h-4 w-4" /> Accepter
                                    </Button>
                                    <Button variant="outline" className="flex-1 rounded-2xl h-14 font-black text-rose-500 border-rose-50 hover:bg-rose-50 hover:border-rose-100 uppercase text-xs" onClick={() => handleReject(selectedParticipant.id)} disabled={isProcessing}>
                                        <XCircleIcon className="mr-2 h-4 w-4" /> Refuser
                                    </Button>
                                </>
                            ) : (
                                <Button variant="outline" className="w-full rounded-2xl h-14 font-black text-gray-400 uppercase text-xs border-gray-100" onClick={() => setSelectedParticipant(null)}>Fermer</Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function InteractiveStatCard({ title, value, hint, icon, color, active, onClick }: any) {
    return (
        <Card className={`rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 group ${active ? 'border-indigo-600 bg-white shadow-2xl dark:bg-slate-900' : 'border-transparent bg-white shadow-sm hover:shadow-xl dark:bg-slate-950 dark:border-slate-800'}`} onClick={onClick}>
            <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${active ? color + ' text-white' : 'bg-gray-50 text-gray-400 dark:bg-slate-800'}`}>{icon}</div>
                    {active && <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />}
                </div>
                <div className="space-y-1">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-indigo-600' : 'text-gray-400'}`}>{title}</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">{hint}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function SectionHeader({ title, onSeeAll }: any) {
    return (
        <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{title}</h3>
            <Button variant="link" className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest p-0 h-auto" onClick={onSeeAll}>Voir tout</Button>
        </div>
    );
}

function DetailItem({ label, value, icon }: any) {
    return (
        <div className="space-y-1.5">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">{icon} {label}</p>
            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{value || 'N/A'}</p>
        </div>
    );
}
