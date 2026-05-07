import { Head, Link } from '@inertiajs/react';
import { 
    TrophyIcon, 
    GavelIcon,
    ArrowRightIcon,
    CheckCircle2Icon,
    AlertCircleIcon,
    FileCheckIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

type JuryDashboardProps = {
    concours_assignes: any[];
    candidatures_a_evaluer: any[];
    deliberations: any[];
    stats: {
        concours_actifs: number;
        candidatures_evaluees: number;
        candidatures_restantes: number;
    };
};

export default function JuryDashboard({ concours_assignes, deliberations, stats }: JuryDashboardProps) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/module5/dashboard' },
        { title: 'Jury', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Espace Jury - UnivEvent" />

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-lg shadow-indigo-200">
                        <GavelIcon className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                            Espace Délibération
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">Évaluez les candidatures et validez les résultats.</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between dark:bg-slate-950 dark:border-slate-800">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Concours actifs</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.concours_actifs}</p>
                        </div>
                        <TrophyIcon className="h-10 w-10 text-amber-400 opacity-20" />
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between dark:bg-slate-950 dark:border-slate-800">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Évaluations faites</p>
                            <p className="text-3xl font-black text-emerald-500">{stats.candidatures_evaluees}</p>
                        </div>
                        <CheckCircle2Icon className="h-10 w-10 text-emerald-400 opacity-20" />
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between dark:bg-slate-950 dark:border-slate-800">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Restantes</p>
                            <p className="text-3xl font-black text-indigo-500">{stats.candidatures_restantes}</p>
                        </div>
                        <AlertCircleIcon className="h-10 w-10 text-indigo-400 opacity-20" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Concours Table */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Concours assignés</h3>
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden dark:bg-slate-950 dark:border-slate-800">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100 dark:bg-slate-900 dark:border-slate-800">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Concours</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rôle</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                                    {concours_assignes.map((item, i) => (
                                        <tr key={i} className="group hover:bg-gray-50 transition-colors dark:hover:bg-slate-900/50">
                                            <td className="px-8 py-6">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{item.concours.titre}</p>
                                                    <p className="text-[10px] text-gray-400">{item.concours.date_deliberation}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <Badge className={`${item.role_jury === 'president' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'} border-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase`}>
                                                    {item.role_jury === 'president' ? 'Président' : 'Membre'}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-2 w-2 rounded-full ${item.statut === 'publie' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                    <span className="text-xs font-medium text-gray-600 dark:text-slate-400">
                                                        {item.statut === 'publie' ? 'Notation ouverte' : 'En attente'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 font-bold uppercase tracking-widest">
                                                    <Link href={`/module5/jury/${item.concours.id}/panel`}>
                                                        Évaluer
                                                        <ArrowRightIcon className="ml-2 h-3.5 w-3.5" />
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {concours_assignes.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-10 text-center text-sm text-gray-500 italic">
                                                Aucun concours ne vous est assigné actuellement.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pending Deliberations Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-gray-200 dark:shadow-none">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <FileCheckIcon className="h-4 w-4 text-emerald-400" />
                                Délibérations
                            </h3>
                            <div className="space-y-6">
                                {deliberations && deliberations.length > 0 ? deliberations.map((del, i) => (
                                    <div key={i} className="space-y-2 pb-6 border-b border-white/10 last:border-0 last:pb-0">
                                        <p className="font-bold text-sm leading-tight">{del.titre_concours}</p>
                                        <p className="text-[10px] text-white/50 uppercase">Statut : {del.statut}</p>
                                        <Button variant="outline" className="w-full mt-2 border-white/20 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest h-8">
                                            Voir le PV
                                        </Button>
                                    </div>
                                )) : (
                                    <p className="text-xs text-white/40 italic">Aucune délibération en cours.</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/30">
                            <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-400 mb-2 uppercase tracking-tight">Guide du Jury</h4>
                            <p className="text-[11px] text-indigo-700/70 leading-relaxed mb-4">
                                Pour chaque critère, attribuez une note sur 20. Le système calculera automatiquement le classement final basé sur les pondérations définies.
                            </p>
                            <Link href="#" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                                Télécharger le règlement
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
