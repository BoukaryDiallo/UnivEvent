import { router } from '@inertiajs/react';
import { Check, Mail, ShieldCheck, UserX2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { refuser, valider } from '@/routes/inscriptions';
import type { BackendParticipationStatus, EventParticipant, ParticipationStatus } from '@/types';
import { UserAvatar } from './UserAvatar';

type ParticipantsListProps = {
    participants: EventParticipant[];
    canManage?: boolean;
    onToast?: (message: string) => void;
};

const badgeMap: Record<ParticipationStatus | BackendParticipationStatus, string> = {
    interesse: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-200',
    participe: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200',
    refuse: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-200',
    en_attente: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-200',
    accepte: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200',
};

export function ParticipantsList({ participants, canManage = false, onToast }: ParticipantsListProps) {
    const [search, setSearch] = useState('');
    const filteredParticipants = useMemo(
        () =>
            participants.filter((participant) => {
                const haystack = `${participant.user.name ?? ''} ${participant.user.email ?? ''} ${participant.user.role ?? ''}`.toLowerCase();

                return haystack.includes(search.trim().toLowerCase());
            }),
        [participants, search],
    );

    if (!participants.length) {
        return (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                Aucun participant pour le moment.
            </div>
        );
    }

    const updateStatus = (id: number, action: 'accept' | 'reject') => {
        router.patch(action === 'accept' ? valider(id) : refuser(id), undefined, {
            preserveScroll: true,
            onSuccess: () => onToast?.(action === 'accept' ? 'Participant accepte.' : 'Participant refuse.'),
        });
    };

    return (
        <div className="space-y-3">
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un participant, un email, un role..." />
            </div>
            {filteredParticipants.map((participant) => (
                <div
                    key={participant.id}
                    className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex items-center gap-3">
                        <UserAvatar name={participant.user.name} />
                        <div className="space-y-1">
                            <div className="font-medium text-slate-900 dark:text-white">{participant.user.name || 'Participant'}</div>
                            <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                                {participant.user.email ? (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Mail className="size-3.5" />
                                        {participant.user.email}
                                    </span>
                                ) : null}
                                {participant.user.role ? (
                                    <span className="inline-flex items-center gap-1.5 capitalize">
                                        <ShieldCheck className="size-3.5" />
                                        {participant.user.role}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={cn('rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]', badgeMap[participant.statut])}>
                            {participant.statut === 'interesse' || participant.statut === 'en_attente'
                                ? 'Interesse'
                                : participant.statut === 'participe' || participant.statut === 'accepte'
                                  ? 'Je participe'
                                  : 'Refuse'}
                        </span>
                        {canManage ? (
                            <>
                                <Button type="button" size="sm" variant="outline" onClick={() => updateStatus(participant.id, 'accept')}>
                                    <Check className="size-4" />
                                    Accepter
                                </Button>
                                <Button type="button" size="sm" variant="outline" onClick={() => updateStatus(participant.id, 'reject')}>
                                    <UserX2 className="size-4" />
                                    Refuser
                                </Button>
                            </>
                        ) : null}
                    </div>
                </div>
            ))}
            {!filteredParticipants.length ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                    Aucun participant ne correspond a la recherche.
                </div>
            ) : null}
        </div>
    );
}
