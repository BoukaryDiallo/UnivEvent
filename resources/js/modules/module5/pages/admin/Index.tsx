import { Head, Link, router, useForm } from '@inertiajs/react';
import { 
    ShieldCheckIcon, 
    AlertCircleIcon, 
    ActivityIcon, 
    UsersIcon, 
    FileTextIcon,
    CheckIcon,
    XIcon,
    ArrowUpRightIcon,
    PieChartIcon,
    PlusIcon,
    Settings2Icon,
    Trash2Icon,
    Edit3Icon
} from 'lucide-react';
import { useState } from 'react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { ActualitesFeed } from '@/modules/module5/components/ActualitesFeed';

type AdminDashboardProps = {
    stats_globales: {
        total_evenements: number;
        publies: number;
        en_attente: number;
        total_participants: number;
        total_certificats: number;
        taux_remplissage_moyen: number;
    };
    evenements_en_attente: any[];
    activite_recente: any[];
    graphiques: {
        inscriptions_par_mois: any[];
        types_evenements: any[];
    };
    event_types: any[];
    actualites: any[];
};

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e'];
const DEFAULT_STATS = {
    total_evenements: 0,
    publies: 0,
    en_attente: 0,
    total_participants: 0,
    total_certificats: 0,
    taux_remplissage_moyen: 0,
};
const DEFAULT_GRAPHIQUES = {
    inscriptions_par_mois: [],
    types_evenements: [],
};

