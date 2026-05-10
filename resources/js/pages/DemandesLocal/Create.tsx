import { Head, Link, useForm } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { dashboard } from '@/routes'
import type { BreadcrumbItem } from '@/types'

interface Props {
  club: { id: number; nom: string }
}

export default function DemandeLocalCreate({ club }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    salle_souhaitee: '',
    date: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(`/clubs/${club.id}/demandes/local`)
  }

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Dashboard',
      href: dashboard(),
    },
    {
      title: 'Clubs',
      href: '/clubs',
    },
    {
      title: club.nom,
      href: `/clubs/${club.id}`,
    },
    {
      title: 'Demander un local',
      href: `/clubs/${club.id}/demandes-local/create`,
    },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Demander un local" />
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Demander un local pour {club.nom}</h1>
          <p className="text-gray-600 mt-2">
            Remplissez le formulaire ci-dessous pour demander une réservation de salle.
          </p>
        </div>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salle souhaitée
              </label>
              <input
                type="text"
                value={data.salle_souhaitee}
                onChange={(e) => setData('salle_souhaitee', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                required
              />
              {errors.salle_souhaitee && <p className="mt-1 text-sm text-red-600">{errors.salle_souhaitee}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date et heure souhaitée
              </label>
              <input
                type="datetime-local"
                value={data.date}
                onChange={(e) => setData('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                required
              />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>

            <div className="flex items-center justify-end gap-4">
              <Link
                href={`/clubs/${club.id}`}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {processing ? 'Envoi...' : 'Envoyer la demande'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
