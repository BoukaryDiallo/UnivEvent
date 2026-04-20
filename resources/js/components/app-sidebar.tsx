import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    ChevronDown,
    FolderGit2,
    GraduationCap,
    LayoutGrid,
    Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import ufr from '@/routes/ufr';
import departement from '@/routes/departement';
import filiere from '@/routes/filiere';
import etudiants from '@/routes/etudiants';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard.url(),
        icon: LayoutGrid,
    },
    {
        title: 'Rôles',
        href: roles.url(),
        icon: Users,
    },
    {
        title: 'Élections',
        href: '/elections',
        icon: Users,
    },
    {
        title: 'Votes',
        href: '/votes',
        icon: Users,
    },
    {
        title: 'Résultats',
        href: '/resultats',
        icon: BookOpen,
    },
];

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
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard.url()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <Building2 className="h-4 w-4" />
                                    <span>Structure académique</span>
                                    <ChevronDown className="ml-auto h-4 w-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent sideOffset={12} align="start">
                                <DropdownMenuItem asChild>
                                    <Link href={ufr.index.url()} className="w-full">
                                        <Building2 className="mr-2 h-4 w-4" />
                                        UFR
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={departement.index.url()} className="w-full">
                                        <FolderGit2 className="mr-2 h-4 w-4" />
                                        Départements
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={filiere.index.url()} className="w-full">
                                        <GraduationCap className="mr-2 h-4 w-4" />
                                        Filières
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={etudiants.index.url()} className="w-full">
                                        <Users className="mr-2 h-4 w-4" />
                                        Étudiants
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
