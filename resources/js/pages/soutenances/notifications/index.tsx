import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Notifications', href: '/notifications-soutenance' },
];

export default function NotificationsIndex({ notifications }: { notifications: any[] }) {
    const handleLu = (id: number) => {
        router.patch(`/notifications-soutenance/${id}/lu`);
    };

    const handleDelete = (id: number) => {
        if (confirm('Supprimer cette notification ?')) {
            router.delete(`/notifications-soutenance/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Notifications des Soutenances</h1>
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Soutenance</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Destinataire</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Type</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Message</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Statut</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {notifications.length === 0 ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Aucune notification.</td></tr>
                            ) : (
                                notifications.map(n => (
                                    <tr key={n.id} className={`hover:bg-gray-50 ${!n.lu ? 'bg-yellow-50' : ''}`}>
                                        <td className="px-4 py-3 text-sm">{n.soutenance?.titre}</td>
                                        <td className="px-4 py-3 text-sm">{n.user?.name}</td>
                                        <td className="px-4 py-3">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{n.type}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm max-w-xs truncate">{n.message}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${n.lu ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {n.lu ? 'Lu' : 'Non lu'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 flex gap-2">
                                            {!n.lu && (
                                                <button onClick={() => handleLu(n.id)} className="text-green-600 hover:underline text-sm">
                                                    Marquer lu
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(n.id)} className="text-red-600 hover:underline text-sm">
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}