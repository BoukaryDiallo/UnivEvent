import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    CalendarDays,
    CirclePlus,
    ChevronDown,
    FileSearch,
    FolderKanban,
    ClipboardList,
    CheckCircle2,
    Mic,
    MessageSquare,
    ScanLine,
    Settings,
    Ticket,
    Trophy,
    Users,
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

import { gestion as evenementsGestion } from '@/routes/evenements';
import { index as evenementsIndex } from '@/routes/evenements';
import { mine as myRegistrations } from '@/routes/inscriptions';

export function ModuleFiveCombobox() {
    const { isCurrentUrl } = useCurrentUrl();
    const { auth, notifications } = usePage().props as any;
    const { notifications: liveNotifications } = useLiveNotifications();

    const unreadCount = liveNotifications?.unread_count ?? notifications?.unread_count ?? 0;

    const user = auth?.user;
    const role = user?.role;

    const isAdmin = role === 'admin';
    const canManageEvents = ['admin', 'organisateur', 'enseignant'].includes(role ?? '');
    const hubHref = canManageEvents ? evenementsGestion.url() : evenementsIndex.url({ query: { statut: 'publie' } });

    const actions = {
        common: [
            {
                title: 'Explorer événements',
                hint: 'Découvrir les événements publics',
                href: evenementsIndex.url({ query: { statut: 'publie' } }),
                icon: FileSearch,
            },
            {
                title: 'Notifications',
                hint: 'Rappels et activités',
                href: '/notifications',
                icon: Bell,
                badge: unreadCount || null,
            },
        ],

        participant: [
            {
                title: 'Mes inscriptions',
                hint: 'Suivi de participation',
                href: myRegistrations().url,
                icon: Ticket,
            },
            {
                title: 'Mes certificats',
                hint: 'Télécharger attestations',
                href: '/certificats',
                icon: Trophy,
            },
        ],

        organisateur: [
            {
                title: 'Centre de gestion',
                hint: 'Piloter vos événements',
                href: evenementsGestion.url(),
                icon: FolderKanban,
            },
            {
                title: 'Créer conférence',
                hint: 'Démarrer un nouvel événement',
                href: '/evenements/create/conference',
                icon: CirclePlus,
            },
            {
                title: 'Créer concours',
                hint: 'Initialiser un concours',
                href: '/evenements/create/concours',
                icon: ClipboardList,
            },
        ],

        jury: [
            {
                title: 'Mes espaces jury',
                hint: 'Accéder aux concours assignés',
                href: evenementsGestion.url({ query: { role: 'organisateur', type: 'concours' } }),
                icon: ClipboardList,
            },
            {
                title: 'Messages événement',
                hint: 'Suivi des échanges liés au jury',
                href: '/evenements/messages',
                icon: MessageSquare,
            },
        ],

        intervenant: [
            {
                title: 'Mes événements assignés',
                hint: 'Retrouver vos sessions et prises de parole',
                href: evenementsGestion.url(),
                icon: Mic,
            },
        ],

        admin: [
            {
                title: 'Scanner QR',
                hint: 'Check-in événementiel',
                href: '/admin/scanner-acces',
                icon: ScanLine,
            },
            {
                title: 'Validation événements',
                hint: 'Approuver ou rejeter',
                href: '/admin/events/pending',
                icon: CheckCircle2,
            },
            {
                title: 'Tous les événements',
                hint: 'Vue globale et brouillons en cours',
                href: evenementsGestion.url(),
                icon: Users,
            },
            {
                title: 'Administration',
                hint: 'Paramètres plateforme',
                href: '/admin',
                icon: Settings,
            },
        ],
    };

    const buildActions = () => {
        const list = [...actions.common];

        if (role === 'participant') {
list.push(...actions.participant);
}

        if (role === 'organisateur') {
list.push(...actions.organisateur);
}

        if (role === 'jury') {
list.push(...actions.jury);
}

        if (role === 'intervenant') {
list.push(...actions.intervenant);
}

        if (isAdmin) {
list.push(...actions.admin);
}

        return list;
    };

    const finalActions = buildActions();

    const isModuleActive = finalActions.some((item) => isCurrentUrl(item.href));

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Module Événementiel</SidebarGroupLabel>

            <SidebarMenu>
                <SidebarMenuItem>
                    {/* MAIN */}
                    <SidebarMenuButton
                        asChild
                        isActive={isModuleActive}
                        tooltip={{ children: 'Hub événementiel' }}
                        className="h-auto min-h-14 items-start rounded-2xl border border-sidebar-border/60 bg-sidebar-accent/30 px-3 py-3"
                    >
                        <Link href={hubHref} prefetch>
                            <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white">
                                <CalendarDays className="size-5" />
                            </div>

                            <div className="grid min-w-0 flex-1 gap-0.5">
                                <span className="text-sm font-semibold">Hub Événementiel</span>
                                <span className="text-xs text-sidebar-foreground/70">
                                    Accès dynamique selon vos rôles
                                </span>
                            </div>
                        </Link>
                    </SidebarMenuButton>

                    {/* DROPDOWN */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuAction showOnHover className="top-3 rounded-full">
                                <ChevronDown className="size-4" />
                            </SidebarMenuAction>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start" side="right" className="w-80 rounded-2xl p-2">
                            <DropdownMenuLabel>
                                Actions intelligentes
                                <div className="text-xs text-slate-500 mt-1">
                                    Interface adaptée automatiquement à votre rôle
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            {finalActions.map((action) => (
                                <DropdownMenuItem
                                    key={action.title}
                                    onClick={() => router.visit(action.href)}
                                    className="rounded-xl px-3 py-3"
                                >
                                    <div className="flex size-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                                        <action.icon className="size-4" />
                                    </div>

                                    <div className="grid flex-1 gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium truncate">{action.title}</span>

                                            {action.badge ? (
                                                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                                    {action.badge}
                                                </span>
                                            ) : null}
                                        </div>

                                        <span className="text-xs text-slate-500">{action.hint}</span>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {unreadCount > 0 && (
                        <SidebarMenuBadge>{unreadCount}</SidebarMenuBadge>
                    )}
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
}
