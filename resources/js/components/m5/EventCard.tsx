import { Link, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import { CalendarIcon, LockIcon, MapPinIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventBadge } from './EventBadge';
import type { EventSummary } from '@/types/evenements';

type EventCardProps = {
    event: EventSummary;
    currentUserRole?: string;
    isRegistered?: boolean;
    onRegister?: (eventId: number) => void;
};

export default function EventCard({ event, isRegistered, onRegister }: EventCardProps) {
    const fillPercent = event.capacite_max 
        ? Math.min((event.participants_count / event.capacite_max) * 100, 100) 
        : 0;
    const isFull = event.capacite_max ? event.participants_count >= event.capacite_max : false;
    const isNew = dayjs().diff(dayjs(event.submitted_at || event.date_debut), 'hour') < 48;

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't trigger if clicking a button
        if ((e.target as HTMLElement).closest('button')) return;
        router.visit(`/m5/events/${event.id}`);
    };

    return (
        <div 
            onClick={handleCardClick}
            className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 dark:bg-slate-950 dark:border-slate-800"
        >
            {/* Bandeau type */}
            <div className={`h-1.5 w-full ${event.type === 'conference' ? 'bg-indigo-600' : 'bg-purple-600'}`} />
            
            {/* Zone affiche */}
            <div className="relative h-44 bg-gradient-to-br from-indigo-50 to-sky-100 dark:from-slate-900 dark:to-slate-800">
                {event.cover_url ? (
                    <img src={event.cover_url} alt={event.titre} className="w-full h-full object-cover" />
                ) : (
                    <div className={`w-full h-full flex items-center justify-center opacity-40 bg-gradient-to-br ${
                        event.type === 'conference' ? 'from-indigo-500 to-sky-500' : 'from-purple-500 to-pink-500'
                    }`} />
                )}
                
                {/* Badges overlay */}
                <div className="absolute top-2 left-2 flex gap-1">
                    <EventBadge statut={event.statut} size="sm" />
                    {isNew && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Nouveau
                        </span>
                    )}
                </div>
                
                {event.visibilite === 'restreint' && (
                    <div className="absolute top-2 right-2 bg-white/80 p-1 rounded-full backdrop-blur-sm dark:bg-black/40">
                        <LockIcon className="text-gray-500 h-3.5 w-3.5" />
                    </div>
                )}
            </div>

            {/* Corps de la carte */}
            <div className="p-4 space-y-3">
                <h3 className="font-bold text-gray-900 text-sm line-clamp-2 min-h-[2.5rem] dark:text-white">
                    {event.titre}
                </h3>
                
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                        <CalendarIcon className="h-3.5 w-3.5 text-indigo-500" />
                        <span>{dayjs(event.date_debut).format('DD MMM YYYY')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                        <MapPinIcon className="h-3.5 w-3.5 text-rose-500" />
                        <span className="truncate">{event.lieu || 'Lieu à définir'}</span>
                    </div>
                </div>

                {/* Barre de remplissage */}
                {event.capacite_max && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-medium text-gray-400 uppercase tracking-tight">
                            <span>{event.participants_count}/{event.capacite_max} inscrits</span>
                            <span>{Math.round(fillPercent)}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden dark:bg-slate-800">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                    fillPercent >= 100 ? 'bg-rose-500' : fillPercent > 75 ? 'bg-amber-400' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${fillPercent}%` }} 
                            />
                        </div>
                    </div>
                )}

                {/* Bouton action */}
                <div className="pt-1">
                    <ActionButton 
                        event={event} 
                        isRegistered={isRegistered} 
                        isFull={isFull} 
                        onRegister={() => onRegister?.(event.id)} 
                    />
                </div>
            </div>
        </div>
    );
}

function ActionButton({ event, isRegistered, isFull, onRegister }: { 
    event: EventSummary, 
    isRegistered?: boolean, 
    isFull: boolean, 
    onRegister: () => void 
}) {
    if (isRegistered) {
        return (
            <Button variant="outline" className="w-full text-xs h-8 border-gray-300 text-gray-500 cursor-default hover:bg-transparent">
                Inscrit(e)
            </Button>
        );
    }

    if (isFull) {
        return (
            <Button 
                onClick={(e) => { e.stopPropagation(); onRegister(); }}
                className="w-full text-xs h-8 bg-amber-500 hover:bg-amber-600 text-white border-0"
            >
                Liste d'attente
            </Button>
        );
    }

    // Default registration button
    return (
        <Button 
            onClick={(e) => { e.stopPropagation(); onRegister(); }}
            className="w-full text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
        >
            S'inscrire
        </Button>
    );
}
