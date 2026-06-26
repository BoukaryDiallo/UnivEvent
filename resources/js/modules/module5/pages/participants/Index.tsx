import { Head, Link } from '@inertiajs/react';
import { 
    Ticket, 
    Trophy, 
    CalendarClock, 
    Rocket,
    Bell
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { ActualitesFeed } from '@/modules/module5/components/ActualitesFeed';
import { ParticipantDashboard } from '@/modules/module5/components/ParticipantDashboard';
import type { BreadcrumbItem } from '@/types';

type ParticipantsIndexProps = {
    mes_inscriptions: any[];
    mes_certificats: any[];
    evenements_suggeres: any[];
    stats: {
        total_inscriptions: number;
        total_certificats: number;
        prochains_evenements: number;
    };
    actualites?: any[];
};

export default function ParticipantsIndex({ mes_inscriptions, mes_certificats, evenements_suggeres, stats, actualites = [] }: ParticipantsIndexProps) {
    const [activeTab, setActiveTab] = useState<'events' | 'news' | 'certs' | 'discover'>('events');
    
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Module 5', href: '/module5/dashboard' },
        { title: 'Espace Participant', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mon Espace Participant" />

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                            Console Participant
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">Suivez vos inscriptions, accédez aux lives et téléchargez vos certificats.</p>
                    </div>
                </div>

                {/* Metrics / Clickable Tabs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InteractiveTabCard 
                        title="Inscriptions" 
                        value={stats.total_inscriptions} 
                        hint="Mes événements" 
                        icon={<Ticket className="h-6 w-6" />} 
                        active={activeTab === 'events'} 
                        onClick={() => setActiveTab('events')} 
                    />
                    <InteractiveTabCard 
                        title="Actualités" 
                        value={actualites?.length || 0} 
                        hint="Flux récent" 
                        icon={<Bell className="h-6 w-6" />} 
                        active={activeTab === 'news'} 
                        onClick={() => setActiveTab('news')} 
                    />
                    <InteractiveTabCard 
                        title="Certificats" 
                        value={stats.total_certificats} 
                        hint="Réussites" 
                        icon={<Trophy className="h-6 w-6" />} 
                        active={activeTab === 'certs'} 
                        onClick={() => setActiveTab('certs')} 
                    />
                    <InteractiveTabCard 
                        title="Découvrir" 
                        value={evenements_suggeres.length} 
                        hint="À ne pas rater" 
                        icon={<Rocket className="h-6 w-6" />} 
                        active={activeTab === 'discover'} 
                        onClick={() => setActiveTab('discover')} 
                    />
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'events' && (
                        <div className="space-y-8">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2 px-2">
                                <Ticket className="size-5 text-indigo-600" />
                                Mes Participations
                            </h2>
                            {mes_inscriptions && mes_inscriptions.length > 0 ? (
                                <div className="space-y-10">
                                    {mes_inscriptions.map((ins: any) => (
                                        <div key={ins.id} className="animate-in fade-in zoom-in duration-300">
                                            <ParticipantDashboard 
                                                event={ins.evenement}
                                                myResult={null}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Card className="rounded-[3rem] border border-dashed border-gray-200 bg-gray-50/50 p-20 text-center">
                                    <Ticket className="size-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-400 font-bold uppercase tracking-widest">Aucune inscription active</p>
                                    <Button variant="link" className="mt-2 text-indigo-600 font-black uppercase text-[10px]" onClick={() => setActiveTab('discover')}>Explorer les événements</Button>
                                </Card>
                            )}
                        </div>
                    )}

                    {activeTab === 'news' && (
                        <div className="max-w-4xl mx-auto">
                            <ActualitesFeed activities={actualites} title="Fil d'actualité personnel" />
                        </div>
                    )}

                    {activeTab === 'certs' && (
                        <div className="space-y-8">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight px-2">Mes Certificats</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {mes_certificats.map((cert) => (
                                    <Card key={cert.id} className="rounded-[2rem] border-0 shadow-sm overflow-hidden hover:shadow-xl transition-all group dark:bg-slate-950 dark:border dark:border-slate-800">
                                        <CardContent className="p-8 space-y-6">
                                            <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                                                <Trophy className="size-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900 dark:text-white uppercase text-sm tracking-tight">{cert.evenement?.titre}</h4>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Délivré le {new Date(cert.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <Button className="w-full rounded-xl bg-gray-900 hover:bg-black font-black uppercase tracking-widest text-[10px] h-11">
                                                Télécharger PDF
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                                {mes_certificats.length === 0 && (
                                    <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-100">
                                        <p className="text-gray-400 font-bold uppercase tracking-widest">Aucun certificat disponible</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'discover' && (
                        <div className="space-y-8">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2 px-2">
                                <Rocket className="size-5 text-indigo-600" />
                                Événements suggérés
                            </h2>
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {evenements_suggeres.map((evt: any) => (
                                    <Card key={evt.id} className="rounded-[2.5rem] border-0 shadow-sm overflow-hidden hover:shadow-xl transition-all group dark:bg-slate-950">
                                        <CardContent className="p-8 space-y-6">
                                            <div className="space-y-2">
                                                <Badge variant="outline" className="rounded-full text-[8px] font-black uppercase border-gray-100">{evt.type}</Badge>
                                                <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight line-clamp-2">{evt.titre}</h4>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase">
                                                <CalendarClock className="h-4 w-4" />
                                                {new Date(evt.date_debut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                            </div>
                                            <Button asChild className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest text-[10px] h-11">
                                                <Link href={`/module5/events/${evt.id}`}>Voir l'événement</Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

function InteractiveTabCard({ title, value, hint, icon, active, onClick }: any) {
    return (
        <Card className={`rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 group ${active ? 'border-indigo-600 bg-white shadow-2xl dark:bg-slate-900' : 'border-transparent bg-white shadow-sm hover:shadow-xl dark:bg-slate-950 dark:border-slate-800'}`} onClick={onClick}>
            <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${active ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-400 dark:bg-slate-800'}`}>{icon}</div>
                </div>
                <div className="space-y-1">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-indigo-600' : 'text-gray-400'}`}>{title}</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">{hint}</p>
                </div>
            </CardContent>
        </Card>
    );
}

