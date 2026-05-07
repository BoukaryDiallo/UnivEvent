import { CalendarDays, Trophy, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EventStatus, EventType, ParticipationStatus } from '@/types';

type EventBadgeProps = {
    type?: EventType;
    status?: EventStatus;
    participation?: ParticipationStatus | null;
    className?: string;
};

const participationMap: Record<ParticipationStatus, { label: string; className: string }> = {
    interesse: { label: 'Interesse', className: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200' },
    participe: { label: 'Je participe', className: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200' },
    refuse: { label: 'Refuse', className: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200' },
};

export function EventBadge({ type, status, participation, className }: EventBadgeProps) {
    if (participation) {
        return (
            <Badge variant="outline" className={cn('gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]', participationMap[participation].className, className)}>
                <Users className="size-3.5" />
                {participationMap[participation].label}
            </Badge>
        );
    }

    if (type) {
        return (
            <Badge
                variant="outline"
                className={cn(
                    'gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]',
                    type === 'conference'
                        ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-200'
                        : 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-900/70 dark:bg-fuchsia-950/40 dark:text-fuchsia-200',
                    className,
                )}
            >
                {type === 'conference' ? <CalendarDays className="size-3.5" /> : <Trophy className="size-3.5" />}
                {type === 'conference' ? 'Conference' : 'Concours'}
            </Badge>
        );
    }

    return (
        <Badge
            variant="outline"
            className={cn(
                'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]',
                status === 'publie'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : status === 'en_cours'
                      ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-200'
                      : status === 'archive'
                        ? 'border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'
                    : status === 'cloture'
                      ? 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
                      : 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/70 dark:bg-orange-950/40 dark:text-orange-200',
                className,
            )}
        >
            {status}
        </Badge>
    );
}
