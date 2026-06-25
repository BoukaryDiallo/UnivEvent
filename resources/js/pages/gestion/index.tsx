import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { dashboard } from '@/routes'
import type { BreadcrumbItem } from '@/types'
import { useState } from 'react'
import { Building2, Calendar as CalendarIcon, MapPin, Wallet, Users as UsersIcon, LayoutDashboard, Eye, Plus, Clock, ArrowUpRight, TrendingUp, Activity, Zap, Ban, CheckCircle, XCircle } from 'lucide-react'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Gestion des clubs',
        href: '/gestion',
    },
]

interface Props {
    clubs?: any[]
    demandesLocal?: any[]
    demandesBudget?: any[]
    users?: any[]
    activites?: any[]
    stats?: {
        totalClubs?: number
        totalActivites?: number
        totalDemandesLocal?: number
        totalDemandesBudget?: number
        totalUsers?: number
    }
}

export default function Gestion({ clubs, demandesLocal, demandesBudget, users, activites, stats }: Props) {
    const [activeTab, setActiveTab] = useState('overview')

    const tabs = [
        { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
        { id: 'clubs', label: 'Clubs', icon: Building2 },
        { id: 'activites', label: 'Activités', icon: CalendarIcon },
        { id: 'demandes-local', label: 'Locaux', icon: MapPin },
        { id: 'demandes-budget', label: 'Budget', icon: Wallet },
        { id: 'roles', label: 'Utilisateurs', icon: UsersIcon },
    ]

    const handleSuspendre = (clubId: number) => {
        const motif = prompt('Motif de la suspension:');
        if (motif) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/admin/clubs/${clubId}/suspendre`;
            
            const methodInput = document.createElement('input');
            methodInput.type = 'hidden';
            methodInput.name = '_method';
            methodInput.value = 'PUT';
            
            const motifInput = document.createElement('input');
            motifInput.type = 'hidden';
            motifInput.name = 'motif';
            motifInput.value = motif;
            
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = '_token';
            tokenInput.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            
            form.appendChild(methodInput);
            form.appendChild(motifInput);
            form.appendChild(tokenInput);
            document.body.appendChild(form);
            form.submit();
        }
    };

    const handleDissoudre = (clubId: number) => {
        const motif = prompt('Motif de la dissolution:');
        if (motif) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/admin/clubs/${clubId}/dissoudre`;
            
            const methodInput = document.createElement('input');
            methodInput.type = 'hidden';
            methodInput.name = '_method';
            methodInput.value = 'PUT';
            
            const motifInput = document.createElement('input');
            motifInput.type = 'hidden';
            motifInput.name = 'motif';
            motifInput.value = motif;
            
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = '_token';
            tokenInput.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            
            form.appendChild(methodInput);
            form.appendChild(motifInput);
            form.appendChild(tokenInput);
            document.body.appendChild(form);
            form.submit();
        }
    };

    const handleReactiver = (clubId: number) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/clubs/${clubId}/reactiver`;
        
        const methodInput = document.createElement('input');
        methodInput.type = 'hidden';
        methodInput.name = '_method';
        methodInput.value = 'PUT';
        
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = '_token';
        tokenInput.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
        
        form.appendChild(methodInput);
        form.appendChild(tokenInput);
        document.body.appendChild(form);
        form.submit();
    };

    const handleValiderLocal = (id: number) => {
        if (confirm('Voulez-vous approuver cette demande de local ?')) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/demandes-local/${id}/valider`;
            
            const methodInput = document.createElement('input');
            methodInput.type = 'hidden';
            methodInput.name = '_method';
            methodInput.value = 'PUT';
            
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = '_token';
            tokenInput.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            
            form.appendChild(methodInput);
            form.appendChild(tokenInput);
            document.body.appendChild(form);
            form.submit();
        }
    };

    const handleRejectLocal = (id: number) => {
        const commentaire = prompt('Motif du rejet :');
        if (commentaire) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/demandes-local/${id}/rejeter`;
            
            const methodInput = document.createElement('input');
            methodInput.type = 'hidden';
            methodInput.name = '_method';
            methodInput.value = 'PUT';
            
            const motifInput = document.createElement('input');
            motifInput.type = 'hidden';
            motifInput.name = 'commentaire';
            motifInput.value = commentaire;
            
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = '_token';
            tokenInput.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            
            form.appendChild(methodInput);
            form.appendChild(motifInput);
            form.appendChild(tokenInput);
            document.body.appendChild(form);
            form.submit();
        }
    };

    const handleValiderBudget = (id: number) => {
        if (confirm('Voulez-vous approuver cette demande de budget ?')) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/demandes-budget/${id}/valider`;
            
            const methodInput = document.createElement('input');
            methodInput.type = 'hidden';
            methodInput.name = '_method';
            methodInput.value = 'PUT';
            
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = '_token';
            tokenInput.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            
            form.appendChild(methodInput);
            form.appendChild(tokenInput);
            document.body.appendChild(form);
            form.submit();
        }
    };

    const handleRejectBudget = (id: number) => {
        const commentaire = prompt('Motif du rejet :');
        if (commentaire) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/demandes-budget/${id}/rejeter`;
            
            const methodInput = document.createElement('input');
            methodInput.type = 'hidden';
            methodInput.name = '_method';
            methodInput.value = 'PUT';
            
            const motifInput = document.createElement('input');
            motifInput.type = 'hidden';
            motifInput.name = 'commentaire';
            motifInput.value = commentaire;
            
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = '_token';
            tokenInput.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            
            form.appendChild(methodInput);
            form.appendChild(motifInput);
            form.appendChild(tokenInput);
            document.body.appendChild(form);
            form.submit();
        }
    };

    const handleToggleUserStatus = (id: number) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/users/${id}/toggle-status`;
        const methodInput = document.createElement('input');
        methodInput.type = 'hidden';
        methodInput.name = '_method';
        methodInput.value = 'PUT';
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = '_token';
        tokenInput.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
        form.appendChild(methodInput);
        form.appendChild(tokenInput);
        document.body.appendChild(form);
        form.submit();
    };

    const handleUpdateUserRole = (id: number, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'etudiant' : 'admin';
        if (confirm(`Voulez-vous changer le rôle de cet utilisateur en ${newRole} ?`)) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/users/${id}/role`;
            const methodInput = document.createElement('input');
            methodInput.type = 'hidden';
            methodInput.name = '_method';
            methodInput.value = 'PUT';
            const roleInput = document.createElement('input');
            roleInput.type = 'hidden';
            roleInput.name = 'role';
            roleInput.value = newRole;
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = '_token';
            tokenInput.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            form.appendChild(methodInput);
            form.appendChild(roleInput);
            form.appendChild(tokenInput);
            document.body.appendChild(form);
            form.submit();
        }
    };

    const handleDeleteUser = (id: number) => {
        if (confirm('Voulez-vous vraiment supprimer cet utilisateur ? Cette action est irréversible.')) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/users/${id}`;
            const methodInput = document.createElement('input');
            methodInput.type = 'hidden';
            methodInput.name = '_method';
            methodInput.value = 'DELETE';
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = '_token';
            tokenInput.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            form.appendChild(methodInput);
            form.appendChild(tokenInput);
            document.body.appendChild(form);
            form.submit();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des clubs" />
            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-8 bg-slate-50">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <LayoutDashboard className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Centre de gestion</h1>
                                <p className="text-slate-500 mt-1 text-base font-medium">Tableau de bord de gestion des clubs et activités</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl">
                            <Zap className="w-5 h-5 text-indigo-600" />
                            <span className="text-sm font-semibold text-indigo-700">Mode Admin</span>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                        <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                    <Building2 className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>+12%</span>
                                </div>
                            </div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Clubs</p>
                            <p className="text-4xl font-bold text-slate-900 mt-2">{stats?.totalClubs || clubs?.length || 0}</p>
                        </div>
                        <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-emerald-200 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                    <CalendarIcon className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>+8%</span>
                                </div>
                            </div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Activités</p>
                            <p className="text-4xl font-bold text-slate-900 mt-2">{stats?.totalActivites || activites?.length || 0}</p>
                        </div>
                        <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-amber-200 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                    <MapPin className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>+5%</span>
                                </div>
                            </div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Locaux</p>
                            <p className="text-4xl font-bold text-slate-900 mt-2">{stats?.totalDemandesLocal || demandesLocal?.length || 0}</p>
                        </div>
                        <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-purple-200 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                    <Wallet className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>+15%</span>
                                </div>
                            </div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Budget</p>
                            <p className="text-4xl font-bold text-slate-900 mt-2">{stats?.totalDemandesBudget || demandesBudget?.length || 0}</p>
                        </div>
                        <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-rose-200 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-14 h-14 bg-rose-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                    <UsersIcon className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>+20%</span>
                                </div>
                            </div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Utilisateurs</p>
                            <p className="text-4xl font-bold text-slate-900 mt-2">{stats?.totalUsers || users?.length || 0}</p>
                        </div>
                    </div>
                )}

                {/* Tabs Navigation */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2">
                    <nav className="flex gap-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                                        activeTab === tab.id
                                            ? 'bg-slate-900 text-white shadow-md'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[400px]">
                    {activeTab === 'overview' && (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-purple-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <LayoutDashboard className="w-12 h-12 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Bienvenue dans le centre de gestion</h3>
                            <p className="text-slate-500 text-base">Sélectionnez un onglet pour accéder aux fonctionnalités de gestion</p>
                        </div>
                    )}

                    {activeTab === 'clubs' && (
                        <div>
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">Gestion des clubs</h2>
                                </div>
                                <div className="flex gap-3">
                                    <Link
                                        href="/admin/clubs/en-attente"
                                        className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-semibold"
                                    >
                                        <Clock className="w-4 h-4" />
                                        Demandes en attente
                                    </Link>
                                </div>
                            </div>
                            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Nom</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Statut</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Membres</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {clubs && clubs.map((club: any) => (
                                            <tr key={club.id} className="bg-blue-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-bold text-slate-900 text-base">{club.nom}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-600 capitalize font-medium">{club.type}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                                                        club.statut === 'actif' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                        club.statut === 'suspendu' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                                        'bg-rose-100 text-rose-800 border-rose-200'
                                                    }`}>
                                                        <span className={`w-2 h-2 mr-2 rounded-full ${
                                                            club.statut === 'actif' ? 'bg-emerald-500' :
                                                            club.statut === 'suspendu' ? 'bg-amber-500' :
                                                            'bg-rose-500'
                                                        }`}></span>
                                                        {club.statut}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-semibold">
                                                    {club.adhesions ? club.adhesions.filter((a: any) => a.statut === 'approuvee').length : 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/clubs/${club.id}`} className="inline-flex items-center justify-center w-9 h-9 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors" title="Détails">
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        {club.statut === 'actif' && (
                                                            <button
                                                                onClick={() => handleSuspendre(club.id)}
                                                                className="inline-flex items-center justify-center w-9 h-9 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                                                title="Suspendre"
                                                            >
                                                                <Ban className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {club.statut === 'suspendu' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleReactiver(club.id)}
                                                                    className="inline-flex items-center justify-center w-9 h-9 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                                                    title="Réactiver"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDissoudre(club.id)}
                                                                    className="inline-flex items-center justify-center w-9 h-9 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                                                                    title="Dissoudre"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {!clubs || clubs.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-16 text-center">
                                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                        <Building2 className="w-8 h-8 text-slate-400" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800 mb-1">Aucun club</h3>
                                                    <p className="text-slate-500">Commencez par créer votre premier club</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'activites' && (
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                                    <CalendarIcon className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Gestion des activités</h2>
                            </div>
                            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Titre</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {activites && activites.map((activite: any) => (
                                            <tr key={activite.id} className="bg-emerald-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-bold text-slate-900 text-base">{activite.titre}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                                                    {new Date(activite.date_debut).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                                                        activite.statut === 'planifie' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                        activite.statut === 'en_cours' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                        'bg-slate-100 text-slate-800 border-slate-200'
                                                    }`}>
                                                        {activite.statut}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {!activites || activites.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-16 text-center">
                                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                        <CalendarIcon className="w-8 h-8 text-slate-400" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800 mb-1">Aucune activité</h3>
                                                    <p className="text-slate-500">Commencez par créer votre première activité</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'demandes-local' && (
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Demandes de locaux</h2>
                            </div>
                            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Club</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Salle</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Statut</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {demandesLocal && demandesLocal.map((demande: any) => (
                                            <tr key={demande.id} className="bg-amber-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 text-base">{demande.club?.nom}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">{demande.salle_souhaitee}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                                                    {new Date(demande.date).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                                                        demande.statut === 'en_attente' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                                        demande.statut === 'approuvée' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                        'bg-rose-100 text-rose-800 border-rose-200'
                                                    }`}>
                                                        {demande.statut}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {demande.statut === 'en_attente' && (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleValiderLocal(demande.id)}
                                                                className="inline-flex items-center justify-center w-9 h-9 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                                                title="Approuver"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectLocal(demande.id)}
                                                                className="inline-flex items-center justify-center w-9 h-9 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                                                                title="Rejeter"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {!demandesLocal || demandesLocal.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-16 text-center">
                                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                        <MapPin className="w-8 h-8 text-slate-400" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800 mb-1">Aucune demande de local</h3>
                                                    <p className="text-slate-500">Aucune demande de réservation de local en cours</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'demandes-budget' && (
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Demandes de budget</h2>
                            </div>
                            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Club</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Montant</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Statut</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {demandesBudget && demandesBudget.map((demande: any) => (
                                            <tr key={demande.id} className="bg-purple-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 text-base">{demande.club?.nom}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-bold text-lg">
                                                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(demande.montant_demande)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                                                        demande.statut === 'en_attente' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                                        demande.statut === 'approuvée' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                        'bg-rose-100 text-rose-800 border-rose-200'
                                                    }`}>
                                                        {demande.statut}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {demande.statut === 'en_attente' && (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleValiderBudget(demande.id)}
                                                                className="inline-flex items-center justify-center w-9 h-9 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                                                title="Approuver"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectBudget(demande.id)}
                                                                className="inline-flex items-center justify-center w-9 h-9 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                                                                title="Rejeter"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {!demandesBudget || demandesBudget.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-16 text-center">
                                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                        <Wallet className="w-8 h-8 text-slate-400" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800 mb-1">Aucune demande de budget</h3>
                                                    <p className="text-slate-500">Aucune demande de budget en cours</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'roles' && (
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center">
                                    <UsersIcon className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Gestion des utilisateurs</h2>
                            </div>
                            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Nom</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Rôle</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Statut</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {users && users.map((user: any) => (
                                            <tr key={user.id} className="bg-rose-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 text-base">{user.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium capitalize">{user.role}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                                                        user.est_actif ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'
                                                    }`}>
                                                        {user.est_actif ? 'Actif' : 'Inactif'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleToggleUserStatus(user.id)}
                                                            className={`inline-flex items-center justify-center w-9 h-9 text-white rounded-lg transition-colors ${
                                                                user.est_actif ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'
                                                            }`}
                                                            title={user.est_actif ? 'Désactiver' : 'Activer'}
                                                        >
                                                            {user.est_actif ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateUserRole(user.id, user.role)}
                                                            className={`inline-flex items-center justify-center px-3 h-9 text-white font-bold text-xs rounded-lg transition-colors ${
                                                                user.role === 'admin' ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-blue-500 hover:bg-blue-600'
                                                            }`}
                                                            title="Changer le rôle"
                                                        >
                                                            {user.role === 'admin' ? 'Rétrograder' : 'Promouvoir'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="inline-flex items-center justify-center w-9 h-9 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                                                            title="Supprimer"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {!users || users.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-16 text-center">
                                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                        <UsersIcon className="w-8 h-8 text-slate-400" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800 mb-1">Aucun utilisateur</h3>
                                                    <p className="text-slate-500">Aucun utilisateur enregistré</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    )
}
