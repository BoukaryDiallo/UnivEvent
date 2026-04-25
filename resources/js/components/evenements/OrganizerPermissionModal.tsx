import { useForm } from '@inertiajs/react';
import { ShieldAlert, Send, CheckCircle2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

declare function route(name: string, params?: any): string;

interface Props {
    eventId: number;
    isOpen: boolean;
    onClose: () => void;
}

const PERMISSIONS = [
    { id: 'can_manage_participants', label: 'Gestion des participants', desc: 'Valider les inscriptions et gérer la liste.' },
    { id: 'can_manage_certificates', label: 'Certificats', desc: 'Générer et révoquer les attestations.' },
    { id: 'can_manage_results', label: 'Résultats & Jury', desc: 'Saisir les notes et valider le classement.' },
    { id: 'can_edit_event', label: 'Édition complète', desc: 'Modifier les détails et le programme.' },
];

export function OrganizerPermissionModal({ eventId, isOpen, onClose }: Props) {
    const { data, setData, post, processing, reset, errors } = useForm({
        permission: '',
        reason: '',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('evenements.request-permission', eventId), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-112.5 rounded-4xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldAlert className="size-5 text-cyan-500" />
                        Demander des accès
                    </DialogTitle>
                    <DialogDescription>
                        Sélectionnez le privilège nécessaire pour vos missions.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="grid gap-2">
                        {PERMISSIONS.map((p) => (
                            <div 
                                key={p.id}
                                onClick={() => setData('permission', p.id)}
                                className={`cursor-pointer rounded-xl border p-3 transition-all ${data.permission === p.id ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                            >
                                <div className="flex items-center justify-between font-medium">
                                    <span className="text-sm">{p.label}</span>
                                    {data.permission === p.id && <CheckCircle2 className="size-4 text-cyan-500" />}
                                </div>
                                <p className="text-xs text-slate-500">{p.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Justification</label>
                        <Textarea 
                            value={data.reason}
                            onChange={e => setData('reason', e.target.value)}
                            placeholder="Pourquoi avez-vous besoin de ces droits ?"
                            className="rounded-xl"
                        />
                        {errors.reason && <p className="text-xs text-red-500">{errors.reason}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
                        <Button disabled={processing || !data.permission} className="bg-cyan-600 hover:bg-cyan-700">
                            <Send className="mr-2 size-4" /> Envoyer
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
