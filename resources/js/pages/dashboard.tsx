import { Head, Link, usePage } from '@inertiajs/react';
import { Building2, Calendar as CalendarIcon, Users, ArrowRight, Zap, TrendingUp, Activity, Star } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

interface Props {
    activites: any[];
    stats: {
        clubsCount: number;
        activitiesCount: number;
        membersCount: number;
    };
}

export default function Dashboard({ activites, stats }: Props) {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const isAdmin = user?.role === 'admin';

    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-8 rounded-xl p-8 bg-slate-50">
                {/* Welcome Section */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 p-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Zap className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold tracking-tight text-slate-900">Bienvenue</h1>
                                <p className="text-base text-slate-500 font-medium mt-1">
                                    Plateforme de gestion des clubs et activités universitaires
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 flex gap-4">
                            {isAdmin && (
                                <Link
                                    href="/gestion"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                                >
                                    <Activity className="w-5 h-5" />
                                    Accéder à la gestion
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            )}
                            <Link
                                href="/clubs"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-300 font-semibold"
                            >
                                <Building2 className="w-5 h-5" />
                                Voir les clubs
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-indigo-200 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.clubsCount}</h3>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Clubs Actifs</p>
                    </div>

                    <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-emerald-200 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                <CalendarIcon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.activitiesCount}</h3>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Activités</p>
                    </div>

                    <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-amber-200 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.membersCount}</h3>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Membres</p>
                    </div>
                </div>
                {/* Ongoing Activities Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-900">Activités en cours</h2>
                        <Link href="/clubs" className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1">
                            Tous les clubs <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {activites.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activites.map((activite) => (
                                <div key={activite.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                                                {activite.club?.nom}
                                            </span>
                                            <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                                                <CalendarIcon className="w-3 h-3" />
                                                {new Date(activite.date_debut).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                            {activite.titre}
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-2 mb-6">
                                            {activite.description}
                                        </p>
                                        <Link 
                                            href={`/clubs/${activite.club?.id}`}
                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 text-slate-900 rounded-xl hover:bg-slate-900 hover:text-white transition-all font-bold text-xs"
                                        >
                                            Voir le club
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center">
                            <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold">Aucune activité en cours pour le moment</p>
                            <Link href="/clubs" className="text-indigo-600 text-sm font-bold mt-2 inline-block hover:underline">
                                Explorer les clubs
                            </Link>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Actions rapides</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(isAdmin || user?.is_responsable) && (
                            <Link
                                href="/demandes-local/create"
                                className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl hover:shadow-md transition-all duration-300 group"
                            >
                                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Star className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">Réserver un local</h4>
                                    <p className="text-sm text-slate-500">Demander une salle</p>
                                </div>
                            </Link>
                        )}

                        {isAdmin && (
                            <Link
                                href="/gestion"
                                className="flex items-center gap-4 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:shadow-md transition-all duration-300 group"
                            >
                                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Activity className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">Administration</h4>
                                    <p className="text-sm text-slate-500">Gérer la plateforme</p>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
