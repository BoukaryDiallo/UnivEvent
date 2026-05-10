import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Salles', href: '/salles' },
    { title: 'Nouvelle salle', href: '#' },
];

export default function SalleCreate() {
    const { data, setData, post, errors, processing } = useForm({
        nom: '', capacite: '', batiment: '', disponible: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/salles');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouvelle Salle" />
            <div className="p-6 max-w-lg mx-auto">
                <h1 className="text-2xl font-bold mb-6">Ajouter une Salle</h1>
                <div className="bg-white rounded-xl shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                            <input type="text" value={data.nom} onChange={e => setData('nom', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2" required />
                            {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bâtiment</label>
                            <input type="text" value={data.batiment} onChange={e => setData('batiment', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Capacité</label>
                            <input type="number" value={data.capacite} onChange={e => setData('capacite', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2" min="1" required />
                            {errors.capacite && <p className="text-red-500 text-sm mt-1">{errors.capacite}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={data.disponible} onChange={e => setData('disponible', e.target.checked)}
                                className="rounded" id="disponible" />
                            <label htmlFor="disponible" className="text-sm font-medium text-gray-700">Disponible</label>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="submit" disabled={processing}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                Enregistrer
                            </button>
                            <Link href="/salles" className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">
                                Annuler
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}