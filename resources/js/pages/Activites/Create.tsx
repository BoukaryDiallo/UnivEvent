import { Head, Link, useForm } from '@inertiajs/react'
import { X, Plus } from 'lucide-react'
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
    {
        title: 'Créer',
        href: '/activites/create',
    },
]

interface Props {
  clubs: Array<{ id: number; nom: string }>;
  preSelectedClubId?: string;
}

export default function ActiviteCreate({ clubs, preSelectedClubId }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    titre: '',
    description: '',
    date_debut: '',
    date_fin: '',
    club_id: preSelectedClubId || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/activites')
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Créer une activité" />
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Créer une nouvelle activité</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Organisez une activité pour votre club</p>
        </div>
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Titre de l'activité
              </label>
              <input
                type="text"
                value={data.titre}
                onChange={(e) => setData('titre', e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all shadow-sm"
                required
              />
              {errors.titre && <p className="mt-1 text-sm text-red-600">{errors.titre}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Description
              </label>
              <textarea
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all shadow-sm resize-none"
                required
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Date de début
              </label>
              <input
                type="datetime-local"
                value={data.date_debut}
                onChange={(e) => setData('date_debut', e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all shadow-sm"
                required
              />
              {errors.date_debut && <p className="mt-1 text-sm text-red-600">{errors.date_debut}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Date de fin
              </label>
              <input
                type="datetime-local"
                value={data.date_fin}
                onChange={(e) => setData('date_fin', e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all shadow-sm"
                required
              />
              {errors.date_fin && <p className="mt-1 text-sm text-red-600">{errors.date_fin}</p>}
            </div>

            {!preSelectedClubId && (
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Club
                </label>
                <select
                  value={data.club_id}
                  onChange={(e) => setData('club_id', e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all shadow-sm"
                  required
                >
                  <option value="">Sélectionner un club</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.nom}
                    </option>
                  ))}
                </select>
                {errors.club_id && <p className="mt-1 text-sm text-red-600">{errors.club_id}</p>}
              </div>
            )}

            <div className="flex items-center justify-end gap-4">
              <Link
                href="/activites"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <X className="w-4 h-4" />
                Annuler
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                {processing ? 'Création...' : 'Créer l\'activité'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
