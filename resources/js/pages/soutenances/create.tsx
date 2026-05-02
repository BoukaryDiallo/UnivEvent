import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Soutenances', href: '/soutenances' },
    { title: 'Nouvelle soutenance', href: '/soutenances/create' },
];

interface Salle { id: number; nom: string; batiment: string; }
interface User { id: number; name: string; }

export default function SoutenanceCreate({ salles, etudiants }: { salles: Salle[]; etudiants: User[] }) {
    const { data, setData, post, errors, processing } = useForm({
        titre: '',
        description: '',
        date_soutenance: '',
        heure_debut: '',
        heure_fin: '',
        salle_id: '',
        etudiant_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/soutenances');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouvelle Soutenance" />
            <div className="p-6 max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Planifier une Soutenance</h1>
                <div className="bg-white rounded-xl shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                            <input type="text" value={data.titre} onChange={e => setData('titre', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                            {errors.titre && <p className="text-red-500 text-sm mt-1">{errors.titre}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea value={data.description} onChange={e => setData('description', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" value={data.date_soutenance} onChange={e => setData('date_soutenance', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2" required />
                                {errors.date_soutenance && <p className="text-red-500 text-sm mt-1">{errors.date_soutenance}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Heure début</label>
                                <input type="time" value={data.heure_debut} onChange={e => setData('heure_debut', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin</label>
                                <input type="time" value={data.heure_fin} onChange={e => setData('heure_fin', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Salle</label>
                            <select value={data.salle_id} onChange={e => setData('salle_id', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2" required>
                                <option value="">-- Choisir une salle --</option>
                                {salles.map(s => <option key={s.id} value={s.id}>{s.nom} ({s.batiment})</option>)}
                            </select>
                            {errors.salle_id && <p className="text-red-500 text-sm mt-1">{errors.salle_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Étudiant</label>
                            <select value={data.etudiant_id} onChange={e => setData('etudiant_id', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2" required>
                                <option value="">-- Choisir un étudiant --</option>
                                {etudiants.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                            {errors.etudiant_id && <p className="text-red-500 text-sm mt-1">{errors.etudiant_id}</p>}
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="submit" disabled={processing}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                Planifier
                            </button>
                            <Link href="/soutenances" className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">
                                Annuler
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}