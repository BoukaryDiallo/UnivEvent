import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Soutenances', href: '/soutenances' },
    { title: 'Modifier', href: '#' },
];

interface Salle { id: number; nom: string; batiment: string; }
interface User { id: number; name: string; }

export default function SoutenanceEdit({ soutenance, salles, etudiants }: { soutenance: any; salles: Salle[]; etudiants: User[] }) {
    const { data, setData, put, errors, processing } = useForm({
        titre: soutenance.titre,
        description: soutenance.description || '',
        date_soutenance: soutenance.date_soutenance,
        heure_debut: soutenance.heure_debut,
        heure_fin: soutenance.heure_fin,
        salle_id: soutenance.salle_id,
        etudiant_id: soutenance.etudiant_id,
        statut: soutenance.statut,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/soutenances/${soutenance.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Modifier Soutenance" />
            <div className="p-6 max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Modifier la Soutenance</h1>
                <div className="bg-white rounded-xl shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                            <input type="text" value={data.titre} onChange={e => setData('titre', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2" required />
                            {errors.titre && <p className="text-red-500 text-sm mt-1">{errors.titre}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea value={data.description} onChange={e => setData('description', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2" rows={3} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" value={data.date_soutenance} onChange={e => setData('date_soutenance', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2" required />
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                            <select value={data.statut} onChange={e => setData('statut', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2">
                                <option value="planifiee">Planifiée</option>
                                <option value="en_cours">En cours</option>
                                <option value="terminee">Terminée</option>
                                <option value="annulee">Annulée</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Salle</label>
                            <select value={data.salle_id} onChange={e => setData('salle_id', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2" required>
                                {salles.map(s => <option key={s.id} value={s.id}>{s.nom} ({s.batiment})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Étudiant</label>
                            <select value={data.etudiant_id} onChange={e => setData('etudiant_id', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2" required>
                                {etudiants.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="submit" disabled={processing}
                                className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50">
                                Modifier
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