import { Link } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, ShieldEllipsis, User } from 'lucide-react';
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

        const mainNavItems: NavItem[] = [
            //Nous utiliserons le seul dashboard en affcihant les infos
            // selons les rôles et permissions (recommandé) de l'utilisateur connecté
            
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
            mainNavItems.push(
            /*{
                // ajouter les liens pour les enseigants ici
                
            },*/
            
        );
        }


        if (hasRole('etudinant')) {
            mainNavItems.push(
            /*{
                // ajouter les liens pour les etudiants ici
                
            },*/
            
            );
        }


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
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
