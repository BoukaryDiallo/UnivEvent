import { usePage, router } from '@inertiajs/react'
import { Badge } from '@/components/ui/badge'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import CrudList from '@/components/ui/crud-list'
import AppLayout from '@/layouts/app-layout'
import {destroy,index as ufrIndex,edit as ufrEdit,create as ufrCreate} from '@/routes/ufr';

type Ufr = {
  id_ufr: number
  nom: string
  departements_count: number
}

export default function List() {
  const { ufrs } = usePage<{ ufrs: { data: Ufr[] } }>().props
  const { confirm, ConfirmDialog } = useConfirmDialog()

  const handleDelete = (ufr: Ufr) => {
    confirm({
      title: 'Supprimer l\'UFR',
      description: 'Êtes-vous sûr de vouloir supprimer cet UFR ?',
      onConfirm: () => {
        router.delete(destroy.url(ufr.id_ufr))
      },
      variant: 'destructive'
    })
  }

  const columns = [
    {
      key: 'nom' as keyof Ufr,
      label: 'Nom'
    },
    {
      key: 'departements_count' as keyof Ufr,
      label: 'Départements',
      render: (value: number) => (
        <Badge variant="secondary">
          {value ?? 0}
        </Badge>
      )
    }
  ]

  const actions = [
    {
      label: 'Modifier',
      onClick: () => {},
      asChild: true as const,
      href: (ufr: Ufr) => ufrEdit.url(ufr.id_ufr)
    },
    {
      label: 'Supprimer',
      onClick: handleDelete,
      variant: 'destructive' as const
    }
  ]

  return (
    <AppLayout>
      <CrudList
        data={ufrs.data}
        columns={columns}
        actions={actions}
        title="Liste des UFR"
        description="Gestion des unités de formation et de recherche"
        createUrl={ufrCreate.url()}
        createLabel="Nouveau UFR"
        searchPlaceholder="Rechercher un UFR..."
        searchFields={['nom']}
        emptyMessage="Aucun UFR trouvé"
        paginated={true}
        itemsPerPage={10}
      />
      <ConfirmDialog />
    </AppLayout>
  )
}
