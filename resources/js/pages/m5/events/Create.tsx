import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    ChevronRightIcon, 
    ChevronLeftIcon, 
    SaveIcon, 
    SendIcon, 
    UploadIcon,
    PlusIcon,
    Trash2Icon,
    EyeIcon,
    ImageIcon
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import EventCard from '@/components/m5/EventCard';
import type { EventSummary } from '@/types/evenements';

type EventType = {
    id: number;
    name: string;
    slug: string;
    features: {
        has_jury: boolean;
        has_organizer: boolean;
        has_speaker: boolean;
        has_participants: boolean;
        has_certification: boolean;
    };
};

type EventCreateProps = {
    event_types: EventType[];
    auth: { user: any };
};

export default function EventCreate({ event_types, auth }: EventCreateProps) {
    const [step, setStep] = useState(1);
    const { data, setData, post, processing, errors } = useForm<any>({
        type: 'conference',
        titre: '',
        description: '',
        lieu: '',
        date_debut: '',
        date_fin: '',
        capacite_max: '',
        visibilite: 'public',
        public_cible: [],
        inscription_requise: true,
        liste_attente_active: true,
        affiche: null as File | null,
        video_url: '',
        programme_pdf: null,
        tags: '',
        reglement: '',
        date_soumission: '',
        date_deliberation: '',
        criteres: [{ nom: '', poids: 20 }],
        theme: '',
        programme: [{ titre: '', start: '', end: '', type: '' }],
        statut: 'brouillon'
    });

    const [affichePreview, setAffichePreview] = useState<string | null>(null);

    const handleAfficheChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('affiche', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAffichePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const selectedType = event_types.find(t => t.slug === data.type);

    const [previewEvent, setPreviewEvent] = useState<EventSummary>({
        id: 0,
        titre: data.titre || 'Titre de l\'événement',
        type: data.type,
        statut: 'brouillon',
        date_debut: data.date_debut || new Date().toISOString(),
        date_fin: data.date_fin,
        lieu: data.lieu || 'Lieu de l\'événement',
        visibilite: data.visibilite,
        public_cible: data.public_cible.join(', '),
        capacite_max: parseInt(data.capacite_max) || 100,
        participants_count: 0,
        comments_count: 0,
        activity_count: 0,
        cover_url: null,
        roles: data.tags ? data.tags.split(',') : [],
        description: data.description,
        comments_enabled: true,
        comment_replies_enabled: true,
        comment_reactions_enabled: true,
        comment_policy: 'all',
        messages_enabled: true,
        evenement_certifie: true,
        createur: { id: auth.user.id, name: auth.user.name, role: auth.user.role },
        participation: null
    });

    useEffect(() => {
        setPreviewEvent(prev => ({
            ...prev,
            titre: data.titre || 'Titre de l\'événement',
            type: data.type,
            date_debut: data.date_debut || new Date().toISOString(),
            lieu: data.lieu || 'Lieu de l\'événement',
            capacite_max: parseInt(data.capacite_max) || 100,
            roles: data.tags ? data.tags.split(',') : [],
            cover_url: affichePreview
        }));
    }, [data, affichePreview]);

    const nextStep = () => setStep(s => Math.min(s + 4, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = (statut: string) => {
        setData('statut', statut);
        post('/m5/events', {
            forceFormData: true,
            onSuccess: () => {
                // Success redirect handled by backend
            }
        });
    };

    const breadcrumbs = [
        { title: 'Événements', href: '/m5/events' },
        { title: 'Créer', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Créer un événement - UnivEvent" />

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Form Wizard */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stepper */}
                        <div className="flex items-center justify-between mb-12">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex flex-col items-center gap-2 flex-1 relative">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all duration-500 ${
                                        step >= i ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                        {i}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= i ? 'text-indigo-600' : 'text-gray-400'}`}>
                                        Étape {i}
                                    </span>
                                    {i < 4 && (
                                        <div className={`absolute top-5 left-1/2 w-full h-0.5 -z-0 ${step > i ? 'bg-indigo-600' : 'bg-gray-100'}`} />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                            {step === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Configuration Initiale</h2>
                                        <p className="text-sm text-gray-500">Choisissez le type d'événement et les informations de base.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Type d'événement</Label>
                                            <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                                                <SelectTrigger className="rounded-xl h-12">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {event_types.map((t) => (
                                                        <SelectItem key={t.id} value={t.slug}>{t.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Titre de l'événement</Label>
                                            <Input 
                                                value={data.titre} 
                                                onChange={e => setData('titre', e.target.value)}
                                                placeholder="Ex: Hackathon UJKZ 2026"
                                                className="rounded-xl h-12"
                                            />
                                            {errors.titre && <p className="text-xs text-rose-500">{errors.titre}</p>}
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label>Description</Label>
                                            <Textarea 
                                                value={data.description}
                                                onChange={e => setData('description', e.target.value)}
                                                placeholder="Décrivez votre événement..."
                                                className="rounded-[1.5rem] min-h-[150px]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Lieu</Label>
                                            <Input 
                                                value={data.lieu}
                                                onChange={e => setData('lieu', e.target.value)}
                                                placeholder="Ex: Amphi Libye"
                                                className="rounded-xl h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Capacité maximale</Label>
                                            <Input 
                                                type="number"
                                                value={data.capacite_max}
                                                onChange={e => setData('capacite_max', e.target.value)}
                                                placeholder="Ex: 200"
                                                className="rounded-xl h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date de début</Label>
                                            <Input 
                                                type="datetime-local"
                                                value={data.date_debut}
                                                onChange={e => setData('date_debut', e.target.value)}
                                                className="rounded-xl h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date de fin</Label>
                                            <Input 
                                                type="datetime-local"
                                                value={data.date_fin}
                                                onChange={e => setData('date_fin', e.target.value)}
                                                className="rounded-xl h-12"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Visibilité & Cible</h2>
                                        <p className="text-sm text-gray-500">Gérez l'accessibilité de votre événement.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <Label>Visibilité de l'événement</Label>
                                        <RadioGroup value={data.visibilite} onValueChange={(v) => setData('visibilite', v)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="relative">
                                                <RadioGroupItem value="public" id="v-public" className="peer sr-only" />
                                                <Label htmlFor="v-public" className="flex flex-col p-4 bg-gray-50 border-2 border-transparent rounded-2xl cursor-pointer hover:bg-gray-100 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50 transition-all dark:bg-slate-900">
                                                    <span className="font-bold text-gray-900 dark:text-white">Public</span>
                                                    <span className="text-[10px] text-gray-500">Tout le monde</span>
                                                </Label>
                                            </div>
                                            <div className="relative">
                                                <RadioGroupItem value="restreint" id="v-restreint" className="peer sr-only" />
                                                <Label htmlFor="v-restreint" className="flex flex-col p-4 bg-gray-50 border-2 border-transparent rounded-2xl cursor-pointer hover:bg-gray-100 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50 transition-all dark:bg-slate-900">
                                                    <span className="font-bold text-gray-900 dark:text-white">Restreint</span>
                                                    <span className="text-[10px] text-gray-500">Public cible</span>
                                                </Label>
                                            </div>
                                            <div className="relative">
                                                <RadioGroupItem value="prive" id="v-prive" className="peer sr-only" />
                                                <Label htmlFor="v-prive" className="flex flex-col p-4 bg-gray-50 border-2 border-transparent rounded-2xl cursor-pointer hover:bg-gray-100 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50 transition-all dark:bg-slate-900">
                                                    <span className="font-bold text-gray-900 dark:text-white">Privé</span>
                                                    <span className="text-[10px] text-gray-500">Invitation</span>
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t">
                                        <Label>Public cible</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {['étudiant', 'enseignant', 'club', 'organisateur', 'externe'].map((role) => (
                                                <div key={role} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={`role-${role}`} 
                                                        checked={data.public_cible.includes(role)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) setData('public_cible', [...data.public_cible, role]);
                                                            else setData('public_cible', data.public_cible.filter((r: string) => r !== role));
                                                        }}
                                                    />
                                                    <Label htmlFor={`role-${role}`} className="capitalize">{role}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Visuels & Médias</h2>
                                        <p className="text-sm text-gray-500">Ajoutez l'affiche et les ressources multimédias.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <Label>Affiche (Poster)</Label>
                                            <div className="aspect-[4/3] relative bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center p-6 text-center dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
                                                {affichePreview ? (
                                                    <>
                                                        <img src={affichePreview} className="absolute inset-0 w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                            <Button variant="outline" className="text-white border-white" onClick={() => setAffichePreview(null)}>Changer</Button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ImageIcon className="h-10 w-10 text-gray-300 mb-2" />
                                                        <p className="text-xs text-gray-500">JPG, PNG (Max 5Mo)</p>
                                                        <Input 
                                                            type="file" 
                                                            className="hidden" 
                                                            id="affiche-upload" 
                                                            accept="image/*"
                                                            onChange={handleAfficheChange}
                                                        />
                                                        <Button variant="outline" asChild className="mt-4 rounded-xl">
                                                            <label htmlFor="affiche-upload" className="cursor-pointer">Choisir l'affiche</label>
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label>Vidéo de présentation (URL)</Label>
                                                <Input 
                                                    value={data.video_url}
                                                    onChange={e => setData('video_url', e.target.value)}
                                                    placeholder="Lien YouTube ou Vimeo"
                                                    className="rounded-xl h-12"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Tags (séparés par des virgules)</Label>
                                                <Input 
                                                    value={data.tags}
                                                    onChange={e => setData('tags', e.target.value)}
                                                    placeholder="IA, Innovation, Campus..."
                                                    className="rounded-xl h-12"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Configuration Avancée</h2>
                                        <p className="text-sm text-gray-500">Paramètres spécifiques au type : <span className="text-indigo-600">{selectedType?.name}</span></p>
                                    </div>

                                    {selectedType?.features.has_speaker && (
                                        <div className="space-y-6">
                                            <Label>Thème principal</Label>
                                            <Input 
                                                value={data.theme}
                                                onChange={e => setData('theme', e.target.value)}
                                                className="h-12 rounded-xl"
                                                placeholder="Sujet central de la conférence"
                                            />
                                        </div>
                                    )}

                                    {selectedType?.features.has_jury && (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label>Règlement du concours</Label>
                                                <Textarea 
                                                    value={data.reglement}
                                                    onChange={e => setData('reglement', e.target.value)}
                                                    className="min-h-[100px] rounded-2xl"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Fin des soumissions</Label>
                                                    <Input 
                                                        type="datetime-local" 
                                                        className="rounded-xl"
                                                        value={data.date_soumission}
                                                        onChange={e => setData('date_soumission', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Date délibération</Label>
                                                    <Input 
                                                        type="datetime-local" 
                                                        className="rounded-xl"
                                                        value={data.date_deliberation}
                                                        onChange={e => setData('date_deliberation', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30">
                                        <h4 className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-2">Note sur les fonctionnalités</h4>
                                        <p className="text-xs text-amber-700/80 leading-relaxed">
                                            Certaines fonctionnalités comme la gestion de jury ou les certificats seront accessibles dans la console de gestion une fois l'événement créé.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
                                <Button 
                                    variant="ghost" 
                                    onClick={prevStep} 
                                    disabled={step === 1}
                                    className="rounded-xl font-bold"
                                >
                                    <ChevronLeftIcon className="mr-2 h-4 w-4" />
                                    Précédent
                                </Button>
                                
                                <div className="flex gap-4">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => handleSubmit('brouillon')}
                                        className="rounded-xl border-gray-200"
                                        disabled={processing}
                                    >
                                        <SaveIcon className="mr-2 h-4 w-4" />
                                        Brouillon
                                    </Button>
                                    
                                    {step < 4 ? (
                                        <Button 
                                            onClick={nextStep}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8"
                                        >
                                            Suivant
                                            <ChevronRightIcon className="ml-2 h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button 
                                            onClick={() => handleSubmit('en_attente')}
                                            disabled={processing}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8"
                                        >
                                            <SendIcon className="mr-2 h-4 w-4" />
                                            Soumettre
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live Preview */}
                    <div className="hidden lg:block space-y-6">
                        <div className="sticky top-8">
                            <div className="flex items-center gap-2 mb-4 px-2">
                                <EyeIcon className="h-4 w-4 text-indigo-600" />
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Aperçu en direct</h3>
                            </div>
                            
                            <div className="space-y-8">
                                <div className="scale-95 origin-top opacity-90 transition-all duration-500">
                                    <EventCard event={previewEvent} />
                                </div>

                                <div className="bg-gray-50 rounded-[2.5rem] p-6 border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
                                    <div className="flex items-center gap-2 mb-4">
                                        <SettingsIcon className="h-3 w-3 text-gray-400" />
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fonctionnalités {selectedType?.name}</p>
                                    </div>
                                    <div className="space-y-2">
                                        {selectedType && Object.entries(selectedType.features).map(([key, value]) => (
                                            value && (
                                                <div key={key} className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                                    <CheckCircle2Icon className="h-3 w-3" />
                                                    {key.replace('has_', '').replace('_', ' ').toUpperCase()}
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
