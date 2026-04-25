import { Download, Eye, FileBadge2, LoaderCircle, Palette, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { EventParticipant, EventResult, EventTemplateSchema } from '@/types';

type CertificateCanvasStudioProps = {
    evenementId: number;
    eventTitle: string;
    eventDate: string;
    enabled: boolean;
    version?: string | null;
    template: EventTemplateSchema | null | undefined;
    participants: EventParticipant[];
    results: EventResult[];
    canManage: boolean;
    onToast: (message: string, tone?: 'success' | 'error') => void;
};

type PreviewState = {
    code: string;
    payload: Record<string, string | number | boolean | null>;
    template: EventTemplateSchema;
};

type DraftState = {
    title: string;
    background: string;
    accent: string;
    layout: string;
    signature: string;
    note: string;
    mention: string;
    admission: string;
    subtitle: string;
};

function normalizeTemplate(template: EventTemplateSchema | null | undefined): DraftState {
    return {
        title: String(template?.title ?? 'Certificat'),
        background: String(template?.background ?? '#fffdf7'),
        accent: String(template?.accent ?? '#0f172a'),
        layout: String(template?.layout ?? 'canvas_v1'),
        signature: String(template?.signature ?? 'Comite de validation'),
        note: '',
        mention: '',
        admission: '',
        subtitle: 'Studio visuel relie au moteur PDF',
    };
}

function readCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

async function postJson(url: string, body: Record<string, unknown>) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': readCsrfToken(),
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: JSON.stringify(body),
    });

    const data = (await response.json().catch(() => null)) as { message?: string; data?: PreviewState } | null;

    if (!response.ok) {
        throw new Error(data?.message || 'La requete a echoue.');
    }

    return data;
}

function formatEventDate(value: string) {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString(undefined, {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
          });
}

