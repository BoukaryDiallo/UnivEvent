import { Head, Link, useForm } from '@inertiajs/react'
import { MapPin, X, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
      <Head title={`Demander un local - ${club.nom}`} />
      
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gray-900 rounded-[2rem] flex items-center justify-center shadow-xl dark:bg-white">
              <MapPin className="h-8 w-8 text-white dark:text-gray-900" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                Demander un local
              </h1>
              <p className="text-sm text-gray-500 font-medium">Réserver une salle pour le club {club.nom}.</p>
            </div>
          </div>
        </div>

        <Card className="rounded-[2.5rem] border-0 shadow-sm dark:bg-slate-950 dark:border dark:border-slate-800">
          <CardContent className="p-8 sm:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Salle souhaitée
                  </label>
                  <input
                    type="text"
                    value={data.salle_souhaitee}
                    onChange={(e) => setData('salle_souhaitee', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-shadow"
                    required
                  />
                  {errors.salle_souhaitee && <p className="text-sm text-rose-500 font-bold">{errors.salle_souhaitee}</p>}
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Date et heure souhaitée
                  </label>
                  <input
                    type="datetime-local"
                    value={data.date}
                    onChange={(e) => setData('date', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-shadow"
                    required
                  />
                  {errors.date && <p className="text-sm text-rose-500 font-bold">{errors.date}</p>}
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4">
                <Link
                  href={`/clubs/${club.id}`}
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
                  {processing ? 'Envoi...' : 'Envoyer la demande'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
