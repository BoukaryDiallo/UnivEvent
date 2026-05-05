import { usePage, Link, router } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import {destroy,index as filiereIndex,edit as filiereEdit,create as filiereCreate} from '@/routes/filiere';
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import CrudList from '@/components/ui/crud-list'
import { Badge } from '@/components/ui/badge'
import { GraduationCap } from 'lucide-react'
import type { PageProps } from '@/types/app'

type Filiere = {
  id_filiere: number
  code: string
  nom: string
  description?: string
  departement: {
    code: string
    nom: string
    ufr: {
      code: string
      nom: string
    }
  }
}

type Props = PageProps<{
  filieres: Filiere[]
}>

export default function FiliereList() {
  const { filieres } = usePage<Props>().props
  const { confirm, ConfirmDialog } = useConfirmDialog()

  const deleteFiliere = (id: number) => {
    confirm({
      title: 'Supprimer la filière',
      description: 'Êtes-vous sûr de vouloir supprimer cette filière ?',
      onConfirm: () => router.delete(destroy.url(id)),
      variant: 'destructive'
    })
  }

  const columns = [
    {
      key: 'code' as keyof Filiere,
      label: 'Code',
      render: (value: string) => (
        <Badge variant="secondary">
          {value}
        </Badge>
      )
    },
    {
      key: 'nom' as keyof Filiere,
      label: 'Nom',
      render: (value: string, item: Filiere) => (
        <div>
          <div className="font-medium">{value}</div>
          {item.description && (
            <div className="text-sm text-muted-foreground">{item.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'departement' as keyof Filiere,
      label: 'Département',
      render: (value: any, item: Filiere) => (
        <div>
          <Badge variant="secondary" className="mb-1">
            {item.departement?.code}
          </Badge>
          <div className="text-sm">{item.departement?.nom}</div>
        </div>
      )
    },
    {
      key: 'ufr' as keyof Filiere,
      label: 'UFR',
      render: (value: any, item: Filiere) => (
        <Badge variant="outline">
          {item.departement?.ufr?.code}
        </Badge>
      )
    }
  ]

  const actions = [
    {
      label: 'Modifier',
      onClick: () => {},
      asChild: true as const,
      href: (filiere: Filiere) => filiereEdit.url(filiere.id_filiere)
    },
    {
      label: 'Supprimer',
      onClick: (filiere: Filiere) => deleteFiliere(filiere.id_filiere),
      variant: 'destructive' as const
    }
  ]

  return (
    <AppLayout>
      <Head title="Liste des Filières" />
      <CrudList
        data={filieres}
        columns={columns}
        actions={actions}
        title="Liste des Filières"
        description="Gestion des filières de formation"
        createUrl={filiereCreate.url()}
        createLabel="Nouvelle Filière"
        searchPlaceholder="Rechercher une filière..."
        searchFields={['code', 'nom']}
        emptyMessage="Aucune filière trouvée"
        paginated={true}
        itemsPerPage={10}
      />
      <ConfirmDialog />
    </AppLayout>
  )
}

