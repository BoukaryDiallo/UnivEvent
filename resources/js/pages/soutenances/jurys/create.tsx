import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Jurys', href: '/jurys' },
    { title: 'Nouveau jury', href: '#' },
];

export default function JuryCreate({ soutenances, enseignants }: { soutenances: any[]; enseignants: any[] }) {
    const { data, setData, post, errors, processing } = useForm({
        nom: '',
        soutenance_id: '',
        president_id: '',
        membres: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/jurys');
    };

    const toggleMembre = (id: string) => {
        const membres = data.membres.includes(id)
            ? data.membres.filter(m => m !== id)
            : [...data.membres, id];
        setData('membres', membres);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouveau Jury" />
            <div className="p-6 max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Constituer un Jury</h1>
                <div className="bg-white rounded-xl shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du jury</label>
                            <input type="text" value={data.nom} onChange={e => setData('nom', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2" required />
                            {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Soutenance</label>
                            <select value={data.soutenance_id} onChange={e => setData('soutenance_id', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2" required>
                                <option value="">-- Choisir une soutenance --</option>
                                {soutenances.map(s => <option key={s.id} value={s.id}>{s.titre} — {s.date_soutenance}</option>)}
                            </select>
                            {errors.soutenance_id && <p className="text-red-500 text-sm mt-1">{errors.soutenance_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Président du jury</label>
                            <select value={data.president_id} onChange={e => setData('president_id', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2" required>
                                <option value="">-- Choisir un président --</option>
                                {enseignants.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                            {errors.president_id && <p className="text-red-500 text-sm mt-1">{errors.president_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Membres du jury</label>
                            <div className="space-y-2 border rounded-lg p-3 max-h-40 overflow-y-auto">
                                {enseignants.map(e => (
                                    <label key={e.id} className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox"
                                            checked={data.membres.includes(String(e.id))}
                                            onChange={() => toggleMembre(String(e.id))}
                                            className="rounded" />
                                        <span className="text-sm">{e.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="submit" disabled={processing}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                Constituer
                            </button>
                            <Link href="/jurys" className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">
                                Annuler
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}