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
    EyeIcon
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
import type { EventFormValues, EventSummary } from '@/types/evenements';

export default function EventCreate() {
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
        affiche: null,
        video_url: '',
        programme_pdf: null,
        tags: '',
        reglement: '',
        date_soumission: '',
        date_deliberation: '',
        criteres: [{ nom: '', poids: 20 }],
        theme: '',
        programme: [{ titre: '', start: '', end: '', type: '' }]
    });

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
        createur: { id: 1, name: 'Organisateur', role: 'Staff' },
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
        }));
    }, [data]);

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = (statut: string) => {
        post('/m5/events', {
            onBefore: () => setData('statut', statut),
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

                        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-xl shadow-gray-200/50 dark:bg-slate-950 dark:border-slate-800">
                            {step === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Informations générales</h2>
                                        <p className="text-sm text-gray-500">Définissez les bases de votre événement.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Type d'événement</Label>
                                            <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                                                <SelectTrigger className="rounded-xl h-12">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="conference">Conférence</SelectItem>
                                                    <SelectItem value="concours">Concours</SelectItem>
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
                                            <p className="text-[10px] text-right text-gray-400">{data.titre.length}/150</p>
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label>Description</Label>
                                            <Textarea 
                                                value={data.description}
                                                onChange={e => setData('description', e.target.value)}
                                                placeholder="Décrivez votre événement en quelques lignes..."
                                                className="rounded-[1.5rem] min-h-[150px]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Lieu</Label>
                                            <Input 
                                                value={data.lieu}
                                                onChange={e => setData('lieu', e.target.value)}
                                                placeholder="Ex: Amphithéâtre Libye"
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
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Visibilité & Public cible</h2>
                                        <p className="text-sm text-gray-500">Qui peut voir et s'inscrire à cet événement ?</p>
                                    </div>

                                    <div className="space-y-6">
                                        <Label>Visibilité de l'événement</Label>
                                        <RadioGroup value={data.visibilite} onValueChange={(v) => setData('visibilite', v)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="relative">
                                                <RadioGroupItem value="public" id="v-public" className="peer sr-only" />
                                                <Label htmlFor="v-public" className="flex flex-col p-4 bg-gray-50 border-2 border-transparent rounded-2xl cursor-pointer hover:bg-gray-100 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50 transition-all dark:bg-slate-900">
                                                    <span className="font-bold text-gray-900 dark:text-white">Public</span>
                                                    <span className="text-[10px] text-gray-500">Visible par tous les utilisateurs</span>
                                                </Label>
                                            </div>
                                            <div className="relative">
                                                <RadioGroupItem value="restreint" id="v-restreint" className="peer sr-only" />
                                                <Label htmlFor="v-restreint" className="flex flex-col p-4 bg-gray-50 border-2 border-transparent rounded-2xl cursor-pointer hover:bg-gray-100 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50 transition-all dark:bg-slate-900">
                                                    <span className="font-bold text-gray-900 dark:text-white">Restreint</span>
                                                    <span className="text-[10px] text-gray-500">Seulement pour le public cible</span>
                                                </Label>
                                            </div>
                                            <div className="relative">
                                                <RadioGroupItem value="prive" id="v-prive" className="peer sr-only" />
                                                <Label htmlFor="v-prive" className="flex flex-col p-4 bg-gray-50 border-2 border-transparent rounded-2xl cursor-pointer hover:bg-gray-100 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50 transition-all dark:bg-slate-900">
                                                    <span className="font-bold text-gray-900 dark:text-white">Privé</span>
                                                    <span className="text-[10px] text-gray-500">Uniquement sur invitation</span>
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
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Médias & Affiche</h2>
                                        <p className="text-sm text-gray-500">Rendez votre événement attrayant.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <Label>Affiche de l'événement</Label>
                                            <div className="aspect-[4/3] bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center p-6 text-center dark:bg-slate-900 dark:border-slate-800">
                                                <UploadIcon className="h-10 w-10 text-gray-300 mb-2" />
                                                <p className="text-xs text-gray-500">Cliquez pour uploader (JPG, PNG, Max 5Mo)</p>
                                                <Input 
                                                    type="file" 
                                                    className="hidden" 
                                                    id="affiche-upload" 
                                                    onChange={e => setData('affiche', e.target.files?.[0])}
                                                />
                                                <Button variant="outline" asChild className="mt-4 rounded-xl">
                                                    <label htmlFor="affiche-upload">Choisir un fichier</label>
                                                </Button>
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
                                                <Label>Programme détaillé (PDF)</Label>
                                                <div className="p-4 border rounded-xl flex items-center justify-between">
                                                    <span className="text-xs text-gray-400">Aucun fichier choisi</span>
                                                    <Button size="sm" variant="ghost">Uploader</Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Tags (séparés par des virgules)</Label>
                                                <Input 
                                                    value={data.tags}
                                                    onChange={e => setData('tags', e.target.value)}
                                                    placeholder="IA, Hackathon, Innovation..."
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
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                                            Configuration {data.type === 'conference' ? 'Conférence' : 'Concours'}
                                        </h2>
                                        <p className="text-sm text-gray-500">Détails spécifiques à votre type d'événement.</p>
                                    </div>

                                    {data.type === 'conference' ? (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label>Thème principal</Label>
                                                <Input 
                                                    value={data.theme}
                                                    onChange={e => setData('theme', e.target.value)}
                                                    placeholder="Le thème majeur de la conférence"
                                                    className="rounded-xl h-12"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <Label>Programme des créneaux</Label>
                                                    <Button size="sm" variant="outline" className="rounded-lg">
                                                        <PlusIcon className="h-4 w-4 mr-1" /> Ajouter
                                                    </Button>
                                                </div>
                                                <div className="space-y-3">
                                                    {data.programme.map((p: any, i: number) => (
                                                        <div key={i} className="p-4 bg-gray-50 rounded-2xl flex gap-4 dark:bg-slate-900">
                                                            <Input placeholder="Titre" className="flex-1" />
                                                            <Input type="time" className="w-24" />
                                                            <Button size="icon" variant="ghost" className="text-rose-500"><Trash2Icon className="h-4 w-4" /></Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
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
                                                    <Input type="datetime-local" className="rounded-xl" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Date délibération</Label>
                                                    <Input type="datetime-local" className="rounded-xl" />
                                                </div>
                                            </div>
                                            <div className="space-y-4 pt-4 border-t">
                                                <div className="flex justify-between items-center">
                                                    <Label>Critères d'évaluation</Label>
                                                    <Button size="sm" variant="outline" className="rounded-lg">
                                                        <PlusIcon className="h-4 w-4 mr-1" /> Ajouter
                                                    </Button>
                                                </div>
                                                <div className="space-y-3">
                                                    {data.criteres.map((c: any, i: number) => (
                                                        <div key={i} className="flex gap-4 items-center">
                                                            <Input placeholder="Nom du critère" className="flex-1" />
                                                            <Input type="number" placeholder="Poids %" className="w-24" />
                                                            <Button size="icon" variant="ghost" className="text-rose-500"><Trash2Icon className="h-4 w-4" /></Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Prévisualisation Live</h3>
                            </div>
                            
                            <div className="space-y-8">
                                <div className="scale-95 origin-top opacity-90 grayscale-[0.2] hover:grayscale-0 hover:scale-100 hover:opacity-100 transition-all duration-500">
                                    <p className="text-[10px] font-bold text-gray-400 mb-2 ml-4">Affiche (Home)</p>
                                    <EventCard event={previewEvent} />
                                </div>

                                <div className="bg-gray-50 rounded-[2.5rem] p-6 border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
                                    <p className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-widest">Aperçu fiche</p>
                                    <div className="space-y-4">
                                        <div className="h-4 w-3/4 bg-gray-200 rounded-full animate-pulse" />
                                        <div className="h-24 w-full bg-gray-100 rounded-2xl animate-pulse" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="h-10 w-full bg-gray-200 rounded-xl animate-pulse" />
                                            <div className="h-10 w-full bg-gray-200 rounded-xl animate-pulse" />
                                        </div>
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
