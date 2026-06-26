import { Link } from '@inertiajs/react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { EventSummary } from '@/types';

interface EventBadgeCarouselProps {
    events: EventSummary[];
    onJoinSuccess?: (message: string) => void;
}

export function EventBadgeCarousel({ events, onJoinSuccess }: EventBadgeCarouselProps) {
    if (!events.length) {
        return (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                Aucun événement disponible pour le moment.
            </div>
        );
    }

    return (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {events.map((event) => (
                <EventBadge key={event.id} event={event} onJoinSuccess={onJoinSuccess} />
            ))}
        </div>
    );
}

interface EventBadgeProps {
    event: EventSummary;
    onJoinSuccess?: (message: string) => void;
}

function EventBadge({ event, onJoinSuccess }: EventBadgeProps) {
    const canJoin = event.can_join && !event.participation;
    const canView = true; // Tous les événements peuvent être vus en détail

    return (
        <div className="flex-shrink-0 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow dark:border-slate-700 dark:bg-slate-800">
            <div className="space-y-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2">
                            {event.titre}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <Calendar className="size-3" />
                            {new Date(event.date_debut).toLocaleDateString('fr-FR')}
                            {event.lieu && (
                                <>
                                    <span>•</span>
                                    <MapPin className="size-3" />
                                    {event.lieu}
                                </>
                            )}
                        </div>
                    </div>
                    <Badge variant={event.type === 'conference' ? 'default' : 'secondary'} className="text-xs">
                        {event.type === 'conference' ? 'Conférence' : 'Concours'}
                    </Badge>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                    {event.description || 'Découvrez cet événement...'}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Users className="size-3" />
                        {event.participants_count} participant{event.participants_count !== 1 ? 's' : ''}
                    </div>

                    <div className="flex gap-2">
                        {canView && (
                            <Button asChild size="sm" variant="outline">
                                <Link href={`/module5/events/${event.id}`}>Voir</Link>
                            </Button>
                        )}
                        {canJoin && (
                            <Button asChild size="sm">
                                <Link href={`/module5/events/${event.id}`}>S'inscrire</Link>
                            </Button>
                        )}
                        {event.participation && (
                            <Badge variant="outline" className="text-xs">
                                {event.participation.statut === 'participe' ? 'Inscrit' : 'En attente'}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
