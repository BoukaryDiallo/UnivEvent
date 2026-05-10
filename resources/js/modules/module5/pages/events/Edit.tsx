import { Head, Link, router, useForm } from '@inertiajs/react';
import { 
    ArrowLeftIcon, 
    SaveIcon, 
    CalendarIcon, 
    MapPinIcon, 
    UsersIcon, 
    EyeIcon, 
    InfoIcon,
    TypeIcon,
    Settings2Icon,
    X,
    ExternalLink,
    MessageCircle,
    Trophy,
    Settings
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type EventEditProps = {
    event: any;
    event_types: any[];
};

const PUBLIC_CIBLES = [
    { id: 'etudiant', label: 'Étudiants' },
    { id: 'enseignant', label: 'Enseignants' },
    { id: 'club', label: 'Clubs & Associations' },
    { id: 'externe', label: 'Public Externe' },
];

export default function EventEdit({ event, event_types }: EventEditProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(event.cover_url);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PATCH',
        titre: event.titre || '',
        description: event.description || '',
        type: event.type || '',
        date_debut: event.date_debut ? new Date(event.date_debut).toISOString().slice(0, 16) : '',
        date_fin: event.date_fin ? new Date(event.date_fin).toISOString().slice(0, 16) : '',
        lieu: event.lieu || '',
        lien_live: event.lien_live || '',
        capacite_max: event.capacite_max || '',
        visibilite: event.visibilite || 'public',
        public_cible: event.public_cible ? (Array.isArray(event.public_cible) ? event.public_cible : event.public_cible.split(',').filter(Boolean)) : ['tous'],
        affiche: null as File | null,
        allow_organizer: !!event.allow_organizer,
        allow_intervenant: !!event.allow_intervenant,
        allow_jury: !!event.allow_jury,
        allow_participant: !!event.allow_participant,
        comment_policy: event.comment_policy || 'accepted_participants',
        comments_enabled: !!event.comments_enabled,
        messages_enabled: !!event.messages_enabled,
        evenement_certifie: !!event.evenement_certifie,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Module 5', href: '/module5/dashboard' },
        { title: 'Événements', href: '/module5/events' },
        { title: event.titre, href: `/module5/events/${event.id}` },
        { title: 'Édition', href: '#' },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('affiche', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/module5/events/${event.id}`, {
            forceFormData: true,
            onSuccess: () => {
                router.visit(`/module5/events/${event.id}`);
            },
        });
    };

    const toggleCible = (id: string) => {
        const current = [...data.public_cible].filter(c => c !== 'tous');
        if (current.includes(id)) {
            setData('public_cible', current.filter(c => c !== id));
        } else {
            setData('public_cible', [...current, id]);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier - ${event.titre}`} />

            <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild className="rounded-full -ml-2">
                                <Link href={`/module5/events/${event.id}`}>
                                    <ArrowLeftIcon className="h-5 w-5" />
                                </Link>
                            </Button>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                                Modifier l'Événement
                            </h1>
                        </div>
                        <div className="flex items-center gap-3 ml-10">
                            <Badge variant="outline" className="font-bold text-[10px] uppercase border-gray-200">
                                {event.workflow_state_label || event.statut}
                            </Badge>
                            <p className="text-sm text-gray-500 font-medium">Édition des paramètres et contenus.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" asChild className="rounded-xl border-gray-200 font-bold px-6">
                            <Link href={`/module5/events/${event.id}`}>Annuler</Link>
                        </Button>
                        <Button 
                            onClick={handleSubmit} 
                            disabled={processing}
                            className="rounded-xl bg-gray-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs px-8 shadow-lg"
                        >
                            <SaveIcon className="mr-2 h-4 w-4" />
                            Sauvegarder
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Area */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="rounded-[2.5rem] border-0 shadow-sm overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
                            <CardHeader className="px-8 pt-8 pb-0">
                                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                                    <InfoIcon className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Contenu</span>
                                </div>
                                <CardTitle className="text-xl font-bold">Détails principaux</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Image de couverture</Label>
                                    <div 
                                        className={`relative group h-64 rounded-[2rem] border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-4 ${
                                            previewUrl ? 'border-indigo-600' : 'border-gray-100 hover:border-indigo-300'
                                        }`}
                                    >
                                        {previewUrl ? (
                                            <>
                                                <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button 
                                                        type="button" 
                                                        variant="secondary" 
                                                        className="rounded-xl font-bold"
                                                        onClick={() => {
                                                            setPreviewUrl(null);
                                                            setData('affiche', null);
                                                        }}
                                                    >
                                                        <X className="mr-2 h-4 w-4" /> Supprimer / Changer
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                                                    <TypeIcon className="h-8 w-8 text-gray-300" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-gray-900">Ajouter une affiche</p>
                                                    <p className="text-xs text-gray-400">Cliquez ou glissez une image</p>
                                                </div>
                                                <input 
                                                    type="file" 
                                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                                    onChange={handleFileChange}
                                                    accept="image/*"
                                                />
                                            </>
                                        )}
                                    </div>
                                    {errors.affiche && <p className="text-xs font-bold text-rose-500">{errors.affiche}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="titre" className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Titre de l'événement *</Label>
                                    <Input
                                        id="titre"
                                        value={data.titre}
                                        onChange={(e) => setData('titre', e.target.value)}
                                        className="h-12 rounded-2xl border-gray-100 focus:ring-indigo-600 font-bold text-lg"
                                        required
                                    />
                                    {errors.titre && <p className="text-xs font-bold text-rose-500">{errors.titre}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Description détaillée *</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={10}
                                        className="rounded-2xl border-gray-100 focus:ring-indigo-600 transition-all resize-none"
                                        required
                                    />
                                    {errors.description && <p className="text-xs font-bold text-rose-500">{errors.description}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-8">
                        {/* Planification */}
                        <Card className="rounded-[2.5rem] border-0 shadow-sm overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
                            <CardHeader className="px-8 pt-8">
                                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                    <Settings2Icon className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Configuration</span>
                                </div>
                            </CardHeader>
                            <CardContent className="px-8 pb-8 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Type d'événement</Label>
                                    <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                                        <SelectTrigger className="h-11 rounded-xl border-gray-100 font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {event_types.map((type) => (
                                                <SelectItem key={type.id} value={type.name || type.nom}>
                                                    {type.name || type.nom}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <CalendarIcon className="h-3 w-3" /> Date Début
                                    </Label>
                                    <Input
                                        type="datetime-local"
                                        value={data.date_debut}
                                        onChange={(e) => setData('date_debut', e.target.value)}
                                        className="h-11 rounded-xl border-gray-100"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <MapPinIcon className="h-3 w-3" /> Lieu
                                    </Label>
                                    <Input
                                        value={data.lieu}
                                        onChange={(e) => setData('lieu', e.target.value)}
                                        className="h-11 rounded-xl border-gray-100"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <ExternalLink className="h-3 w-3" /> Lien Live
                                    </Label>
                                    <Input
                                        value={data.lien_live}
                                        onChange={(e) => setData('lien_live', e.target.value)}
                                        placeholder="https://..."
                                        className="h-11 rounded-xl border-gray-100"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Interactions */}
                        <Card className="rounded-[2.5rem] border-0 shadow-sm overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
                            <CardHeader className="px-8 pt-8">
                                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                    <MessageCircle className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Interactions</span>
                                </div>
                            </CardHeader>
                            <CardContent className="px-8 pb-8 space-y-6">
                                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors group">
                                    <Label htmlFor="comments_enabled" className="text-[10px] font-bold uppercase text-gray-600 cursor-pointer">Commentaires</Label>
                                    <Checkbox 
                                        id="comments_enabled"
                                        checked={data.comments_enabled}
                                        onCheckedChange={(checked) => setData('comments_enabled', !!checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors group">
                                    <Label htmlFor="messages_enabled" className="text-[10px] font-bold uppercase text-gray-600 cursor-pointer">Messagerie</Label>
                                    <Checkbox 
                                        id="messages_enabled"
                                        checked={data.messages_enabled}
                                        onCheckedChange={(checked) => setData('messages_enabled', !!checked)}
                                    />
                                </div>
                                <div className="space-y-2 pt-2 border-t border-gray-50">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Politique de com.</Label>
                                    <Select value={data.comment_policy} onValueChange={(value) => setData('comment_policy', value)}>
                                        <SelectTrigger className="h-10 rounded-xl border-gray-100 text-xs font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="all">🌍 Tout le monde</SelectItem>
                                            <SelectItem value="registered">📝 Inscrits uniquement</SelectItem>
                                            <SelectItem value="accepted_participants">✅ Participants validés</SelectItem>
                                            <SelectItem value="readonly">🚫 Lecture seule</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Certification */}
                        <Card className="rounded-[2.5rem] border-0 shadow-sm overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
                            <CardHeader className="px-8 pt-8">
                                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                    <Trophy className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Certification</span>
                                </div>
                            </CardHeader>
                            <CardContent className="px-8 pb-8 space-y-6">
                                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors group">
                                    <Label htmlFor="evenement_certifie" className="text-[10px] font-bold uppercase text-gray-600 cursor-pointer">Mode certifiant</Label>
                                    <Checkbox 
                                        id="evenement_certifie"
                                        checked={data.evenement_certifie}
                                        onCheckedChange={(checked) => setData('evenement_certifie', !!checked)}
                                    />
                                </div>
                                <p className="text-[9px] text-gray-400 font-medium leading-relaxed px-2">Délivrez des certificats de réussite aux participants après l'événement.</p>
                            </CardContent>
                        </Card>

                        <div className="px-4">
                            <Button variant="ghost" asChild className="w-full justify-start text-gray-500 hover:text-indigo-600 font-bold h-12 rounded-2xl">
                                <Link href={`/module5/events/${event.id}`}>
                                    <ExternalLink className="mr-2 h-4 w-4" /> Voir la fiche publique
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Target Audience Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="rounded-[2.5rem] sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Public Cible</DialogTitle>
                        <DialogDescription className="text-xs font-medium text-gray-500">
                            Sélectionnez les audiences autorisées.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {PUBLIC_CIBLES.map((cible) => (
                            <div 
                                key={cible.id} 
                                className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                                    data.public_cible.includes(cible.id) 
                                    ? 'border-indigo-600 bg-indigo-50/50' 
                                    : 'border-gray-100 hover:bg-gray-50'
                                }`}
                                onClick={() => toggleCible(cible.id)}
                            >
                                <Checkbox 
                                    id={cible.id} 
                                    checked={data.public_cible.includes(cible.id)}
                                    onCheckedChange={() => toggleCible(cible.id)}
                                    className="rounded-md"
                                />
                                <label htmlFor={cible.id} className="text-sm font-black text-gray-900 cursor-pointer">{cible.label}</label>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl bg-gray-900 text-white font-black uppercase tracking-widest text-[10px] w-full h-11">
                            Confirmer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
