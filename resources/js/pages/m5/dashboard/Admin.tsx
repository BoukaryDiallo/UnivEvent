import { Head, Link, router } from '@inertiajs/react';
import { 
    ShieldCheckIcon, 
    AlertCircleIcon, 
    ActivityIcon, 
    UsersIcon, 
    FileTextIcon,
    CheckIcon,
    XIcon,
    ArrowUpRightIcon,
    PieChartIcon
} from 'lucide-react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type AdminDashboardProps = {
    stats_globales: {
        total_evenements: number;
        publies: number;
        en_attente: number;
        total_participants: number;
        total_certificats: number;
        taux_remplissage_moyen: number;
    };
    evenements_en_attente: any[];
    activite_recente: any[];
    graphiques: {
        inscriptions_par_mois: any[];
        types_evenements: any[];
    };
};

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e'];

export default function AdminDashboard({ stats_globales, evenements_en_attente, activite_recente, graphiques }: AdminDashboardProps) {
    const handleApprove = (id: number) => {
        router.patch(`/m5/events/${id}`, { statut: 'publie' });
    };

    const handleReject = (id: number) => {
        const reason = window.prompt("Raison du refus :");
        if (reason) {
            router.patch(`/m5/events/${id}`, { statut: 'annule', message: reason });
        }
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/m5/dashboard' },
        { title: 'Administration', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Administration Globale - UnivEvent" />

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-gray-900 rounded-[2rem] flex items-center justify-center shadow-xl">
                        <ShieldCheckIcon className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            Supervision Module 5
                        </h1>
                        <p className="text-sm text-gray-500">Vue d'ensemble et contrôle global des événements.</p>
                    </div>
                </div>

                {/* Global Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    <MiniStat title="Total" value={stats_globales.total_evenements} color="bg-gray-100 text-gray-900" />
                    <MiniStat title="Publiés" value={stats_globales.publies} color="bg-emerald-100 text-emerald-700" />
                    <MiniStat title="En attente" value={stats_globales.en_attente} color="bg-amber-100 text-amber-700" />
                    <MiniStat title="Participants" value={stats_globales.total_participants} color="bg-indigo-100 text-indigo-700" />
                    <MiniStat title="Certificats" value={stats_globales.total_certificats} color="bg-purple-100 text-purple-700" />
                    <MiniStat title="Remplissage" value={`${stats_globales.taux_remplissage_moyen}%`} color="bg-sky-100 text-sky-700" />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 rounded-[2.5rem] border-0 shadow-sm overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
                        <CardHeader className="px-8 pt-8">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-400">Croissance des inscriptions</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-8 h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={graphiques.inscriptions_par_mois}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] border-0 shadow-sm overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
                        <CardHeader className="px-8 pt-8">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-400">Répartition types</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-8 flex flex-col items-center justify-center h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={graphiques.types_evenements}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {graphiques.types_evenements.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex gap-4 mt-4">
                                {graphiques.types_evenements.map((t, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">{t.name}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Approval Queue */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <AlertCircleIcon className="h-5 w-5 text-amber-500" />
                            En attente de validation
                        </h3>
                        <div className="space-y-4">
                            {evenements_en_attente.map((event) => (
                                <div key={event.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group dark:bg-slate-950 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 dark:bg-slate-900">
                                            <FileTextIcon className="h-6 w-6 text-gray-300" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{event.titre}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Par {event.createur?.name} • {event.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            onClick={() => handleReject(event.id)}
                                            className="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-50"
                                        >
                                            <XIcon className="h-5 w-5" />
                                        </Button>
                                        <Button 
                                            size="icon" 
                                            onClick={() => handleApprove(event.id)}
                                            className="h-10 w-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            <CheckIcon className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {evenements_en_attente.length === 0 && (
                                <p className="text-center py-12 text-gray-400 text-sm italic">Aucun événement en attente.</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <ActivityIcon className="h-5 w-5 text-indigo-600" />
                            Activité récente
                        </h3>
                        <div className="bg-gray-50 rounded-[2.5rem] p-8 space-y-6 border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
                            {activite_recente.map((log, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="h-2 w-2 rounded-full bg-indigo-600 mt-1.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                                            <span className="font-bold">{log.user?.name}</span> {log.action}
                                        </p>
                                        <p className="text-[10px] text-gray-400">{log.created_at}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function MiniStat({ title, value, color }: { title: string, value: string | number, color: string }) {
    return (
        <div className={`p-4 rounded-2xl ${color} flex flex-col items-center justify-center text-center`}>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{title}</p>
            <p className="text-lg font-black">{value}</p>
        </div>
    );
}
