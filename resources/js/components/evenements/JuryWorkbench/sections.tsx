import { CheckCheck, Gavel, LoaderCircle, } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { EventJuryPanel, } from '@/types';

interface JuryStatusCardsProps {
    competitionStatus: string | null | undefined;
    panel: EventJuryPanel;
    pendingDeliberations: unknown[];
}

export function JuryStatusCards({ competitionStatus, panel, pendingDeliberations }: JuryStatusCardsProps) {
    const formatStatusLabel = (value: string | null | undefined) => {
        if (!value) {
            return 'En attente';
        }

        return value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    };

    return (
        <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Statut</div>
                <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                    {formatStatusLabel(competitionStatus)}
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Notation ouverte</div>
                <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                    {panel.scoring_opened_at ? 'Oui' : 'Non'}
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Deliberations</div>
                <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                    {pendingDeliberations.length}
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Validation</div>
                <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                    {panel.validated_at ? 'Effectuee' : 'En attente'}
                </div>
            </div>
        </div>
    );
}

interface JuryConfigurationPanelProps {
    evenementId: number;
    criteria: Array<{ id?: number; nom: string; description: string; bareme: string; coefficient: string; ordre: string; actif: boolean }>;
    setCriteria: Dispatch<SetStateAction<Array<{ id?: number; nom: string; description: string; bareme: string; coefficient: string; ordre: string; actif: boolean }>>>;
    admissionAverage: string;
    setAdmissionAverage: Dispatch<SetStateAction<string>>;
    seatsCount: string;
    setSeatsCount: Dispatch<SetStateAction<string>>;
    rankingMode: string;
    setRankingMode: Dispatch<SetStateAction<string>>;
    tieBreakRule: string;
    setTieBreakRule: Dispatch<SetStateAction<string>>;
    busyAction: string | null;
    handleSaveConfiguration: () => void;
}

export function JuryConfigurationPanel({
    evenementId,
    criteria,
    setCriteria,
    admissionAverage,
    setAdmissionAverage,
    seatsCount,
    setSeatsCount,
    rankingMode,
    setRankingMode,
    tieBreakRule,
    setTieBreakRule,
    busyAction,
    handleSaveConfiguration,
}: JuryConfigurationPanelProps) {
    return (
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
                    {busyAction === `/evenements/${evenementId}/jury/configurer`
                        ? <LoaderCircle className="size-4 animate-spin" />
                        : <CheckCheck className="size-4" />}
                    Enregistrer la configuration
                </Button>
            </div>
        </div>
    );
}