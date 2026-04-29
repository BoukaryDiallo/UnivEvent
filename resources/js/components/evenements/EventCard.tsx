import { Link, router } from '@inertiajs/react';
import { CalendarDays, Clock3, Heart, MapPin, MessageSquare, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { show } from '@/routes/evenements';
import { store as joinEvent } from '@/routes/inscriptions';
import type { EventSummary } from '@/types';
import { EventBadge } from './EventBadge';
import { UserAvatar } from './UserAvatar';

type EventCardProps = {
    evenement: EventSummary;
    onJoinSuccess?: (message: string) => void;
    compact?: boolean;
};

function formatRange(start: string, end: string | null) {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;

    return `${startDate.toLocaleDateString()}${endDate ? ` - ${endDate.toLocaleDateString()}` : ''}`;
}

function formatTime(start: string, end: string | null) {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;

    return `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${endDate ? ` - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}`;
}

function extractFirstImage(value: string | null) {
    if (!value) {
        return null;
    }

    const match = value.match(/<img[^>]+src=["']([^"']+)["']/i);

    return match?.[1] ?? null;
}

function stripHtml(value: string | null) {
    if (!value) {
        return null;
    }

    return value
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<\/p>/gi, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function EventCard({ evenement, onJoinSuccess, compact = false }: EventCardProps) {
    const visualUrl = evenement.cover_url || extractFirstImage(evenement.description);
    const cleanDescription = stripHtml(evenement.description);

    return (
        <Card className={cn('group h-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 py-0 shadow-lg shadow-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-black/20', compact ? 'min-w-[18rem] max-w-[20rem] snap-start' : '')}>
            <div className={cn('relative overflow-hidden bg-slate-100 dark:bg-slate-900', compact ? 'aspect-[16/9]' : 'aspect-[16/10]')}>
                {visualUrl ? (
                    <>
                        <img src={visualUrl} alt={evenement.titre} className="size-full object-cover transition duration-500 group-hover:scale-[1.02]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                    </>
                ) : (
                    <div className="flex size-full items-center justify-center bg-gradient-to-br from-sky-100 via-cyan-50 to-white text-slate-500 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 dark:text-slate-300">
                        <CalendarDays className="size-14" />
                    </div>
                )}
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                    <EventBadge type={evenement.type} />
                    {evenement.participation ? <EventBadge participation={evenement.participation.statut} /> : null}
                </div>
            </div>
            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-3">
                    <UserAvatar name={evenement.createur.name} className="size-11" />
                    <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-900 dark:text-white">
                            {evenement.createur.name || 'Organisateur'}
                        </div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                            {evenement.createur.role || 'Porteur du projet'}
                        </div>
                    </div>
                </div>
                <div className="mt-4 space-y-2">
                    <h3 className="line-clamp-2 text-xl font-semibold text-slate-950 dark:text-white">
                        {evenement.titre}
                    </h3>
                    <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {cleanDescription || 'Aucune description disponible pour le moment.'}
                    </p>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <div className="inline-flex items-center gap-2">
                        <CalendarDays className="size-4" />
                        {formatRange(evenement.date_debut, evenement.date_fin)}
                    </div>
                    <div className="inline-flex items-center gap-2">
                        <Clock3 className="size-4" />
                        {formatTime(evenement.date_debut, evenement.date_fin)}
                    </div>
                    <div className="inline-flex items-center gap-2">
                        <MapPin className="size-4" />
                        {evenement.lieu || 'Lieu a confirmer'}
                    </div>
                    <div className="inline-flex items-center gap-2">
                        <Users className="size-4" />
                        {evenement.participants_count} participant{evenement.participants_count > 1 ? 's' : ''}
                    </div>
                    <div className="inline-flex items-center gap-4 text-xs">
                        <span className="inline-flex items-center gap-1.5">
                            <Heart className="size-3.5" />
                            {evenement.activity_count}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <MessageSquare className="size-3.5" />
                            {evenement.comments_count}
                        </span>
                    </div>
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <div className="line-clamp-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                        {evenement.roles.length ? evenement.roles.join(' / ') : 'Acces libre'}
                    </div>
                    <div className="flex items-center gap-2">
                        {evenement.can_join && !evenement.participation ? (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        router.post(joinEvent(), { evenement_id: evenement.id, mode: 'interesse' }, {
                                            preserveScroll: true,
                                            onSuccess: () => onJoinSuccess?.('Interet enregistre.'),
                                        });
                                    }}
                                >
                                    Liker
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        router.post(joinEvent(), { evenement_id: evenement.id, mode: 'participe' }, {
                                            preserveScroll: true,
                                            onSuccess: () => onJoinSuccess?.('Participation enregistree.'),
                                        });
                                    }}
                                >
                                    Je participe
                                </Button>
                            </>
                        ) : null}
                        <Button asChild>
                            <Link href={show(evenement.id)}>Voir</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
