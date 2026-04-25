import { useForm } from '@inertiajs/react';
import { ImagePlus, ListChecks, Layers3, Sparkles, Eye } from 'lucide-react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import type {
    EventAssignmentPermissions,
    EventAssignmentRole,
    EventFormMeta,
    EventFormValues,
} from '@/types';

import { RichTextEditor } from '../RichTextEditor';

export const formWizardSteps = [
    { key: 'basics', label: 'Informations', icon: Sparkles },
    { key: 'access', label: 'Acces', icon: Layers3 },
    { key: 'program', label: 'Programme', icon: ListChecks },
    { key: 'media', label: 'Medias', icon: ImagePlus },
    { key: 'preview', label: 'Apercu', icon: Eye },
] as const;

export type EventFormWizardStepKey = (typeof formWizardSteps)[number]['key'];
export type EventForm = ReturnType<typeof useForm<EventFormValues>>;

export const permissionLabels: Record<keyof EventAssignmentPermissions, string> = {
    can_manage_messages: 'Messages',
    can_manage_comments: 'Commentaires',
    can_edit_event: 'Edition',
    can_change_visibility: 'Visibilite',
    can_manage_participants: 'Participants',
    can_assign_jury: 'Affecter jury',
    can_assign_organizers: 'Affecter organisateurs',
    can_manage_certificates: 'Certificats',
    can_manage_results: 'Resultats',
};

export const assignmentRoleDescriptions: Record<string, string> = {
    organisateur: 'Peut aider a preparer et piloter l evenement.',
    participant: 'Figure parmi les personnes attendues sur l evenement.',
    intervenant: 'Anime une session, une presentation ou une intervention.',
    jury: 'Participe a l evaluation ou a la deliberation.',
};

export function defaultPermissionsForRole(
    role: EventAssignmentRole,
): EventAssignmentPermissions {
    if (role === 'organisateur') {
        return {
            can_manage_messages: true,
            can_manage_comments: true,
            can_edit_event: true,
            can_change_visibility: true,
            can_manage_participants: false,
            can_assign_jury: false,
            can_assign_organizers: false,
            can_manage_certificates: true,
            can_manage_results: false,
        };
    }

    if (role === 'jury') {
        return {
            can_manage_messages: false,
            can_manage_comments: false,
            can_edit_event: false,
            can_change_visibility: false,
            can_manage_participants: false,
            can_assign_jury: false,
            can_assign_organizers: false,
            can_manage_certificates: false,
            can_manage_results: true,
        };
    }

    return {
        can_manage_messages: false,
        can_manage_comments: false,
        can_edit_event: false,
        can_change_visibility: false,
        can_manage_participants: false,
        can_assign_jury: false,
        can_assign_organizers: false,
        can_manage_certificates: false,
        can_manage_results: false,
    };
}

interface EventBasicsStepProps {
    form: EventForm;
    meta: EventFormMeta;
}

export function EventBasicsStep({ form, meta }: EventBasicsStepProps) {
    return (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5 rounded-4xl border border-slate-200 bg-white/90 p-6 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="space-y-2">
                    <Label htmlFor="titre">Titre de l evenement</Label>
                    <Input
                        id="titre"
                        value={form.data.titre}
                        onChange={(event) => form.setData('titre', event.target.value)}
                        placeholder="Sommet IA et Innovation 2026"
                    />
                    <InputError message={form.errors.titre} />
                </div>

                <div className="space-y-2">
                    <Label>Description</Label>
                    <RichTextEditor
                        value={form.data.description}
                        onChange={(value) => form.setData('description', value)}
                    />
                    <InputError message={form.errors.description} />
                </div>
            </div>

            <div className="space-y-5 rounded-4xl border border-slate-200 bg-white/90 p-6 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="space-y-2">
                    <Label>Type d evenement</Label>
                    <Select
                        value={form.data.type}
                        onValueChange={(value) =>
                            form.setData('type', value as EventFormValues['type'])
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                            {meta.types.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <InputError message={form.errors.type} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="date_debut">Date de debut</Label>
                        <Input
                            id="date_debut"
                            type="datetime-local"
                            value={form.data.date_debut}
                            onChange={(event) =>
                                form.setData('date_debut', event.target.value)
                            }
                        />
                        <InputError message={form.errors.date_debut} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date_fin">Date de fin</Label>
                        <Input
                            id="date_fin"
                            type="datetime-local"
                            value={form.data.date_fin}
                            onChange={(event) =>
                                form.setData('date_fin', event.target.value)
                            }
                        />
                        <InputError message={form.errors.date_fin} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lieu">Lieu</Label>
                    <Input
                        id="lieu"
                        value={form.data.lieu}
                        onChange={(event) => form.setData('lieu', event.target.value)}
                        placeholder="Campus principal, batiment B"
                    />
                    <InputError message={form.errors.lieu} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lien_live">Lien Meet / Zoom</Label>
                    <Input
                        id="lien_live"
                        value={form.data.lien_live}
                        onChange={(event) =>
                            form.setData('lien_live', event.target.value)
                        }
                        placeholder="https://meet.google.com/..."
                    />
                    <InputError message={form.errors.lien_live} />
                </div>
            </div>
        </div>
    );
}