export default function AdminDashboard({
    stats_globales = DEFAULT_STATS,
    evenements_en_attente = [],
    activite_recente = [],
    graphiques = DEFAULT_GRAPHIQUES,
    event_types = [],
    actualites = [],
}: AdminDashboardProps) {
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<any>(null);

    const { data, setData, post, patch, delete: destroy, reset, processing } = useForm({
        name: '',
        description: '',
        features: [] as string[],
        feature_input: '',
        allow_organizer: true,
        allow_intervenant: true,
        allow_jury: false,
        allow_participant: true,
    });

    const handleApprove = (id: number) => {
        router.post(`/admin/events/${id}/approve`);
    };

    const handleReject = (id: number) => {
        const reason = window.prompt("Raison du refus :");

        if (reason) {
            router.post(`/admin/events/${id}/reject`, { reason });
        }
    };

    const openCreateModal = () => {
        setEditingType(null);
        reset();
        setIsTypeModalOpen(true);
    };

    const openEditModal = (type: any) => {
        setEditingType(type);
        setData({
            name: type.name,
            description: type.description || '',
            features: Array.isArray(type.features) ? type.features : [],
            feature_input: '',
            allow_organizer: !!type.allow_organizer,
            allow_intervenant: !!type.allow_intervenant,
            allow_jury: !!type.allow_jury,
            allow_participant: !!type.allow_participant,
        });
        setIsTypeModalOpen(true);
    };

    const submitType = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingType) {
            patch(`/admin/types/${editingType.id}`, {
                onSuccess: () => setIsTypeModalOpen(false),
            });
        } else {
            post('/admin/types', {
                onSuccess: () => {
                    setIsTypeModalOpen(false);
                    reset();
                },
            });
        }
    };

    const deleteType = (id: number) => {
        if (confirm('Supprimer ce type ?')) {
            destroy(`/admin/types/${id}`);
        }
    };

    const addFeature = () => {
        if (data.feature_input.trim()) {
            setData('features', [...data.features, data.feature_input.trim()]);
            setData('feature_input', '');
        }
    };

    const removeFeature = (index: number) => {
        setData('features', data.features.filter((_, i) => i !== index));
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/module5/dashboard' },
        { title: 'Administration', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Administration Globale - UnivEvent" />

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-gray-900 rounded-[2rem] flex items-center justify-center shadow-xl">
                            <ShieldCheckIcon className="h-8 w-8 text-white" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                                supervision module 5
                            </h1>
                            <p className="text-sm text-gray-500 font-medium">Contrôle global et configuration système.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" asChild className="rounded-xl border-gray-200 font-bold">
                            <Link href="/admin/scanner-acces">Scanner QR</Link>
                        </Button>
                        <Button onClick={openCreateModal} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] px-6">
                            <PlusIcon className="mr-2 h-4 w-4" /> Nouveau Type
                        </Button>
                    </div>
                </div>

                {/* Global Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    <MiniStat 
                        title="Total" 
                        value={stats_globales.total_evenements} 
                        color="bg-gray-100 text-gray-900" 
                        href="/module5/events"
                    />
                    <MiniStat 
                        title="Publiés" 
                        value={stats_globales.publies} 
                        color="bg-emerald-100 text-emerald-700" 
                        href="/module5/events?statut=publie"
                    />
                    <MiniStat 
                        title="En attente" 
                        value={stats_globales.en_attente} 
                        color="bg-amber-100 text-amber-700" 
                        href="/admin/events/pending"
                    />
                    <MiniStat 
                        title="Participants" 
                        value={stats_globales.total_participants} 
                        color="bg-indigo-100 text-indigo-700" 
                        href="/admin/participants"
                    />
                    <MiniStat 
                        title="Certificats" 
                        value={stats_globales.total_certificats} 
                        color="bg-purple-100 text-purple-700" 
                        href="/module5/certificats"
                    />
                    <MiniStat 
                        title="Remplissage" 
                        value={`${stats_globales.taux_remplissage_moyen}%`} 
                        color="bg-sky-100 text-sky-700" 
                        href="/module5/events"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 rounded-[2.5rem] border-0 shadow-sm overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
                        <CardHeader className="px-8 pt-8">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-400">Croissance des inscriptions</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-8 h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={graphiques.inscriptions_par_mois}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] border-0 shadow-sm overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
                        <CardHeader className="px-8 pt-8">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-400">Répartition types</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-8 flex flex-col items-center justify-center h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={graphiques.types_evenements}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {graphiques.types_evenements.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap justify-center gap-4 mt-4">
                                {graphiques.types_evenements.map((t, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{t.name}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Approval Queue */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                            <AlertCircleIcon className="h-5 w-5 text-amber-500" />
                            Validation
                        </h3>
                        <div className="space-y-4">
                            {evenements_en_attente.map((event) => (
                                <div key={event.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group dark:bg-slate-950 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 dark:bg-slate-900">
                                            <FileTextIcon className="h-6 w-6 text-gray-300" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{event.titre}</p>
                                                <Link href={`/module5/events/${event.id}`} className="text-indigo-600 hover:text-indigo-700 transition-colors">
                                                    <ArrowUpRightIcon className="h-4 w-4" />
                                                </Link>
                                            </div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-tighter font-bold">Par {event.createur?.name} • {event.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            onClick={() => handleReject(event.id)}
                                            className="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-50"
                                        >
                                            <XIcon className="h-5 w-5" />
                                        </Button>
                                        <Button 
                                            size="icon" 
                                            onClick={() => handleApprove(event.id)}
                                            className="h-10 w-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            <CheckIcon className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {evenements_en_attente.length === 0 && (
                                <div className="py-12 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200 dark:bg-slate-900 dark:border-slate-800">
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest italic">Aucune attente</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Platform News Feed */}
                    <div className="space-y-6">
                        <ActualitesFeed activities={actualites} title="Actualités Plateforme" />
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Event Types Management */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                            <Settings2Icon className="h-5 w-5 text-indigo-600" />
                            Types d'événements
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {event_types.map((type) => {
                                const isSystemType = ['concours', 'conference'].includes(type.slug);

                                return (
                                    <div key={type.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 dark:bg-slate-950 dark:border-slate-800">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-black text-gray-900 dark:text-white uppercase text-sm tracking-tight">{type.name}</h4>
                                                <div className="flex gap-1 mt-1">
                                                    <Badge variant={type.is_active ? 'indigo' : 'secondary'} className="text-[8px] font-black uppercase">
                                                        {type.is_active ? 'Actif' : 'Inactif'}
                                                    </Badge>
                                                    {isSystemType && (
                                                        <Badge className="bg-gray-900 text-white text-[8px] font-black uppercase">Système</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            {!isSystemType && (
                                                <div className="flex gap-1">
                                                    <Button size="icon" variant="ghost" onClick={() => openEditModal(type)} className="h-8 w-8 rounded-lg text-gray-400 hover:text-indigo-600">
                                                        <Edit3Icon className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={() => deleteType(type.id)} className="h-8 w-8 rounded-lg text-gray-400 hover:text-rose-600">
                                                        <Trash2Icon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-medium line-clamp-2">{type.description || 'Pas de description.'}</p>
                                        
                                        <div className="flex flex-wrap gap-1">
                                            <p className="text-[8px] font-black uppercase text-gray-400 w-full mb-1">Affectations autorisées:</p>
                                            {type.allow_organizer && <Badge variant="outline" className="text-[7px] font-bold border-indigo-100 text-indigo-600">Orga</Badge>}
                                            {type.allow_intervenant && <Badge variant="outline" className="text-[7px] font-bold border-indigo-100 text-indigo-600">Inter</Badge>}
                                            {type.allow_jury && <Badge variant="outline" className="text-[7px] font-bold border-indigo-100 text-indigo-600">Jury</Badge>}
                                            {type.allow_participant && <Badge variant="outline" className="text-[7px] font-bold border-indigo-100 text-indigo-600">Part</Badge>}
                                        </div>

                                        <div className="flex flex-wrap gap-1">
                                            {(Array.isArray(type.features) ? type.features : []).slice(0, 3).map((f: string, i: number) => (
                                                <Badge key={i} variant="outline" className="text-[7px] font-black uppercase px-1.5 py-0 border-gray-100">
                                                    {f}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Type Management Modal */}
            <Dialog open={isTypeModalOpen} onOpenChange={setIsTypeModalOpen}>
                <DialogContent className="rounded-[2.5rem] sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">
                            {editingType ? 'Modifier le Type' : 'Nouveau Type d\'Événement'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitType} className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nom du Type</Label>
                                    <Input 
                                        value={data.name} 
                                        onChange={e => setData('name', e.target.value)} 
                                        placeholder="Ex: Hackathon"
                                        className="h-12 rounded-2xl border-gray-100 font-bold"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description</Label>
                                    <Textarea 
                                        value={data.description} 
                                        onChange={e => setData('description', e.target.value)} 
                                        placeholder="Courte description pour les utilisateurs..."
                                        className="rounded-2xl border-gray-100 resize-none font-medium"
                                        rows={5}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Autoriser les Affectations</Label>
                                <div className="grid gap-3">
                                    {[
                                        { id: 'allow_organizer', label: 'Organisateurs' },
                                        { id: 'allow_intervenant', label: 'Intervenants' },
                                        { id: 'allow_jury', label: 'Membres du Jury' },
                                        { id: 'allow_participant', label: 'Participants' },
                                    ].map((role) => (
                                        <div key={role.id} className="flex items-center space-x-3 p-3 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors">
                                            <Checkbox 
                                                id={role.id} 
                                                checked={!!data[role.id as keyof typeof data]}
                                                onCheckedChange={(checked) => setData(role.id as any, !!checked)}
                                                className="rounded-md"
                                            />
                                            <div className="grid gap-1">
                                                <Label htmlFor={role.id} className="text-xs font-black cursor-pointer uppercase tracking-tight">{role.label}</Label>
                                                <p className="text-[9px] text-gray-400 font-medium">Permet d'affecter ces acteurs.</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Fonctionnalités (Features)</Label>
                            <div className="flex gap-2">
                                <Input 
                                    value={data.feature_input} 
                                    onChange={e => setData('feature_input', e.target.value)} 
                                    placeholder="Ex: Vote du jury"
                                    className="h-11 rounded-xl border-gray-100"
                                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                />
                                <Button type="button" onClick={addFeature} variant="secondary" className="rounded-xl font-bold h-11 px-6">Ajouter</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {(Array.isArray(data.features) ? data.features : []).map((f, i) => (
                                    <Badge key={i} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-0 flex items-center gap-1.5 py-1.5 px-4 rounded-full font-bold text-[10px] uppercase">
                                        {f}
                                        <XIcon className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100" onClick={() => removeFeature(i)} />
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <DialogFooter className="pt-6 border-t border-gray-50">
                            <Button type="button" variant="ghost" onClick={() => setIsTypeModalOpen(false)} className="rounded-xl font-bold">Annuler</Button>
                            <Button type="submit" disabled={processing} className="rounded-xl bg-gray-900 text-white font-black uppercase tracking-widest text-xs px-8 h-12 shadow-lg">
                                {editingType ? 'Enregistrer' : 'Créer'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function MiniStat({ title, value, color, href }: { title: string, value: string | number, color: string, href?: string }) {
    const content = (
        <>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{title}</p>
            <p className="text-lg font-black">{value}</p>
        </>
    );

    if (href) {
        return (
            <Link 
                href={href} 
                className={`p-4 rounded-2xl ${color} flex flex-col items-center justify-center text-center transition-all hover:scale-105 hover:shadow-md cursor-pointer`}
            >
                {content}
            </Link>
        );
    }

    return (
        <div className={`p-4 rounded-2xl ${color} flex flex-col items-center justify-center text-center`}>
            {content}
        </div>
    );
}
