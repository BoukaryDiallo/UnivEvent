import { Head, Link, useForm, usePage } from '@inertiajs/react'
import { X, Plus, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import AppLayout from '@/layouts/app-layout'
import { dashboard } from '@/routes'
import type { BreadcrumbItem } from '@/types'

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
      
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gray-900 rounded-[2rem] flex items-center justify-center shadow-xl dark:bg-white">
              <Building2 className="h-8 w-8 text-white dark:text-gray-900" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                Nouveau Club
              </h1>
              <p className="text-sm text-gray-500 font-medium">Soumettre une demande de création de club estudiantin.</p>
            </div>
          </div>
        </div>

        {flash?.error && (
          <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 font-bold text-sm">
            {flash.error}
          </div>
        )}
        {flash?.success && (
          <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 font-bold text-sm">
            {flash.success}
          </div>
        )}

        <Card className="rounded-[2.5rem] border-0 shadow-sm dark:bg-slate-950 dark:border dark:border-slate-800">
          <CardContent className="p-8 sm:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Nom du club
                  </label>
                  <input
                    type="text"
                    value={data.nom}
                    onChange={(e) => setData('nom', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-shadow"
                    required
                  />
                  {errors.nom && <p className="text-sm text-rose-500 font-bold">{errors.nom}</p>}
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Type de club
                  </label>
                  <select
                    value={data.type}
                    onChange={(e) => setData('type', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-shadow"
                    required
                  >
                    <option value="sportif">Sportif</option>
                    <option value="culturel">Culturel</option>
                    <option value="scientifique">Scientifique</option>
                    <option value="humanitaire">Humanitaire</option>
                    <option value="autre">Autre</option>
                  </select>
                  {errors.type && <p className="text-sm text-rose-500 font-bold">{errors.type}</p>}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Description
                </label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-shadow resize-none"
                  required
                />
                {errors.description && <p className="text-sm text-rose-500 font-bold">{errors.description}</p>}
              </div>

              {isAdmin && (
                <div className="p-6 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-3xl space-y-6">
                  <div>
                    <h3 className="text-sm font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-widest mb-1">Responsable du club</h3>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">En tant qu'administrateur, veuillez désigner un étudiant responsable.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-indigo-800 dark:text-indigo-400 uppercase tracking-widest">
                        Nom de l'étudiant
                      </label>
                      <input
                        type="text"
                        value={data.president_nom}
                        onChange={(e) => setData('president_nom', e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-shadow"
                        required={isAdmin}
                      />
                      {errors.president_nom && <p className="text-sm text-rose-500 font-bold">{errors.president_nom}</p>}
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-indigo-800 dark:text-indigo-400 uppercase tracking-widest">
                        Prénom de l'étudiant
                      </label>
                      <input
                        type="text"
                        value={data.president_prenom}
                        onChange={(e) => setData('president_prenom', e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-shadow"
                        required={isAdmin}
                      />
                      {errors.president_prenom && <p className="text-sm text-rose-500 font-bold">{errors.president_prenom}</p>}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-4 pt-4">
                <Link
                  href="/clubs"
                  className="flex items-center gap-2 px-6 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-bold text-xs uppercase tracking-widest"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/30"
                >
                  <Plus className="w-4 h-4" />
                  {processing ? 'Création...' : 'Créer le club'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
