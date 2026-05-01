import { Head, Link, useForm } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { dashboard } from '@/routes'
import type { BreadcrumbItem } from '@/types'
import { Check, X, Wallet } from 'lucide-react'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Demandes de budget',
        href: '/demandes-budget',
    },
]

interface DemandeBudget {
  id: number
  montant_demande: number
  justificatif: string
  statut: string
  commentaire: string | null
  club: { id: number; nom: string }
}

interface Props {
  demandes: DemandeBudget[]
}

export default function DemandesBudgetIndex({ demandes }: Props) {
  const { put, processing, setData } = useForm({ commentaire: '' })

  const handleValider = (id: number) => {
    put(`/demandes-budget/${id}/valider`)
  }

  const handleRejeter = (id: number) => {
    const commentaire = prompt('Motif du rejet:')
    if (commentaire) {
      setData('commentaire', commentaire)
      put(`/demandes-budget/${id}/rejeter`)
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Demandes de budget" />
      <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">Demandes de budget</h1>
          <p className="text-slate-500 mt-2 text-base font-light">Gérez les demandes de financement</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Club</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Justificatif</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {demandes.map((demande) => (
                <tr key={demande.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/clubs/${demande.club.id}`} className="font-semibold text-slate-900 hover:text-slate-600">
                      {demande.club.nom}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(demande.montant_demande)}
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{demande.justificatif}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      demande.statut === 'en_attente' ? 'bg-amber-100 text-amber-800' :
                      demande.statut === 'approuvée' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                        demande.statut === 'en_attente' ? 'bg-amber-500' :
                        demande.statut === 'approuvée' ? 'bg-emerald-500' :
                        'bg-rose-500'
                      }`}></span>
                      {demande.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {demande.statut === 'en_attente' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleValider(demande.id)}
                          disabled={processing}
                          className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Approuver"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRejeter(demande.id)}
                          disabled={processing}
                          className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Rejeter"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {demande.commentaire && (
                      <p className="text-slate-500 text-xs mt-1">{demande.commentaire}</p>
                    )}
                  </td>
                </tr>
              ))}
              {demandes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Wallet className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium">Aucune demande de budget</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  )
}
