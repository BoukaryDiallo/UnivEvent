import { CalendarPlus2, CheckCheck, ClipboardList, MessageSquareText, Sparkles, ThumbsUp, Trophy } from 'lucide-react';
import type { EventActivity } from '@/types';

type EventActivityTimelineProps = {
    activities: EventActivity[];
};

const iconMap: Record<string, typeof CalendarPlus2> = {
    creation: CalendarPlus2,
    publication: Sparkles,
    inscription: CheckCheck,
    inscription_validee: CheckCheck,
    inscription_refusee: CheckCheck,
    desinscription: CheckCheck,
    programme_ajoute: ClipboardList,
    resultat_publie: Trophy,
    commentaire_ajoute: MessageSquareText,
    reaction_ajoutee: ThumbsUp,
    mise_a_jour: Sparkles,
};

export function EventActivityTimeline({ activities }: EventActivityTimelineProps) {
    if (!activities.length) {
        return (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                Aucune activite sociale pour le moment.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {activities.map((activity, index) => {
                const Icon = iconMap[activity.type] ?? Sparkles;

                return (
                    <div key={activity.id} className="relative rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                        {index !== activities.length - 1 ? <div className="absolute left-10 top-14 h-[calc(100%-1rem)] w-px bg-slate-200 dark:bg-slate-800" /> : null}
                        <div className="flex gap-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white">
                                <Icon className="size-4" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="font-semibold text-slate-950 dark:text-white">{activity.label}</div>
                                    <span className="text-xs text-slate-400">
                                        {activity.created_at ? new Date(activity.created_at).toLocaleString() : ''}
                                    </span>
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {activity.user.name ? `${activity.user.name} · ` : ''}
                                    {activity.description || 'Mise a jour de l evenement.'}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
