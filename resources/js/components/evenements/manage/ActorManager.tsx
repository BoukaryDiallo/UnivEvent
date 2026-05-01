import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { EventAssignableUser, EventTeamMember } from '@/types/evenements';

type ActorManagerProps = {
    eventId: number;
    role: 'organisateur' | 'jury' | 'intervenant' | 'participant';
    title: string;
    members: EventTeamMember[];
    assignableUsers: EventAssignableUser[];
};

export function ActorManager({ eventId, role, title, members, assignableUsers }: ActorManagerProps) {
    const [userId, setUserId] = useState<string>('');
    const [search, setSearch] = useState('');
    const availableUsers = useMemo(
        () =>
            assignableUsers.filter((user) => {
                if (members.some((member) => member.user_id === user.id)) {
                    return false;
                }

                const haystack = `${user.name ?? ''} ${user.email ?? ''} ${user.role ?? ''}`.toLowerCase();
                return haystack.includes(search.trim().toLowerCase());
            }),
        [assignableUsers, members, search],
    );

    function addMember() {
        if (!userId) return;

        router.post(
            `/evenements/${eventId}/assign-user`,
            { user_id: Number(userId), role },
            {
                preserveScroll: true,
                onSuccess: () => router.reload({ only: ['evenement'] }),
            },
        );
    }

    return (
        <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium text-slate-800">{title}</h3>
                <span className="text-sm text-slate-500">{members.length}</span>
            </div>
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Rechercher dans ${title.toLowerCase()}...`} />
            <div className="flex flex-col gap-3 md:flex-row">
                <Select value={userId} onValueChange={setUserId}>
                    <SelectTrigger className="rounded-2xl">
                        <SelectValue placeholder="Choisir un utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableUsers.map((user) => (
                            <SelectItem key={user.id} value={String(user.id)}>
                                {user.name ?? user.email ?? `Utilisateur #${user.id}`}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button type="button" onClick={addMember} className="rounded-2xl">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter
                </Button>
            </div>
            <div className="space-y-2">
                {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                        <div>
                            <p className="font-medium text-slate-700">{member.name ?? member.email ?? 'Utilisateur'}</p>
                            <p className="text-slate-500">{member.email}</p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                router.delete(`/evenements/${eventId}/assignments/${member.user_id}`, {
                                    preserveScroll: true,
                                    onSuccess: () => router.reload({ only: ['evenement'] }),
                                })
                            }
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
