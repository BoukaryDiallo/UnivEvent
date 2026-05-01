import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { dashboard } from '@/routes'
import type { BreadcrumbItem } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Activités',
        href: '/activites',
    },
]

interface Activite {
  id: number
  titre: string
  description: string
  date_debut: string
  date_fin: string
  statut: string
  club: { id: number; nom: string }
}

interface Props {
  activites: Activite[]
}

export default function ActivitesIndex({ activites }: Props) {
  const statutColors = {
    brouillon: 'bg-gray-100 text-gray-800',
    publie: 'bg-green-100 text-green-800',
    annule: 'bg-red-100 text-red-800',
    termine: 'bg-blue-100 text-blue-800',
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Activités" />
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activités des clubs</h1>
          <p className="text-gray-600 mt-1">Consultez les activités organisées par les clubs</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activites.map((activite) => (
            <div key={activite.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">{activite.titre}</h2>
              <p className="text-gray-600 mt-2 line-clamp-2">{activite.description}</p>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Club:</span>{' '}
                  <Link href={`/clubs/${activite.club.id}`} className="text-blue-600 hover:text-blue-800">
                    {activite.club.nom}
                  </Link>
                </p>
                <p>
                  <span className="font-medium">Date:</span>{' '}
                  {new Date(activite.date_debut).toLocaleDateString()} - {new Date(activite.date_fin).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-4">
                <span className={`px-2 py-1 rounded text-sm ${statutColors[activite.statut as keyof typeof statutColors]}`}>
                  {activite.statut}
                </span>
              </div>
            </div>
          ))}
          {activites.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              Aucune activité disponible
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
