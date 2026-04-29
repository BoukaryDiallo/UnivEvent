import { useForm } from '@inertiajs/react';
import { ImagePlus, ListChecks, Layers3, Sparkles, Eye, Search, Shield } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type {
    EventAssignmentPermissions,
    EventAssignmentRole,
    EventFormMeta,
    EventFormValues,
} from '@/types';
import { EventBadge } from '../EventBadge';
import { EventProgramEditor } from '../EventProgramEditor';
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

export function EventAccessStep({ form, meta }: EventBasicsStepProps) {
    const [search, setSearch] = useState('');
    
    const filteredUsers = meta.assignableUsers.filter(u => 
        u.name?.toLowerCase().includes(search.toLowerCase()) || 
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    const applyBulkPermissions = (role: EventAssignmentRole, permissions: Partial<EventAssignmentPermissions>) => {
        const currentEntries = form.data.assigned_users[role];
        const updated = currentEntries.map((entry) => ({
            ...entry,
            permissions: { ...entry.permissions, ...permissions }
        }));
        form.setData('assigned_users', { ...form.data.assigned_users, [role]: updated });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl dark:bg-slate-900/50">
                <Search className="size-5 text-slate-400" />
                <Input 
                    placeholder="Rechercher un utilisateur pour l'affecter..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="border-none bg-transparent focus-visible:ring-0"
                />
            </div>
            
            <div className="grid gap-6">
                {meta.assignmentRoles.map((role) => (
                    <div key={role.value} className="space-y-4 rounded-4xl border p-6 bg-white dark:bg-slate-950/70">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2">
                                <Shield className="size-4 text-sky-500" /> {role.label}
                            </h3>
                            {form.data.assigned_users[role.value].length > 1 && (
                                <Button variant="ghost" size="sm" onClick={() => applyBulkPermissions(role.value, { can_edit_event: true })}>
                                    Donner accès édition à tous
                                </Button>
                            )}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {filteredUsers.slice(0, 6).map(user => (
                                <UserAssignmentCard 
                                    key={user.id} 
                                    user={user} 
                                    role={role.value} 
                                    form={form} 
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function UserAssignmentCard({ user, role, form }: any) {
    const entry = form.data.assigned_users[role].find((item: any) => item.user_id === user.id);
    const isSelected = !!entry;

    return (
        <div className={cn(
            "p-4 rounded-2xl border transition-all cursor-pointer",
            isSelected ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20" : "hover:border-slate-300"
        )} onClick={() => {
            const current = form.data.assigned_users[role];
            const next = isSelected 
                ? current.filter((i: any) => i.user_id !== user.id)
                : [...current, { user_id: user.id, permissions: defaultPermissionsForRole(role) }];
            form.setData('assigned_users', { ...form.data.assigned_users, [role]: next });
        }}>
            <div className="flex items-center gap-3">
                <Checkbox checked={isSelected} />
                <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                </div>
            </div>
        </div>
    );
}

export function EventProgramStep({ form }: { form: any }) {
    return (
        <div className="rounded-4xl border bg-white p-6 dark:bg-slate-950/70">
            <EventProgramEditor 
                programmes={form.data.programmes} 
                eventStart={form.data.date_debut} 
                onChange={(p) => form.setData('programmes', p)} 
            />
        </div>
    );
}

export function EventMediaStep({ form }: { form: any }) {
    return (
        <div className="rounded-4xl border bg-white p-8 text-center dark:bg-slate-950/70">
            <Label className="text-lg mb-4 block">Bannière de l'événement</Label>
            <Input type="file" onChange={e => form.setData('media', e.target.files?.[0])} />
            <p className="text-sm text-slate-500 mt-4">Images recommandées : 1600x900px</p>
        </div>
    );
}

export function EventPreviewStep({ form }: { form: any }) {
    return (
        <div className="space-y-6">
            <div className="p-8 border-2 border-dashed rounded-4xl text-center bg-sky-50/50 dark:bg-sky-900/10">
                <h2 className="text-2xl font-bold">{form.data.titre || 'Sans titre'}</h2>
                <EventBadge type={form.data.type} className="mt-2" />
            </div>
            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: form.data.description }} />
        </div>
    );
}