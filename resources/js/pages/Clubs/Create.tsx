import { Head, Link, useForm, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { dashboard } from '@/routes'
import type { BreadcrumbItem } from '@/types'
import { X, Plus } from 'lucide-react'

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
        title: 'Créer',
        href: '/clubs/create',
    },
]

export default function ClubCreate() {
  const { auth, flash } = usePage().props as any;
  const isAdmin = auth?.user?.role === 'admin';
  
  const { data, setData, post, processing, errors } = useForm({
    nom: '',
    type: 'sportif',
    description: '',
    president_nom: '',
    president_prenom: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/clubs')
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Créer un club" />
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Créer un nouveau club</h1>
          <p className="text-gray-600 mt-2">
            Remplissez le formulaire ci-dessous pour créer un nouveau club. Votre demande sera soumise à validation par l'administration.
          </p>
          {flash?.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{flash.error}</p>
            </div>
          )}
          {flash?.success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{flash.success}</p>
            </div>
          )}
        </div>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du club
              </label>
              <input
                type="text"
                value={data.nom}
                onChange={(e) => setData('nom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                required
              />
              {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de club
              </label>
              <select
                value={data.type}
                onChange={(e) => setData('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                required
              >
                <option value="sportif">Sportif</option>
                <option value="culturel">Culturel</option>
                <option value="scientifique">Scientifique</option>
                <option value="humanitaire">Humanitaire</option>
                <option value="autre">Autre</option>
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                required
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {isAdmin && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3">Responsable du club</h3>
                  <p className="text-xs text-blue-700 mb-4">En tant qu'administrateur, vous ne pouvez pas être responsable d'un club. Veuillez désigner un étudiant.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de l'étudiant
                      </label>
                      <input
                        type="text"
                        value={data.president_nom}
                        onChange={(e) => setData('president_nom', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        required={isAdmin}
                      />
                      {errors.president_nom && <p className="mt-1 text-sm text-red-600">{errors.president_nom}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom de l'étudiant
                      </label>
                      <input
                        type="text"
                        value={data.president_prenom}
                        onChange={(e) => setData('president_prenom', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        required={isAdmin}
                      />
                      {errors.president_prenom && <p className="mt-1 text-sm text-red-600">{errors.president_prenom}</p>}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-end gap-4">
              <Link
                href="/clubs"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <X className="w-4 h-4" />
                Annuler
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {processing ? 'Création...' : 'Créer le club'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
