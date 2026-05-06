import { Head, usePage } from '@inertiajs/react';
import { Edit, Trash2, Power, PowerOff, Plus, Users as UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard, roles } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Gestion des rôles',
        href: roles(),
    },
];

export default function Roles() {
    const { users } = usePage().props as any;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des rôles" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-8 bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">Gestion des utilisateurs</h1>
                        <p className="text-slate-500 mt-2 text-base font-light">Gérez les utilisateurs et leurs rôles</p>
                    </div>
                    <Button variant="default" className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800">
                        <Plus className="w-4 h-4" />
                        Ajouter un utilisateur
                    </Button>
                </div>
        
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nom</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Rôle</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {users?.map((user: any) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap capitalize text-slate-600">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            user.est_actif ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                                                user.est_actif ? 'bg-emerald-500' : 'bg-rose-500'
                                            }`}></span>
                                            {user.est_actif ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100" title="Modifier">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-rose-600 hover:text-rose-800 hover:bg-rose-50" title="Supprimer">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className={user.est_actif ? "text-amber-600 hover:text-amber-800 hover:bg-amber-50" : "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"} title={user.est_actif ? 'Désactiver' : 'Activer'}>
                                                {user.est_actif ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!users || users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <UsersIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p className="font-medium">Aucun utilisateur</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
