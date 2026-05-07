import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();
    const displayName = user.name ?? 'Utilisateur';

    const roleLabels: Record<string, string> = {
        admin: 'Administrateur',
        organisateur: 'Organisateur / Club',
        etudiant: 'Étudiant',
        enseignant: 'Enseignant',
        jury: 'Membre du Jury',
        intervenant: 'Intervenant',
        participant: 'Participant',
    };

    const roleLabel = roleLabels[user.role as string] || user.role || 'Utilisateur';

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full border border-gray-100 shadow-sm">
                <AvatarImage src={user.avatar} alt={displayName} />
                <AvatarFallback className="rounded-lg bg-indigo-50 text-indigo-700 font-bold dark:bg-neutral-700 dark:text-white">
                    {getInitials(displayName)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-black text-gray-900 dark:text-white tracking-tight uppercase text-[11px]">{displayName}</span>
                <span className="truncate text-[10px] font-bold text-indigo-600/70 uppercase tracking-widest">
                    {roleLabel}
                </span>
                {showEmail && (
                    <span className="truncate text-[10px] text-muted-foreground mt-0.5">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}
