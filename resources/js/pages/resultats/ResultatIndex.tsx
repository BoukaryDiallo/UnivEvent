import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import CrudList from '@/components/ui/crud-list';
import { Badge } from '@/components/ui/badge';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import resultatsRoutes from '@/routes/resultats';
import type { PageProps } from '@/types/app';

interface Election {
    id_election: number;
    titre: string;
    description: string;
    statut: string;
    resultat_statut: string;
    date_debut: string;
    date_fin: string;
    tour: number;
    ufr?: { nom: string };
    filiere?: { nom: string };
}

interface Props extends PageProps {
    elections: Election[];
}

export default function ResultatIndex() {
    const { elections } = usePage<Props>().props;
    const { confirm, ConfirmDialog } = useConfirmDialog();

    const handlePublish = (election: Election) => {
        confirm({
            title: 'Publier les résultats',
            description: 'Êtes-vous sûr de vouloir publier les résultats de cette élection ? Cette action les rendra visibles à tous.',
            onConfirm: () => {
                router.post(resultatsRoutes.publier.url({ election: election.id_election }));
            },
            variant: 'default'
        });
    };

    const columns = [
        {
            key: 'titre' as keyof Election,
            label: 'Titre'
        },
        {
            key: 'description' as keyof Election,
            label: 'Description',
            render: (value: string) => value?.slice(0, 50) || ''
        },
        {
            key: 'date_debut' as keyof Election,
            label: 'Date début',
            render: (value: string) => new Date(value).toLocaleDateString('fr-FR')
        },
        {
            key: 'date_fin' as keyof Election,
            label: 'Date fin',
            render: (value: string) => new Date(value).toLocaleDateString('fr-FR')
        },
        {
            key: 'statut' as keyof Election,
            label: 'Statut élection',
            render: (value: string) => (
                <Badge
                    className={
                        value === 'terminee' ? 'bg-green-100 text-green-800' :
                        value === 'ouverte' ? 'bg-blue-100 text-blue-800' :
                        value === 'cloturee' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                    }
                >
                    {value === 'terminee' ? 'Terminée' :
                     value === 'ouverte' ? 'Ouverte' :
                     value === 'cloturee' ? 'Clôturée' :
                     value}
                </Badge>
            )
        },
        {
            key: 'resultat_statut' as keyof Election,
            label: 'Résultats',
            render: (value: string) => (
                <Badge
                    className={
                        value === 'officiel' ? 'bg-green-100 text-green-800' :
                        value === 'brouillon' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }
                >
                    {value === 'officiel' ? 'Officiel' :
                     value === 'brouillon' ? 'Brouillon' :
                     'Aucun'}
                </Badge>
            )
        },
        {
            key: 'tour' as keyof Election,
            label: 'Tour',
            render: (value: number) => `Tour ${value}`
        }
    ];

    const actions = (election: Election) => {
        const baseActions = [
            {
                label: 'Détails',
                onClick: (election: Election) => {},
                asChild: true,
                href: (election: Election) => resultatsRoutes.show.url({ election: election.id_election })
            }
        ];

        // Ajouter l'action de publier uniquement pour les brouillons
        if (election.resultat_statut === 'brouillon') {
            baseActions.push({
                label: 'Publier',
                onClick: handlePublish,
                variant: 'default'
            });
        }

        return baseActions;
    };

    return (
        <AppLayout>
            <Head title="Résultats des élections" />
            <CrudList
                data={elections}
                columns={columns}
                actions={actions}
                title="Résultats des élections"
                description="Gérez les résultats des élections et leur publication"
                searchFields={['titre', 'description']}
                searchPlaceholder="Rechercher une élection..."
                emptyMessage="Aucune élection trouvée"
            />
            <ConfirmDialog />
        </AppLayout>
    );
}