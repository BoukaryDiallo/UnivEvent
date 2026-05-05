import { Head, usePage, router } from '@inertiajs/react';
import ElectionStatusBadge from '@/components/elections/ElectionStatusBadge';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import CrudList from '@/components/ui/crud-list';
import AppLayout from '@/layouts/app-layout';
import { index as electionsIndex, create as electionsCreate, admin as electionsAdmin } from '@/routes/elections';
import type { PageProps } from '@/types/app';

interface Election {
    id_election: number;
    titre: string;
    description: string;
    date_debut: string;
    date_fin: string;
    statut: string;
    type: string;
    ufr?: { nom: string };
    filiere?: { nom: string };
}

interface Props extends PageProps {
    elections: Election[];
}

export default function ElectionList() {
    const { elections } = usePage<Props>().props;
    const { confirm, ConfirmDialog } = useConfirmDialog();

    const handleDelete = (election: Election) => {
        confirm({
            title: 'Annuler l\'élection',
            description: 'Êtes-vous sûr de vouloir annuler cette élection ?',
            onConfirm: () => {
                router.delete(`/elections/${election.id_election}`);
            },
            variant: 'destructive'
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
            label: 'Date début'
        },
        {
            key: 'date_fin' as keyof Election,
            label: 'Date fin'
        },
        {
            key: 'statut' as keyof Election,
            label: 'Statut',
            render: (value: string) => <ElectionStatusBadge statut={value} />
        },
        {
            key: 'type' as keyof Election,
            label: 'Portée',
            render: (value: string, election: Election) => 
                value === 'ufr' && election.ufr
                    ? `UFR: ${election.ufr.nom}`
                    : value === 'promotion' && election.filiere
                    ? `Promotion: ${election.filiere.nom}`
                    : 'Non définie'
        }
    ];

    const actions = [
        {
            label: 'Administrer',
            onClick: (election: Election) => {},
            asChild: true as const,
            href: (election: Election) => electionsAdmin.url({ election: election.id_election })
        },
        {
            label: 'Modifier',
            onClick: (election: Election) => {},
            asChild: true as const,
            href: (election: Election) => `/elections/${election.id_election}/edit`
        },
        {
            label: 'Annuler',
            onClick: handleDelete,
            variant: 'destructive' as const
        }
    ];

    return (
        <AppLayout>
            <Head title="Liste des Élections" />
            <CrudList
                data={elections}
                columns={columns}
                actions={actions}
                title="Liste des Élections"
                description="Gestion des élections universitaires"
                createUrl={electionsCreate.url()}
                createLabel="Créer une élection"
                searchPlaceholder="Rechercher une élection..."
                searchFields={['titre', 'description']}
                emptyMessage="Aucune élection trouvée"
                paginated={true}
                itemsPerPage={10}
            />
            <ConfirmDialog />
        </AppLayout>
    );
}