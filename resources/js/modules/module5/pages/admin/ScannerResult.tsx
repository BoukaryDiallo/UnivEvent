import { Head, router } from '@inertiajs/react';
import { 
    CheckCircle2, 
    XCircle, 
    User, 
    Calendar, 
    MapPin, 
    ShieldAlert, 
    ArrowLeft,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

type ScannerResultProps = {
    inscription: {
        id: number;
        utilisateur: {
            id: number;
            name: string;
            email: string;
        };
        evenement: {
            id: number;
            titre: string;
        };
        checked_in_at: string | null;
        statut: string;
    };
    canManage: boolean;
    isWrongEvent: boolean;
    targetEventId: string | null;
};

export default function ScannerResult({ inscription, canManage, isWrongEvent, targetEventId }: ScannerResultProps) {
    const handleCheckIn = () => {
        router.post(`/inscriptions/check-in/${inscription.id}`, {
            target_event_id: targetEventId
        }, {
            preserveScroll: true
        });
    };

    const breadcrumbs = [
        { title: 'Scanner', href: '/admin/scanner-acces' },
        { title: 'Résultat', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Résultat du Scan" />

            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="mb-8">
                    <Button variant="ghost" onClick={() => window.history.back()} className="rounded-full">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                    </Button>
                </div>

                {isWrongEvent ? (
                    <Card className="rounded-[3rem] border-2 border-rose-100 bg-rose-50/30 overflow-hidden text-center p-12">
                        <div className="h-24 w-24 bg-rose-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="h-12 w-12 text-rose-600" />
                        </div>
                        <h2 className="text-3xl font-black text-rose-900 uppercase tracking-tight mb-4">Mauvais Événement</h2>
                        <p className="text-rose-700 font-medium mb-8 leading-relaxed px-10">
                            Ce ticket appartient à l'événement <span className="font-black italic underline">"{inscription.evenement.titre}"</span>, 
                            mais vous scannez actuellement pour un autre événement.
                        </p>
                        <Button className="rounded-2xl h-14 px-10 bg-rose-600 hover:bg-rose-700 font-black uppercase tracking-widest text-xs shadow-xl" onClick={() => window.history.back()}>
                            Reprendre le scan
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-8">
                        {/* Result Status */}
                        <Card className={`rounded-[3.5rem] border-0 shadow-2xl overflow-hidden ${inscription.checked_in_at ? 'bg-indigo-900 text-white' : 'bg-emerald-600 text-white'}`}>
                            <CardContent className="p-12 text-center space-y-6">
                                <div className="h-24 w-24 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto backdrop-blur-md">
                                    {inscription.checked_in_at ? <Clock className="h-12 w-12 text-white" /> : <CheckCircle2 className="h-12 w-12 text-white" />}
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black uppercase tracking-tight">
                                        {inscription.checked_in_at ? 'Déjà Présent' : 'Ticket Valide'}
                                    </h2>
                                    <p className="text-white/80 font-medium mt-2">
                                        {inscription.checked_in_at ? `Scanné à ${new Date(inscription.checked_in_at).toLocaleTimeString()}` : 'Prêt pour l\'admission.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Details */}
                        <Card className="rounded-[3rem] border-0 shadow-xl bg-white dark:bg-slate-950 p-10 space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="h-20 w-20 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-3xl font-black text-indigo-600 uppercase shadow-inner">
                                    {inscription.utilisateur.name[0]}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{inscription.utilisateur.name}</h3>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{inscription.utilisateur.email}</p>
                                    <Badge variant="secondary" className="mt-2 bg-emerald-50 text-emerald-700 border-0 rounded-full font-black text-[10px] uppercase">
                                        {inscription.statut}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid gap-4 pt-6 border-t border-gray-50">
                                <DetailItem icon={<Calendar className="h-4 w-4" />} label="Événement" value={inscription.evenement.titre} />
                            </div>

                            {canManage && !inscription.checked_in_at && (
                                <div className="pt-6">
                                    <Button className="w-full h-16 rounded-3xl bg-gray-900 hover:bg-black text-white font-black uppercase tracking-widest shadow-2xl text-sm" onClick={handleCheckIn}>
                                        Confirmer l'admission
                                    </Button>
                                </div>
                            )}

                            {canManage && inscription.checked_in_at && (
                                <div className="pt-6">
                                    <Button variant="outline" className="w-full h-14 rounded-3xl font-black uppercase tracking-widest text-xs border-gray-100" onClick={() => window.history.back()}>
                                        Scannage suivant
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function DetailItem({ icon, label, value }: any) {
    return (
        <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">{icon}</div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="font-bold text-gray-900 dark:text-white truncate uppercase text-sm">{value}</p>
            </div>
        </div>
    );
}
