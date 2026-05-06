import { Link, useForm } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { ListChecks, Layers3 } from 'lucide-react';
import { ImagePlus } from 'lucide-react';
import { Rocket } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { EventFormMeta, EventFormValues, EventAssignmentRole, EventAssignmentPermissions } from '@/types';
import { EventBadge } from './EventBadge';
import { 
    EventBasicsStep,
    formWizardSteps,
    defaultPermissionsForRole,
    assignmentRoleDescriptions,
    permissionLabels
} from './EventFormWizard/sections';
import { EventProgramEditor } from './EventProgramEditor';

type EventFormWizardProps = {
    mode: 'create' | 'edit';
    meta: EventFormMeta;
    action: string;
    method?: 'post' | 'put';
    initialValues: EventFormValues;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

export function EventFormWizard({ mode, meta, action, method = 'post', initialValues, cancelHref }: EventFormWizardProps) {
    const [step, setStep] = useState<(typeof formWizardSteps)[number]['key']>('basics');
    const form = useForm<EventFormValues>(initialValues);

    const currentStepIndex = formWizardSteps.findIndex((item) => item.key === step);
    const mediaPreviewUrl = useMemo(
        () => (form.data.media ? URL.createObjectURL(form.data.media) : null),
        [form.data.media],
    );
    const mediaPreviewIsImage = form.data.media?.type.startsWith('image/') ?? false;

    useEffect(() => {
        if (!mediaPreviewUrl) {
            return;
        }

        return () => URL.revokeObjectURL(mediaPreviewUrl);
    }, [mediaPreviewUrl]);

    const validateStep = (stepKey: (typeof formWizardSteps)[number]['key']): boolean => {
        switch (stepKey) {
            case 'basics':
                return Boolean(form.data.titre && form.data.type && form.data.date_debut);
            case 'access':
                return Boolean(form.data.visibilite && form.data.statut && form.data.roles.length > 0);
            case 'program':
                return true;
            case 'media':
                return true;
            case 'preview':
                return Boolean(form.data.titre && form.data.type && form.data.date_debut && form.data.visibilite && form.data.statut);
            default:
                return false;
        }
    };

    const canProceedToNext = (): boolean => {
        return validateStep(step);
    };

    const goToNextStep = () => {
        if (!canProceedToNext()) {
            return;
        }

        const nextIndex = Math.min(formWizardSteps.length - 1, currentStepIndex + 1);
        setStep(formWizardSteps[nextIndex]!.key);
    };

    const goToPreviousStep = () => {
        const prevIndex = Math.max(0, currentStepIndex - 1);
        setStep(formWizardSteps[prevIndex]!.key);
    };

    const toggleAssignment = (role: EventAssignmentRole, userId: number, checked: boolean) => {
        const currentEntries = form.data.assigned_users[role];

        form.setData('assigned_users', {
            ...form.data.assigned_users,
            [role]: checked
                ? [...currentEntries, { user_id: userId, is_president_jury: false, permissions: defaultPermissionsForRole(role) }]
                : currentEntries.filter((entry) => entry.user_id !== userId),
        });
    };

    const updateAssignmentPermission = (role: EventAssignmentRole, userId: number, permission: keyof EventAssignmentPermissions, checked: boolean) => {
        form.setData('assigned_users', {
            ...form.data.assigned_users,
            [role]: form.data.assigned_users[role].map((entry) =>
                entry.user_id === userId
                    ? {
                          ...entry,
                          permissions: {
                              ...entry.permissions,
                              [permission]: checked,
                          },
                      }
                    : entry,
            ),
        });
    };

    const togglePresident = (userId: number, checked: boolean) => {
        form.setData('assigned_users', {
            ...form.data.assigned_users,
            jury: form.data.assigned_users.jury.map((entry) => ({
                ...entry,
                is_president_jury: entry.user_id === userId ? checked : false,
            })),
        });
        form.setData('jury_config', {
            ...form.data.jury_config,
            president_user_id: checked ? userId : null,
        });
    };

    const submit = () => {
        if (!validateStep('preview')) {
            setStep('preview');

            return;
        }

        form.transform((data) => ({
            ...data,
            _method: method === 'put' ? 'put' : undefined,
        }));

        form.post(action, {
            forceFormData: true,
        });
    };

    return (
        <div className="space-y-8">
            <div className="grid gap-3 lg:grid-cols-4">
                {formWizardSteps.map((item, index) => (
                    <button
                        key={item.key}
                        type="button"
                        onClick={() => setStep(item.key)}
                        className={cn(
                            'flex items-center gap-3 rounded-3xl border px-4 py-4 text-left transition',
                            step === item.key
                                ? 'border-sky-200 bg-sky-50 text-sky-700 shadow-sm dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-200'
                                : 'border-slate-200 bg-white/80 text-slate-500 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300 dark:hover:border-slate-700',
                        )}
                    >
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                            <item.icon className="size-5" />
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-[0.2em] opacity-70">Etape {index + 1}</div>
                            <div className="font-medium">{item.label}</div>
                        </div>
                    </button>
                ))}
            </div>

            {step === 'basics' && (
                <EventBasicsStep form={form} meta={meta} />
            )}

            {step === 'access' && (
                <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-5 rounded-[2rem] border border-slate-200 bg-white/90 p-6 dark:border-slate-800 dark:bg-slate-950/70">
                            <div className="space-y-2">
                                <Label>Visibilite</Label>
                                <Select value={form.data.visibilite} onValueChange={(value) => form.setData('visibilite', value as EventFormValues['visibilite'])}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {meta.visibilities.map((visibility) => (
                                            <SelectItem key={visibility.value} value={visibility.value}>
                                                {visibility.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="public_cible">Note sur le public cible</Label>
                                <Textarea id="public_cible" value={form.data.public_cible} onChange={(event) => form.setData('public_cible', event.target.value)} className="min-h-24" />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="capacite_max">Capacite</Label>
                                    <Input id="capacite_max" type="number" min="1" value={form.data.capacite_max} onChange={(event) => form.setData('capacite_max', event.target.value)} placeholder="250" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Statut</Label>
                                    <Select value={form.data.statut} onValueChange={(value) => form.setData('statut', value as EventFormValues['statut'])}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {meta.statuses.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                                    <Checkbox checked={form.data.inscription_requise} onCheckedChange={(checked) => form.setData('inscription_requise', Boolean(checked))} />
                                    <span className="text-sm">Inscription requise</span>
                                </label>
                                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                                    <Checkbox checked={form.data.checkin_active} onCheckedChange={(checked) => form.setData('checkin_active', Boolean(checked))} />
                                    <span className="text-sm">Activer le check-in</span>
                                </label>
                                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                                    <Checkbox checked={form.data.comments_enabled} onCheckedChange={(checked) => form.setData('comments_enabled', Boolean(checked))} />
                                    <span className="text-sm">Commentaires actifs</span>
                                </label>
                                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                                    <Checkbox checked={form.data.messages_enabled} onCheckedChange={(checked) => form.setData('messages_enabled', Boolean(checked))} />
                                    <span className="text-sm">Messagerie active</span>
                                </label>
                                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                                    <Checkbox checked={form.data.comment_replies_enabled} onCheckedChange={(checked) => form.setData('comment_replies_enabled', Boolean(checked))} />
                                    <span className="text-sm">Reponses autorisees</span>
                                </label>
                                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                                    <Checkbox checked={form.data.comment_reactions_enabled} onCheckedChange={(checked) => form.setData('comment_reactions_enabled', Boolean(checked))} />
                                    <span className="text-sm">Reactions autorisees</span>
                                </label>
                                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                                    <Checkbox checked={form.data.evenement_certifie} onCheckedChange={(checked) => form.setData('evenement_certifie', Boolean(checked))} />
                                    <span className="text-sm">Evenement certifiant</span>
                                </label>
                                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                                    <Checkbox checked={form.data.allow_participant_result_tracking} onCheckedChange={(checked) => form.setData('allow_participant_result_tracking', Boolean(checked))} />
                                    <span className="text-sm">Suivi resultat participant</span>
                                </label>
                            </div>
                            <div className="space-y-2">
                                <Label>Politique de commentaire</Label>
                                <Select value={form.data.comment_policy} onValueChange={(value) => form.setData('comment_policy', value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {meta.commentPolicies.map((policy) => (
                                            <SelectItem key={policy.value} value={policy.value}>
                                                {policy.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-5 rounded-[2rem] border border-slate-200 bg-white/90 p-6 dark:border-slate-800 dark:bg-slate-950/70">
                            <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                <ListChecks className="size-4" />
                                Roles autorises
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {meta.availableRoles.map((role) => {
                                    const checked = form.data.roles.includes(role);

                                    return (
                                        <label key={role} className={cn('flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition', checked ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-200' : 'border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-300')}>
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={(isChecked) => {
                                                    form.setData('roles', isChecked ? [...form.data.roles, role] : form.data.roles.filter((item) => item !== role));
                                                }}
                                            />
                                            <span className="capitalize">{role}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white/90 p-6 dark:border-slate-800 dark:bg-slate-950/70">
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            <Layers3 className="size-4" />
                            Affectations nominatives et permissions
                        </div>
                        <div className="grid gap-4">
                            {meta.assignmentRoles.map((assignmentRole) => (
                                <div key={assignmentRole.value} className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                                    <div className="text-sm font-semibold capitalize text-slate-900 dark:text-white">{assignmentRole.label}</div>
                                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                        {assignmentRoleDescriptions[assignmentRole.value] ?? 'Selectionnez les utilisateurs concernes.'}
                                    </p>
                                    <div className="mt-4 grid gap-3 xl:grid-cols-2">
                                        {meta.assignableUsers.map((user) => {
                                            const entry = form.data.assigned_users[assignmentRole.value].find((item) => item.user_id === user.id);
                                            const selected = Boolean(entry);

                                            return (
                                                <div key={`${assignmentRole.value}-${user.id}`} className={cn('rounded-2xl border px-4 py-3 transition', selected ? 'border-sky-200 bg-sky-50 dark:border-sky-900/70 dark:bg-sky-950/30' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950')}>
                                                    <label className="flex items-start gap-3 text-sm">
                                                        <Checkbox checked={selected} onCheckedChange={(checked) => toggleAssignment(assignmentRole.value, user.id, Boolean(checked))} />
                                                        <span className="min-w-0">
                                                            <span className="block truncate font-medium text-slate-900 dark:text-white">{user.name || 'Utilisateur sans nom'}</span>
                                                            <span className="mt-1 block truncate text-xs text-slate-500 dark:text-slate-400">{[user.email, user.role].filter(Boolean).join(' - ')}</span>
                                                        </span>
                                                    </label>
                                                    {selected && entry ? (
                                                        <div className="mt-4 space-y-3">
                                                            {assignmentRole.value === 'jury' ? (
                                                                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-800">
                                                                    <Checkbox checked={Boolean(entry.is_president_jury)} onCheckedChange={(checked) => togglePresident(user.id, Boolean(checked))} />
                                                                    <span>President du jury</span>
                                                                </label>
                                                            ) : null}
                                                            <div className="grid gap-2 sm:grid-cols-2">
                                                                {(Object.keys(permissionLabels) as Array<keyof EventAssignmentPermissions>).map((permission) => (
                                                                    <label key={permission} className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-800">
                                                                        <Checkbox
                                                                            checked={entry.permissions[permission]}
                                                                            onCheckedChange={(checked) => updateAssignmentPermission(assignmentRole.value, user.id, permission, Boolean(checked))}
                                                                        />
                                                                        <span>{permissionLabels[permission]}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {form.data.type === 'concours' && (
                        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 dark:border-slate-800 dark:bg-slate-950/70">
                            <div className="mb-4 text-sm font-medium text-slate-500 dark:text-slate-400">Configuration concours et jury</div>
                            <div className="grid gap-4 lg:grid-cols-4">
                                <div className="space-y-2">
                                    <Label>Seuil admission</Label>
                                    <Input type="number" step="0.1" value={form.data.jury_config.admission_average ?? ''} onChange={(event) => form.setData('jury_config', { ...form.data.jury_config, admission_average: Number(event.target.value) })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nombre de places</Label>
                                    <Input type="number" value={form.data.jury_config.seats_count ?? ''} onChange={(event) => form.setData('jury_config', { ...form.data.jury_config, seats_count: event.target.value ? Number(event.target.value) : null })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mode classement</Label>
                                    <Input value={form.data.jury_config.ranking_mode ?? ''} onChange={(event) => form.setData('jury_config', { ...form.data.jury_config, ranking_mode: event.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Regle ex aequo</Label>
                                    <Input value={form.data.jury_config.tie_break_rule ?? ''} onChange={(event) => form.setData('jury_config', { ...form.data.jury_config, tie_break_rule: event.target.value })} />
                                </div>
                            </div>
                            <div className="mt-5 space-y-3">
                                {form.data.jury_config.criteria.map((criterion, index) => (
                                    <div key={`criterion-${index}`} className="grid gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 lg:grid-cols-6">
                                        <Input value={criterion.nom} onChange={(event) => form.setData('jury_config', { ...form.data.jury_config, criteria: form.data.jury_config.criteria.map((item, itemIndex) => itemIndex === index ? { ...item, nom: event.target.value } : item) })} placeholder="Critere" />
                                        <Input value={criterion.description ?? ''} onChange={(event) => form.setData('jury_config', { ...form.data.jury_config, criteria: form.data.jury_config.criteria.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item) })} placeholder="Description" />
                                        <Input type="number" step="0.1" value={criterion.bareme ?? ''} onChange={(event) => form.setData('jury_config', { ...form.data.jury_config, criteria: form.data.jury_config.criteria.map((item, itemIndex) => itemIndex === index ? { ...item, bareme: Number(event.target.value) } : item) })} placeholder="Bareme" />
                                        <Input type="number" step="0.1" value={criterion.coefficient ?? ''} onChange={(event) => form.setData('jury_config', { ...form.data.jury_config, criteria: form.data.jury_config.criteria.map((item, itemIndex) => itemIndex === index ? { ...item, coefficient: Number(event.target.value) } : item) })} placeholder="Coef" />
                                        <Input type="number" value={criterion.ordre ?? ''} onChange={(event) => form.setData('jury_config', { ...form.data.jury_config, criteria: form.data.jury_config.criteria.map((item, itemIndex) => itemIndex === index ? { ...item, ordre: Number(event.target.value) } : item) })} placeholder="Ordre" />
                                        <Button type="button" variant="outline" onClick={() => form.setData('jury_config', { ...form.data.jury_config, criteria: form.data.jury_config.criteria.filter((_, itemIndex) => itemIndex !== index) })}>
                                            Retirer
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={() => form.setData('jury_config', { ...form.data.jury_config, criteria: [...form.data.jury_config.criteria, { nom: '', description: '', bareme: 20, coefficient: 1, ordre: form.data.jury_config.criteria.length + 1, actif: true }] })}>
                                    Ajouter un critere
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {step === 'media' && (
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-5 rounded-[2rem] border border-slate-200 bg-white/90 p-6 dark:border-slate-800 dark:bg-slate-950/70">
                        <div className="space-y-2">
                            <Label htmlFor="media">Banniere de couverture</Label>
                            <Input id="media" type="file" accept="image/*,.pdf" onChange={(event) => form.setData('media', event.target.files?.[0] ?? null)} className="h-12 rounded-2xl" />
                            <InputError message={form.errors.media} />
                        </div>
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm leading-6 text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                            Ajoutez une banniere forte pour rendre l evenement plus vivant dans le fil. Les images larges fonctionnent le mieux.
                        </div>
                    </div>
                    <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 dark:border-slate-800 dark:bg-slate-950/70">
                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Apercu visuel</div>
                        <div className="mt-4 space-y-4">
                            <div className="aspect-[16/9] overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-sky-500 via-cyan-400 to-emerald-300">
                                {mediaPreviewUrl && mediaPreviewIsImage ? (
                                    <img src={mediaPreviewUrl} alt="Apercu de la banniere" className="size-full object-cover" />
                                ) : mediaPreviewUrl ? (
                                    <div className="flex size-full flex-col items-center justify-center gap-3 bg-slate-950/70 p-6 text-center text-white">
                                        <ImagePlus className="size-10" />
                                        <div className="text-sm font-medium">Document PDF selectionne</div>
                                        <div className="text-xs text-slate-200">{form.data.media?.name}</div>
                                    </div>
                                ) : null}
                            </div>
                            <div className="space-y-3">
                                <EventBadge type={form.data.type} />
                                <div className="text-2xl font-semibold text-slate-950 dark:text-white">{form.data.titre || 'Votre prochain evenement phare'}</div>
                                <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{form.data.lieu || 'Campus universitaire'} - {form.data.date_debut || 'Choisissez une date pour continuer'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === 'program' && (
                <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 dark:border-slate-800 dark:bg-slate-950/70">
                    <EventProgramEditor programmes={form.data.programmes} eventStart={form.data.date_debut} onChange={(programmes) => form.setData('programmes', programmes)} />
                </div>
            )}

            {step === 'preview' && (
                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-950/70">
                        <div className="aspect-[16/7] overflow-hidden bg-gradient-to-br from-slate-950 via-sky-700 to-cyan-400">
                            {mediaPreviewUrl && mediaPreviewIsImage ? (
                                <img src={mediaPreviewUrl} alt="Banniere de previsualisation" className="size-full object-cover" />
                            ) : mediaPreviewUrl ? (
                                <div className="flex size-full flex-col items-center justify-center gap-3 bg-slate-950/70 p-6 text-center text-white">
                                    <ImagePlus className="size-10" />
                                    <div className="text-sm font-medium">Le document sera affiche dans la section Documents de l evenement.</div>
                                    <div className="text-xs text-slate-200">{form.data.media?.name}</div>
                                </div>
                            ) : null}
                        </div>
                        <div className="space-y-5 p-6">
                            <div className="flex flex-wrap gap-2">
                                <EventBadge type={form.data.type} />
                                <EventBadge status={form.data.statut} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-semibold text-slate-950 dark:text-white">{form.data.titre || 'Apercu du titre de l evenement'}</h2>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{form.data.lieu || 'Lieu en attente'} - {form.data.date_debut || 'Date en attente'}</div>
                            </div>
                            <div className="prose prose-slate max-w-none [&_b]:font-bold [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 dark:prose-invert" dangerouslySetInnerHTML={{ __html: form.data.description || '<p>Ajoutez une description pour previsualiser l histoire de l evenement.</p>' }} />
                        </div>
                    </div>
                    <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white/90 p-6 dark:border-slate-800 dark:bg-slate-950/70">
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            <Rocket className="size-4" />
                            Verification avant publication
                        </div>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                            <li className={form.data.titre ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                Titre : {form.data.titre ? '✓ Pret' : '✗ Manquant'}
                            </li>
                            <li className={form.data.date_debut ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                Date : {form.data.date_debut ? '✓ Prete' : '✗ Manquante'}
                            </li>
                            <li className={form.data.roles.length ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                Audience : {form.data.roles.length ? form.data.roles.join(', ') : '✗ Aucun role selectionne'}
                            </li>
                            <li className={form.data.visibilite ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                Visibilite : {form.data.visibilite || '✗ Non definie'}
                            </li>
                            <li className={form.data.statut ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                Statut : {form.data.statut || '✗ Non defini'}
                            </li>
                            <li>Messagerie : {form.data.messages_enabled ? 'Active' : 'Inactive'}</li>
                            <li>Certifications : {form.data.evenement_certifie ? 'Actives' : 'Inactives'}</li>
                        </ul>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={goToPreviousStep} disabled={currentStepIndex === 0}>
                        Precedent
                    </Button>
                    <Button type="button" variant="outline" onClick={goToNextStep} disabled={currentStepIndex === formWizardSteps.length - 1 || !canProceedToNext()}>
                        Suivant
                    </Button>
                </div>
                <div className="flex gap-3">
                    <Button asChild type="button" variant="outline">
                        <Link href={cancelHref}>Annuler</Link>
                    </Button>
                    {step === 'preview' && validateStep('preview') ? (
                        <Button type="button" onClick={submit} disabled={form.processing}>
                            {mode === 'create' ? 'Soumettre pour validation' : 'Enregistrer les modifications'}
                        </Button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
