import { Link } from '@inertiajs/react';
import {
    Activity,
    Bell,
    BookOpen,
    Building2,
    Calendar,
    Calendar1,
    CalendarClock,
    CalendarRange,
    ClipboardCheck,
    Eye,
    FolderGit2,
    GraduationCap,
    History,
    LayoutGrid,
    NotebookPen,
    PieChart,
    ShieldEllipsis,
    User,
    Users,
} from 'lucide-react';

import AppLogo from '@/components/app-logo';
import { ModuleFiveCombobox } from '@/components/module-five-combobox';
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

import { useAuth } from '@/hooks/module1/useAuth';

import { dashboard as adminDashboard } from '@/routes/admin';
import { index as adminDiplomasIndex } from '@/routes/admin/diplomas';
import { index as adminPickupSlotsIndex } from '@/routes/admin/pickup-slots';

import type { NavItem } from '@/types';
import { dashboard } from '@/routes';
import { index as diplomasIndex } from '@/routes/diplomas';

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
    const { hasRole, can, user } = useAuth();

    const role = user?.role ?? null;

    const canManageDiplomas = can('diplomas.manage');

    const mainNavItems: NavItem[] = [
        {
            title: role === 'enseignant' ? 'Mon planning' : 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Événements',
            href: '/module5/dashboard',
            icon: Calendar,
        },
        {
            title: 'Retraits de diplômes',
            href: diplomasIndex(),
            icon: GraduationCap,
        },
    ];

    // Elections & Clubs
    if (hasRole('admin') || hasRole('etudiant')) {
        mainNavItems.push(
            {
                title: 'Clubs',
                href: '/clubs',
                icon: Building2,
            },
            {
                title: 'Élections',
                href: '/elections',
                icon: Users,
            }
        );
    }

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
            }
        );
    }

    if (hasRole('admin')) {
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
            }
        );
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
            }
        );
    }

    if (hasRole('enseignant')) {
        mainNavItems.push(
            {
                title: 'Mes disponibilités',
                href: '/dispos',
                icon: CalendarClock,
            },
            {
                title: 'Exceptions',
                href: '/ecarts',
                icon: CalendarRange,
            },
            {
                title: 'Réservations',
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
                title: 'Mon emploi du temps',
                href: '/emploie-du-temps/edt-enseignant',
                icon: Calendar1,
            }
        );
    }

    if (hasRole('etudiant')) {
        mainNavItems.push({
            title: 'Mon emploi du temps',
            href: '/emploie-du-temps/edt-etudiant',
            icon: Calendar1,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">

            {/* HEADER */}
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

            {/* CONTENT */}
            <SidebarContent>
                <NavMain items={mainNavItems} />
                <ModuleFiveCombobox />
            </SidebarContent>

            {/* FOOTER */}
            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>

        </Sidebar>
    );
}
