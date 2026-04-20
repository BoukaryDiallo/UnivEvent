import { Link, usePage } from '@inertiajs/react';
import { Bell, BookOpen, CalendarClock, CalendarRange, Eye, FolderGit2, History, LayoutGrid, NotebookPen, User } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard, roles } from '@/routes';
import type { Auth, NavItem } from '@/types';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const role = auth.user.role;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    if (role === 'admin') {
        mainNavItems.push(
            {
                title: 'Roles',
                href: roles(),
                icon: User,
            },
            {
                title: 'Consultation',
                href: '/consultation',
                icon: Eye,
            },
        );
    }

    if (role === 'enseignant') {
        mainNavItems.push(
            {
                title: 'Mes disponibilites',
                href: '/dispos',
                icon: CalendarClock,
            },
            {
                title: 'Exceptions',
                href: '/ecarts',
                icon: CalendarRange,
            },
            {
                title: 'Reservations',
                href: '/mes-reservations',
                icon: NotebookPen,
            },
            {
                title: 'Historique',
                href: '/historique-disponibilites',
                icon: History,
            },
            {
                title: 'Notifications',
                href: '/mes-notifications',
                icon: Bell,
            },
        );
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()}>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