function mentionLabel(value: string) {
    return value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function CertificateCanvasStudio({
    evenementId,
    eventTitle,
    eventDate,
    enabled,
    version,
    template,
    participants,
    results,
    canManage,
    onToast,
}: CertificateCanvasStudioProps) {
    const eligibleParticipants = participants.filter((participant) => participant.backend_statut === 'accepte');
    const [selectedUserId, setSelectedUserId] = useState<number | null>(
        results[0]?.user.id ?? eligibleParticipants[0]?.user.id ?? participants[0]?.user.id ?? null,
    );
    const [draft, setDraft] = useState<DraftState>(() => normalizeTemplate(template));
    const [preview, setPreview] = useState<PreviewState | null>(null);
    const [busyAction, setBusyAction] = useState<'preview' | 'generate' | null>(null);

    const selectedParticipant =
        participants.find((participant) => participant.user_id === selectedUserId) ??
        participants.find((participant) => participant.user.id === selectedUserId) ??
        null;
    const selectedResult = results.find((result) => result.user.id === selectedUserId) ?? null;
    const visualPayload = preview?.payload ?? {
        nom: selectedParticipant?.user.name ?? selectedResult?.user.name ?? 'Participant',
        titre_evenement: eventTitle,
        date_evenement: formatEventDate(eventDate),
        rang: selectedResult?.classement ?? (draft.note || null),
        admission: selectedResult?.admission ?? (draft.admission || null),
        mention: selectedResult?.mention ?? (draft.mention || null),
        signature: draft.signature,
        type_certificat: enabled ? 'certificat' : 'apercu',
    };
    const visualTheme = {
        background: String(preview?.template?.background ?? draft.background),
        accent: String(preview?.template?.accent ?? draft.accent),
        title: String(preview?.template?.title ?? draft.title),
        layout: String(preview?.template?.layout ?? draft.layout),
    };

    const handlePreview = async () => {
        if (!selectedUserId) {
            onToast('Selectionnez un participant pour lancer l apercu.', 'error');

            return;
        }

        setBusyAction('preview');

        try {
            const response = await postJson('/certificats/previsualiser', {
                evenement_id: evenementId,
                utilisateur_id: selectedUserId,
                overrides: {
                    nom: selectedParticipant?.user.name ?? selectedResult?.user.name ?? null,
                    titre_evenement: eventTitle,
                    date_evenement: formatEventDate(eventDate),
                    admission: selectedResult?.admission ?? (draft.admission || null),
                    mention: selectedResult?.mention ?? (draft.mention || null),
                    rang: selectedResult?.classement ?? (draft.note || null),
                    signature: draft.signature,
                },
            });

            setPreview(response?.data ?? null);

            onToast('Apercu certificat recharge depuis le backend.');
        } catch (error) {
            onToast(error instanceof Error ? error.message : 'Apercu indisponible.', 'error');
        } finally {
            setBusyAction(null);
        }
    };

    const handleGenerate = async () => {
        if (!selectedUserId) {
            onToast('Selectionnez un participant avant generation.', 'error');

            return;
        }

        setBusyAction('generate');

        try {
            await postJson('/certificats/generer', {
                evenement_id: evenementId,
                utilisateur_id: selectedUserId,
                overrides: {
                    nom: selectedParticipant?.user.name ?? selectedResult?.user.name ?? null,
                    titre_evenement: eventTitle,
                    date_evenement: formatEventDate(eventDate),
                    admission: selectedResult?.admission ?? (draft.admission || null),
                    mention: selectedResult?.mention ?? (draft.mention || null),
                    rang: selectedResult?.classement ?? (draft.note || null),
                    signature: draft.signature,
                },
            });

            onToast('Generation envoyee. Le certificat apparaitra en live.');
        } catch (error) {
            onToast(error instanceof Error ? error.message : 'Generation impossible.', 'error');
        } finally {
            setBusyAction(null);
        }
    };

    if (!canManage) {
        return null;
    }

    return (
        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
            <div className="border-b border-slate-200 bg-linear-to-r from-amber-50 via-white to-rose-50 px-6 py-5 dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-900 dark:bg-slate-900 dark:text-amber-300">
                            <Palette className="size-3.5" />
                            Canvas certificat {version ? `• ${version}` : ''}
                        </div>
                        <h3 className="mt-3 text-xl font-semibold text-slate-950 dark:text-white">Studio visuel de certificat</h3>
                        <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                            Retouchez le rendu, demandez un apercu backend, puis generez le PDF final pour un participant.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" onClick={handlePreview} disabled={busyAction !== null}>
                            {busyAction === 'preview' ? <LoaderCircle className="size-4 animate-spin" /> : <Eye className="size-4" />}
                            Previsualiser
                        </Button>
                        <Button type="button" onClick={handleGenerate} disabled={busyAction !== null || !enabled}>
                            {busyAction === 'generate' ? <LoaderCircle className="size-4 animate-spin" /> : <Download className="size-4" />}
                            Generer
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 p-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-5">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                        <Label id="certificate-user-label" htmlFor="certificate-user">Participant cible</Label>
                        <select
                            id="certificate-user"
                            title="Sélectionner un participant"
                            aria-labelledby="certificate-user-label"
                            value={selectedUserId ?? ''}
                            onChange={(event) => setSelectedUserId(Number(event.target.value))}
                            className="mt-2 flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none ring-0 transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        >
                            {participants.map((participant) => (
                                <option key={participant.id} value={participant.user_id}>
                                    {(participant.user.name ?? 'Participant') + (participant.backend_statut ? ` • ${participant.backend_statut}` : '')}
                                </option>
                            ))}
                        </select>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="rounded-full bg-white px-3 py-1 dark:bg-slate-950">
                                Classement: {selectedResult?.classement ?? 'non publie'}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 dark:bg-slate-950">
                                Admission: {selectedResult?.admission ? mentionLabel(selectedResult.admission) : 'a definir'}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 dark:bg-slate-950">
                                Mention: {selectedResult?.mention ? mentionLabel(selectedResult.mention) : 'aucune'}
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="certificate-title">Titre</Label>
                            <Input id="certificate-title" value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label id="certificate-layout-label" htmlFor="certificate-layout">Layout</Label>
                            <select
                                id="certificate-layout"
                                title="Choisir la mise en page du certificat"
                                aria-labelledby="certificate-layout-label"
                                value={draft.layout}
                                onChange={(event) => setDraft((current) => ({ ...current, layout: event.target.value }))}
                                className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            >
                                <option value="canvas_v1">Canvas V1</option>
                                <option value="spotlight">Spotlight</option>
                                <option value="stacked">Stacked</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="certificate-background">Fond</Label>
                            <Input id="certificate-background" value={draft.background} onChange={(event) => setDraft((current) => ({ ...current, background: event.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="certificate-accent">Accent</Label>
                            <Input id="certificate-accent" value={draft.accent} onChange={(event) => setDraft((current) => ({ ...current, accent: event.target.value }))} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="certificate-signature">Signature affichee</Label>
                        <Input id="certificate-signature" value={draft.signature} onChange={(event) => setDraft((current) => ({ ...current, signature: event.target.value }))} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="certificate-rank">Rang</Label>
                            <Input id="certificate-rank" value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} placeholder={String(selectedResult?.classement ?? '')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="certificate-admission">Admission</Label>
                            <Input id="certificate-admission" value={draft.admission} onChange={(event) => setDraft((current) => ({ ...current, admission: event.target.value }))} placeholder={selectedResult?.admission ?? 'admis'} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="certificate-mention">Mention</Label>
                            <Input id="certificate-mention" value={draft.mention} onChange={(event) => setDraft((current) => ({ ...current, mention: event.target.value }))} placeholder={selectedResult?.mention ?? 'tres_bien'} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="certificate-subtitle">Note de studio</Label>
                        <Textarea
                            id="certificate-subtitle"
                            value={draft.subtitle}
                            onChange={(event) => setDraft((current) => ({ ...current, subtitle: event.target.value }))}
                            className="min-h-20"
                        />
                    </div>

                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
                        {enabled
                            ? 'Le moteur certificat est actif pour cet evenement. Les apercus utilisent les endpoints backend en place.'
                            : 'Cet evenement n est pas marque comme certifiant. Le canvas reste visible pour preconfigurer le rendu, mais la generation sera bloquee.'}
                    </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),rgba(241,245,249,0.88))] p-4 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.95),rgba(2,6,23,0.98))]">
                    <div
                        className="relative min-h-135 overflow-hidden rounded-[1.75rem] border border-white/60 p-8 shadow-[0_35px_80px_-35px_rgba(15,23,42,0.35)] transition-all duration-500 dark:border-white/10"
                        style={{
                            background: `linear-gradient(135deg, ${visualTheme.background} 0%, #ffffff 55%, ${visualTheme.background} 100%)`,
                            color: visualTheme.accent,
                        }}
                    >
                        <div className="absolute inset-0 opacity-90" style={{ background: `radial-gradient(circle at top right, ${visualTheme.accent}22, transparent 34%), radial-gradient(circle at bottom left, ${visualTheme.accent}18, transparent 32%)` }} />
                        <div className="absolute -right-16 top-10 size-44 rounded-full blur-3xl" style={{ backgroundColor: `${visualTheme.accent}20` }} />
                        <div className="absolute bottom-8 left-8 h-px w-24" style={{ backgroundColor: `${visualTheme.accent}55` }} />

                        <div className={`relative z-10 flex h-full flex-col ${visualTheme.layout === 'spotlight' ? 'justify-center text-center' : 'justify-between'}`}>
                            <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] opacity-75">
                                <span className="inline-flex items-center gap-2">
                                    <FileBadge2 className="size-4" />
                                    {visualTheme.title}
                                </span>
                                <span>{preview?.code ?? 'Apercu local'}</span>
                            </div>

                            <div className={visualTheme.layout === 'stacked' ? 'mt-10 space-y-8' : 'mt-14 space-y-6'}>
                                <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium" style={{ borderColor: `${visualTheme.accent}30`, backgroundColor: `${visualTheme.accent}0d` }}>
                                    <Sparkles className="size-3.5" />
                                    {draft.subtitle}
                                </div>
                                <div className="max-w-3xl">
                                    <div className="text-sm uppercase tracking-[0.32em] opacity-70">Attribue a</div>
                                    <div className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                                        {String(visualPayload.nom ?? 'Participant')}
                                    </div>
                                    <div className="mt-4 text-lg leading-8 opacity-85">
                                        Pour sa participation et sa performance dans <span className="font-semibold">{String(visualPayload.titre_evenement ?? eventTitle)}</span>.
                                    </div>
                                </div>
                                <div className={`grid gap-3 ${visualTheme.layout === 'spotlight' ? 'mx-auto max-w-2xl sm:grid-cols-3' : 'sm:grid-cols-3'}`}>
                                    <div className="rounded-3xl border px-4 py-4 backdrop-blur" style={{ borderColor: `${visualTheme.accent}22`, backgroundColor: `${visualTheme.accent}0d` }}>
                                        <div className="text-xs uppercase tracking-[0.2em] opacity-70">Date</div>
                                        <div className="mt-2 text-lg font-semibold">{String(visualPayload.date_evenement ?? formatEventDate(eventDate))}</div>
                                    </div>
                                    <div className="rounded-3xl border px-4 py-4 backdrop-blur" style={{ borderColor: `${visualTheme.accent}22`, backgroundColor: `${visualTheme.accent}0d` }}>
                                        <div className="text-xs uppercase tracking-[0.2em] opacity-70">Admission</div>
                                        <div className="mt-2 text-lg font-semibold">
                                            {visualPayload.admission ? mentionLabel(String(visualPayload.admission)) : 'En evaluation'}
                                        </div>
                                    </div>
                                    <div className="rounded-3xl border px-4 py-4 backdrop-blur" style={{ borderColor: `${visualTheme.accent}22`, backgroundColor: `${visualTheme.accent}0d` }}>
                                        <div className="text-xs uppercase tracking-[0.2em] opacity-70">Mention</div>
                                        <div className="mt-2 text-lg font-semibold">
                                            {visualPayload.mention ? mentionLabel(String(visualPayload.mention)) : 'Aucune'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`relative mt-10 ${visualTheme.layout === 'spotlight' ? 'text-center' : ''}`}>
                                <div className={`grid gap-4 ${visualTheme.layout === 'spotlight' ? 'sm:grid-cols-2' : 'sm:grid-cols-[1fr_auto]'}`}>
                                    <div>
                                        <div className="text-xs uppercase tracking-[0.24em] opacity-70">Signature</div>
                                        <div className="mt-2 text-lg font-semibold">{String(visualPayload.signature ?? draft.signature)}</div>
                                    </div>
                                    <div className="rounded-3xl border px-4 py-4 text-right" style={{ borderColor: `${visualTheme.accent}24`, backgroundColor: `${visualTheme.accent}0d` }}>
                                        <div className="text-xs uppercase tracking-[0.2em] opacity-70">Rang</div>
                                        <div className="mt-2 text-3xl font-semibold">
                                            {String(visualPayload.rang ?? selectedResult?.classement ?? '—')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
