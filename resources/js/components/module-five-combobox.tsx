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
    LayoutDashboard,
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

import { mine as myRegistrations } from '@/routes/inscriptions';

export function ModuleFiveCombobox() {
    const { isCurrentUrl } = useCurrentUrl();
    const { auth, notifications } = usePage().props as {
        auth?: { 
            user?: { 
                role?: string | null;
                event_roles?: string[];
                has_managed_events?: boolean;
            } | null 
        };
        notifications?: { unread_count?: number } | null;
    };
    const { notifications: liveNotifications } = useLiveNotifications();

    const unreadCount = liveNotifications?.unread_count ?? notifications?.unread_count ?? 0;

    const user = auth?.user ?? null;
    const role = user?.role;
    const eventRoles = user?.event_roles ?? [];
    const hasManagedEvents = user?.has_managed_events ?? false;

    const isAdmin = role === 'admin';
    const canManageEvents = isAdmin || role === 'organisateur' || eventRoles.includes('organisateur');
    const hubHref = '/module5/events';

    const actions = {
        common: [
            {
                title: 'Explorer événements',
                hint: 'Découvrir les événements publics',
                href: '/module5/events',
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
                href: '/mes-inscriptions',
                icon: Ticket,
            },
            {
                title: 'Mes certificats',
                hint: 'Télécharger attestations',
                href: '/module5/certificats',
                icon: Trophy,
            },
        ],

        organisateur: [
            {
                title: 'Console Gestion',
                hint: 'Piloter vos participants',
                href: '/module5/dashboard',
                icon: LayoutDashboard,
            },
            {
                title: 'Mes événements',
                hint: 'Liste de vos créations',
                href: '/module5/events?filter=mine',
                icon: FolderKanban,
            },
            {
                title: 'Créer événement',
                hint: 'Démarrer un nouvel événement',
                href: '/module5/events/create',
                icon: CirclePlus,
            },
            {
                title: 'Gérer les concours',
                hint: 'Initialiser un concours',
                href: '/module5/events/create',
                icon: ClipboardList,
            },
        ],

        jury: [
            {
                title: 'Mes espaces jury',
                hint: 'Accéder aux concours assignés',
                href: '/module5/dashboard', // Redirects to jury dashboard
                icon: ClipboardList,
            },
            {
                title: 'Messages événement',
                hint: 'Suivi des échanges liés au jury',
                href: '/module5/dashboard',
                icon: MessageSquare,
            },
        ],

        intervenant: [
            {
                title: 'Mes événements assignés',
                hint: 'Retrouver vos sessions et prises de parole',
                href: '/module5/events',
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
                href: '/module5/events',
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

        // Participant actions: either by global role or if has any registration
        if (role === 'participant' || role === 'etudiant' || role === 'enseignant' || eventRoles.includes('participant')) {
            list.push(...actions.participant);
        }

        // Organizer actions: either by global role or if assigned as organizer
        if (role === 'organisateur' || eventRoles.includes('organisateur')) {
            list.push(...actions.organisateur);
        }

        // Jury actions: if assigned as jury in any event
        if (eventRoles.includes('jury')) {
            list.push(...actions.jury);
        }

        // Speaker actions
        if (eventRoles.includes('intervenant')) {
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
                    {hasManagedEvents ? (
                        <SidebarMenuButton
                            asChild
                            isActive={isModuleActive}
                            tooltip={{ children: 'Menu événementiel' }}
                            className="h-auto min-h-14 items-start rounded-2xl border border-sidebar-border/60 bg-sidebar-accent/30 px-3 py-3"
                        >
                            <Link href={hubHref} prefetch>
                                <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white">
                                    <CalendarDays className="size-5" />
                                </div>

                                <div className="grid min-w-0 flex-1 gap-0.5">
                                    <span className="text-sm font-semibold">Menu Événementiel</span>
                                    <span className="text-xs text-sidebar-foreground/70">
                                        Interface adaptée à votre activité
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    ) : (
                         <SidebarMenuButton
                            asChild
                            isActive={isModuleActive}
                            tooltip={{ children: 'Explorer les événements' }}
                            className="h-auto min-h-14 items-start rounded-2xl border border-sidebar-border/60 bg-sidebar-accent/30 px-3 py-3"
                        >
                            <Link href={actions.common[0].href} prefetch>
                                <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-400 text-white">
                                    <FileSearch className="size-5" />
                                </div>

                                <div className="grid min-w-0 flex-1 gap-0.5">
                                    <span className="text-sm font-semibold">UnivEvent Explorer</span>
                                    <span className="text-xs text-sidebar-foreground/70">
                                        Découvrez les événements à venir
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    )}

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
                                    Raccourcis contextuels selon vos rôles
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
