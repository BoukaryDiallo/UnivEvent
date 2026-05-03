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
    XCircleIcon,
    ArrowLeftIcon,
    CalendarIcon,
    MapPinIcon,
    ActivityIcon
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { EventBadge } from '@/components/m5/EventBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
};

export default function OrganizerDashboard({ mes_evenements, inscriptions, stats, prochains_evenements }: OrganizerDashboardProps) {
    const [view, setView] = useState<'overview' | 'events' | 'inscriptions' | 'upcoming' | 'analytics'>('overview');
    const [selectedParticipant, setSelectedParticipant] = useState<any | null>(null);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/m5/dashboard' },
        { title: view === 'overview' ? 'Organisateur' : view.charAt(0).toUpperCase() + view.slice(1), href: '#' },
    ];

    const handleApprove = (id: number) => {
        router.patch(`/m5/inscriptions/${id}/approve`, {}, { onSuccess: () => setSelectedParticipant(null) });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Console de Gestion - UnivEvent" />

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
                {/* Navigation Header */}
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
                            <p className="text-sm text-gray-500 font-medium">Votre périmètre de gestion sur la plateforme.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 h-12 shadow-lg shadow-indigo-100">
                            <Link href="/m5/events/create">
                                <PlusIcon className="mr-2 h-5 w-5" />
                                Créer
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Metric Cards (Clickable) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InteractiveStatCard 
                        title="Événements" 
                        value={stats.total_events} 
                        hint="Dans votre périmètre"
                        icon={<CalendarCheckIcon className="h-6 w-6" />}
                        color="bg-indigo-600"
                        active={view === 'events'}
                        onClick={() => setView('events')}
                    />
                    <InteractiveStatCard 
                        title="Inscriptions" 
                        value={stats.total_inscriptions} 
                        hint="Demandes et confirmations"
                        icon={<UsersIcon className="h-6 w-6" />}
                        color="bg-emerald-600"
                        active={view === 'inscriptions'}
                        onClick={() => setView('inscriptions')}
                    />
                    <InteractiveStatCard 
                        title="À venir" 
                        value={stats.upcoming_count} 
                        hint="Prochains rendez-vous"
                        icon={<ClockIcon className="h-6 w-6" />}
                        color="bg-amber-500"
                        active={view === 'upcoming'}
                        onClick={() => setView('upcoming')}
                    />
                    <InteractiveStatCard 
                        title="Participation" 
                        value={`${stats.validation_rate}%`} 
                        hint="Taux de validation"
                        icon={<ActivityIcon className="h-6 w-6" />}
                        color="bg-rose-500"
                        active={view === 'analytics'}
                        onClick={() => setView('analytics')}
                    />
                </div>

                {/* Dynamic Content Area */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {view === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-2 space-y-6">
                                <SectionHeader title="Activité Récente" onSeeAll={() => setView('inscriptions')} />
                                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden dark:bg-slate-950 dark:border-slate-800">
                                    <div className="p-4 space-y-4">
                                        {inscriptions.slice(0, 5).map((ins) => (
                                            <div key={ins.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group" onClick={() => setSelectedParticipant(ins)}>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center dark:bg-indigo-900/30">
                                                        <UserIcon className="h-5 w-5 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{ins.user.name}</p>
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{ins.event_title}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <EventBadge statut={ins.statut} size="sm" />
                                                    <ArrowRightIcon className="h-4 w-4 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <SectionHeader title="Calendrier" onSeeAll={() => setView('upcoming')} />
                                <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
                                    <div className="space-y-6">
                                        {prochains_evenements.slice(0, 3).map((event) => (
                                            <div key={event.id} className="flex gap-4">
                                                <div className="h-12 w-12 bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center shrink-0 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                                                    <span className="text-[10px] font-black text-indigo-600 uppercase">{new Date(event.date_debut).toLocaleDateString('fr', {month: 'short'})}</span>
                                                    <span className="text-lg font-black leading-none">{new Date(event.date_debut).getDate()}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{event.titre}</p>
                                                    <p className="text-[10px] text-gray-400">{event.lieu}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'inscriptions' && (
                        <div className="space-y-8">
                            {/* Validation Priority Section */}
                            <div className="bg-emerald-50/50 p-8 rounded-[3rem] border-2 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30">
                                <div className="flex items-center gap-3 mb-6">
                                    <CheckCircle2Icon className="h-6 w-6 text-emerald-600" />
                                    <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-tight">Priorité de Validation</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {inscriptions.filter(i => i.statut === 'en_attente' && !i.is_waitlist).map((ins) => (
                                        <div key={ins.id} className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 flex flex-col justify-between dark:bg-slate-950 dark:border-emerald-900/50">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold">
                                                        {ins.user.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{ins.user.name}</p>
                                                        <p className="text-[10px] text-gray-400">{ins.registered_at}</p>
                                                    </div>
                                                </div>
                                                <Button size="icon" variant="ghost" onClick={() => setSelectedParticipant(ins)}><ArrowRightIcon className="h-4 w-4" /></Button>
                                            </div>
                                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 font-bold text-xs uppercase" onClick={() => handleApprove(ins.id)}>Valider</Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Waitlist Section */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase flex items-center gap-2 px-2">
                                    <ListOrderedIcon className="h-5 w-5 text-indigo-600" />
                                    Listes d'attente
                                </h3>
                                <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden dark:bg-slate-950 dark:border-slate-800">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-100 dark:bg-slate-900">
                                            <tr>
                                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pos.</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Participant</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Événement</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-slate-900">
                                            {inscriptions.filter(i => i.is_waitlist).sort((a, b) => a.waitlist_position - b.waitlist_position).map((ins) => (
                                                <tr key={ins.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <Badge className="bg-amber-100 text-amber-700 border-0 rounded-lg px-2 text-xs">#{ins.waitlist_position}</Badge>
                                                    </td>
                                                    <td className="px-8 py-6 font-bold text-sm">{ins.user.name}</td>
                                                    <td className="px-8 py-6 text-xs text-gray-500 uppercase">{ins.event_title}</td>
                                                    <td className="px-8 py-6 text-right">
                                                        <Button variant="ghost" className="text-indigo-600 font-bold text-xs" onClick={() => setSelectedParticipant(ins)}>Détails</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'events' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {mes_evenements.map((event) => (
                                <Card key={event.id} className="rounded-[2.5rem] border border-gray-100 overflow-hidden hover:shadow-xl transition-all group dark:bg-slate-950 dark:border-slate-800">
                                    <div className="p-8 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <EventBadge statut={event.statut} size="sm" />
                                            <Badge variant="outline" className="rounded-full px-4 text-[9px] font-black uppercase">{event.type}</Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-xl font-black text-gray-900 dark:text-white line-clamp-2 leading-tight uppercase">{event.titre}</h4>
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                <div className="flex items-center gap-1.5"><UsersIcon className="h-3 w-3" /> {event.inscriptions_count}</div>
                                                <div className="flex items-center gap-1.5"><CalendarIcon className="h-3 w-3" /> {new Date(event.date_debut).getFullYear()}</div>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-gray-50 flex gap-2">
                                            <Button asChild className="flex-1 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase h-10 shadow-lg shadow-gray-200">
                                                <Link href={`/m5/events/${event.id}`}>Gérer</Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-gray-50"><MoreHorizontalIcon className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {view === 'analytics' && (
                        <div className="space-y-8">
                            <div className="bg-indigo-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10"><BarChart3Icon className="h-48 w-48" /></div>
                                <div className="relative z-10 space-y-8">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Performance Globale</p>
                                        <h2 className="text-5xl font-black">{stats.validation_rate}% <span className="text-xl text-indigo-400">de conversion</span></h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-md">
                                            <p className="text-[10px] font-bold uppercase text-indigo-200 mb-2">Total Inscrits</p>
                                            <p className="text-3xl font-black">{stats.total_inscriptions}</p>
                                        </div>
                                        <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-md">
                                            <p className="text-[10px] font-bold uppercase text-indigo-200 mb-2">Événements Actifs</p>
                                            <p className="text-3xl font-black">{stats.total_events}</p>
                                        </div>
                                        <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-md">
                                            <p className="text-[10px] font-bold uppercase text-indigo-200 mb-2">Prochains jours</p>
                                            <p className="text-3xl font-black">{stats.upcoming_count}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Participant Detail Modal */}
            <Dialog open={!!selectedParticipant} onOpenChange={() => setSelectedParticipant(null)}>
                <DialogContent className="sm:max-w-xl rounded-[3rem] p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="h-32 bg-gradient-to-br from-indigo-600 to-indigo-800 relative">
                        <div className="absolute -bottom-8 left-8 p-1 bg-white rounded-[2rem] dark:bg-slate-900">
                            <div className="h-20 w-20 bg-indigo-100 rounded-[1.8rem] flex items-center justify-center text-2xl font-black text-indigo-600">
                                {selectedParticipant?.user.name[0]}
                            </div>
                        </div>
                    </div>
                    <div className="p-10 pt-12 space-y-8">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{selectedParticipant?.user.name}</h3>
                                <p className="text-sm font-medium text-gray-500">{selectedParticipant?.user.email}</p>
                            </div>
                            <EventBadge statut={selectedParticipant?.statut} size="md" />
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <DetailItem label="Inscription" value={selectedParticipant?.registered_at} icon={<CalendarIcon className="h-3.5 w-3.5" />} />
                                <DetailItem label="Lieu" value="UJKZ Campus" icon={<MapPinIcon className="h-3.5 w-3.5" />} />
                            </div>
                            <div className="space-y-4">
                                <DetailItem label="Événement" value={selectedParticipant?.event_title} icon={<ActivityIcon className="h-3.5 w-3.5" />} />
                                {selectedParticipant?.is_waitlist && (
                                    <DetailItem label="Position d'attente" value={`N° ${selectedParticipant.waitlist_position}`} icon={<ListOrderedIcon className="h-3.5 w-3.5" />} />
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-slate-800">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Documents Joints</h4>
                            {selectedParticipant?.has_cv ? (
                                <Button className="w-full bg-gray-50 hover:bg-gray-100 text-indigo-600 border border-indigo-100 rounded-2xl h-14 font-black uppercase text-xs">
                                    <DownloadIcon className="mr-2 h-4 w-4" />
                                    Télécharger le CV
                                </Button>
                            ) : (
                                <p className="text-xs text-gray-400 italic bg-gray-50 p-4 rounded-2xl text-center">Aucun CV requis ou joint pour cet événement.</p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            {selectedParticipant?.statut === 'en_attente' && (
                                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 font-bold uppercase text-xs" onClick={() => handleApprove(selectedParticipant.id)}>Valider la participation</Button>
                            )}
                            <Button variant="outline" className="flex-1 rounded-2xl h-12 font-bold text-gray-400 hover:text-rose-600 hover:bg-rose-50 border-gray-100">Révoquer</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function InteractiveStatCard({ title, value, hint, icon, color, active, onClick }: { 
    title: string, value: string | number, hint: string, icon: React.ReactNode, color: string, active: boolean, onClick: () => void 
}) {
    return (
        <Card 
            className={`rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 overflow-hidden group ${
                active 
                ? 'border-indigo-600 bg-white shadow-2xl shadow-indigo-100 dark:bg-slate-900' 
                : 'border-transparent bg-white shadow-sm hover:shadow-xl dark:bg-slate-950 dark:border-slate-800'
            }`}
            onClick={onClick}
        >
            <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${
                        active ? color + ' text-white' : 'bg-gray-50 text-gray-400 dark:bg-slate-900'
                    } group-hover:scale-110`}>
                        {icon}
                    </div>
                    {active && <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />}
                </div>
                <div className="space-y-1">
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${active ? 'text-indigo-600' : 'text-gray-400'}`}>{title}</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{hint}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function SectionHeader({ title, onSeeAll }: { title: string, onSeeAll: () => void }) {
    return (
        <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{title}</h3>
            <Button variant="link" className="text-indigo-600 font-bold text-xs uppercase tracking-widest p-0 h-auto" onClick={onSeeAll}>Voir Tout</Button>
        </div>
    );
}

function DetailItem({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                {icon}
                {label}
            </p>
            <p className="text-xs font-bold text-gray-900 dark:text-white">{value || 'N/A'}</p>
        </div>
    );
}
