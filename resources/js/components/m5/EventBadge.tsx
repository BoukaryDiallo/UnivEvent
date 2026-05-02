import { cn } from '@/lib/utils';

type StatutType = 'brouillon' | 'en_attente' | 'publie' | 'annule' | 'cloture' | 'archive' | string;

type EventBadgeProps = {
    statut: StatutType;
    size?: 'sm' | 'md' | 'lg';
};

const statusStyles: Record<string, { label: string; className: string; dotColor: string }> = {
    brouillon: { 
        label: 'Brouillon', 
        className: 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400',
        dotColor: 'bg-gray-400'
    },
    en_attente: { 
        label: 'En validation', 
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        dotColor: 'bg-amber-500'
    },
    publie: { 
        label: 'Publié', 
        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        dotColor: 'bg-emerald-500'
    },
    annule: { 
        label: 'Annulé', 
        className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        dotColor: 'bg-rose-500'
    },
    cloture: { 
        label: 'Clôturé', 
        className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
        dotColor: 'bg-sky-500'
    },
    archive: { 
        label: 'Archivé', 
        className: 'bg-gray-200 text-gray-500 dark:bg-slate-800 dark:text-slate-500',
        dotColor: 'bg-gray-400'
    },
};

export function EventBadge({ statut, size = 'md' }: EventBadgeProps) {
    const style = statusStyles[statut] || { 
        label: statut, 
        className: 'bg-gray-100 text-gray-600',
        dotColor: 'bg-gray-400'
    };

    const sizeStyles = {
        sm: 'text-[10px] px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
        lg: 'text-sm px-4 py-1.5',
    };

    const dotSizes = {
        sm: 'h-1 w-1',
        md: 'h-1.5 w-1.5',
        lg: 'h-2 w-2',
    };

    return (
        <span className={cn(
            'inline-flex items-center font-bold rounded-full tracking-wide transition-colors',
            style.className,
            sizeStyles[size]
        )}>
            <span className={cn('mr-1.5 rounded-full', style.dotColor, dotSizes[size])} />
            {style.label}
        </span>
    );
}
