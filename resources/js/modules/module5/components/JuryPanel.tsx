import { useState } from 'react';
import { 
    FileTextIcon, 
    DownloadIcon, 
    CheckCircle2Icon, 
    AlertCircleIcon,
    ChevronRightIcon,
    SaveIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

type Candidature = {
    id: number;
    nom: string;
    fichier_url: string;
    statut_evaluation: 'en_attente' | 'evalue';
    notes?: Record<number, number>;
    commentaire?: string;
};

type Critere = {
    id: number;
    nom: string;
    poids: number;
};

type JuryPanelProps = {
    concours: any;
    candidatures: Candidature[];
    criteres: Critere[];
    onSave: (candidatureId: number, data: any) => void;
};

export default function JuryPanel({ concours, candidatures, criteres, onSave }: JuryPanelProps) {
    const [selectedId, setSelectedId] = useState<number | null>(candidatures[0]?.id || null);
    const selected = candidatures.find(c => c.id === selectedId);

    const [scores, setScores] = useState<Record<number, number>>(
        criteres.reduce((acc, c) => ({ ...acc, [c.id]: 10 }), {})
    );
    const [comment, setComment] = useState('');

    const total = criteres.reduce((acc, c) => acc + (scores[c.id] || 0) * (c.poids / 100), 0);

    const handleSave = () => {
        if (selectedId) {
            onSave(selectedId, { scores, comment, total });
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-200px)] gap-px bg-gray-100 rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl dark:bg-slate-800 dark:border-slate-800">
            {/* List of Candidates */}
            <div className="bg-white lg:col-span-1 flex flex-col dark:bg-slate-950">
                <div className="p-6 border-b border-gray-50 dark:border-slate-900">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Candidatures ({candidatures.length})</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {candidatures.map((c) => (
                        <div 
                            key={c.id}
                            onClick={() => setSelectedId(c.id)}
                            className={`p-6 border-b border-gray-50 cursor-pointer transition-all flex items-center justify-between group dark:border-slate-900 ${
                                selectedId === c.id ? 'bg-indigo-50 dark:bg-indigo-950/20' : 'hover:bg-gray-50 dark:hover:bg-slate-900/50'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                                    c.statut_evaluation === 'evalue' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                                }`}>
                                    {c.nom[0]}
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${selectedId === c.id ? 'text-indigo-600' : 'text-gray-900 dark:text-white'}`}>{c.nom}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{c.statut_evaluation}</p>
                                </div>
                            </div>
                            <ChevronRightIcon className={`h-4 w-4 transition-transform ${selectedId === c.id ? 'text-indigo-600 translate-x-1' : 'text-gray-200 opacity-0 group-hover:opacity-100'}`} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Evaluation Workspace */}
            <div className="lg:col-span-2 bg-gray-50/50 flex flex-col dark:bg-slate-900/50">
                {selected ? (
                    <>
                        <div className="p-8 bg-white border-b border-gray-100 flex items-center justify-between dark:bg-slate-950 dark:border-slate-800">
                            <div className="space-y-1">
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">{selected.nom}</h2>
                                <Button variant="link" className="p-0 h-auto text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                                    <DownloadIcon className="mr-1 h-3 w-3" />
                                    Télécharger le dossier (PDF)
                                </Button>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Note actuelle</p>
                                <p className="text-4xl font-black text-indigo-600">{total.toFixed(2)}<span className="text-lg text-gray-300">/20</span></p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10">
                            {/* Scoring Section */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                    <CheckCircle2Icon className="h-4 w-4 text-emerald-500" />
                                    Critères de pondération
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {criteres.map((critere) => (
                                        <div key={critere.id} className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{critere.nom}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase font-medium">Poids : {critere.poids}%</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Input 
                                                        type="number" 
                                                        min={0} 
                                                        max={20} 
                                                        step={0.5}
                                                        value={scores[critere.id] || 0}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value);
                                                            if (!isNaN(val)) {
                                                                setScores(prev => ({ ...prev, [critere.id]: Math.min(20, Math.max(0, val)) }));
                                                            }
                                                        }}
                                                        className="w-20 text-right font-black text-indigo-600 rounded-xl"
                                                    />
                                                    <span className="text-sm text-gray-300">/20</span>
                                                </div>
                                            </div>
                                            <Slider 
                                                value={[scores[critere.id] || 0]} 
                                                max={20} 
                                                step={0.5} 
                                                onValueChange={([val]) => setScores(prev => ({ ...prev, [critere.id]: val }))}
                                                className="py-4"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Comment Section */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                    <AlertCircleIcon className="h-4 w-4 text-amber-500" />
                                    Observations & Feedback
                                </h3>
                                <Textarea 
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Justifiez votre note ou laissez des conseils au candidat..."
                                    className="min-h-[150px] rounded-[1.5rem] bg-white border-gray-100 shadow-sm focus:ring-indigo-600"
                                />
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-8 bg-white border-t border-gray-100 flex justify-end gap-4 dark:bg-slate-950 dark:border-slate-800">
                            <Button variant="ghost" className="rounded-xl font-bold text-gray-400">Réinitialiser</Button>
                            <Button 
                                onClick={handleSave}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 h-12 font-bold uppercase tracking-widest text-xs"
                            >
                                <SaveIcon className="mr-2 h-4 w-4" />
                                Enregistrer l'évaluation
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                        <FileTextIcon className="h-16 w-16 mb-4 opacity-20" />
                        <p className="font-bold uppercase tracking-widest text-sm">Aucune candidature sélectionnée</p>
                    </div>
                )}
            </div>
        </div>
    );
}
