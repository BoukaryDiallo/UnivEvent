import { Link, usePage } from '@inertiajs/react';
import { Bell, ChevronDown } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useLiveNotifications } from '@/contexts/live-notifications-context';
import { dashboard } from '@/routes';
import type { BreadcrumbItem as BreadcrumbItemType, User } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth, notifications } = usePage().props as unknown as {
        auth: { user: User };
        notifications: { unread_count: number };
    };
    const { notifications: liveNotifications } = useLiveNotifications();
    const unreadCount = liveNotifications.unread_count ?? notifications.unread_count;

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                {breadcrumbs.length ? (
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                ) : (
                    <Link href={dashboard()} className="text-sm font-medium text-slate-500">
                        Tableau de bord
                    </Link>
                )}
            </div>
            <div className="flex items-center gap-2">
                <Link
                    href="/notifications"
                    className="relative inline-flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white"
                    aria-label="Notifications"
                    title="Notifications"
                >
                    <Bell className="size-4" />
                    {unreadCount ? (
                        <span className="absolute ml-5 -mt-5 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            {unreadCount}
                        </span>
                    ) : null}
                </Link>
                <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700">
                        <UserInfo user={auth.user} />
                        <ChevronDown className="mr-1 size-4 text-slate-400" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60">
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
