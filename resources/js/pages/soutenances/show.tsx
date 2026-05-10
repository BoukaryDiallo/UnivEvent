import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Soutenances', href: '/soutenances' },
    { title: 'Détails', href: '#' },
];

export default function SoutenanceShow({ soutenance }: { soutenance: any }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={soutenance.titre} />
            <div className="p-6 max-w-3xl mx-auto">
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-2xl font-bold">{soutenance.titre}</h1>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {soutenance.statut}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="font-semibold">Étudiant :</span> {soutenance.etudiant?.name}</div>
                        <div><span className="font-semibold">Salle :</span> {soutenance.salle?.nom} - {soutenance.salle?.batiment}</div>
                        <div><span className="font-semibold">Date :</span> {new Date(soutenance.date_soutenance).toLocaleDateString('fr-FR')}</div>
                        <div><span className="font-semibold">Heure :</span> {soutenance.heure_debut} - {soutenance.heure_fin}</div>
                        {soutenance.description && (
                            <div className="col-span-2"><span className="font-semibold">Description :</span> {soutenance.description}</div>
                        )}
                    </div>
                </div>

                {soutenance.jury ? (
                    <div className="bg-white rounded-xl shadow p-6 mb-6">
                        <h2 className="text-lg font-bold mb-4">Jury : {soutenance.jury.nom}</h2>
                        <p className="text-sm mb-2"><span className="font-semibold">Président :</span> {soutenance.jury.president?.name}</p>
                        <h3 className="font-semibold text-sm mb-2">Membres :</h3>
                        <ul className="space-y-1">
                            {soutenance.jury.membres?.map((m: any) => (
                                <li key={m.id} className="text-sm flex items-center gap-2">
                                    <span>{m.user?.name}</span>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{m.role}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                        <p className="text-yellow-800 text-sm">Aucun jury constitué.
                            <Link href="/jurys/create" className="ml-2 text-blue-600 underline">Constituer un jury</Link>
                        </p>
                    </div>
                )}

                <div className="flex gap-3">
                    <Link href={`/soutenances/${soutenance.id}/edit`} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">
                        Modifier
                    </Link>
                    <Link href="/soutenances" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                        Retour
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}