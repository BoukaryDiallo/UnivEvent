import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Soutenances', href: '/soutenances' },
];

interface Soutenance {
    id: number;
    titre: string;
    date_soutenance: string;
    heure_debut: string;
    heure_fin: string;
    statut: string;
    salle: { nom: string };
    etudiant: { name: string };
}

export default function SoutenancesIndex({ soutenances }: { soutenances: Soutenance[] }) {
    const statutColor = (statut: string) => {
        switch (statut) {
            case 'planifiee': return 'bg-blue-100 text-blue-800';
            case 'en_cours': return 'bg-yellow-100 text-yellow-800';
            case 'terminee': return 'bg-green-100 text-green-800';
            case 'annulee': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Supprimer cette soutenance ?')) {
            router.delete(`/soutenances/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Soutenances" />
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Gestion des Soutenances</h1>
                    <Link
                        href="/soutenances/create"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        + Nouvelle Soutenance
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Titre</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Étudiant</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Heure</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Salle</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Statut</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {soutenances.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                        Aucune soutenance planifiée.
                                    </td>
                                </tr>
                            ) : (
                                soutenances.map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{s.titre}</td>
                                        <td className="px-4 py-3">{s.etudiant?.name}</td>
                                        <td className="px-4 py-3">{new Date(s.date_soutenance).toLocaleDateString('fr-FR')}</td>
                                        <td className="px-4 py-3">{s.heure_debut} - {s.heure_fin}</td>
                                        <td className="px-4 py-3">{s.salle?.nom}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statutColor(s.statut)}`}>
                                                {s.statut}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 flex gap-2">
                                            <Link href={`/soutenances/${s.id}`} className="text-blue-600 hover:underline text-sm">Voir</Link>
                                            <Link href={`/soutenances/${s.id}/edit`} className="text-yellow-600 hover:underline text-sm">Modifier</Link>
                                            <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline text-sm">Supprimer</button>
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