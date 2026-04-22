import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface Election {
    id_election: number;
    titre: string;
    description: string;
    statut: string;
}

interface Props {
    election: Election;
}

export default function ElectionTest() {
    // Test avec des données fixes
    const election: Election = {
        id_election: 1,
        titre: 'Test Élection',
        description: 'Description de test',
        statut: 'liste_generee'
    };

    return (
        <AppLayout>
            <Head title="Test Administration" />
            <div className="container mt-5">
                <h1 className="text-3xl font-bold text-gray-900">{election.titre}</h1>
                <p className="text-gray-600 mt-1">{election.description}</p>
                <div className="mt-4 p-4 bg-white border rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Statut: {election.statut}</h2>
                    <p>Si vous voyez ce message, le composant fonctionne !</p>
                </div>
            </div>
        </AppLayout>
    );
}
