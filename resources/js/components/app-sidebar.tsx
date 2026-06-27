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
    DoorOpen,
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
    Vote,
    UserCheck,
    FileText,
    BarChart3,
} from 'lucide-react';

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

import { useAuth } from '@/hooks/module1/useAuth';

import { dashboard } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as adminDiplomasIndex } from '@/routes/admin/diplomas';
import { index as adminPickupSlotsIndex } from '@/routes/admin/pickup-slots';

import { index as diplomasIndex } from '@/routes/diplomas';
import type { NavItem } from '@/types';



const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/BoukaryDiallo/UnivEvent',
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
    ];

    if (!hasRole('admin')) {
        mainNavItems.push({
            title: 'Retraits de diplômes',
            href: diplomasIndex(),
            icon: GraduationCap,
        });
    }

    // Structure Académique (menu déroulant pour admin)
    if (hasRole('admin')) {
        mainNavItems.push({
            title: 'Structure Académique',
            icon: FolderGit2,
            items: [
                {
                    title: 'UFR',
                    href: '/ufr',
                    icon: Building2,
                },
                {
                    title: 'Départements',
                    href: '/departement',
                    icon: Building2,
                },
                {
                    title: 'Filières',
                    href: '/filiere',
                    icon: Building2,
                },
                {
                    title: 'Étudiants',
                    href: '/etudiants',
                    icon: User,
                },
            ],
        });
    }

    // Élections (menu déroulant)
    if (hasRole('admin') || hasRole('etudiant')) {
        if (hasRole('admin')) {
            // Admin voit toutes les options
            mainNavItems.push({
                title: 'Élections',
                icon: Vote,
                items: [
                    {
                        title: 'Liste des élections',
                        href: '/elections',
                        icon: Users,
                    },
                    {
                        title: 'Espace Élections',
                        href: '/espace-election',
                        icon: Vote,
                    },
                    {
                        title: 'Candidatures',
                        href: '/candidatures',
                        icon: UserCheck,
                    },
                    {
                        title: 'Votes',
                        href: '/votes',
                        icon: Activity,
                    },
                    {
                        title: 'Résultats',
                        href: '/resultats',
                        icon: BarChart3,
                    },
                ],
            });
        } else {
            // Non-admin voit seulement Espace Élections
            mainNavItems.push({
                title: 'Élections',
                icon: Vote,
                items: [
                    {
                        title: 'Espace Élections',
                        href: '/espace-election',
                        icon: Vote,
                    },
                ],
            });
        }

        mainNavItems.push({
            title: 'Clubs',
            href: '/clubs',
            icon: Building2,
        });
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
                title: 'Soutenances',
                href: '/soutenances',
                icon: GraduationCap,
            },
            {
                title: 'Salles',
                href: '/salles',
                icon: DoorOpen,
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
        },
        {
        title: 'Soutenances',
        href: '/soutenances',
        icon: GraduationCap,
    },
    {
        title: 'Jurys',
        href: '/jurys',
        icon: Users,
    },
    {
        title: 'Salles',
        href: '/salles',
        icon: DoorOpen,
    },
    {
        title: 'Notifications',
        href: '/notifications-soutenance',
        icon: Bell,
    },
    
    );
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
            </SidebarContent>

            {/* FOOTER */}
            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>

        </Sidebar>
    );
}
