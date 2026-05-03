import { Head, useForm } from '@inertiajs/react';
import { 
    SettingsIcon, 
    PlusIcon, 
    Trash2Icon, 
    CheckCircle2Icon, 
    XCircleIcon,
    ShieldCheckIcon,
    UsersIcon,
    GavelIcon,
    AwardIcon,
    PresentationIcon
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

type EventType = {
    id: number;
    name: string;
    slug: string;
    description: string;
    features: {
        has_jury: boolean;
        has_organizer: boolean;
        has_speaker: boolean;
        has_participants: boolean;
        has_certification: boolean;
    };
    is_active: boolean;
};

type AdminIndexProps = {
    event_types: EventType[];
};

export default function AdminIndex({ event_types }: AdminIndexProps) {
    const [isAdding, setIsAdding] = useState(false);
    const { data, setData, post, patch, delete: destroy, processing, reset } = useForm({
        name: '',
        description: '',
        features: {
            has_jury: false,
            has_organizer: true,
            has_speaker: true,
            has_participants: true,
            has_certification: true,
        }
    });

    const handleToggleFeature = (feature: string) => {
        setData('features', {
            ...data.features,
            [feature]: !data.features[feature as keyof typeof data.features]
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/types', {
            onSuccess: () => {
                setIsAdding(false);
                reset();
            }
        });
    };

    const breadcrumbs = [
        { title: 'Administration', href: '/admin' },
        { title: 'Types d\'événements', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuration Plateforme - UnivEvent" />

            <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                            <SettingsIcon className="h-8 w-8 text-indigo-600" />
                            Paramètres Plateforme
                        </h1>
                        <p className="text-sm text-gray-500">Gérez les types d'événements et les permissions globales.</p>
                    </div>
                    <Button 
                        onClick={() => setIsAdding(!isAdding)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 px-6 shadow-lg shadow-indigo-200"
                    >
                        <PlusIcon className="mr-2 h-5 w-5" />
                        Nouveau Type
                    </Button>
                </div>

                {isAdding && (
                    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-indigo-100 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500 dark:bg-slate-950 dark:border-slate-800">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nom du type</Label>
                                        <Input 
                                            id="name"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            placeholder="Ex: Hackathon, Soutenance, Gala..."
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea 
                                            id="description"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            placeholder="Décrivez à quoi sert ce type d'événement..."
                                            className="min-h-[120px] rounded-2xl"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <Label>Fonctionnalités & Permissions</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FeatureToggle 
                                            icon={<GavelIcon className="h-4 w-4" />}
                                            label="Gestion de Jury"
                                            active={data.features.has_jury}
                                            onToggle={() => handleToggleFeature('has_jury')}
                                        />
                                        <FeatureToggle 
                                            icon={<ShieldCheckIcon className="h-4 w-4" />}
                                            label="Organisateurs"
                                            active={data.features.has_organizer}
                                            onToggle={() => handleToggleFeature('has_organizer')}
                                        />
                                        <FeatureToggle 
                                            icon={<PresentationIcon className="h-4 w-4" />}
                                            label="Intervenants"
                                            active={data.features.has_speaker}
                                            onToggle={() => handleToggleFeature('has_speaker')}
                                        />
                                        <FeatureToggle 
                                            icon={<UsersIcon className="h-4 w-4" />}
                                            label="Participants"
                                            active={data.features.has_participants}
                                            onToggle={() => handleToggleFeature('has_participants')}
                                        />
                                        <FeatureToggle 
                                            icon={<AwardIcon className="h-4 w-4" />}
                                            label="Certification"
                                            active={data.features.has_certification}
                                            onToggle={() => handleToggleFeature('has_certification')}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-6 border-t">
                                <Button variant="ghost" type="button" onClick={() => setIsAdding(false)}>Annuler</Button>
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-10 h-12 font-bold"
                                >
                                    Enregistrer le type
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {event_types.map((type) => (
                        <div 
                            key={type.id}
                            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group dark:bg-slate-950 dark:border-slate-800"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{type.name}</h3>
                                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">Slug: {type.slug}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2Icon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            
                            <p className="text-sm text-gray-500 mb-8 line-clamp-2">{type.description || 'Aucune description.'}</p>
                            
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Fonctionnalités activées</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(type.features).map(([key, value]) => (
                                        value && (
                                            <span key={key} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-bold text-gray-600 uppercase dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400">
                                                <CheckCircle2Icon className="h-3 w-3 text-emerald-500" />
                                                {key.replace('has_', '').replace('_', ' ')}
                                            </span>
                                        )
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between dark:border-slate-900">
                                <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${type.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">{type.is_active ? 'Actif' : 'Inactif'}</span>
                                </div>
                                <Button variant="link" className="text-indigo-600 font-bold text-xs uppercase tracking-widest p-0 h-auto">Modifier les paramètres</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

function FeatureToggle({ icon, label, active, onToggle }: { icon: React.ReactNode, label: string, active: boolean, onToggle: () => void }) {
    return (
        <div 
            onClick={onToggle}
            className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                active 
                ? 'bg-indigo-50 border-indigo-600 dark:bg-indigo-950/20' 
                : 'bg-gray-50 border-transparent dark:bg-slate-900'
            }`}
        >
            <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-400 shadow-sm dark:bg-slate-800'}`}>
                    {icon}
                </div>
                <span className={`text-xs font-bold ${active ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-500'}`}>{label}</span>
            </div>
            {active ? <CheckCircle2Icon className="h-5 w-5 text-indigo-600" /> : <div className="h-5 w-5 rounded-full border-2 border-gray-200" />}
        </div>
    );
}
