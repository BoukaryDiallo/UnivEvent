import { Head, Link, usePage } from '@inertiajs/react'
import { Eye, Ban, XCircle, Plus, Building2, Shield, Users, Sparkles, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import AppLayout from '@/layouts/app-layout'
import { dashboard } from '@/routes'
import type { BreadcrumbItem } from '@/types'
import type { Club } from '@/types/club'

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
  const isAdmin = user?.role === 'admin';

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
      
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gray-900 rounded-[2rem] flex items-center justify-center shadow-xl dark:bg-white">
              <Building2 className="h-8 w-8 text-white dark:text-gray-900" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                Clubs de l'université
              </h1>
              <p className="text-sm text-gray-500 font-medium">Supervision et gestion des clubs estudiantins.</p>
            </div>
          </div>
        </div>

        {/* Clubs Table */}
        <Card className="rounded-[2.5rem] border-0 shadow-sm overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
          <CardContent className="p-0 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Nom du club</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Statut</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Rôle</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {clubs.map(club => (
                  <tr key={club.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
                          <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white text-base">{club.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate font-medium text-sm">
                      {club.description || <span className="italic opacity-50">Aucune description</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        club.statut === 'actif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                        club.statut === 'suspendu' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 mr-2 rounded-full ${
                          club.statut === 'actif' ? 'bg-emerald-500' :
                          club.statut === 'suspendu' ? 'bg-amber-500' :
                          'bg-rose-500'
                        }`}></span>
                        {club.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getUserRoleInClub(club) && (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          getUserRoleInClub(club) === 'responsable' 
                            ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20' 
                            : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                        }`}>
                          {getUserRoleInClub(club) === 'responsable' ? (
                            <><Shield className="w-3 h-3" /> Resp.</>
                          ) : (
                            <><Users className="w-3 h-3" /> Membre</>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/clubs/${club.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:scale-110 transition-transform shadow-sm"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {isAdmin && (
                          <>
                            {club.statut !== 'suspendu' && club.statut !== 'dissous' && (
                              <button
                                onClick={() => handleSuspendre(club.id)}
                                className="inline-flex items-center justify-center w-8 h-8 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors border border-amber-200 dark:border-amber-500/20"
                                title="Suspendre"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                            {club.statut === 'suspendu' && (
                              <button
                                onClick={() => handleReactiver(club.id)}
                                className="inline-flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors border border-emerald-200 dark:border-emerald-500/20"
                                title="Réactiver"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {club.statut !== 'dissous' && (
                              <button
                                onClick={() => handleDissoudre(club.id)}
                                className="inline-flex items-center justify-center w-8 h-8 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors border border-rose-200 dark:border-rose-500/20"
                                title="Dissoudre"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}