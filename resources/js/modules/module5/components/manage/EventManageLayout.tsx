import type { ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftRight, ExternalLink } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { EventCompletionSummary, EventSummary, EventWorkflowState } from '@/modules/module5/types/event';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CompletionProgress } from './CompletionProgress';

type EventManageLayoutProps = {
    evenement: EventSummary;
    workflowState: EventWorkflowState;
    completion: EventCompletionSummary;
    breadcrumbs: BreadcrumbItem[];
    actions?: ReactNode;
    suggestions?: string[];
    children: ReactNode;
};

const workflowLabels: Record<EventWorkflowState, string> = {
    draft: 'Brouillon',
    pending: 'En validation',
    published: 'Publié',
    rejected: 'Refusé',
};

export function EventManageLayout({
    evenement,
    workflowState,
    completion,
    breadcrumbs,
    actions,
    suggestions = [],
    children,
}: EventManageLayoutProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Gestion - ${evenement.titre}`} />
            <div className="space-y-6 p-4 md:p-6">
                <div className="rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f8fafc_55%,#e2e8f0_100%)] p-6 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant="secondary">{evenement.type === 'concours' ? 'Concours' : 'Conference'}</Badge>
                                <Badge>{workflowLabels[workflowState]}</Badge>
                                <Badge variant="outline">{evenement.statut}</Badge>
                            </div>
                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{evenement.titre}</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                    Creation express d’abord, configuration ensuite. Cette page est votre console de progression.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Button asChild variant="outline">
                                    <Link href={`/module5/events/${evenement.id}`}>
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Voir la fiche publique
                                    </Link>
                                </Button>
                                <Button asChild variant="ghost">
                                    <Link href="/module5/events">
                                        <ArrowLeftRight className="mr-2 h-4 w-4" />
                                        Retour gestion
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="w-full max-w-xl space-y-4">
                            <CompletionProgress completion={completion} />
                            {suggestions.length > 0 ? (
                                <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
                                    {suggestions.join(' • ')}
                                </div>
                            ) : null}
                            {actions}
                        </div>
                    </div>
                </div>
                {children}
            </div>
        </AppLayout>
    );
}

