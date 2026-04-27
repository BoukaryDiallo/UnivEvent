import { usePage, Link, router } from '@inertiajs/react'
import { Head, useForm } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import departement from '@/routes/departement';
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import CrudList from '@/components/ui/crud-list'
import { Badge } from '@/components/ui/badge'
import type { PageProps } from '@/types/app'

type Departement = {
  id_departement: number
  nom: string
  ufr: {
    nom: string
  } | null
}

type Props = PageProps<{
  departements: Departement[]
}>

export default function DepartementList() {
  const { departements } = usePage<Props>().props
  const { confirm, ConfirmDialog } = useConfirmDialog()

  const deleteDepartement = (id: number) => {
    confirm({
      title: 'Supprimer le département',
      description: 'Êtes-vous sûr de vouloir supprimer ce département ?',
      onConfirm: () => router.delete(departement.destroy.url(id)),
      variant: 'destructive'
    })
  }

  const columns = [
    {
      key: 'id_departement' as keyof Departement,
      label: 'ID',
      render: (value: number) => (
        <Badge variant="secondary">
          {value}
        </Badge>
      )
    },
    {
      key: 'nom' as keyof Departement,
      label: 'Nom'
    },
    {
      key: 'ufr' as keyof Departement,
      label: 'UFR',
      render: (value: any, item: Departement) => (
        <Badge variant="secondary">
          {item.ufr?.nom || 'N/A'}
        </Badge>
      )
    }
  ]

  const actions = [
    {
      label: 'Voir',
      onClick: () => {},
      asChild: true as const,
      href: (departementItem: Departement) => departement.show.url(departementItem.id_departement)
    },
    {
      label: 'Modifier',
      onClick: () => {},
      asChild: true as const,
      href: (departementItem: Departement) => departement.edit.url(departementItem.id_departement)
    },
    {
      label: 'Supprimer',
      onClick: (departementItem: Departement) => deleteDepartement(departementItem.id_departement),
      variant: 'destructive' as const
    }
  ]

  return (
    <AppLayout>
      <Head title="Liste des Départements" />
      <CrudList
        data={departements}
        columns={columns}
        actions={actions}
        title="Liste des Départements"
        description="Gestion des départements universitaires"
        createUrl={departement.create.url()}
        createLabel="Nouveau Département"
        searchPlaceholder="Rechercher un département..."
        searchFields={['nom']}
        emptyMessage="Aucun département trouvé"
        paginated={true}
        itemsPerPage={10}
      />
      <ConfirmDialog />
    </AppLayout>
  )
}
