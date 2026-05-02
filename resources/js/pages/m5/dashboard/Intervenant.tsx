import { Head, Link } from '@inertiajs/react';
import { 
    PresentationIcon, 
    FileTextIcon, 
    UploadIcon, 
    ArrowRightIcon,
    DownloadIcon,
    ClockIcon,
    MapPinIcon,
    Trash2Icon
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type IntervenantDashboardProps = {
    conferences_assignees: any[];
    mes_supports: any[];
};

export default function IntervenantDashboard({ conferences_assignees, mes_supports }: IntervenantDashboardProps) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/m5/dashboard' },
        { title: 'Intervenant', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Espace Intervenant - UnivEvent" />

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        Espace Intervenant
                    </h1>
                    <p className="text-sm text-gray-500">Gérez vos présentations et supports de cours.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Assigned Conferences */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <PresentationIcon className="h-5 w-5 text-indigo-600" />
                                Mes Conférences
                            </h3>
                            <div className="grid grid-cols-1 gap-6">
                                {conferences_assignees.map((item, i) => (
                                    <div key={i} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden dark:bg-slate-950 dark:border-slate-800">
                                        <div className="p-8 space-y-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="space-y-2">
                                                    <h4 className="text-lg font-black text-gray-900 dark:text-white">{item.conference.titre}</h4>
                                                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                                                        <div className="flex items-center gap-1.5">
                                                            <ClockIcon className="h-3.5 w-3.5" />
                                                            <span>{item.conference.date_debut}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPinIcon className="h-3.5 w-3.5" />
                                                            <span>{item.conference.lieu}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button asChild variant="outline" className="rounded-xl border-gray-200 h-10 px-6 font-bold text-xs uppercase tracking-widest">
                                                    <Link href={`/m5/events/${item.conference.id}`}>Détails</Link>
                                                </Button>
                                            </div>

                                            <div className="bg-gray-50 p-6 rounded-2xl dark:bg-slate-900">
                                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Mes créneaux assignés</h5>
                                                <div className="space-y-3">
                                                    {item.creneaux_assignes?.map((c: any, j: number) => (
                                                        <div key={j} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 dark:bg-slate-950 dark:border-slate-800">
                                                            <span className="text-xs font-bold text-gray-900 dark:text-white">{c.titre}</span>
                                                            <span className="text-[10px] font-mono text-indigo-600">{c.heure_debut} - {c.heure_fin}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Supports Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <FileTextIcon className="h-4 w-4 text-rose-500" />
                                Mes Supports
                            </h3>
                            
                            <div className="space-y-4 mb-8">
                                {mes_supports.map((file, i) => (
                                    <div key={i} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-gray-50 rounded-lg flex items-center justify-center dark:bg-slate-900">
                                                <FileTextIcon className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold text-gray-900 dark:text-white truncate max-w-[120px]">{file.nom}</p>
                                                <p className="text-[9px] text-gray-400 uppercase">{file.type} • {file.taille}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-7 w-7"><DownloadIcon className="h-3 w-3" /></Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-500"><Trash2Icon className="h-3 w-3" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-2 border-dashed border-gray-100 rounded-2xl p-6 text-center space-y-3 dark:border-slate-800">
                                <UploadIcon className="h-8 w-8 text-gray-200 mx-auto" />
                                <p className="text-[10px] text-gray-400 font-medium">Glissez-déposez vos fichiers ici (PDF, PPTX)</p>
                                <Button size="sm" className="bg-gray-900 text-white hover:bg-black rounded-lg text-[10px] font-bold uppercase tracking-widest px-4">
                                    Parcourir
                                </Button>
                            </div>
                        </div>

                        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white">
                            <h4 className="text-lg font-black mb-2 leading-tight">Besoin d'aide technique ?</h4>
                            <p className="text-xs text-indigo-100 opacity-80 mb-6">
                                Si vous rencontrez des difficultés pour uploader vos supports ou si vous avez besoin d'un matériel spécifique.
                            </p>
                            <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold text-xs uppercase tracking-widest h-11">
                                Contacter le support
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
