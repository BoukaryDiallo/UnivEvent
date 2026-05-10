import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Jurys', href: '/jurys' },
];

export default function JurysIndex({ jurys }: { jurys: any[] }) {
    const handleDelete = (id: number) => {
        if (confirm('Supprimer ce jury ?')) {
            router.delete(`/jurys/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jurys" />
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Gestion des Jurys</h1>
                    <Link href="/jurys/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        + Nouveau Jury
                    </Link>
                </div>
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Nom</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Soutenance</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Président</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Membres</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {jurys.length === 0 ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Aucun jury constitué.</td></tr>
                            ) : (
                                jurys.map(jury => (
                                    <tr key={jury.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{jury.nom}</td>
                                        <td className="px-4 py-3">{jury.soutenance?.titre}</td>
                                        <td className="px-4 py-3">{jury.president?.name}</td>
                                        <td className="px-4 py-3">{jury.membres?.length} membre(s)</td>
                                        <td className="px-4 py-3 flex gap-2">
                                            <Link href={`/jurys/${jury.id}`} className="text-blue-600 hover:underline text-sm">Voir</Link>
                                            <Link href={`/jurys/${jury.id}/edit`} className="text-yellow-600 hover:underline text-sm">Modifier</Link>
                                            <button onClick={() => handleDelete(jury.id)} className="text-red-600 hover:underline text-sm">Supprimer</button>
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