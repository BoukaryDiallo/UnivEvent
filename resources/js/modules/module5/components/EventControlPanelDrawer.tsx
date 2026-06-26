import { Link } from '@inertiajs/react';
import { CalendarDays, ChartBar, ClipboardList, Gavel, Layers, MessageCircle, ShieldCheck, Trophy } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { EventBadge } from '@/modules/module5/components/EventBadge';
import { participantShow, show } from '@/routes/module5';
import type { EventSummary } from '@/types';

type EventControlPanelDrawerProps = {
    events: EventSummary[];
    userRoles?: string[];
    userPermissions?: {
        canManage: boolean;
        canManageMessages: boolean;
        canJuryMember: boolean;
        canPresident: boolean;
    };
};

const roleLabels: Record<string, string> = {
    organisateur: 'Organisateur',
    jury: 'Jury',
    intervenant: 'Intervenant',
    participant: 'Participant',
};

export function EventControlPanelDrawer({ events, userRoles = [] }: EventControlPanelDrawerProps) {
    const [selectedEvent, setSelectedEvent] = useState<EventSummary | null>(null);
    const [open, setOpen] = useState(false);

    const openPanel = (event: EventSummary) => {
        setSelectedEvent(event);
        setOpen(true);
    };

    const closePanel = () => {
        setOpen(false);
        setSelectedEvent(null);
    };

    const renderRoleCard = (label: string, description: string, icon: ReactNode) => (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                {icon}
                <div>
                    <div className="text-sm font-semibold">{label}</div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
                </div>
            </div>
        </div>
    );

    const effectiveRoles = selectedEvent ? (userRoles.length ? userRoles : selectedEvent.roles) : [];

    return (
        <div className="space-y-4">
            <div className="rounded-4xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-black/20">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-sky-600 dark:text-sky-300">Mes événements actifs</p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Panneau de contrôle centralisé</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                            Ouvrez un événement et accédez à ses raccourcis de pilotage selon votre rôle.
                        </p>
                    </div>
                    <Button type="button" onClick={() => events[0] && openPanel(events[0])} disabled={!events.length}>
                        Ouvrir le dernier événement
                    </Button>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {events.slice(0, 6).map((event) => (
                        <div key={`panel-${event.id}`} className="group rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-sky-300 hover:bg-sky-50 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-sky-600 dark:hover:bg-slate-900/95">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{event.titre}</span>
                                        <EventBadge type={event.type} />
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{event.lieu ?? 'Lieu non défini'}</p>
                                </div>
                                <Button type="button" size="sm" variant="outline" onClick={() => openPanel(event)}>
                                    Ouvrir
                                </Button>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <span>{new Date(event.date_debut).toLocaleDateString()}</span>
                                <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">{event.participants_count} participants</span>
                                <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">{event.comments_count} commentaires</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Sheet open={open} onOpenChange={(isOpen) => (isOpen ? setOpen(true) : closePanel())}>
                <SheetContent side="right" className="w-full max-w-2xl">
                    <SheetHeader>
                        <SheetTitle>Tableau de bord de l'événement</SheetTitle>
                        {selectedEvent ? <p className="text-sm text-slate-500 dark:text-slate-400">{selectedEvent.titre}</p> : null}
                    </SheetHeader>

                    <div className="space-y-6 overflow-y-auto p-4">
                        {selectedEvent ? (
                            <>
                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/80">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <div className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300">
                                                <CalendarDays className="size-4" />
                                                {new Date(selectedEvent.date_debut).toLocaleDateString()} · {selectedEvent.statut}
                                            </div>
                                            <h3 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{selectedEvent.titre}</h3>
                                            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{selectedEvent.public_cible}</p>
                                        </div>
                                        <div className="flex flex-col gap-2 text-right">
                                            <EventBadge type={selectedEvent.type} />
                                            <EventBadge status={selectedEvent.statut} />
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                        {effectiveRoles.includes('organisateur') && renderRoleCard('Organisateur', 'Supervisez la programmation, les inscriptions et les résultats.', <ClipboardList className="size-5 text-sky-600" />)}
                                        {effectiveRoles.includes('jury') && renderRoleCard('Jury', 'Accédez aux notations, délibérations et résultats finaux.', <Gavel className="size-5 text-amber-600" />)}
                                        {effectiveRoles.includes('intervenant') && renderRoleCard('Intervenant', 'Gérez votre intervention, vos supports et l’ordre du jour.', <Layers className="size-5 text-violet-600" />)}
                                        {effectiveRoles.includes('participant') && renderRoleCard('Participant', 'Consultez votre participation, l’accès et le contenu associé.', <ShieldCheck className="size-5 text-emerald-600" />)}
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/80">
                                        <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                                            <ChartBar className="size-5" />
                                            <div>
                                                <p className="text-sm font-semibold">Vue synthèse</p>
                                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Participants, activité et état global accessibles en un coup d’œil.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/80">
                                        <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                                            <MessageCircle className="size-5" />
                                            <div>
                                                <p className="text-sm font-semibold">Actions rapides</p>
                                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Ouvrez directement la page publique ou l’espace participant selon le contexte.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/80">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Rôle actif</p>
                                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{effectiveRoles.map((role) => roleLabels[role] ?? role).join(' / ')}</p>
                                        </div>
                                        <Trophy className="size-5 text-yellow-500" />
                                    </div>
                                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                        <Button asChild variant="outline" className="w-full">
                                            <Link href={effectiveRoles.includes('participant') ? participantShow(selectedEvent.id) : show(selectedEvent.id)}>Accéder au tableau de bord</Link>
                                        </Button>
                                        <Button asChild className="w-full">
                                            <Link href={show(selectedEvent.id)}>Voir l'événement</Link>
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-700 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300">
                                Sélectionnez un événement pour afficher ses accès rapides.
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
