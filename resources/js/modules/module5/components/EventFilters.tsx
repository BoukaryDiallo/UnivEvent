import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { EventFilterState } from '@/types';

type EventFiltersProps = {
    filters: EventFilterState;
    onChange: (filters: EventFilterState) => void;
};

const scopes: Array<{ value: EventFilterState['scope']; label: string }> = [
    { value: 'upcoming', label: 'A venir' },
    { value: 'ongoing', label: 'En cours' },
    { value: 'past', label: 'Passes' },
];

const types: Array<{ value: EventFilterState['type']; label: string }> = [
    { value: 'all', label: 'Tous' },
    { value: 'conference', label: 'Conferences' },
    { value: 'concours', label: 'Concours' },
];

const statuses: Array<{ value: NonNullable<EventFilterState['statut']>; label: string }> = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'brouillon', label: 'Brouillons' },
    { value: 'publie', label: 'Publies' },
    { value: 'cloture', label: 'Clotures' },
];

const dates: Array<{ value: NonNullable<EventFilterState['date']>; label: string }> = [
    { value: 'all', label: 'Toutes les dates' },
    { value: 'today', label: 'Aujourd hui' },
    { value: 'week', label: '7 jours' },
    { value: 'month', label: '30 jours' },
];

export function EventFilters({ filters, onChange }: EventFiltersProps) {
    return (
        <div className="space-y-4 rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-lg shadow-slate-200/70 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/70 dark:shadow-black/20">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                    value={filters.search}
                    onChange={(event) => onChange({ ...filters, search: event.target.value })}
                    placeholder="Rechercher par titre, lieu ou type d evenement..."
                    className="h-12 rounded-2xl border-white/80 bg-white pl-11 dark:border-slate-800 dark:bg-slate-950"
                    aria-label="Rechercher des evenements"
                />
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                    {scopes.map((scope) => (
                        <button
                            key={scope.value}
                            type="button"
                            onClick={() => onChange({ ...filters, scope: scope.value })}
                            className={cn(
                                'rounded-full px-4 py-2 text-sm font-medium transition',
                                filters.scope === scope.value
                                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
                            )}
                        >
                            {scope.label}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2">
                    {types.map((type) => (
                        <button
                            key={type.value}
                            type="button"
                            onClick={() => onChange({ ...filters, type: type.value })}
                            className={cn(
                                'rounded-full border px-4 py-2 text-sm font-medium transition',
                                filters.type === type.value
                                    ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-200'
                                    : 'border-slate-200 bg-transparent text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700',
                            )}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                        <button
                            key={status.value}
                            type="button"
                            onClick={() => onChange({ ...filters, statut: status.value })}
                            className={cn(
                                'rounded-full border px-4 py-2 text-sm font-medium transition',
                                (filters.statut ?? 'all') === status.value
                                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/70 dark:bg-indigo-950/40 dark:text-indigo-200'
                                    : 'border-slate-200 bg-transparent text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700',
                            )}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2">
                    {dates.map((date) => (
                        <button
                            key={date.value}
                            type="button"
                            onClick={() => onChange({ ...filters, date: date.value })}
                            className={cn(
                                'rounded-full border px-4 py-2 text-sm font-medium transition',
                                (filters.date ?? 'all') === date.value
                                    ? 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900/70 dark:bg-cyan-950/40 dark:text-cyan-200'
                                    : 'border-slate-200 bg-transparent text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700',
                            )}
                        >
                            {date.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
