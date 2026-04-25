import { ChevronDown, Clock3, MapPin, Mic2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { EventProgramme } from '@/types';

type EventTimelineProps = {
    programmes: EventProgramme[];
};

export function EventTimeline({ programmes }: EventTimelineProps) {
    if (!programmes.length) {
        return (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                Aucun programme n'a encore ete publie.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {programmes.map((programme, index) => (
                <div key={programme.id} className="relative rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
                    <div className="absolute left-6 top-6 hidden h-[calc(100%-1.5rem)] w-px bg-slate-200 dark:bg-slate-800 sm:block" />
                    <div className="relative flex gap-4">
                        <div className="hidden sm:flex">
                            <div className={cn('mt-1 flex size-10 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold text-white', index < 3 ? 'bg-gradient-to-br from-cyan-500 to-sky-500' : 'bg-gradient-to-br from-slate-500 to-slate-700')}>
                                {String(index + 1).padStart(2, '0')}
                            </div>
                        </div>
                        <Collapsible defaultOpen className="w-full">
                            <CollapsibleTrigger className="flex w-full items-start justify-between gap-4 text-left">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                                            {programme.type_section || 'Session'}
                                        </span>
                                        {programme.date_programme ? (
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {programme.date_programme}
                                            </span>
                                        ) : null}
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                        {programme.titre}
                                    </h3>
                                    <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                                        {(programme.heure_debut || programme.heure_fin) ? (
                                            <span className="inline-flex items-center gap-1.5">
                                                <Clock3 className="size-4" />
                                                {programme.heure_debut || '--:--'} - {programme.heure_fin || '--:--'}
                                            </span>
                                        ) : null}
                                        {programme.intervenant ? (
                                            <span className="inline-flex items-center gap-1.5">
                                                <Mic2 className="size-4" />
                                                {programme.intervenant}
                                            </span>
                                        ) : null}
                                        {programme.salle ? (
                                            <span className="inline-flex items-center gap-1.5">
                                                <MapPin className="size-4" />
                                                {programme.salle}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                                <ChevronDown className="mt-1 size-5 text-slate-400 transition data-[state=open]:rotate-180" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-4 text-sm leading-6 text-slate-600 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down dark:text-slate-300">
                                {programme.description || 'Aucun detail supplementaire pour cette session.'}
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                </div>
            ))}
        </div>
    );
}
