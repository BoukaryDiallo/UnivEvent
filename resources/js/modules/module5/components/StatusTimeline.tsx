import { cn } from '@/lib/utils';
import { CheckIcon, CircleIcon } from 'lucide-react';

type TimelineStep = {
    label: string;
    date: string;
    statut: string;
    description?: string;
    icon?: React.ReactNode;
};

type StatusTimelineProps = {
    steps: TimelineStep[];
    currentStep: number;
};

export default function StatusTimeline({ steps, currentStep }: StatusTimelineProps) {
    return (
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent dark:before:via-slate-800">
            {steps.map((step, index) => {
                const isPast = index < currentStep;
                const isCurrent = index === currentStep;
                
                return (
                    <div key={index} className="relative flex items-center group">
                        {/* Dot / Icon */}
                        <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-full border-4 z-10 transition-all duration-300",
                            isPast 
                                ? "bg-emerald-500 border-emerald-100 dark:border-emerald-900/30" 
                                : isCurrent 
                                    ? "bg-white border-indigo-600 dark:bg-slate-950 animate-pulse-slow" 
                                    : "bg-white border-gray-100 dark:bg-slate-950 dark:border-slate-800"
                        )}>
                            {isPast ? (
                                <CheckIcon className="h-5 w-5 text-white" />
                            ) : isCurrent ? (
                                <div className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                            ) : (
                                <CircleIcon className="h-4 w-4 text-gray-200 dark:text-slate-800" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 ml-6 pb-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <h4 className={cn(
                                    "font-bold text-sm uppercase tracking-wider transition-colors",
                                    isPast ? "text-emerald-600" : isCurrent ? "text-indigo-600" : "text-gray-400"
                                )}>
                                    {step.label}
                                </h4>
                                <time className="text-[10px] font-mono text-gray-400 dark:text-slate-500">
                                    {step.date}
                                </time>
                            </div>
                            {step.description && (
                                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400 line-clamp-2">
                                    {step.description}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
