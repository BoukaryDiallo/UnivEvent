import { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
  Building2, 
  Users, 
  Shield, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Plus, 
  Check, 
  X, 
  Trash2, 
  ArrowLeft,
  UserPlus,
  LogOut,
  MessageSquare,
  Send
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';

interface Props {
  club: any;
}

const dashboard = () => '/dashboard';

export default function ClubShow({ club }: Props) {
  const { post, processing } = useForm({})
  const forumForm = useForm({
    contenu: ''
  })
  const { auth } = usePage().props as any;
  const user = auth?.user;
  const isAdmin = user?.role === 'admin' || (auth?.roles && auth.roles.includes('admin'));
  const [activeTab, setActiveTab] = useState('overview');

  if (!club) {
    return <div className="p-8 text-center">Chargement...</div>
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
    if (confirm('Voulez-vous vraiment supprimer cette activité ?')) {
      router.delete(`/activites/${activiteId}`)
    }
  }

  const handleTransferResponsabilite = (userId: number) => {
    if (confirm('Voulez-vous vraiment transférer la responsabilité à ce membre ?')) {
      router.put(`/clubs/${club.id}/transferer-responsabilite`, {
        user_id: userId
      })
    }
  }

  const handlePublishActivite = (activiteId: number) => {
    router.put(`/activites/${activiteId}/publier`)
  }

  const handleCancelActivite = (activiteId: number) => {
    router.put(`/activites/${activiteId}/annuler`)
  }

  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!forumForm.data.contenu.trim()) return
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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={club.nom} />
      <div className="flex h-full flex-1 flex-col gap-6 p-8 bg-slate-50/50">
        {/* Minimalist Hero Section */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-8">
            <Link
              href="/clubs"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux clubs
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm flex-shrink-0">
                  <Building2 className="w-12 h-12 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">{club.nom}</h1>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      club.statut === 'actif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      club.statut === 'en_attente' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {club.statut}
                    </span>
                  </div>
                  <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">{club.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {(isMember || isAdmin) && (
                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-semibold shadow-sm text-sm">
                        <MessageSquare className="w-4 h-4" />
                        Forum
                      </button>
                    </SheetTrigger>
                    <SheetContent className="p-0 sm:max-w-md border-l-0" onOpenAutoFocus={(e) => {
                      e.preventDefault();
                      setTimeout(() => document.getElementById('forum-message-input')?.focus(), 100);
                    }}>
                      <div className="flex flex-col h-full bg-white">
                        <SheetHeader className="p-6 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                              <MessageSquare className="w-5 h-5 text-white" />
                            </div>
                            <SheetTitle className="text-xl font-bold text-slate-900">Forum - {club.nom}</SheetTitle>
                          </div>
                        </SheetHeader>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
                          {club.forum_messages && club.forum_messages.map((message: any) => (
                            <div key={message.id} className={`flex flex-col ${message.user.id === user.id ? 'items-end' : 'items-start'}`}>
                              <div className={`max-w-[90%] rounded-2xl px-4 py-3 shadow-sm border ${
                                message.user.id === user.id 
                                ? 'bg-slate-900 text-white border-slate-800 rounded-tr-none' 
                                : 'bg-white text-slate-900 border-slate-100 rounded-tl-none'
                              }`}>
                                <div className="flex items-center justify-between gap-4 mb-1">
                                  <span className={`text-[10px] font-bold uppercase tracking-wider ${message.user.id === user.id ? 'text-slate-300' : 'text-slate-500'}`}>
                                    {message.user.id === user.id ? 'Moi' : message.user.name}
                                  </span>
                                  <span className={`text-[10px] ${message.user.id === user.id ? 'text-slate-400' : 'text-slate-400'}`}>
                                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.contenu}</p>
                                
                                {(message.user.id === user.id || isAdmin) && (
                                  <button
                                    onClick={() => handleDeleteMessage(message.id)}
                                    className={`mt-2 text-[10px] font-bold uppercase flex items-center gap-1 hover:underline ${
                                      message.user.id === user.id ? 'text-slate-300' : 'text-rose-500'
                                    }`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Supprimer
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Message Form */}
                        <div className="p-4 bg-white border-t border-slate-100">
                          <form onSubmit={handlePostMessage} className="relative">
                            <textarea
                              id="forum-message-input"
                              value={forumForm.data.contenu}
                              onChange={e => forumForm.setData('contenu', e.target.value)}
                              placeholder="Votre message..."
                              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all resize-none min-h-[48px] max-h-32 text-sm text-slate-900 placeholder:text-slate-400 relative z-10 pointer-events-auto"
                              rows={1}
                              required
                            />
                            <button
                              type="submit"
                              disabled={forumForm.processing || !forumForm.data.contenu.trim()}
                              className="absolute right-2 top-2 p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50 z-20"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                )}

                {club.statut === 'actif' && !adhesionStatut && !isAdmin && (
                  <button
                    onClick={handleJoin}
                    disabled={processing}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-sm text-sm disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    Rejoindre
                  </button>
                )}
                
                {isMember && !isResponsable && (
                  <button
                    onClick={handleLeave}
                    disabled={processing}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 transition-all font-semibold text-sm disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Quitter
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex items-center px-8 border-t border-slate-100 bg-slate-50/30 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: Building2 },
              { id: 'activities', label: 'Activités', icon: Calendar },
              { id: 'community', label: 'Communauté', icon: Users },
              ...(canManage ? [{ id: 'admin', label: 'Administration', icon: Shield }] : [])
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                  ? 'border-slate-900 text-slate-900' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                      <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Membres</p>
                      <p className="text-2xl font-black text-slate-900">
                        {club.adhesions ? club.adhesions.filter((a: any) => a.statut === 'approuvee').length : 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Activités</p>
                      <p className="text-2xl font-black text-slate-900">{club.activites?.length || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                      <Shield className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Responsable</p>
                      <p className="text-lg font-bold text-slate-900 truncate">{club.responsable?.name || 'Non défini'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-4">À propos du club</h3>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{club.description}</p>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Détails</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">Type de club:</span>
                        <span className="font-bold text-slate-700">{club.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">Créé le:</span>
                        <span className="font-bold text-slate-700">{new Date(club.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">Prochaines activités</h2>
                {canManage && club.statut === 'actif' && (
                  <Link
                    href={`/activites/create?club_id=${club.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Nouvelle activité
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {club.activites && club.activites.filter((activite: any) => canManage || activite.statut === 'publié').map((activite: any) => (
                  <div key={activite.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all group">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                            activite.statut === 'publié' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {activite.statut}
                          </span>
                        </div>
                        <h3 className="font-black text-slate-900 text-xl group-hover:text-indigo-600 transition-colors">{activite.titre}</h3>
                        <p className="text-slate-500 text-sm line-clamp-2">{activite.description}</p>
                        <div className="flex items-center gap-4 pt-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(activite.date_debut).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {canManage && (
                        <div className="flex flex-col gap-2">
                          {activite.statut === 'brouillon' && (
                            <button onClick={() => handlePublishActivite(activite.id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors">
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleDeleteActivite(activite.id)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {(!club.activites || club.activites.length === 0) && (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                  <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">Aucune activité programmée</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'community' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900">Membres du club</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {club.adhesions && club.adhesions.filter((a: any) => a.statut === 'approuvee').map((adhesion: any) => (
                  <div key={adhesion.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center group transition-all hover:shadow-md">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-black text-2xl border-2 border-white shadow-sm mb-4">
                      {adhesion.user?.name?.charAt(0) || 'U'}
                    </div>
                    <p className="font-black text-slate-900 text-lg line-clamp-1">{adhesion.user?.name}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {adhesion.role_dans_club || 'Membre'}
                    </p>
                    {canManage && adhesion.user?.id !== user?.id && (
                      <button
                        onClick={() => handleTransferResponsabilite(adhesion.user.id)}
                        className="mt-4 px-4 py-1.5 border border-slate-200 text-xs font-bold text-slate-600 rounded-lg hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100"
                      >
                        Désigner Responsable
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'admin' && canManage && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Local Requests */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 shadow-sm">
                        <Building2 className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h3 className="text-xl font-black px-4 py-1.5 bg-indigo-100 text-indigo-900 rounded-xl shadow-sm border border-indigo-200">Demandes de locaux</h3>
                    </div>
                    {!isAdmin && (
                      <Link href={`/clubs/${club.id}/demandes-local/create`} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-wider">
                        Nouvelle
                      </Link>
                    )}
                  </div>
                  <div className="space-y-4 flex-1">
                    {club.demandes_local && club.demandes_local.map((demande: any) => (
                      <div key={demande.id} className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900">{demande.salle_souhaitee}</h4>
                            <p className="text-xs text-slate-500 mt-1">{new Date(demande.date).toLocaleString()}</p>
                            <span className={`inline-flex items-center mt-3 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                              demande.statut === 'approuvée' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              demande.statut === 'en_attente' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              'bg-rose-50 text-rose-700 border-rose-100'
                            }`}>
                              {demande.statut}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!club.demandes_local || club.demandes_local.length === 0) && (
                      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Aucune demande</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Budget Requests */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100 shadow-sm">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-black px-4 py-1.5 bg-purple-100 text-purple-900 rounded-xl shadow-sm border border-purple-200">Demandes de budget</h3>
                    </div>
                    {!isAdmin && (
                      <Link href={`/clubs/${club.id}/demandes-budget/create`} className="text-xs font-bold text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-wider">
                        Nouvelle
                      </Link>
                    )}
                  </div>
                  <div className="space-y-4 flex-1">
                    {club.demandes_budget && club.demandes_budget.map((demande: any) => (
                      <div key={demande.id} className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 hover:border-purple-200 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-black text-slate-900 text-lg">{demande.montant_demande} FCFA</h4>
                            <p className="text-xs text-slate-500 mt-1">{demande.justificatif}</p>
                            <span className={`inline-flex items-center mt-3 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                              demande.statut === 'approuvée' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              demande.statut === 'en_attente' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              'bg-rose-50 text-rose-700 border-rose-100'
                            }`}>
                              {demande.statut}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!club.demandes_budget || club.demandes_budget.length === 0) && (
                      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Aucune demande</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pending Approvals */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shadow-sm">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-black px-4 py-1.5 bg-emerald-100 text-emerald-900 rounded-xl shadow-sm border border-emerald-200">Demandes d'adhésion en attente</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {club.adhesions && club.adhesions.filter((a: any) => a.statut === 'en_attente').map((adhesion: any) => (
                    <div key={adhesion.id} className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-600 font-black text-xl shadow-sm border border-slate-200">
                          {adhesion.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{adhesion.user?.name}</p>
                          <p className="text-xs text-slate-500">{adhesion.user?.email}</p>
                        </div>
                      </div>
                      {isResponsable && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(adhesion.id)} className="p-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors shadow-sm">
                            <Check className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleReject(adhesion.id)} className="p-2 bg-rose-100 text-rose-700 rounded-xl hover:bg-rose-200 transition-colors shadow-sm">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {(!club.adhesions || club.adhesions.filter((a: any) => a.statut === 'en_attente').length === 0) && (
                    <div className="md:col-span-2 lg:col-span-3 text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Aucune demande en attente</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
