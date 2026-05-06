import { Head, Link, router } from '@inertiajs/react';
import { CalendarIcon, UsersIcon, MapPinIcon, ClockIcon, UserIcon, ArrowLeftIcon, Radio, Heart, Share2, CheckCircle, Trophy, MessageCircle, ExternalLink, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { store as joinEvent } from '@/routes/inscriptions';
import type { BreadcrumbItem } from '@/types';

type EventShowProps = {
    event: any;
    participation: any;
    auth: {
        user: any;
    };
};

export default function EventShow({ event, participation: directParticipation, auth }: EventShowProps) {
    const participation = event.participation || directParticipation;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Module 5', href: '/module5/dashboard' },
        { title: 'Événements', href: '/module5/events' },
        { title: event?.titre || 'Détails', href: '#' },
    ];

    const canManage = auth.user && (auth.user.id === event?.createur?.id || auth.user.role === 'admin');
    
    const allowedRoles = event?.public_cible ? event.public_cible.split(',') : ['tous'];
    const isPublic = event?.visibilite === 'public';
    const isUserAllowed = auth.user && (
        isPublic || 
        canManage || 
        allowedRoles.includes('tous') || 
        allowedRoles.includes(auth.user.role)
    );

    const showLiveLink = event.lien_live && isUserAllowed;

    const toggleLike = () => {
        if (!auth.user) {
            router.visit('/login');
            return;
        }
        router.post(`/module5/events/${event.id}/toggle-reaction`, {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={event?.titre} />

            <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
                {/* Image & Main Header */}
                <div className="relative rounded-[3.5rem] overflow-hidden bg-gray-100 shadow-2xl h-[450px] group">
                    {event.cover_url ? (
                        <img src={event.cover_url} alt={event.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-indigo-600 via-indigo-900 to-purple-900">
                            <CalendarIcon className="h-32 w-32 text-white/10" />
                        </div>
                    )}
                    
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-12">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex-1 space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    <Badge className="bg-white/20 backdrop-blur-md text-white border-0 uppercase text-[10px] font-black px-4 py-1.5 rounded-full">
                                        {event.type}
                                    </Badge>
                                    <Badge className={`uppercase text-[10px] font-black px-4 py-1.5 rounded-full border-0 shadow-lg ${
                                        event.statut === 'publie' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                                    }`}>
                                        {event.statut}
                                    </Badge>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight leading-tight">
                                    {event.titre}
                                </h1>
                            </div>
                            
                            <div className="flex gap-3">
                                <Button 
                                    onClick={toggleLike}
                                    className={`rounded-2xl h-14 px-6 border-0 shadow-2xl transition-all hover:scale-105 active:scale-95 ${
                                        event.liked_by_me ? 'bg-rose-600 text-white' : 'bg-white/10 backdrop-blur-xl text-white hover:bg-white/20'
                                    }`}
                                >
                                    <Heart className={`size-6 mr-2 ${event.liked_by_me ? 'fill-current' : ''}`} />
                                    <span className="font-black text-lg">{event.likes_count || 0}</span>
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    className="rounded-2xl h-14 w-14 bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 border-0"
                                >
                                    <Share2 className="size-6" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-10 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-12">
                        {/* Info Bar */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm dark:bg-slate-950 dark:border-slate-800 shadow-slate-200/50">
                            <InfoTile label="Date" value={event.date_debut ? new Date(event.date_debut).toLocaleDateString('fr-FR') : 'À définir'} />
                            <InfoTile label="Lieu" value={event.lieu || 'TBD'} />
                            <InfoTile label="Organisé par" value={event.createur?.name} />
                            <InfoTile label="Inscrits" value={event.participants_count || 0} />
                        </div>

                        {/* Meeting Link (Live) Section */}
                        {showLiveLink && (
                            <Card className="rounded-[3rem] border-0 shadow-2xl bg-indigo-950 text-white overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="flex items-center gap-6 text-center md:text-left">
                                        <div className="h-20 w-20 bg-indigo-500/20 rounded-3xl flex items-center justify-center backdrop-blur-md border border-indigo-500/30">
                                            <Radio className="h-10 w-10 text-indigo-400 animate-pulse" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black uppercase tracking-tight">Visioconférence active</h3>
                                            <p className="text-indigo-300 font-medium">Rejoignez le flux en direct maintenant.</p>
                                        </div>
                                    </div>
                                    <Button asChild size="lg" className="rounded-2xl bg-white text-indigo-950 hover:bg-indigo-50 font-black uppercase tracking-widest text-xs h-16 px-10 shadow-2xl">
                                        <a href={event.lien_live} target="_blank" rel="noopener noreferrer">
                                            Lancer le live
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Description */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                                <MessageCircle className="size-6 text-indigo-600" />
                                À propos de l'événement
                            </h3>
                            <div 
                                className="prose prose-indigo dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 font-medium leading-relaxed bg-white p-10 rounded-[3rem] border border-gray-50 shadow-sm"
                                dangerouslySetInnerHTML={{ __html: event.description || 'Aucune description disponible.' }}
                            />
                        </div>

                        {/* Program */}
                        {event.programmes?.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                                    <ClockIcon className="size-6 text-indigo-600" />
                                    Programme & Sessions
                                </h3>
                                <div className="grid gap-4">
                                    {event.programmes.map((p: any) => (
                                        <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center justify-between group hover:border-indigo-200 transition-all shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-xs shadow-inner">
                                                    {p.heure_debut}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white">{p.titre}</h4>
                                                    <p className="text-xs text-gray-400 font-medium">{p.intervenant || 'Intervenant à confirmer'}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="rounded-xl font-bold uppercase text-[9px] border-gray-100 px-3">{p.salle || 'Salle TBD'}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-10">
                        {/* Participation Card */}
                        <Card className="rounded-[3rem] border-0 shadow-2xl bg-gray-900 text-white overflow-hidden sticky top-8">
                            <CardHeader className="p-8 pb-0">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-400">Participation</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-6 space-y-6">
                                {auth.user ? (
                                    participation ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                                                <CheckCircle className={`size-5 ${participation.backend_statut === 'accepte' ? 'text-emerald-400' : 'text-amber-400'}`} />
                                                <div>
                                                    <p className="font-black uppercase text-xs">
                                                        {participation.backend_statut === 'accepte' ? 'Inscription validée' : 'Demande en attente'}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400">
                                                        {participation.backend_statut === 'accepte' ? 'À bientôt sur place !' : 'L\'organisateur doit valider.'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                className="w-full rounded-2xl h-12 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 font-bold uppercase text-[10px] tracking-widest"
                                                onClick={() => {
                                                    if (confirm("Annuler votre participation ?")) {
                                                        router.delete(`/inscriptions/${participation.id}`, {
                                                            preserveScroll: true,
                                                            onSuccess: () => router.reload(),
                                                        });
                                                    }
                                                }}
                                            >
                                                Se désinscrire
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <p className="text-sm font-medium text-gray-300 leading-relaxed">
                                                Rejoignez cet événement pour accéder aux ressources exclusives et échanger avec les intervenants.
                                            </p>
                                            <Button 
                                                className="w-full rounded-2xl h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs shadow-2xl" 
                                                onClick={() => router.post(joinEvent(), { evenement_id: event.id, mode: 'participe' })}
                                            >
                                                Confirmer ma présence
                                            </Button>
                                        </div>
                                    )
                                ) : (
                                    <div className="space-y-6 text-center">
                                        <div className="h-16 w-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto">
                                            <UserIcon className="size-8 text-gray-500" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-400">Connectez-vous pour rejoindre l'événement.</p>
                                        <Button className="w-full rounded-2xl h-14 bg-white text-gray-900 hover:bg-gray-100 font-black uppercase tracking-widest text-xs shadow-xl" asChild>
                                            <Link href="/login">Identification</Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Resources */}
                        {event.medias?.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                                    <Trophy className="size-5 text-indigo-600" />
                                    Médiathèque
                                </h3>
                                <div className="space-y-3">
                                    {event.medias.map((m: any) => (
                                        <div key={m.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all shadow-sm">
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-900 truncate uppercase">{m.name}</p>
                                                <p className="text-[9px] text-gray-400 font-black uppercase mt-0.5">{m.type}</p>
                                            </div>
                                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-indigo-600">
                                                <ExternalLink className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function InfoTile({ label, value }: { label: string, value: any }) {
    return (
        <div className="space-y-1">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-black text-gray-900 dark:text-white truncate">{value || '---'}</p>
        </div>
    );
}
