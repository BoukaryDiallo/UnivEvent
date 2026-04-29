import { Head, Link, useForm, usePage, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { dashboard } from '@/routes'
import type { BreadcrumbItem } from '@/types'
import { UserPlus, LogOut, MapPin, DollarSign, Check, X, Shield, Trash2, Building2, Calendar, Users, ArrowLeft, MessageSquare, Send } from 'lucide-react'

interface Club {
  id: number
  nom: string
  type: string
  statut: string
  description: string
  responsable: { name: string }
  adhesions: Array<{
    id: number
    user: { name: string; email: string }
    statut: string
    role_dans_club: string
  }>
  activites: Array<{
    id: number
    titre: string
    description: string
    date_debut: string
    date_fin: string
    statut: string
  }>
  demandes_local: Array<{
    id: number
    salle_souhaitee: string
    date: string
    statut: string
    commentaire: string | null
  }>
  demandes_budget: Array<{
    id: number
    montant_demande: number
    justificatif: string
    statut: string
    commentaire: string | null
  }>
  forum_messages: Array<{
    id: number
    contenu: string
    created_at: string
    user: { id: number; name: string }
  }>
}

interface Props {
  club: Club
}

export default function ClubShow({ club }: Props) {
  const { post, put, processing } = useForm({})
  const forumForm = useForm({
    contenu: ''
  })
  const { auth } = usePage().props as any;
  const user = auth?.user;
  const isAdmin = user?.role === 'admin';

  if (!club) {
    return <div>Chargement...</div>
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
  ]

  const handleJoin = () => {
    post(`/clubs/${club.id}/adherer`)
  }

  const handleLeave = () => {
    post(`/clubs/${club.id}/quitter`)
  }

  const isMember = club.adhesions ? club.adhesions.some((a: any) => a.user?.email === user?.email && a.statut === 'approuvee') : false
  const isResponsable = club.responsable?.name === user?.name
  const canManage = isAdmin || isResponsable;

  // Obtenir le statut d'adhésion de l'utilisateur
  const userAdhesion = club.adhesions ? club.adhesions.find((a: any) => a.user?.email === user?.email) : null
  const adhesionStatut = userAdhesion ? userAdhesion.statut : null

  const handleApprove = (adhesionId: number) => {
    router.visit(`/adhesions/${adhesionId}/valider`, {
      method: 'put'
    })
  }

  const handleReject = (adhesionId: number) => {
    router.visit(`/adhesions/${adhesionId}/rejeter`, {
      method: 'put'
    })
  }

  const handleDeleteActivite = (activiteId: number) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/activites/${activiteId}`;

    const methodInput = document.createElement('input');
    methodInput.type = 'hidden';
    methodInput.name = '_method';
    methodInput.value = 'DELETE';

    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = '_token';
    tokenInput.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

    form.appendChild(methodInput);
    form.appendChild(tokenInput);
    document.body.appendChild(form);
    form.submit();
  }

  const handleTransferResponsabilite = (userId: number) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/clubs/${club.id}/transferer-responsabilite`;

    const methodInput = document.createElement('input');
    methodInput.type = 'hidden';
    methodInput.name = '_method';
    methodInput.value = 'PUT';

    const userIdInput = document.createElement('input');
    userIdInput.type = 'hidden';
    userIdInput.name = 'user_id';
    userIdInput.value = userId.toString();

    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = '_token';
    tokenInput.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

    form.appendChild(methodInput);
    form.appendChild(userIdInput);
    form.appendChild(tokenInput);
    document.body.appendChild(form);
    form.submit();
  }

  const handlePublishActivite = (activiteId: number) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/activites/${activiteId}/publier`;

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
  }

  const handleCancelActivite = (activiteId: number) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/activites/${activiteId}/annuler`;

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
  }

  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault()
    forumForm.post(`/clubs/${club.id}/forum`, {
      onSuccess: () => forumForm.reset('contenu'),
      preserveScroll: true
    })
  }

  const handleDeleteMessage = (messageId: number) => {
    if (confirm('Voulez-vous vraiment supprimer ce message ?')) {
      router.delete(`/forum/${messageId}`, {
        preserveScroll: true
      })
    }
  }

  const statutColors = {
    actif: 'bg-green-100 text-green-800',
    en_attente: 'bg-yellow-100 text-yellow-800',
    suspendu: 'bg-orange-100 text-orange-800',
    dissous: 'bg-red-100 text-red-800',
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={club.nom} />
      <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-8 bg-slate-50">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <Link
            href="/clubs"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux clubs
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{club.nom}</h1>
                <p className="text-slate-600 mt-2 text-lg">{club.description}</p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold border ${
              club.statut === 'actif' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
              club.statut === 'en_attente' ? 'bg-amber-100 text-amber-800 border-amber-200' :
              club.statut === 'suspendu' ? 'bg-orange-100 text-orange-800 border-orange-200' :
              'bg-rose-100 text-rose-800 border-rose-200'
            }`}>
              {club.statut === 'actif' ? 'Actif' :
               club.statut === 'en_attente' ? 'En attente' :
               club.statut === 'suspendu' ? 'Suspendu' :
               club.statut}
            </span>
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Responsable</p>
                  <p className="text-sm font-semibold text-slate-900">{club.responsable?.name || 'Non défini'}</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Type</p>
                  <p className="text-sm font-semibold text-slate-900">{club.type}</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Membres</p>
                  <p className="text-sm font-semibold text-slate-900">{club.adhesions ? club.adhesions.filter((a: any) => a.statut === 'approuvee').length : 0}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex gap-3 flex-wrap">
            {club.statut === 'actif' && !adhesionStatut && (
              <button
                onClick={handleJoin}
                disabled={processing}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold disabled:opacity-50"
              >
                <UserPlus className="w-5 h-5" />
                Rejoindre le club
              </button>
            )}
            {adhesionStatut && (
              <span className={`inline-flex items-center px-6 py-3 rounded-xl font-bold ${
                adhesionStatut === 'approuvee' ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-200' :
                adhesionStatut === 'en_attente' ? 'bg-amber-100 text-amber-800 border-2 border-amber-200' :
                adhesionStatut === 'rejetee' ? 'bg-rose-100 text-rose-800 border-2 border-rose-200' :
                'bg-slate-100 text-slate-800 border-2 border-slate-200'
              }`}>
                {adhesionStatut === 'approuvee' ? 'Membre' :
                 adhesionStatut === 'en_attente' ? 'En attente' :
                 adhesionStatut === 'rejetee' ? 'Rejeté' :
                 'Statut inconnu'}
              </span>
            )}
            {isMember && !isResponsable && (
              <button
                onClick={handleLeave}
                disabled={processing}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold disabled:opacity-50"
              >
                <LogOut className="w-5 h-5" />
                Quitter le club
              </button>
            )}
            {canManage && club.statut === 'actif' && (
              <>
                <Link
                  href={`/clubs/${club.id}/demandes-local/create`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                >
                  <MapPin className="w-5 h-5" />
                  Demander un local
                </Link>
                <Link
                  href={`/clubs/${club.id}/demandes-budget/create`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                >
                  <DollarSign className="w-5 h-5" />
                  Demander un budget
                </Link>
              </>
            )}
          </div>
        </div>

        {canManage && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Membres</h2>
            </div>
            <div className="space-y-4">
              {club.adhesions && club.adhesions.map((adhesion: any) => (
                <div key={adhesion.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {adhesion.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{adhesion.user?.name || 'Inconnu'}</p>
                      <p className="text-sm text-slate-600">{adhesion.user?.email || ''}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                          adhesion.role_dans_club === 'responsable' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {adhesion.role_dans_club}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                          adhesion.statut === 'approuvee' ? 'bg-emerald-100 text-emerald-800' :
                          adhesion.statut === 'en_attente' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {adhesion.statut}
                        </span>
                      </div>
                    </div>
                  </div>
                  {adhesion.statut === 'en_attente' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(adhesion.id)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-sm"
                        title="Accepter"
                      >
                        <Check className="w-4 h-4" />
                        Accepter
                      </button>
                      <button
                        onClick={() => handleReject(adhesion.id)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-semibold text-sm"
                        title="Refuser"
                      >
                        <X className="w-4 h-4" />
                        Refuser
                      </button>
                    </div>
                  )}
                  {adhesion.statut === 'approuvee' && canManage && adhesion.user?.id !== user?.id && (
                    <button
                      onClick={() => handleTransferResponsabilite(adhesion.user.id)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                      title="Désigner comme responsable"
                    >
                      <Shield className="w-4 h-4" />
                      Responsable
                    </button>
                  )}
                </div>
              ))}
              {!club.adhesions || club.adhesions.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Aucun membre pour le moment</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Activités</h2>
            </div>
            {canManage && club.statut === 'actif' && (
              <Link
                href="/activites/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold text-sm"
              >
                <Plus className="w-4 h-4" />
                Créer une activité
              </Link>
            )}
          </div>
          <div className="space-y-4">
            {club.activites && club.activites.filter((activite: any) => canManage || activite.statut === 'publié').map((activite: any) => (
              <div key={activite.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg">{activite.titre}</h3>
                    <p className="text-slate-600 mt-2">{activite.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <p className="text-sm text-slate-500">
                        {new Date(activite.date_debut).toLocaleDateString()} - {new Date(activite.date_fin).toLocaleDateString()}
                      </p>
                    </div>
                    {canManage && (
                      <span className={`inline-flex items-center mt-3 px-3 py-1 rounded-full text-xs font-bold border ${
                        activite.statut === 'publié' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        activite.statut === 'brouillon' ? 'bg-slate-100 text-slate-800 border-slate-200' :
                        activite.statut === 'annulé' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                        'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        {activite.statut}
                      </span>
                    )}
                  </div>
                  {canManage && (
                    <div className="flex gap-2 ml-4">
                      {activite.statut === 'brouillon' && (
                        <button
                          onClick={() => handlePublishActivite(activite.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-sm"
                        >
                          <Check className="w-4 h-4" />
                          Publier
                        </button>
                      )}
                      {activite.statut === 'publie' && (
                        <button
                          onClick={() => handleCancelActivite(activite.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-semibold text-sm"
                        >
                          <X className="w-4 h-4" />
                          Annuler
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteActivite(activite.id)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-semibold text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {(!club.activites || club.activites.filter((activite: any) => canManage || activite.statut === 'publié').length === 0) && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Aucune activité pour le moment</p>
              </div>
            )}
          </div>
        </div>

        {canManage && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Demandes de locaux</h2>
              </div>
              <div className="space-y-4">
                {club.demandes_local && club.demandes_local.map((demande: any) => (
                  <div key={demande.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900">{demande.salle_souhaitee}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <p className="text-sm text-slate-600">
                            {new Date(demande.date).toLocaleString()}
                          </p>
                        </div>
                        <span className={`inline-flex items-center mt-3 px-3 py-1 rounded-full text-xs font-bold border ${
                          demande.statut === 'approuvée' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          demande.statut === 'en_attente' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          demande.statut === 'rejetée' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                          'bg-slate-100 text-slate-800 border-slate-200'
                        }`}>
                          {demande.statut}
                        </span>
                        {demande.commentaire && (
                          <p className="text-sm text-slate-500 mt-2">Commentaire: {demande.commentaire}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {!club.demandes_local || club.demandes_local.length === 0 && (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Aucune demande de local pour le moment</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Demandes de budget</h2>
              </div>
              <div className="space-y-4">
                {club.demandes_budget && club.demandes_budget.map((demande: any) => (
                  <div key={demande.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">{demande.montant_demande} FCFA</h4>
                        <p className="text-slate-600 mt-2">{demande.justificatif}</p>
                        <span className={`inline-flex items-center mt-3 px-3 py-1 rounded-full text-xs font-bold border ${
                          demande.statut === 'approuvée' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          demande.statut === 'en_attente' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          demande.statut === 'rejetée' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                          'bg-slate-100 text-slate-800 border-slate-200'
                        }`}>
                          {demande.statut}
                        </span>
                        {demande.commentaire && (
                          <p className="text-sm text-slate-500 mt-2">Commentaire: {demande.commentaire}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {!club.demandes_budget || club.demandes_budget.length === 0 && (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Aucune demande de budget pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
