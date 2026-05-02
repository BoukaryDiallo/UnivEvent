import { Head, Link } from '@inertiajs/react';
import { 
    CalendarIcon, 
    TrophyIcon, 
    FileTextIcon, 
    CheckCircle2Icon,
    ClockIcon,
    ArrowRightIcon,
    StarIcon
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { EventBadge } from '@/components/m5/EventBadge';
import EventCard from '@/components/m5/EventCard';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ParticipantDashboardProps = {
    mes_inscriptions: any[];
    mes_certificats: any[];
    evenements_suggeres: any[];
    stats: {
        inscrits: number;
        en_attente: number;
        certificats_disponibles: number;
        evenements_termines: number;
    };
};

export default function ParticipantDashboard({ mes_inscriptions, mes_certificats, evenements_suggeres, stats }: ParticipantDashboardProps) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/m5/dashboard' },
        { title: 'Participant', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mon Espace Participant - UnivEvent" />

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        Mon Espace
                    </h1>
                    <p className="text-sm text-gray-500">Retrouvez vos inscriptions et certificats.</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Inscriptions</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.inscrits}</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">En attente</p>
                        <p className="text-2xl font-black text-amber-500">{stats.en_attente}</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Certificats</p>
                        <p className="text-2xl font-black text-emerald-500">{stats.certificats_disponibles}</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Terminés</p>
                        <p className="text-2xl font-black text-indigo-500">{stats.evenements_termines}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Inscriptions Tabs */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-indigo-600" />
                                Mes Inscriptions
                            </h3>

                            <Tabs defaultValue="a_venir" className="w-full">
                                <TabsList className="bg-gray-100 p-1 rounded-2xl dark:bg-slate-900">
                                    <TabsTrigger value="a_venir" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-slate-800">À Venir</TabsTrigger>
                                    <TabsTrigger value="termines" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-slate-800">Passés</TabsTrigger>
                                </TabsList>
                                <TabsContent value="a_venir" className="mt-6 space-y-4">
                                    {mes_inscriptions.filter(i => i.statut !== 'termine').map((ins, i) => (
                                        <div key={i} className="bg-white p-5 rounded-[2rem] border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all dark:bg-slate-950 dark:border-slate-800">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 dark:bg-slate-900">
                                                    <CalendarIcon className="h-6 w-6 text-gray-300" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{ins.evenement.titre}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <EventBadge statut={ins.statut} size="sm" />
                                                        {ins.position_attente && (
                                                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                                Position #{ins.position_attente}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="rounded-full" asChild>
                                                <Link href={`/m5/events/${ins.evenement.id}`}>
                                                    <ArrowRightIcon className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                    {mes_inscriptions.length === 0 && (
                                        <p className="text-center py-12 text-gray-400 text-sm italic">Vous n'avez pas d'inscriptions en cours.</p>
                                    )}
                                </TabsContent>
                                <TabsContent value="termines">
                                    {/* Similar structure for finished events */}
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Certificates Grid */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <TrophyIcon className="h-5 w-5 text-amber-500" />
                                Mes Certificats
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {mes_certificats.map((cert, i) => (
                                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4 dark:bg-slate-950 dark:border-slate-800">
                                        <div className="flex justify-between items-start">
                                            <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center dark:bg-amber-900/20">
                                                <FileTextIcon className="h-5 w-5 text-amber-600" />
                                            </div>
                                            <Button size="sm" variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Détails</Button>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{cert.evenement_titre}</h4>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{cert.date_evenement}</p>
                                        </div>
                                        <Button className="w-full bg-gray-900 hover:bg-black text-white rounded-xl h-10 text-xs font-bold dark:bg-slate-800 dark:hover:bg-slate-700">
                                            Télécharger PDF
                                        </Button>
                                    </div>
                                ))}
                                {mes_certificats.length === 0 && (
                                    <p className="text-gray-400 text-sm italic col-span-2">Aucun certificat n'est encore disponible.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Suggestions Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-indigo-50 rounded-[2.5rem] p-8 border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/30">
                            <div className="flex items-center gap-2 mb-6">
                                <StarIcon className="h-4 w-4 text-indigo-600" />
                                <h3 className="text-[10px] font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-[0.2em]">Suggéré pour vous</h3>
                            </div>
                            <div className="space-y-4">
                                {evenements_suggeres.map((event, i) => (
                                    <Link 
                                        key={i} 
                                        href={`/m5/events/${event.id}`} 
                                        className="block bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md transition-all dark:bg-slate-950 dark:border-indigo-900/50"
                                    >
                                        <p className="font-bold text-xs text-gray-900 dark:text-white line-clamp-1">{event.titre}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-[10px] text-gray-400">{event.date_debut}</span>
                                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">{event.type}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-100 dark:shadow-none">
                            <div className="space-y-4">
                                <CheckCircle2Icon className="h-10 w-10 text-emerald-200" />
                                <h3 className="text-xl font-black leading-tight">Vérifiez l'authenticité d'un certificat</h3>
                                <p className="text-xs text-emerald-100 leading-relaxed opacity-80">
                                    Utilisez notre outil public pour valider n'importe quel certificat émis par UnivEvent.
                                </p>
                                <Button className="w-full bg-white text-emerald-600 hover:bg-emerald-50 rounded-xl font-bold text-xs uppercase tracking-widest mt-4">
                                    Vérifier
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
