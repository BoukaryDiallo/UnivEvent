import { Head, Link } from '@inertiajs/react';
import { 
    DownloadIcon, 
    Trophy, 
    Search, 
    Calendar, 
    ShieldCheck, 
    ExternalLink,
    Filter,
    X,
    FileText
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type CertificatsIndexProps = {
    certificats: any[];
    auth: {
        user: any;
    };
};

export default function CertificatsIndex({ certificats, auth }: CertificatsIndexProps) {
    const [search, setSearch] = useState('');
    
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Module 5', href: '/module5/dashboard' },
        { title: 'Mes Certificats', href: '#' },
    ];

    const filtered = useMemo(() => {
        return certificats.filter(cert => 
            cert.evenement_titre.toLowerCase().includes(search.toLowerCase()) ||
            cert.numero_serie.toLowerCase().includes(search.toLowerCase())
        );
    }, [certificats, search]);

    const handleDownload = (certificatId: number) => {
        window.open(`/module5/certificats/${certificatId}/download`, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mes Certificats de Réussite" />

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-gray-900 rounded-2xl flex items-center justify-center shadow-xl">
                                <Trophy className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                                Mes Certificats
                            </h1>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Récupérez vos attestations et certificats de réussite officiels.</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <Input 
                            placeholder="Rechercher un événement ou n° série..." 
                            className="pl-10 h-12 rounded-2xl border-gray-100 bg-white shadow-sm focus:ring-indigo-600 transition-all" 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="size-4" />
                            </button>
                        )}
                    </div>
                </div>

                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {filtered.map((cert: any) => (
                            <Card key={cert.id} className="group rounded-[2.5rem] border-0 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500 dark:bg-slate-950 dark:border dark:border-slate-800">
                                <div className="h-4 bg-linear-to-r from-indigo-600 to-purple-600" />
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                            <ShieldCheck className="size-6" />
                                        </div>
                                        <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[8px] font-black uppercase px-3 py-1 rounded-full">
                                            {cert.type_certificat.replace('_', ' ')}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight line-clamp-2">
                                            {cert.evenement_titre}
                                        </h3>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <Calendar className="size-3" />
                                            {cert.date_evenement}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-2xl p-4 dark:bg-slate-900">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">N° de série vérifiable</p>
                                        <p className="text-xs font-mono font-bold text-indigo-600 truncate">{cert.numero_serie}</p>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button 
                                            className="flex-1 rounded-xl h-11 bg-gray-900 hover:bg-black font-black uppercase tracking-widest text-[9px] shadow-lg shadow-gray-200"
                                            onClick={() => handleDownload(cert.id)}
                                        >
                                            <DownloadIcon className="mr-2 size-3.5" /> Télécharger
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="rounded-xl h-11 border-gray-100 font-black uppercase tracking-widest text-[9px] px-4"
                                            asChild
                                        >
                                            <Link href={`/verify/${cert.token_verification}`}>
                                                <ExternalLink className="size-3.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center bg-gray-50 rounded-[4rem] border border-dashed border-gray-200 dark:bg-slate-900/50">
                        <FileText className="size-16 text-gray-200 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Aucun certificat trouvé</h3>
                        <p className="text-gray-500 text-sm max-w-md mx-auto mt-2">
                            Participez à des événements certifiants pour obtenir vos attestations de réussite.
                        </p>
                        <Button className="mt-8 rounded-xl bg-indigo-600 font-bold px-8 h-12" asChild>
                            <Link href="/module5/events">Explorer les événements</Link>
                        </Button>
                    </div>
                )}
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
