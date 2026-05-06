import { cn } from '@/lib/utils';

export type EventTabKey = 'overview' | 'program' | 'participants' | 'actors' | 'media' | 'chat' | 'results';

type EventTabsProps = {
    activeTab: EventTabKey;
    onChange: (tab: EventTabKey) => void;
    showResults?: boolean;
    showActors?: boolean;
};

const tabs: Array<{ key: EventTabKey; label: string }> = [
    { key: 'overview', label: 'Apercu' },
    { key: 'program', label: 'Programme' },
    { key: 'participants', label: 'Participants' },
    { key: 'actors', label: 'Acteurs' },
    { key: 'media', label: 'Medias' },
    { key: 'chat', label: 'Messagerie' },
    { key: 'results', label: 'Resultats' },
];

export function EventTabs({ activeTab, onChange, showResults = false, showActors = false }: EventTabsProps) {
    return (
        <div className="overflow-x-auto">
            <div className="inline-flex min-w-full gap-2 rounded-2xl border border-white/60 bg-white/80 p-2 shadow-sm shadow-slate-200/70 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 dark:shadow-black/20">
                {tabs.filter((tab) => (showResults || tab.key !== 'results') && (showActors || tab.key !== 'actors')).map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onChange(tab.key)}
                        className={cn(
                            'rounded-xl px-4 py-2 text-sm font-medium transition',
                            activeTab === tab.key
                                ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900',
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
