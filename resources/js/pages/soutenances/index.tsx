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
    const statutBadge = (statut: string) => {
        switch (statut) {
            case 'planifiee': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
            case 'en_cours': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
            case 'terminee': return 'bg-green-500/20 text-green-400 border border-green-500/30';
            case 'annulee': return 'bg-red-500/20 text-red-400 border border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
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
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Gestion des Soutenances</h1>
                        <p className="text-muted-foreground text-sm mt-1">Planifiez et gérez les soutenances universitaires</p>
                    </div>
                    <Link href="/soutenances/create"
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors">
                        + Nouvelle Soutenance
                    </Link>
                </div>

                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Titre</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Étudiant</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Heure</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Salle</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Statut</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {soutenances.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                        Aucune soutenance planifiée.
                                    </td>
                                </tr>
                            ) : (
                                soutenances.map((s) => (
                                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 font-medium text-foreground">{s.titre}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{s.etudiant?.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{new Date(s.date_soutenance).toLocaleDateString('fr-FR')}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{s.heure_debut} - {s.heure_fin}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{s.salle?.nom}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statutBadge(s.statut)}`}>
                                                {s.statut}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-3">
                                                <Link href={`/soutenances/${s.id}`} className="text-primary hover:text-primary/80 text-sm font-medium">Voir</Link>
                                                <Link href={`/soutenances/${s.id}/edit`} className="text-yellow-500 hover:text-yellow-400 text-sm font-medium">Modifier</Link>
                                                <button onClick={() => handleDelete(s.id)} className="text-destructive hover:text-destructive/80 text-sm font-medium">Supprimer</button>
                                            </div>
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