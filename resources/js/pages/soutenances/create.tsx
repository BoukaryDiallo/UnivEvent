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

    const inputClass = "w-full rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";
    const labelClass = "block text-sm font-medium text-foreground mb-1";

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouvelle Soutenance" />
            <div className="p-6 max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Planifier une Soutenance</h1>
                    <p className="text-muted-foreground text-sm mt-1">Remplissez les informations de la soutenance</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className={labelClass}>Titre</label>
                            <input type="text" value={data.titre}
                                onChange={e => setData('titre', e.target.value)}
                                className={inputClass} placeholder="Titre de la soutenance" required />
                            {errors.titre && <p className="text-destructive text-sm mt-1">{errors.titre}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className={inputClass} rows={3} placeholder="Description optionnelle" />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Date</label>
                                <input type="date" value={data.date_soutenance}
                                    onChange={e => setData('date_soutenance', e.target.value)}
                                    className={inputClass} required />
                                {errors.date_soutenance && <p className="text-destructive text-sm mt-1">{errors.date_soutenance}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Heure début</label>
                                <input type="time" value={data.heure_debut}
                                    onChange={e => setData('heure_debut', e.target.value)}
                                    className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Heure fin</label>
                                <input type="time" value={data.heure_fin}
                                    onChange={e => setData('heure_fin', e.target.value)}
                                    className={inputClass} required />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Salle</label>
                            <select value={data.salle_id}
                                onChange={e => setData('salle_id', e.target.value)}
                                className={inputClass} required>
                                <option value="">-- Choisir une salle --</option>
                                {salles.map(s => (
                                    <option key={s.id} value={s.id}>{s.nom} ({s.batiment})</option>
                                ))}
                            </select>
                            {errors.salle_id && <p className="text-destructive text-sm mt-1">{errors.salle_id}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Étudiant</label>
                            <select value={data.etudiant_id}
                                onChange={e => setData('etudiant_id', e.target.value)}
                                className={inputClass} required>
                                <option value="">-- Choisir un étudiant --</option>
                                {etudiants.map(e => (
                                    <option key={e.id} value={e.id}>{e.name}</option>
                                ))}
                            </select>
                            {errors.etudiant_id && <p className="text-destructive text-sm mt-1">{errors.etudiant_id}</p>}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="submit" disabled={processing}
                                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium transition-colors">
                                Planifier
                            </button>
                            <Link href="/soutenances"
                                className="bg-secondary text-secondary-foreground px-6 py-2 rounded-lg hover:bg-secondary/80 text-sm font-medium transition-colors">
                                Annuler
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}