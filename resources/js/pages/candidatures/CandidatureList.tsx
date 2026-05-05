import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import CrudList from '@/components/ui/crud-list';
import ElectionStatusBadge from '@/components/elections/ElectionStatusBadge';
import { valider,refuser,show as candidaturesShow, destroy as candidaturesDestroy } from '@/routes/candidatures';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import type { PageProps } from '@/types/app';

type Candidature = {
    id_candidature: number;
    programme: string | null;
    statut: string;
    photo?: string | null;
    cnib_pdf?: string;
    casier_judiciaire_pdf?: string;
    user?: { name: string } | null;
    election?: { titre: string } | null;
};

type Props = PageProps<{
    candidatures: Candidature[];
}>;

export default function CandidatureList() {
    const { candidatures } = usePage<Props>().props;
    const { confirm, ConfirmDialog } = useConfirmDialog();

    const handleDelete = (candidature: Candidature) => {
        confirm({
            title: 'Supprimer la candidature',
            description: 'Êtes-vous sûr de vouloir supprimer cette candidature ?',
            onConfirm: () => {
                router.delete(candidaturesDestroy.url(candidature.id_candidature));
            },
            variant: 'destructive'
        });
    };

    const handleValider = (candidature: Candidature) => {
        confirm({
            title: 'Valider la candidature',
            description: 'Êtes-vous sûr de vouloir valider cette candidature ?',
            onConfirm: () => {
                router.post(valider.url(candidature.id_candidature));
            }
        });
    };

    const handleRefuser = (candidature: Candidature) => {
        confirm({
            title: 'Refuser la candidature',
            description: 'Êtes-vous sûr de vouloir refuser cette candidature ?',
            onConfirm: () => {
                router.post(refuser.url(candidature.id_candidature));
            },
            variant: 'destructive'
        });
    };

    const columns = [
        {
            key: 'user' as keyof Candidature,
            label: 'Candidat',
            render: (value: any, item: Candidature) => item.user?.name ?? 'Non spécifié'
        },
        {
            key: 'election' as keyof Candidature,
            label: 'Élection',
            render: (value: any, item: Candidature) => item.election?.titre ?? 'Non spécifiée'
        },
        {
            key: 'programme' as keyof Candidature,
            label: 'Programme',
            render: (value: string) => value?.slice(0, 50) || ''
        },
        {
            key: 'statut' as keyof Candidature,
            label: 'Statut',
            render: (value: string) => <ElectionStatusBadge statut={value} />
        }
    ];

    const getActions = (candidature: Candidature) => {
        const actions = [
            {
                label: 'Voir',
                onClick: () => {},
                asChild: true as const,
                href: () => candidaturesShow.url({ candidature: candidature.id_candidature })
            }
        ];

        if (candidature.statut === 'en_attente') {
            actions.push(
                {
                    label: 'Valider',
                    onClick: () => handleValider(candidature),
                    variant: 'success' 
                }
               
            );

            actions.push(
                {
                    label: 'Refuser',
                    onClick: () => handleRefuser(candidature),
                    variant: 'primary' 
                }
            );
        }
         

        actions.push({
            label: 'Supprimer',
            onClick: () => handleDelete(candidature),
            variant: 'destructive' 
        });

        return actions;
    };

    return (
        <AppLayout>
            <Head title="Liste des Candidatures" />
            <CrudList
                data={candidatures}
                columns={columns}
                actions={getActions}
                title="Liste des Candidatures"
                description="Gestion des candidatures électorales"
                searchPlaceholder="Rechercher une candidature..."
                emptyMessage="Aucune candidature trouvée"
                paginated={true}
                itemsPerPage={10}
            />
            <ConfirmDialog />
        </AppLayout>
    );
}