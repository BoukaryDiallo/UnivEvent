import { Head, Link, useForm } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { dashboard } from '@/routes'
import type { BreadcrumbItem } from '@/types'

interface Props {
  club: { id: number; nom: string }
}

export default function DemandeBudgetCreate({ club }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    montant_demande: '',
    justificatif: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(`/clubs/${club.id}/demandes/budget`)
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
      title: 'Demander un budget',
      href: `/clubs/${club.id}/demandes-budget/create`,
    },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Demander un budget" />
      <div className="flex h-full flex-1 flex-col gap-6 p-8 bg-slate-50/50">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden max-w-3xl mx-auto w-full">
          <div className="p-8 sm:p-10">
            <h1 className="text-3xl font-black text-slate-900">Demander un budget pour {club.nom}</h1>
            <p className="text-slate-500 mt-3 text-lg">
              Remplissez le formulaire ci-dessous pour demander un financement.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-8">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Montant demandé (FCFA)
                </label>
                <input
                  type="number"
                  value={data.montant_demande}
                  onChange={(e) => setData('montant_demande', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                  required
                  min="0"
                />
                {errors.montant_demande && <p className="mt-2 text-sm text-rose-600 font-medium">{errors.montant_demande}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Justificatif
                </label>
                <textarea
                  value={data.justificatif}
                  onChange={(e) => setData('justificatif', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none resize-none"
                  required
                  placeholder="Expliquez la raison de cette demande de budget..."
                />
                {errors.justificatif && <p className="mt-2 text-sm text-rose-600 font-medium">{errors.justificatif}</p>}
              </div>

              <div className="flex items-center justify-end gap-4 pt-8 mt-8 border-t border-slate-100">
                <Link
                  href={`/clubs/${club.id}`}
                  className="px-6 py-3 text-slate-600 font-bold hover:text-slate-900 transition-colors"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-8 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all shadow-sm disabled:opacity-50"
                >
                  {processing ? 'Envoi...' : 'Envoyer la demande'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
