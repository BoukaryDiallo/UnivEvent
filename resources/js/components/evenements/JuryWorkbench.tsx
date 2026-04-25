import type { FormDataConvertible } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import { Activity, CheckCheck, Clock3, Gavel, LoaderCircle, Lock, Send, Sparkles, Trophy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { EventJuryPanel, EventParticipant, EventTeamMember } from '@/types';

type JuryWorkbenchProps = {
    evenementId: number;
    competitionStatus: string | null | undefined;
    panel: EventJuryPanel | null | undefined;
    participants: EventTeamMember[];
    juryMembers: EventTeamMember[];
    registrants: EventParticipant[];
    canPresident: boolean;
    canJuryMember: boolean;
    onToast: (message: string, tone?: 'success' | 'error') => void;
};

type CriterionDraft = {
    id?: number;
    nom: string;
    description: string;
    bareme: string;
    coefficient: string;
    ordre: string;
    actif: boolean;
};

function normalizeCriteria(panel: EventJuryPanel | null | undefined): CriterionDraft[] {
    if (!panel?.criteria.length) {
        return [
            {
                nom: 'Impact',
                description: 'Pertinence et portee',
                bareme: '20',
                coefficient: '1',
                ordre: '1',
                actif: true,
            },
        ];
    }

    return panel.criteria.map((criterion, index) => ({
        id: criterion.id,
        nom: criterion.nom,
        description: criterion.description ?? '',
        bareme: String(criterion.bareme ?? 20),
        coefficient: String(criterion.coefficient ?? 1),
        ordre: String(criterion.ordre ?? index + 1),
        actif: criterion.actif,
    }));
}

function formatStatusLabel(value: string | null | undefined) {
    if (!value) {
        return 'En attente';
    }

    return value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildInitialScoreMap(panel: EventJuryPanel | null | undefined) {
    const grouped: Record<number, Record<number, { score: string; commentaire: string }>> = {};

    for (const entry of panel?.score_entries ?? []) {
        grouped[entry.participant_id] ??= {};
        grouped[entry.participant_id][entry.criterion_id] = {
            score: entry.score !== null ? String(entry.score) : '',
            commentaire: entry.commentaire ?? '',
        };
    }

    return grouped;
}

export function JuryWorkbench({
    evenementId,
    competitionStatus,
    panel,
    participants,
    juryMembers,
    registrants,
    canPresident,
    canJuryMember,
    onToast,
}: JuryWorkbenchProps) {
    const [criteria, setCriteria] = useState<CriterionDraft[]>(() => normalizeCriteria(panel));
    const [admissionAverage, setAdmissionAverage] = useState(String(panel?.admission_average ?? 10));
    const [seatsCount, setSeatsCount] = useState(String(panel?.seats_count ?? ''));
    const [rankingMode, setRankingMode] = useState(panel?.ranking_mode ?? 'final_note');
    const [tieBreakRule, setTieBreakRule] = useState(panel?.tie_break_rule ?? 'name');
    const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(participants[0]?.user_id ?? null);
    const [revisionReason, setRevisionReason] = useState('');
    const [scoreValuesByParticipant, setScoreValuesByParticipant] = useState(() => buildInitialScoreMap(panel));
    const [busyAction, setBusyAction] = useState<string | null>(null);

    const effectiveParticipantId = selectedParticipantId ?? participants[0]?.user_id ?? null;
    const selectedParticipant = participants.find((participant) => participant.user_id === effectiveParticipantId) ?? null;
    const selectedRegistrant = registrants.find((participant) => participant.user_id === effectiveParticipantId) ?? null;
    const scoreValues = effectiveParticipantId ? (scoreValuesByParticipant[effectiveParticipantId] ?? {}) : {};
    const totalCriteria = panel?.criteria.length ?? 0;
    const completedCriteria = panel?.score_entries?.filter(
        (entry) => entry.participant_id === effectiveParticipantId && entry.score !== null,
    ).length ?? 0;
    const pendingDeliberations = panel?.deliberations.filter((item) => item.status !== 'resolved') ?? [];

    const submitAction = (
        url: string,
        data?: Record<string, FormDataConvertible>,
        successMessage?: string,
        tone: 'success' | 'error' = 'success',
    ) => {
        setBusyAction(url);
        router.post(
            url,
            data ?? {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (successMessage) {
                        onToast(successMessage, tone);
                    }

                    setBusyAction(null);
                },
                onError: () => {
                    onToast('Action impossible pour le moment.', 'error');

                    setBusyAction(null);
                },
            },
        );
    };

    const handleSaveConfiguration = () => {
        submitAction(
            `/evenements/${evenementId}/jury/configurer`,
            {
                president_user_id: panel?.president_user_id ?? juryMembers.find((member) => member.is_president_jury)?.user_id ?? null,
                admission_average: Number(admissionAverage || 0),
                seats_count: seatsCount ? Number(seatsCount) : null,
                ranking_mode: rankingMode,
                tie_break_rule: tieBreakRule,
                lock_criteria: panel?.criteria_locked ?? false,
                criteria: criteria.map((criterion, index) => ({
                    id: criterion.id,
                    nom: criterion.nom,
                    description: criterion.description || null,
                    bareme: Number(criterion.bareme || 20),
                    coefficient: Number(criterion.coefficient || 1),
                    ordre: Number(criterion.ordre || index + 1),
                    actif: criterion.actif,
                })),
            },
            'Configuration jury enregistree.',
        );
    };

    const handleScore = (submit: boolean) => {
        if (!effectiveParticipantId) {
            onToast('Choisissez un participant a noter.', 'error');

            return;
        }

        submitAction(
            `/evenements/${evenementId}/jury/participants/${effectiveParticipantId}/noter`,
            {
                scores: (panel?.criteria ?? []).map((criterion) => ({
                    criterion_id: criterion.id,
                    score: scoreValues[criterion.id ?? -1]?.score ? Number(scoreValues[criterion.id ?? -1].score) : null,
                    commentaire: scoreValues[criterion.id ?? -1]?.commentaire || null,
                })),
                submit,
            },
            submit ? 'Notation soumise au jury.' : 'Brouillon de notation enregistre.',
        );
    };

    const handleRequestRevision = () => {
        if (!effectiveParticipantId || !revisionReason.trim()) {
            onToast('Ajoutez une raison de revision avant envoi.', 'error');

            return;
        }

        submitAction(
            `/evenements/${evenementId}/jury/participants/${effectiveParticipantId}/revision`,
            { reason: revisionReason.trim() },
            'Revision demandee aux jurys.',
        );

        setRevisionReason('');
    };

    if (!panel || (!canPresident && !canJuryMember)) {
        return null;
    }

    return (
        <section className="space-y-6">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white/95 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
                            <Activity className="size-3.5" />
                            Live Reverb actif
                        </div>
                        <h3 className="mt-3 text-xl font-semibold text-slate-950 dark:text-white">Cockpit jury et deliberation</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Configuration, notation, revisions et validation finale sont maintenant branches sur les endpoints du workflow.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {canPresident ? (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={busyAction === `/evenements/${evenementId}/jury/ouvrir-notation`}
                                    onClick={() => submitAction(`/evenements/${evenementId}/jury/ouvrir-notation`, {}, 'Notation ouverte.')}
                                >
                                    {busyAction === `/evenements/${evenementId}/jury/ouvrir-notation` ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                                    Ouvrir notation
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={busyAction === `/evenements/${evenementId}/jury/fermer-notation`}
                                    onClick={() => submitAction(`/evenements/${evenementId}/jury/fermer-notation`, {}, 'Notation fermee.')}
                                >
                                    {busyAction === `/evenements/${evenementId}/jury/fermer-notation` ? <LoaderCircle className="size-4 animate-spin" /> : <Lock className="size-4" />}
                                    Fermer notation
                                </Button>
                                <Button
                                    type="button"
                                    disabled={busyAction === `/evenements/${evenementId}/jury/finaliser`}
                                    onClick={() => submitAction(`/evenements/${evenementId}/jury/finaliser`, {}, 'Classement final publie.')}
                                >
                                    {busyAction === `/evenements/${evenementId}/jury/finaliser` ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCheck className="size-4" />}
                                    Finaliser
                                </Button>
                            </>
                        ) : null}
                    </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Statut</div>
                        <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{formatStatusLabel(competitionStatus)}</div>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Notation ouverte</div>
                        <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{panel.scoring_opened_at ? 'Oui' : 'Non'}</div>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Deliberations</div>
                        <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{pendingDeliberations.length}</div>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Validation</div>
                        <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{panel.validated_at ? 'Effectuee' : 'En attente'}</div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                {canPresident ? (
                    <div className="rounded-[1.75rem] border border-slate-200 bg-white/95 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            <Gavel className="size-4" />
                            Configuration du jury
                        </div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="jury-admission">Seuil admission</Label>
                                <Input id="jury-admission" value={admissionAverage} onChange={(event) => setAdmissionAverage(event.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jury-seats">Places</Label>
                                <Input id="jury-seats" value={seatsCount} onChange={(event) => setSeatsCount(event.target.value)} placeholder="Illimite" />
                            </div>
                            <div className="space-y-2">
                                <Label id="jury-ranking-label" htmlFor="jury-ranking">Mode</Label>
                                <select
                                    id="jury-ranking"
                                    title="Mode de classement"
                                    aria-labelledby="jury-ranking-label"
                                    value={rankingMode}
                                    onChange={(event) => setRankingMode(event.target.value)}
                                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                >
                                    <option value="final_note">Final note</option>
                                    <option value="weighted_average">Weighted average</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label id="jury-tie-break-label" htmlFor="jury-tie-break">Ex aequo</Label>
                                <select
                                    id="jury-tie-break"
                                    title="Règle pour les ex aequo"
                                    aria-labelledby="jury-tie-break-label"
                                    value={tieBreakRule}
                                    onChange={(event) => setTieBreakRule(event.target.value)}
                                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                >
                                    <option value="name">Nom</option>
                                    <option value="id">Ordre technique</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            {criteria.map((criterion, index) => (
                                <div key={`criterion-${criterion.id ?? index}`} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <Input
                                            value={criterion.nom}
                                            onChange={(event) =>
                                                setCriteria((current) =>
                                                    current.map((item, itemIndex) => (itemIndex === index ? { ...item, nom: event.target.value } : item)),
                                                )
                                            }
                                            placeholder="Nom du critere"
                                        />
                                        <div className="grid grid-cols-3 gap-3">
                                            <Input
                                                value={criterion.bareme}
                                                onChange={(event) =>
                                                    setCriteria((current) =>
                                                        current.map((item, itemIndex) => (itemIndex === index ? { ...item, bareme: event.target.value } : item)),
                                                    )
                                                }
                                                placeholder="Bareme"
                                            />
                                            <Input
                                                value={criterion.coefficient}
                                                onChange={(event) =>
                                                    setCriteria((current) =>
                                                        current.map((item, itemIndex) => (itemIndex === index ? { ...item, coefficient: event.target.value } : item)),
                                                    )
                                                }
                                                placeholder="Coeff"
                                            />
                                            <Input
                                                value={criterion.ordre}
                                                onChange={(event) =>
                                                    setCriteria((current) =>
                                                        current.map((item, itemIndex) => (itemIndex === index ? { ...item, ordre: event.target.value } : item)),
                                                    )
                                                }
                                                placeholder="Ordre"
                                            />
                                        </div>
                                    </div>
                                    <Textarea
                                        className="mt-3 min-h-20"
                                        value={criterion.description}
                                        onChange={(event) =>
                                            setCriteria((current) =>
                                                current.map((item, itemIndex) => (itemIndex === index ? { ...item, description: event.target.value } : item)),
                                            )
                                        }
                                        placeholder="Description du critere"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setCriteria((current) => [
                                        ...current,
                                        {
                                            nom: `Critere ${current.length + 1}`,
                                            description: '',
                                            bareme: '20',
                                            coefficient: '1',
                                            ordre: String(current.length + 1),
                                            actif: true,
                                        },
                                    ])
                                }
                            >
                                Ajouter un critere
                            </Button>
                            <Button type="button" onClick={handleSaveConfiguration} disabled={busyAction === `/evenements/${evenementId}/jury/configurer`}>
                                {busyAction === `/evenements/${evenementId}/jury/configurer` ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCheck className="size-4" />}
                                Enregistrer la configuration
                            </Button>
                        </div>
                    </div>
                ) : null}

                <div className="space-y-6">
                    <div className="rounded-[1.75rem] border border-slate-200 bg-white/95 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Bloc de notation</div>
                                <h4 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                                    {selectedParticipant?.name ?? 'Participant non selectionne'}
                                </h4>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    {selectedRegistrant?.backend_statut ? `Inscription ${selectedRegistrant.backend_statut}` : 'Participant assigne au concours'}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label id="jury-selected-participant-label" htmlFor="jury-selected-participant">Participant</Label>
                                <select
                                    id="jury-selected-participant"
                                    title="Sélectionner un participant"
                                    aria-labelledby="jury-selected-participant-label"
                                    value={effectiveParticipantId ?? ''}
                                    onChange={(event) => setSelectedParticipantId(Number(event.target.value))}
                                    className="flex h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                >
                                            {participants.map((participant) => (
                                        <option key={participant.id} value={participant.user_id ?? ''}>
                                            {participant.name ?? 'Participant'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-900">
                                Progression: {completedCriteria}/{totalCriteria}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-900">
                                Notation: {panel.scoring_closed_at ? 'fermee' : 'ouverte'}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-900">
                                Jurys: {juryMembers.length}
                            </span>
                        </div>

                        <div className="mt-5 space-y-4">
                            {panel.criteria.map((criterion) => (
                                <div key={criterion.id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 transition duration-300 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/40">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <div className="font-medium text-slate-950 dark:text-white">{criterion.nom}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                Bareme {criterion.bareme ?? 20} • coefficient {criterion.coefficient ?? 1}
                                            </div>
                                        </div>
                                        <Input
                                            value={scoreValues[criterion.id ?? -1]?.score ?? ''}
                                            onChange={(event) =>
                                                setScoreValuesByParticipant((current) => ({
                                                    ...current,
                                                    [effectiveParticipantId ?? -1]: {
                                                        ...(current[effectiveParticipantId ?? -1] ?? {}),
                                                        [criterion.id ?? -1]: {
                                                            score: event.target.value,
                                                            commentaire: current[effectiveParticipantId ?? -1]?.[criterion.id ?? -1]?.commentaire ?? '',
                                                        },
                                                    },
                                                }))
                                            }
                                            placeholder="Note"
                                            className="w-28"
                                        />
                                    </div>
                                    <Textarea
                                        className="mt-3 min-h-20"
                                        value={scoreValues[criterion.id ?? -1]?.commentaire ?? ''}
                                        onChange={(event) =>
                                            setScoreValuesByParticipant((current) => ({
                                                ...current,
                                                [effectiveParticipantId ?? -1]: {
                                                    ...(current[effectiveParticipantId ?? -1] ?? {}),
                                                    [criterion.id ?? -1]: {
                                                        score: current[effectiveParticipantId ?? -1]?.[criterion.id ?? -1]?.score ?? '',
                                                        commentaire: event.target.value,
                                                    },
                                                },
                                            }))
                                        }
                                        placeholder="Commentaire jury"
                                    />
                                </div>
                            ))}
                        </div>

                        {canJuryMember ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Button type="button" variant="outline" onClick={() => handleScore(false)} disabled={Boolean(busyAction)}>
                                    {busyAction?.includes('/noter') ? <LoaderCircle className="size-4 animate-spin" /> : <Clock3 className="size-4" />}
                                    Sauver brouillon
                                </Button>
                                <Button type="button" onClick={() => handleScore(true)} disabled={Boolean(busyAction) || panel.scoring_closed_at !== null}>
                                    {busyAction?.includes('/noter') ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
                                    Soumettre la note
                                </Button>
                            </div>
                        ) : null}
                    </div>

                    {canPresident ? (
                        <div className="rounded-[1.75rem] border border-slate-200 bg-white/95 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
                            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Demandes de revision</div>
                            <Textarea
                                className="mt-3 min-h-24"
                                value={revisionReason}
                                onChange={(event) => setRevisionReason(event.target.value)}
                                placeholder="Expliquez pourquoi une nouvelle deliberation est demandee"
                            />
                            <div className="mt-3 flex justify-end">
                                <Button type="button" variant="outline" onClick={handleRequestRevision} disabled={Boolean(busyAction)}>
                                    <Gavel className="size-4" />
                                    Demander revision
                                </Button>
                            </div>

                            <div className="mt-5 space-y-3">
                                {panel.deliberations.length ? (
                                    panel.deliberations.map((item) => (
                                        <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                <div>
                                                    <div className="font-medium text-slate-950 dark:text-white">
                                                        {item.participant_name ?? `Participant #${item.participant_id}`}
                                                    </div>
                                                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                        {item.requested_by_name ? `Demandee par ${item.requested_by_name}` : 'Origine non precisee'}
                                                    </div>
                                                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.reason}</p>
                                                </div>
                                                <div className="flex flex-col items-start gap-2 md:items-end">
                                                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                                                        {formatStatusLabel(item.status)}
                                                    </span>
                                                    {item.status !== 'resolved' ? (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => submitAction(`/jury/deliberations/${item.id}/resolve`, {}, 'Revision marquee comme resolue.')}
                                                        >
                                                            Resoudre
                                                        </Button>
                                                    ) : (
                                                        <div className="text-xs text-slate-400">
                                                            {item.resolved_by_name ? `Resolue par ${item.resolved_by_name}` : 'Resolue'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-3xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                        Aucune deliberation ouverte pour le moment.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}

                    <div className="rounded-[1.75rem] border border-slate-200 bg-white/95 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            <Trophy className="size-4" />
                            Projection du classement
                        </div>
                        <div className="mt-4 space-y-3">
                            {panel.computed_results.length ? (
                                panel.computed_results.map((row, index) => (
                                    <div
                                        key={`${row.participant_id}-${index}`}
                                        className="rounded-3xl border border-slate-200 bg-linear-to-r from-white to-slate-50 px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:from-slate-950 dark:to-slate-900"
                                    >
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <div className="font-medium text-slate-950 dark:text-white">{row.participant_name ?? `Participant #${row.participant_id}`}</div>
                                                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                    {formatStatusLabel(row.admission)} • {formatStatusLabel(row.mention)}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex size-11 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
                                                    {row.classement}
                                                </span>
                                                <span className="text-lg font-semibold text-slate-950 dark:text-white">{row.note}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-3xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                    Les resultats calcules apparaitront ici des que la configuration et les notes existent.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
