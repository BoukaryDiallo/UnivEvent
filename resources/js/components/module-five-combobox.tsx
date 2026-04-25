import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    CalendarDays,
    ChevronDown,
    FolderKanban,
    Plus,
    ScanLine,
    Ticket,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useLiveNotifications } from '@/contexts/live-notifications-context';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { create as createEvent, index as evenementsIndex } from '@/routes/evenements';
import { mine as myRegistrations } from '@/routes/inscriptions';

type ModuleAction = {
    title: string;
    hint: string;
    href: string;
    icon: typeof CalendarDays;
    badge?: number | string | null;
    visible?: boolean;
};

export function ModuleFiveCombobox() {
    const { isCurrentUrl } = useCurrentUrl();
    const { auth, notifications } = usePage().props as unknown as {
        auth: { user: { role?: string | null } };
        notifications: { unread_count: number };
    };
    const { notifications: liveNotifications } = useLiveNotifications();
    const unreadCount = liveNotifications.unread_count ?? notifications.unread_count;

    const actions: ModuleAction[] = [
        {
            title: 'Mes evenements',
            hint: 'Acceder au module principal',
            href: evenementsIndex().url,
            icon: FolderKanban,
        },
        {
            title: 'Creer un evenement',
            hint: 'Lancer un nouveau flux',
            href: createEvent().url,
            icon: Plus,
        },
        {
            title: 'Mes inscriptions',
            hint: 'Suivre mes participations',
            href: myRegistrations().url,
            icon: Ticket,
        },
        {
            title: 'Notifications',
            hint: 'Rappels et actualites',
            href: '/notifications',
            icon: Bell,
            badge: unreadCount || null,
        },
        {
            title: 'Scanner QR',
            hint: 'Check-in et controle d acces',
            href: '/admin/scanner-acces',
            icon: ScanLine,
            visible: auth.user.role === 'admin',
        },
    ].filter((item) => item.visible !== false);

    const isModuleActive = actions.some((item) => isCurrentUrl(item.href));

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Module 5</SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={isModuleActive}
                        tooltip={{ children: 'Module 5 - Mes evenements' }}
                        className="h-auto min-h-14 items-start rounded-2xl border border-sidebar-border/60 bg-sidebar-accent/30 px-3 py-3"
                    >
                        <Link href={evenementsIndex()} prefetch>
                            <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-sm">
                                <CalendarDays className="size-5" />
                            </div>
                            <div className="grid min-w-0 flex-1 gap-0.5">
                                <span className="text-sm font-semibold">Mes evenements</span>
                                <span className="text-xs text-sidebar-foreground/70">
                                    Hub metier du module
                                </span>
                            </div>
                        </Link>
                    </SidebarMenuButton>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuAction showOnHover className="top-3 rounded-full">
                                <ChevronDown className="size-4" />
                                <span className="sr-only">Ouvrir les actions du module 5</span>
                            </SidebarMenuAction>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" side="right" className="w-80 rounded-2xl p-2">
                            <DropdownMenuLabel className="px-3 py-2">
                                Module 5
                                <div className="mt-1 text-xs font-normal text-slate-500">
                                    Les actions metier importantes sont centralisees ici au lieu de saturer la sidebar.
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {actions.map((action) => (
                                <DropdownMenuItem
                                    key={action.title}
                                    className="rounded-xl px-3 py-3"
                                    onClick={() => router.visit(action.href)}
                                >
                                    <div className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                        <action.icon className="size-4" />
                                    </div>
                                    <div className="grid min-w-0 flex-1 gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="truncate font-medium">{action.title}</span>
                                            {action.badge ? (
                                                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                                    {action.badge}
                                                </span>
                                            ) : null}
                                        </div>
                                        <span className="truncate text-xs text-slate-500">{action.hint}</span>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {unreadCount ? <SidebarMenuBadge>{unreadCount}</SidebarMenuBadge> : null}
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
}
