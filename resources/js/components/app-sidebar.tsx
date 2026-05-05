import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, ShieldEllipsis, User, Vote, Users, Trophy, List, ChevronDown, Building2, GraduationCap } from 'lucide-react';
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
import { useAuth } from '@/hooks/module1/useAuth';

import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const role = auth?.user?.role;
    const { hasRole, can } = useAuth();

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        }
    ];

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
        // Ajouter les liens pour les enseignants ici si nécessaire
    }

    if (hasRole('etudiant')) {
        // Ajouter les liens pour les étudiants ici si nécessaire
    }

    const footerNavItems = [
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

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />

                <SidebarMenu>

         
                    {role === 'etudiant' && (
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton>
                                        <Vote className="h-4 w-4" />
                                        <span>Espace Élections</span>
                                        <ChevronDown className="ml-auto h-4 w-4" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent sideOffset={12} align="start">
                                    <DropdownMenuItem asChild>
                                        <Link href="/espace-election" className="w-full">
                                            <Vote className="mr-2 h-4 w-4" />
                                            Espace élection
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    )}

               
    
                    {role === 'admin' && (
                        <>
                            {/* Structure académique */}
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
                                            <Link href="/ufr" className="w-full">
                                                <Building2 className="mr-2 h-4 w-4" />
                                                UFR
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild>
                                            <Link href="/departement" className="w-full">
                                                <FolderGit2 className="mr-2 h-4 w-4" />
                                                Départements
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild>
                                            <Link href="/filiere" className="w-full">
                                                <GraduationCap className="mr-2 h-4 w-4" />
                                                Filières
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild>
                                            <Link href="/etudiants" className="w-full">
                                                <Users className="mr-2 h-4 w-4" />
                                                Étudiants
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </SidebarMenuItem>

                            {/* Gestion élections */}
                            <SidebarMenuItem>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <SidebarMenuButton>
                                            <Vote className="h-4 w-4" />
                                            <span>Gestion des élections</span>
                                            <ChevronDown className="ml-auto h-4 w-4" />
                                        </SidebarMenuButton>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent sideOffset={12} align="start">
                                        <DropdownMenuItem asChild>
                                            <Link href="/elections" className="w-full">
                                                <List className="mr-2 h-4 w-4" />
                                                Élections
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild>
                                            <Link href="/candidatures" className="w-full">
                                                <Users className="mr-2 h-4 w-4" />
                                                Candidatures
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild>
                                            <Link href="/votes" className="w-full">
                                                <Vote className="mr-2 h-4 w-4" />
                                                Votes
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild>
                                            <Link href="/resultats" className="w-full">
                                                <Trophy className="mr-2 h-4 w-4" />
                                                Résultats
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild>
                                            <Link href="/espace-election" className="w-full">
                                                <Vote className="mr-2 h-4 w-4" />
                                                Espace Élections
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </SidebarMenuItem>

                            
                        </>
                    )}

                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}