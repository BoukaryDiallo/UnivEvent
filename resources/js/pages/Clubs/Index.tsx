import { Head, Link, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Club } from '@/types/club'
import { dashboard } from '@/routes'
import type { BreadcrumbItem } from '@/types'
import { Eye, Ban, XCircle, Plus, Building2, Shield, Users, Sparkles, CheckCircle } from 'lucide-react'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Clubs',
        href: '/clubs',
    },
]

interface Props {
  clubs: Club[]
}

export default function ClubsIndex({ clubs }: Props) {
  const { auth } = usePage().props as any;
  const user = auth?.user;
  const isAdmin = auth?.roles?.includes('admin');

  const getUserRoleInClub = (club: any) => {
    if (club.responsable?.id === user?.id) {
      return 'responsable';
    }
    if (club.adhesions && club.adhesions.some((a: any) => a.statut === 'approuvee')) {
      return 'membre';
    }
    return null;
  };

  const handleSuspendre = (clubId: number) => {
    const motif = prompt('Motif de la suspension:');
    if (motif) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `/admin/clubs/${clubId}/suspendre`;
      
      const methodInput = document.createElement('input');
      methodInput.type = 'hidden';
      methodInput.name = '_method';
      methodInput.value = 'PUT';
      
      const motifInput = document.createElement('input');
      motifInput.type = 'hidden';
      motifInput.name = 'motif';
      motifInput.value = motif;
      
      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = '_token';
      tokenInput.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
      
      form.appendChild(methodInput);
      form.appendChild(motifInput);
      form.appendChild(tokenInput);
      document.body.appendChild(form);
      form.submit();
    }
  };

  const handleDissoudre = (clubId: number) => {
    const motif = prompt('Motif de la dissolution:');
    if (motif) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `/admin/clubs/${clubId}/dissoudre`;
      
      const methodInput = document.createElement('input');
      methodInput.type = 'hidden';
      methodInput.name = '_method';
      methodInput.value = 'PUT';
      
      const motifInput = document.createElement('input');
      motifInput.type = 'hidden';
      motifInput.name = 'motif';
      motifInput.value = motif;
      
      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = '_token';
      tokenInput.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
      
      form.appendChild(methodInput);
      form.appendChild(motifInput);
      form.appendChild(tokenInput);
      document.body.appendChild(form);
      form.submit();
    }
  };

  const handleReactiver = (clubId: number) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/admin/clubs/${clubId}/reactiver`;
    
    const methodInput = document.createElement('input');
    methodInput.type = 'hidden';
    methodInput.name = '_method';
    methodInput.value = 'PUT';
    
    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = '_token';
    tokenInput.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
    
    form.appendChild(methodInput);
    form.appendChild(tokenInput);
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Clubs" />
      <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-8 bg-slate-50">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Clubs de l'université</h1>
                <p className="text-slate-500 mt-1 text-base font-medium">Gérez les clubs estudiantins de l'université</p>
              </div>
            </div>
          </div>
        </div>

        {/* Clubs Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {clubs.map(club => (
                  <tr key={club.id} className="bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-slate-900 text-base">{club.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate font-medium">{club.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                        club.statut === 'actif' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        club.statut === 'suspendu' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        'bg-rose-100 text-rose-800 border-rose-200'
                      }`}>
                        <span className={`w-2 h-2 mr-2 rounded-full ${
                          club.statut === 'actif' ? 'bg-emerald-500' :
                          club.statut === 'suspendu' ? 'bg-amber-500' :
                          'bg-rose-500'
                        }`}></span>
                        {club.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getUserRoleInClub(club) && (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          getUserRoleInClub(club) === 'responsable' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          'bg-blue-100 text-blue-800 border-blue-200'
                        }`}>
                          {getUserRoleInClub(club) === 'responsable' ? (
                            <>
                              <Shield className="w-3 h-3" />
                              Responsable
                            </>
                          ) : (
                            <>
                              <Users className="w-3 h-3" />
                              Membre
                            </>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/clubs/${club.id}`}
                          className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors shadow-sm"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {isAdmin && (
                          <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
                            {club.statut === 'actif' && (
                              <button
                                onClick={() => handleSuspendre(club.id)}
                                className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 hover:text-amber-700 transition-colors"
                                title="Suspendre"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                            {(club.statut === 'suspendu' || club.statut === 'dissous') && (
                              <button
                                onClick={() => handleReactiver(club.id)}
                                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                                title="Réactiver"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {club.statut !== 'dissous' && (
                              <button
                                onClick={() => handleDissoudre(club.id)}
                                className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 hover:text-rose-700 transition-colors"
                                title="Dissoudre"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}