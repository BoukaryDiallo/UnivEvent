import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    CalendarIcon,
    CheckCircle2,
    EyeIcon,
    InfoIcon,
    MapPinIcon,
    SaveIcon,
    Settings2Icon,
    TypeIcon,
    UsersIcon,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type EventCreateProps = {
    event_types: any[];
    auth: {
        user: any;
    };
};

const PUBLIC_CIBLES = [
    { id: 'etudiant', label: 'Étudiants' },
    { id: 'enseignant', label: 'Enseignants' },
    { id: 'club', label: 'Clubs & Associations' },
    { id: 'externe', label: 'Public Externe' },
];

export default function EventCreate({ event_types }: EventCreateProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Module 5', href: '/module5/dashboard' },
        { title: 'Événements', href: '/module5/events' },
        { title: 'Nouveau', href: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        titre: '',
        description: '',
        type: '',
        date_debut: '',
        date_fin: '',
        lieu: '',
        capacite_max: '',
        visibilite: 'public',
        public_cible: ['tous'],
        tags: '',
        affiche: null as File | null,
        allow_organizer: true,
        allow_intervenant: true,
        allow_jury: false,
        allow_participant: true,
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleTypeSelect = (type: any) => {
        setData((prev: any) => ({
            ...prev,
            type: type.name || type.nom,
            allow_organizer: !!type.allow_organizer,
            allow_intervenant: !!type.allow_intervenant,
            allow_jury: !!type.allow_jury,
            allow_participant: !!type.allow_participant,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setData('affiche', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleVisibiliteChange = (value: string) => {
        setData('visibilite', value);

        if (value === 'restreint' && (data.public_cible.length === 0 || data.public_cible.includes('tous'))) {
            setIsModalOpen(true);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/module5/events', {
            forceFormData: true,
            onSuccess: () => {
                router.visit('/module5/events');
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
            <Head title="Créer un événement - UnivEvent" />

            <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild className="rounded-full -ml-2">
                                <Link href="/module5/events">
                                    <ArrowLeftIcon className="h-5 w-5" />
                                </Link>
                            </Button>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                                Nouvel Événement
                            </h1>
                        </div>
                        <p className="text-sm text-gray-500 font-medium ml-10">Configurez votre événement en quelques étapes.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" asChild className="rounded-xl border-gray-200 font-bold px-6">
                            <Link href="/module5/events">Annuler</Link>
                        </Button>
                        <Button 
                            onClick={handleSubmit} 
                            disabled={processing}
                            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs px-8 shadow-lg shadow-indigo-100"
                        >
                            <SaveIcon className="mr-2 h-4 w-4" />
                            Enregistrer le brouillon
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* 1. Basic Info */}
                        <Card className="rounded-[2.5rem] border-0 shadow-sm overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
                            <CardHeader className="px-8 pt-8 pb-0">
                                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                                    <InfoIcon className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Informations Générales</span>
                                </div>
                                <CardTitle className="text-xl font-bold">Détails de l'événement</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                {/* Image Upload Area */}
                                <div className="space-y-4">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Affiche de l'événement</Label>
                                    <div 
                                        className={`relative group h-64 rounded-4xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-4 ${
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
                                                        <X className="mr-2 h-4 w-4" /> Changer l'image
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                                                    <TypeIcon className="h-8 w-8 text-gray-300" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-gray-900">Cliquez pour ajouter une affiche</p>
                                                    <p className="text-xs text-gray-400">PNG, JPG ou GIF (Max 5Mo)</p>
                                                </div>
                                                <input 
                                                    type="file" 
                                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                                    onChange={handleFileChange}
                                                    accept="image/*"
                                                    aria-label="Ajouter une affiche de l'événement"
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
                                        placeholder="Ex: Concours de Programmation 2026"
                                        className="h-12 rounded-2xl border-gray-100 focus:ring-indigo-600 transition-all text-lg font-bold"
                                        required
                                    />
                                    {errors.titre && <p className="text-xs font-bold text-rose-500 mt-1">{errors.titre}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Description détaillée *</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Décrivez les objectifs, le déroulement et les modalités..."
                                        rows={6}
                                        className="rounded-2xl border-gray-100 focus:ring-indigo-600 transition-all resize-none"
                                        required
                                    />
                                    {errors.description && <p className="text-xs font-bold text-rose-500 mt-1">{errors.description}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Type Selection - VISUAL */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-indigo-600 px-4">
                                <TypeIcon className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Choisir le Type</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {event_types.map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => handleTypeSelect(type)}
                                        className={`relative p-6 rounded-4xl border-2 text-left transition-all group ${
                                            data.type === (type.name || type.nom)
                                            ? 'border-indigo-600 bg-indigo-50/50 shadow-md'
                                            : 'border-white bg-white hover:border-gray-100 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-2">
                                                <h3 className="font-black text-gray-900 uppercase tracking-tight">{type.name || type.nom}</h3>
                                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                                    {type.description || "Événement universitaire standard."}
                                                </p>
                                            </div>
                                            {data.type === (type.name || type.nom) && (
                                                <CheckCircle2 className="h-6 w-6 text-indigo-600 animate-in zoom-in" />
                                            )}
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-1">
                                            {(Array.isArray(type.features) ? type.features : []).map((f: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="text-[8px] font-black uppercase tracking-tighter px-2 py-0">
                                                    {f}
                                                </Badge>
                                            ))}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {errors.type && <p className="text-xs font-bold text-rose-500 ml-4">{errors.type}</p>}
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-8">
                        {/* 3. Settings Card */}
                        <Card className="rounded-[2.5rem] border-0 shadow-sm overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
                            <CardHeader className="px-8 pt-8">
                                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                    <Settings2Icon className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Planification</span>
                                </div>
                            </CardHeader>
                            <CardContent className="px-8 pb-8 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <CalendarIcon className="h-3 w-3" /> Date & Heure Début
                                    </Label>
                                    <Input
                                        type="datetime-local"
                                        value={data.date_debut}
                                        onChange={(e) => setData('date_debut', e.target.value)}
                                        className="h-11 rounded-xl border-gray-100"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <CalendarIcon className="h-3 w-3" /> Date & Heure Fin
                                    </Label>
                                    <Input
                                        type="datetime-local"
                                        value={data.date_fin}
                                        onChange={(e) => setData('date_fin', e.target.value)}
                                        className="h-11 rounded-xl border-gray-100"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <MapPinIcon className="h-3 w-3" /> Lieu / Plateforme
                                    </Label>
                                    <Input
                                        value={data.lieu}
                                        onChange={(e) => setData('lieu', e.target.value)}
                                        placeholder="Ex: Amphi A ou Zoom"
                                        className="h-11 rounded-xl border-gray-100"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <UsersIcon className="h-3 w-3" /> Capacité Max
                                    </Label>
                                    <Input
                                        type="number"
                                        value={data.capacite_max}
                                        onChange={(e) => setData('capacite_max', e.target.value)}
                                        placeholder="Illimité si vide"
                                        className="h-11 rounded-xl border-gray-100"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* 4. Visibility Card */}
                        <Card className="rounded-[2.5rem] border-0 shadow-sm overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
                            <CardHeader className="px-8 pt-8">
                                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                    <EyeIcon className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Confidentialité</span>
                                </div>
                            </CardHeader>
                            <CardContent className="px-8 pb-8 space-y-6">
                                <div className="space-y-4">
                                    <Select value={data.visibilite} onValueChange={handleVisibiliteChange}>
                                        <SelectTrigger className="h-11 rounded-xl border-gray-100">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="public">🌍 Public (Tous)</SelectItem>
                                            <SelectItem value="restreint">🔐 Restreint (Cible)</SelectItem>
                                            <SelectItem value="prive">🕵️ Privé (Invités)</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {data.visibilite === 'restreint' && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Public Cible</Label>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => setIsModalOpen(true)}
                                                    className="h-6 text-[10px] font-black text-indigo-600"
                                                >
                                                    Modifier
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {data.public_cible.filter(c => c !== 'tous').length > 0 ? (
                                                    data.public_cible.filter(c => c !== 'tous').map(id => (
                                                        <Badge key={id} variant="secondary" className="bg-indigo-600 text-white text-[8px] font-black uppercase">
                                                            {PUBLIC_CIBLES.find(p => p.id === id)?.label}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] italic text-rose-500 font-bold">⚠️ Aucune cible définie</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        {/* 5. Assignment Toggles Card */}
                        <Card className="rounded-[2.5rem] border-0 shadow-sm overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800 animate-in fade-in slide-in-from-right-4 duration-500 delay-150">
                            <CardHeader className="px-8 pt-8">
                                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                    <UsersIcon className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Options d'affectation</span>
                                </div>
                            </CardHeader>
                            <CardContent className="px-8 pb-8 space-y-3">
                                {[
                                    { id: 'allow_organizer', label: 'Organisateurs' },
                                    { id: 'allow_intervenant', label: 'Intervenants' },
                                    { id: 'allow_jury', label: 'Membres du Jury' },
                                    { id: 'allow_participant', label: 'Participants' },
                                ].map((role) => (
                                    <div key={role.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors group">
                                        <Label htmlFor={`create_${role.id}`} className="text-[10px] font-bold uppercase tracking-tight text-gray-600 cursor-pointer group-hover:text-indigo-600">{role.label}</Label>
                                        <Checkbox 
                                            id={`create_${role.id}`}
                                            checked={data[role.id as keyof typeof data] as boolean}
                                            onCheckedChange={(checked) => setData(role.id as any, !!checked)}
                                            className="rounded-md data-[state=checked]:bg-indigo-600"
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Target Audience Selection Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="rounded-[2.5rem] sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Définir le Public Cible</DialogTitle>
                        <DialogDescription className="text-xs font-medium text-gray-500">
                            Sélectionnez qui pourra voir et s'inscrire à cet événement.
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
                                    className="rounded-md border-gray-300 data-[state=checked]:bg-indigo-600"
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <label
                                        htmlFor={cible.id}
                                        className="text-sm font-black text-gray-900 leading-none cursor-pointer"
                                    >
                                        {cible.label}
                                    </label>
                                    <p className="text-[10px] text-gray-400 font-medium">
                                        Autoriser les {cible.label.toLowerCase()} à participer.
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <DialogFooter className="sm:justify-end gap-2">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsModalOpen(false)}
                            className="rounded-xl border-gray-100 font-bold"
                        >
                            Fermer
                        </Button>
                        <Button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="rounded-xl bg-gray-900 text-white font-black uppercase tracking-widest text-[10px] px-8"
                        >
                            Confirmer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}