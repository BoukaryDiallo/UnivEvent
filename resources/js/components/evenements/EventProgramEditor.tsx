import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { EventProgrammeDraft } from '@/types';

type EventProgramEditorProps = {
    programmes: EventProgrammeDraft[];
    onChange: (programmes: EventProgrammeDraft[]) => void;
    eventStart?: string;
};

const emptyProgramme = (ordre: number, eventStart?: string): EventProgrammeDraft => ({
    titre: '',
    description: '',
    intervenant: '',
    date_programme: eventStart ? eventStart.slice(0, 10) : '',
    heure_debut: '',
    heure_fin: '',
    salle: '',
    type_section: '',
    ordre: String(ordre),
});

export function EventProgramEditor({ programmes, onChange, eventStart }: EventProgramEditorProps) {
    const updateProgramme = (index: number, patch: Partial<EventProgrammeDraft>) => {
        onChange(programmes.map((programme, itemIndex) => (itemIndex === index ? { ...programme, ...patch } : programme)));
    };

    const addProgramme = () => {
        onChange([...programmes, emptyProgramme(programmes.length + 1, eventStart)]);
    };

    const removeProgramme = (index: number) => {
        onChange(
            programmes
                .filter((_, itemIndex) => itemIndex !== index)
                .map((programme, itemIndex) => ({ ...programme, ordre: String(itemIndex + 1) })),
        );
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Programme</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Ajoutez les sessions directement depuis la creation ou la modification de l evenement.
                    </p>
                </div>
                <Button type="button" variant="outline" className="rounded-full" onClick={addProgramme}>
                    <Plus className="size-4" />
                    Ajouter une session
                </Button>
            </div>

            {programmes.length ? (
                <div className="grid gap-4">
                    {programmes.map((programme, index) => (
                        <div key={`${programme.id ?? 'draft'}-${index}`} className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
                            <div className="flex items-center justify-between gap-3">
                                <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    <GripVertical className="size-4" />
                                    Session {index + 1}
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="rounded-full text-slate-500 hover:text-rose-600" onClick={() => removeProgramme(index)}>
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>

                            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                <div className="space-y-2 lg:col-span-2">
                                    <Label>Titre</Label>
                                    <Input value={programme.titre} onChange={(event) => updateProgramme(index, { titre: event.target.value })} placeholder="Keynote d ouverture" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Type de section</Label>
                                    <Input value={programme.type_section} onChange={(event) => updateProgramme(index, { type_section: event.target.value })} placeholder="Conference, atelier, pause..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Intervenant</Label>
                                    <Input value={programme.intervenant} onChange={(event) => updateProgramme(index, { intervenant: event.target.value })} placeholder="Nom de l intervenant" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input type="date" value={programme.date_programme} onChange={(event) => updateProgramme(index, { date_programme: event.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Salle</Label>
                                    <Input value={programme.salle} onChange={(event) => updateProgramme(index, { salle: event.target.value })} placeholder="Salle A12" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Heure debut</Label>
                                    <Input type="time" value={programme.heure_debut} onChange={(event) => updateProgramme(index, { heure_debut: event.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Heure fin</Label>
                                    <Input type="time" value={programme.heure_fin} onChange={(event) => updateProgramme(index, { heure_fin: event.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Ordre</Label>
                                    <Input type="number" min="1" value={programme.ordre} onChange={(event) => updateProgramme(index, { ordre: event.target.value })} />
                                </div>
                                <div className="space-y-2 lg:col-span-2">
                                    <Label>Description</Label>
                                    <Textarea value={programme.description} onChange={(event) => updateProgramme(index, { description: event.target.value })} className="min-h-24" placeholder="Description de la session, objectifs, intervenants invites..." />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                    Aucun programme n est encore prevu. Vous pouvez enregistrer l evenement tel quel ou ajouter des sessions maintenant.
                </div>
            )}
        </div>
    );
}
