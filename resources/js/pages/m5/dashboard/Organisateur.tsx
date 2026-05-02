import { Head, Link } from '@inertiajs/react';
import { 
    CalendarCheckIcon, 
    ClockIcon, 
    UsersIcon, 
    ListOrderedIcon, 
    PlusIcon,
    ArrowRightIcon,
    MoreHorizontalIcon,
    BarChart3Icon
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { EventBadge } from '@/components/m5/EventBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type OrganizerDashboardProps = {
    mes_evenements: any[];
    stats: {
        total: number;
        publies: number;
        en_attente_validation: number;
        clotures: number;
        total_inscrits: number;
    };
    prochains_evenements: any[];
};

export default function OrganizerDashboard({ mes_evenements, stats, prochains_evenements }: OrganizerDashboardProps) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/m5/dashboard' },
        { title: 'Organisateur', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Organisateur - UnivEvent" />

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            Console Organisateur
                        </h1>
                        <p className="text-sm text-gray-500">Gérez vos conférences et concours en un coup d'œil.</p>
                    </div>
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 h-12 shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Link href="/m5/events/create">
                            <PlusIcon className="mr-2 h-5 w-5" />
                            Nouvel Événement
                        </Link>
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Événements publiés" 
                        value={stats.publies} 
                        icon={<CalendarCheckIcon className="h-6 w-6 text-emerald-600" />} 
                        color="bg-emerald-50"
                    />
                    <StatCard 
                        title="En attente" 
                        value={stats.en_attente_validation} 
                        icon={<ClockIcon className="h-6 w-6 text-amber-600" />} 
                        color="bg-amber-50"
                    />
                    <StatCard 
                        title="Total Participants" 
                        value={stats.total_inscrits} 
                        icon={<UsersIcon className="h-6 w-6 text-indigo-600" />} 
                        color="bg-indigo-50"
                    />
                    <StatCard 
                        title="Listes d'attente" 
                        value={stats.clotures} 
                        icon={<ListOrderedIcon className="h-6 w-6 text-rose-600" />} 
                        color="bg-rose-50"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main Section: Events Table */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Mes Événements</h3>
                            <Link href="/m5/events" className="text-xs font-bold text-indigo-600 hover:underline uppercase tracking-widest">Voir tout</Link>
                        </div>

                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden dark:bg-slate-950 dark:border-slate-800">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100 dark:bg-slate-900 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Événement</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Statut</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inscrits</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                                    {mes_evenements.map((event) => (
                                        <tr key={event.id} className="group hover:bg-gray-50 transition-colors dark:hover:bg-slate-900/50">
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{event.titre}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{event.type} • {event.date_debut}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <EventBadge statut={event.statut} size="sm" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden dark:bg-slate-800">
                                                        <div 
                                                            className="h-full bg-indigo-500 rounded-full" 
                                                            style={{ width: `${Math.min((event.participants_count / (event.capacite_max || 1)) * 100, 100)}%` }} 
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-400">{event.participants_count}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button size="icon" variant="ghost" className="rounded-full group-hover:bg-white dark:group-hover:bg-slate-800">
                                                    <MoreHorizontalIcon className="h-4 w-4 text-gray-400" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Sidebar Sections */}
                    <div className="space-y-8">
                        {/* Upcoming Events Timeline */}
                        <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-6">À Venir</h3>
                            <div className="space-y-6">
                                {prochains_evenements.map((event, i) => (
                                    <div key={i} className="flex gap-4 relative">
                                        {i < prochains_evenements.length - 1 && (
                                            <div className="absolute top-8 left-4 h-full w-px bg-gray-200 dark:bg-slate-800" />
                                        )}
                                        <div className="h-8 w-8 bg-white rounded-full border-2 border-indigo-600 flex items-center justify-center z-10 dark:bg-slate-950">
                                            <div className="h-2 w-2 rounded-full bg-indigo-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{event.titre}</p>
                                            <p className="text-[10px] text-indigo-600 font-medium">{event.date_debut}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="link" className="mt-8 p-0 h-auto text-indigo-600 font-bold text-xs uppercase tracking-widest group">
                                Voir le calendrier
                                <ArrowRightIcon className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </div>

                        {/* Quick Analytics Widget */}
                        <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100 dark:shadow-none">
                            <div className="flex items-center gap-3 mb-6">
                                <BarChart3Icon className="h-5 w-5 text-indigo-400" />
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Aperçu Analytique</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-bold opacity-60 uppercase">
                                        <span>Taux de remplissage</span>
                                        <span>78%</span>
                                    </div>
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-sky-400 w-[78%]" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-bold opacity-60 uppercase">
                                        <span>Événements terminés</span>
                                        <span>12</span>
                                    </div>
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-400 w-[60%]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
    return (
        <Card className="rounded-[2rem] border-0 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300 dark:bg-slate-950 dark:border dark:border-slate-800">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-2xl ${color} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
