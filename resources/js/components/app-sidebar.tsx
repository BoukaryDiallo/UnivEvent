import { Link, usePage } from '@inertiajs/react';
import { Bell, BookOpen,ClipboardCheck, GraduationCap, PieChart, Calendar1, CalendarClock, CalendarRange, Eye, FolderGit2, History, LayoutGrid, NotebookPen, ShieldEllipsis, User } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { useAuth } from '@/hooks/module1/useAuth';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as adminDiplomasIndex } from '@/routes/admin/diplomas';
import { index as adminPickupSlotsIndex } from '@/routes/admin/pickup-slots';
import { index as diplomasIndex } from '@/routes/diplomas';
import type { NavItem } from '@/types';

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
    const { hasRole, can } = useAuth();
    const canManageDiplomas = can('diplomas.manage');

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Retraits de diplômes',
            href: diplomasIndex(),
            icon: GraduationCap,
        },
    ];

    if (canManageDiplomas) {
        mainNavItems.push(
            {
                title: 'Tableau de bord scolarité',
                href: adminDashboard(),
                icon: PieChart,
            },
            {
                title: 'Dossiers à instruire',
                href: adminDiplomasIndex(),
                icon: ClipboardCheck,
            },
            {
                title: 'Créneaux de retrait',
                href: adminPickupSlotsIndex(),
                icon: CalendarRange,
            },
        );
    }


        if(hasRole('admin')){
            mainNavItems.push(
                {
                    title: 'Consultation',
                    href: '/consultation',
                    icon: Eye,
                },
                {
                    title: 'Emploi du Temps',
                    href: '/emploie-du-temps',
                    icon: Calendar1,
                },
            )
        }



        if (hasRole('admin') || can('manage users')) {
        mainNavItems.push(
            {
                title: 'Gestion des rôles',
                href: '/admin/users',
                icon: User,
            },
            {
                title: 'Permissions',
                href: '/admin/permissions',
                icon: ShieldEllipsis,
            },
        );
        }


        if (hasRole('enseignant')) {
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
                {
                    title: 'Mon emploi du Temps',
                    href: '/emploie-du-temps/edt-enseignant',
                    icon: Calendar1,
                },
            
            );
        }


        if (hasRole('etudiant')) {
            mainNavItems.push(
            {
                    title: 'Emploi du Temps',
                    href: '/emploie-du-temps/edt-etudiant',
                    icon: Calendar1,
                }
            
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
