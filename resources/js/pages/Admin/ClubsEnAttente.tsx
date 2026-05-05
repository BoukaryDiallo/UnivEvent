import { Head, Link } from '@inertiajs/react'
import { Check, X, Clock, Building2, Mail, User, Tag } from 'lucide-react'
import AppLayout from '@/layouts/app-layout'
import { dashboard } from '@/routes'
import type { BreadcrumbItem } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Administration',
        href: '/admin/clubs/en-attente',
    },
    {
        title: 'Demandes de création',
        href: '/admin/clubs/en-attente',
    },
]

interface Club {
  id: number
  nom: string
  type: string
  description: string
  statut: string
  responsable: { id: number; name: string; email: string }
}

interface Props {
  clubs: Club[]
}

export default function ClubsEnAttente({ clubs }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Demandes de création de clubs" />
      <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-8 bg-slate-50">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Demandes de création de clubs</h1>
              <p className="text-slate-500 mt-1 text-base font-medium">Validez ou rejetez les demandes de création de clubs en attente</p>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">{clubs.length} demande(s) en attente</span>
            </div>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
        </div>

        {clubs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Aucune demande en attente</h3>
            <p className="text-slate-500">Toutes les demandes de création de clubs ont été traitées</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map(club => (
              <div key={club.id} className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-amber-200 transition-all duration-300">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{club.nom}</h2>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3" />
                        En attente
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 mb-5 line-clamp-3 text-sm leading-relaxed">{club.description}</p>

                {/* Info Grid */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Tag className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Type</p>
                      <p className="text-sm font-semibold text-slate-800 capitalize">{club.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <User className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Responsable</p>
                      <p className="text-sm font-semibold text-slate-800">{club.responsable.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Email</p>
                      <p className="text-sm font-semibold text-slate-800">{club.responsable.email}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <form method="POST" action={`/admin/clubs/${club.id}/valider`} className="flex-1">
                    <input type="hidden" name="_token" value={(document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''} />
                    <input type="hidden" name="_method" value="PUT" />
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold text-sm"
                    >
                      <Check className="w-4 h-4" />
                      Valider
                    </button>
                  </form>
                  <form method="POST" action={`/admin/clubs/${club.id}/rejeter`} className="flex-1">
                    <input type="hidden" name="_token" value={(document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''} />
                    <input type="hidden" name="_method" value="PUT" />
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold text-sm"
                    >
                      <X className="w-4 h-4" />
                      Rejeter
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
