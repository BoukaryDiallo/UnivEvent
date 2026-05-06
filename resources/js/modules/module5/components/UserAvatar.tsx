import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type UserAvatarProps = {
    name?: string | null;
    avatar?: string | null;
    className?: string;
};

function initials(name?: string | null) {
    if (!name) {
        return 'UE';
    }

    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
}

export function UserAvatar({ name, avatar, className }: UserAvatarProps) {
    return (
        <Avatar className={cn('size-10 ring-2 ring-white/60 dark:ring-slate-900/60', className)}>
            <AvatarImage src={avatar ?? undefined} alt={name ?? 'User avatar'} />
            <AvatarFallback className="bg-gradient-to-br from-sky-500 to-cyan-400 text-xs font-semibold text-white">
                {initials(name)}
            </AvatarFallback>
        </Avatar>
    );
}
