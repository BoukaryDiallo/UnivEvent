import { Progress } from '@/components/ui/progress';
import type { EventCompletionSummary } from '@/types/evenements';

type CompletionProgressProps = {
    completion: EventCompletionSummary;
};

export function CompletionProgress({ completion }: CompletionProgressProps) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">Complétude</p>
                    <p className="text-3xl font-semibold text-slate-950">{completion.percentage}%</p>
                </div>
                <p className="max-w-xs text-right text-sm text-slate-500">
                    Chaque section reste editable librement. La validation finale controle seulement le minimum requis.
                </p>
            </div>
            <Progress value={completion.percentage} className="mt-4 h-3 bg-slate-100" />
            <div className="mt-4 grid gap-2 md:grid-cols-2">
                {completion.sections.map((section) => (
                    <div key={section.key} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                        <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-slate-700">{section.label}</span>
                            <span className="text-slate-500">{section.percentage}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
