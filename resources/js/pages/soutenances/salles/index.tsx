import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Salles', href: '/salles' },
];

interface Salle { id: number; nom: string; capacite: number; batiment: string; disponible: boolean; }

export default function SallesIndex({ salles }: { salles: Salle[] }) {
    const handleDelete = (id: number) => {
        if (confirm('Supprimer cette salle ?')) {
            router.delete(`/salles/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Salles" />
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Gestion des Salles</h1>
                    <Link href="/salles/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        + Nouvelle Salle
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {salles.length === 0 ? (
                        <p className="text-gray-400 col-span-3 text-center py-8">Aucune salle enregistrée.</p>
                    ) : (
                        salles.map(salle => (
                            <div key={salle.id} className="bg-white rounded-xl shadow p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <h2 className="text-lg font-bold">{salle.nom}</h2>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${salle.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {salle.disponible ? 'Disponible' : 'Indisponible'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">Bâtiment : {salle.batiment || 'Non précisé'}</p>
                                <p className="text-sm text-gray-600">Capacité : {salle.capacite} personnes</p>
                                <div className="flex gap-2 mt-4">
                                    <Link href={`/salles/${salle.id}/edit`} className="text-yellow-600 hover:underline text-sm">Modifier</Link>
                                    <button onClick={() => handleDelete(salle.id)} className="text-red-600 hover:underline text-sm">Supprimer</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}