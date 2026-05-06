import { usePage, Link, router } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import { User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import CrudList from '@/components/ui/crud-list'
import AppLayout from '@/layouts/app-layout'
import {destroy,index as etudiantsIndex,edit as etudiantsEdit,create as etudiantsCreate} from '@/routes/etudiants';
import type { PageProps } from '@/types/app'

type Etudiant = {
  id: number
  INE: string
  niveau: string
  date_naissance: string
  photo?: string
  user: {
    name: string
  }
  ufr: {
    nom: string
  }
  departement: {
    nom: string
  }
  filiere: {
    nom: string
  }
}

type Props = PageProps<{
  etudiants: Etudiant[]
}>

export default function EtudiantList() {
  const { etudiants: etudiantList } = usePage<Props>().props
  const { confirm, ConfirmDialog } = useConfirmDialog()

  const deleteEtudiant = (id: number) => {
    confirm({
      title: 'Supprimer l\'étudiant',
      description: 'Êtes-vous sûr de vouloir supprimer cet étudiant ?',
      onConfirm: () => router.delete(destroy.url(id)),
      variant: 'destructive'
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const columns = [
    {
      key: 'INE' as keyof Etudiant,
      label: 'INE'
    },
    {
      key: 'user' as keyof Etudiant,
      label: 'Nom',
      render: (value: any, item: Etudiant) => item.user?.name ?? 'Non spécifié'
    },
    {
      key: 'ufr' as keyof Etudiant,
      label: 'UFR',
      render: (value: any, item: Etudiant) => item.ufr?.nom ?? 'Non spécifiée'
    },
    {
      key: 'departement' as keyof Etudiant,
      label: 'Département',
      render: (value: any, item: Etudiant) => item.departement?.nom ?? 'Non spécifié'
    },
    {
      key: 'filiere' as keyof Etudiant,
      label: 'Filière',
      render: (value: any, item: Etudiant) => item.filiere?.nom ?? 'Non spécifiée'
    },
    {
      key: 'niveau' as keyof Etudiant,
      label: 'Niveau',
      render: (value: string) => <Badge variant="secondary">{value}</Badge>
    },
    {
      key: 'date_naissance' as keyof Etudiant,
      label: 'Naissance',
      render: (value: string) => formatDate(value)
    },
    {
      key: 'photo' as keyof Etudiant,
      label: 'Photo',
      render: (value: any, item: Etudiant) => (
        <div className="relative">
          {item.photo ? (
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
              <img 
                src={`/storage/${item.photo}`} 
                alt={item.user?.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
      )
    }
  ]

  const actions = [
    {
      label: 'Modifier',
      onClick: () => {},
      asChild: true as const,
      href: (etudiant: Etudiant) => etudiantsEdit.url(etudiant.id)
    },
    {
      label: 'Supprimer',
      onClick: (etudiant: Etudiant) => deleteEtudiant(etudiant.id),
      variant: 'destructive' as const
    }
  ]

  return (
    <AppLayout>
      <Head title="Liste des Étudiants" />
      <CrudList
        data={etudiantList}
        columns={columns}
        actions={actions}
        title="Liste des Étudiants"
        description="Gestion des étudiants inscrits"
        createUrl={etudiantsCreate.url()}
        createLabel="Ajouter un étudiant"
        searchPlaceholder="Rechercher par nom ou INE..."
        searchFields={['INE']}
        emptyMessage="Aucun étudiant trouvé"
        paginated={true}
        itemsPerPage={10}
      />
      <ConfirmDialog />
    </AppLayout>
  )
}
