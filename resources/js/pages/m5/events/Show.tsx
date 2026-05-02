import { Head, Link, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import { 
    CalendarIcon, 
    MapPinIcon, 
    UsersIcon, 
    ClockIcon, 
    ArrowLeftIcon, 
    DownloadIcon,
    TrophyIcon,
    UserIcon,
    Share2Icon
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventBadge } from '@/components/m5/EventBadge';
import MediaGallery from '@/components/m5/MediaGallery';
import RegistrationModal from '@/components/m5/RegistrationModal';
import type { EventDetail } from '@/types/evenements';

type ShowProps = {
    event: EventDetail;
    participation: any;
    auth: { user: any };
};

export default function EventShow({ event, participation, auth }: ShowProps) {
    const [isRegModalOpen, setIsRegModalOpen] = useState(false);
    
    const isRegistered = !!participation;
    const isFull = event.capacite_max ? event.participants_count >= event.capacite_max : false;

    const breadcrumbs = [
        { title: 'Événements', href: '/m5/events' },
        { title: event.titre, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${event.titre} - UnivEvent`} />

            {/* Hero Header */}
            <div className="relative h-[400px] w-full overflow-hidden">
                {event.cover_url ? (
                    <img src={event.cover_url} className="w-full h-full object-cover" alt={event.titre} />
                ) : (
                    <div className={`w-full h-full ${event.type === 'conference' ? 'bg-indigo-900' : 'bg-purple-900'}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                    <div className="max-w-7xl mx-auto space-y-4">
                        <Link 
                            href="/m5/events" 
                            className="inline-flex items-center text-white/70 hover:text-white transition-colors text-sm font-medium mb-4"
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Retour au fil d'événements
                        </Link>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge className={`${event.type === 'conference' ? 'bg-indigo-600' : 'bg-purple-600'} text-white border-0 rounded-full px-4`}>
                                {event.type === 'conference' ? 'Conférence' : 'Concours'}
                            </Badge>
                            <EventBadge statut={event.statut} size="md" />
                        </div>
                        
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl">
                            {event.titre}
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-6 pt-4 text-white/80">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-indigo-400" />
                                <span className="font-bold">{dayjs(event.date_debut).format('DD MMMM YYYY')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPinIcon className="h-5 w-5 text-rose-400" />
                                <span className="font-bold">{event.lieu || 'Lieu à confirmer'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        <Tabs defaultValue="description" className="w-full">
                            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 mb-8 space-x-8">
                                <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 font-bold text-gray-500 data-[state=active]:text-indigo-600">
                                    Description
                                </TabsTrigger>
                                <TabsTrigger value="programme" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 font-bold text-gray-500 data-[state=active]:text-indigo-600">
                                    Programme
                                </TabsTrigger>
                                <TabsTrigger value="intervenants" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 font-bold text-gray-500 data-[state=active]:text-indigo-600">
                                    Intervenants
                                </TabsTrigger>
                                <TabsTrigger value="documents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 font-bold text-gray-500 data-[state=active]:text-indigo-600">
                                    Documents
                                </TabsTrigger>
                                {event.type === 'concours' && (
                                    <TabsTrigger value="candidature" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 font-bold text-gray-500 data-[state=active]:text-indigo-600">
                                        Candidature
                                    </TabsTrigger>
                                )}
                            </TabsList>

                            <TabsContent value="description" className="mt-0">
                                <div className="prose prose-indigo max-w-none dark:prose-invert">
                                    <div dangerouslySetInnerHTML={{ __html: event.description || '' }} />
                                </div>
                                {event.roles && event.roles.length > 0 && (
                                    <div className="mt-8 pt-8 border-t">
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Mots-clés</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {event.roles.map((tag, i) => (
                                                <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-600 border-0 rounded-full px-4 py-1">
                                                    #{tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="programme" className="mt-0">
                                <div className="space-y-8">
                                    {event.programmes && event.programmes.length > 0 ? (
                                        event.programmes.map((p, i) => (
                                            <div key={i} className="flex gap-6">
                                                <div className="flex flex-col items-center">
                                                    <div className="h-4 w-4 rounded-full bg-indigo-600 shadow-lg shadow-indigo-200" />
                                                    <div className="flex-1 w-0.5 bg-gray-100 my-2" />
                                                </div>
                                                <div className="pb-8 space-y-1">
                                                    <span className="text-xs font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">
                                                        {p.heure_debut} - {p.heure_fin}
                                                    </span>
                                                    <h4 className="text-lg font-bold text-gray-900">{p.titre}</h4>
                                                    <p className="text-sm text-gray-500">{p.description}</p>
                                                    {p.intervenant && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <div className="h-6 w-6 bg-gray-100 rounded-full flex items-center justify-center">
                                                                <UserIcon className="h-3 w-3 text-gray-400" />
                                                            </div>
                                                            <span className="text-xs font-medium text-gray-600">{p.intervenant}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 italic">Le programme n'a pas encore été publié.</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="intervenants" className="mt-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {event.team?.intervenant?.map((member, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-[2rem] border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
                                            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm overflow-hidden">
                                                <UserIcon className="h-8 w-8 text-gray-300" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white">{member.name}</h4>
                                                <p className="text-xs text-indigo-600 font-bold uppercase tracking-tighter">Intervenant</p>
                                                <p className="text-xs text-gray-500 mt-1">{member.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!event.team?.intervenant || event.team.intervenant.length === 0) && (
                                        <p className="text-gray-500 italic col-span-2">Aucun intervenant n'est listé pour le moment.</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="documents" className="mt-0">
                                <MediaGallery medias={event.medias} />
                            </TabsContent>

                            <TabsContent value="candidature" className="mt-0">
                                <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/30">
                                    <h4 className="text-xl font-bold text-indigo-900 dark:text-indigo-400 mb-4">Espace Candidature</h4>
                                    <p className="text-sm text-indigo-700/80 mb-6">
                                        Les soumissions pour ce concours sont ouvertes jusqu'au 20 Mai 2026.
                                        Veuillez préparer votre dossier conformément au règlement du concours.
                                    </p>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8">
                                        Soumettre mon dossier
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Status / Action Card */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 dark:bg-slate-950 dark:border-slate-800 dark:shadow-none">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Votre Statut</h4>
                            
                            <div className="space-y-6">
                                {isRegistered ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl dark:bg-emerald-900/20">
                                            <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                                                <TrophyIcon className="h-5 w-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-tight">Vous êtes inscrit</p>
                                                <p className="text-[10px] text-emerald-700 opacity-70">Confirmation validée</p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            className="w-full h-12 rounded-xl text-rose-500 border-rose-100 hover:bg-rose-50 hover:text-rose-600 font-bold"
                                            onClick={() => setIsRegModalOpen(true)}
                                        >
                                            Gérer mon inscription
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            Rejoignez cet événement pour accéder aux ressources exclusives et recevoir votre certificat de participation.
                                        </p>
                                        <Button 
                                            className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-lg shadow-indigo-200 dark:shadow-none"
                                            onClick={() => setIsRegModalOpen(true)}
                                        >
                                            S'inscrire maintenant
                                        </Button>
                                        {isFull && (
                                            <p className="text-xs text-amber-600 text-center font-bold italic">
                                                ⚠️ Événement complet - Inscription en liste d'attente
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Practical Info Card */}
                        <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Infos Pratiques</h4>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm dark:bg-slate-800">
                                        <CalendarIcon className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white">Date et Heure</p>
                                        <p className="text-sm text-gray-500">{dayjs(event.date_debut).format('DD MMM YYYY à HH:mm')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm dark:bg-slate-800">
                                        <MapPinIcon className="h-5 w-5 text-rose-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white">Lieu</p>
                                        <p className="text-sm text-gray-500">{event.lieu || 'Lieu à confirmer'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm dark:bg-slate-800">
                                        <UsersIcon className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white">Capacité</p>
                                        <p className="text-sm text-gray-500">{event.participants_count} / {event.capacite_max || '∞'} places</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-800">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Organisé par</h4>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                        {event.createur?.name?.[0] || 'O'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{event.createur?.name}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{event.createur?.role || 'Organisateur'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Share */}
                        <div className="flex items-center justify-center gap-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Partager</span>
                            <div className="flex gap-2">
                                <Button size="icon" variant="outline" className="h-10 w-10 rounded-full border-gray-200">
                                    <Share2Icon className="h-4 w-4 text-gray-400" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RegistrationModal 
                isOpen={isRegModalOpen}
                onClose={() => setIsRegModalOpen(false)}
                event={event}
                isRegistered={isRegistered}
                isFull={isFull}
            />
        </AppLayout>
    );
}
