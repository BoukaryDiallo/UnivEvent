import { router, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import {
    read as readNotification,
    readAll as readAllNotifications,
} from '@/actions/App/Http/Controllers/NotificationController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { NotificationsShare } from '@/types/global';

const formatRelative = (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.round(diffMs / 60000);

    if (minutes < 1) {
return 'à l\'instant';
}

    if (minutes < 60) {
return `il y a ${minutes} min`;
}

    const hours = Math.round(minutes / 60);

    if (hours < 24) {
return `il y a ${hours} h`;
}

    const days = Math.round(hours / 24);

    return `il y a ${days} j`;
};

export function NotificationBell() {
    const page = usePage<{ notifications: NotificationsShare }>();
    const { unread_count, recent } = page.props.notifications;

    const openItem = (id: string) => {
        router.post(readNotification(id).url, {}, { preserveScroll: true });
    };

    const markAllRead = () => {
        router.post(readAllNotifications().url, {}, { preserveScroll: true });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Notifications (${unread_count})`}
                    className="relative"
                >
                    <Bell className="h-5 w-5" />
                    {unread_count > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full px-1 text-xs"
                        >
                            {unread_count}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unread_count > 0 && (
                        <button
                            onClick={markAllRead}
                            className="text-xs font-normal text-primary hover:underline"
                        >
                            Tout marquer lu
                        </button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {recent.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                        Aucune notification non lue.
                    </div>
                ) : (
                    recent.map((n) => (
                        <DropdownMenuItem
                            key={n.id}
                            onSelect={() => openItem(n.id)}
                            className="flex flex-col items-start gap-1 whitespace-normal py-2"
                        >
                            <div className="text-sm font-medium">{n.title}</div>
                            {n.tracking_code && (
                                <div className="font-mono text-xs text-muted-foreground">
                                    {n.tracking_code}
                                </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                                {formatRelative(n.created_at)}
                            </div>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
