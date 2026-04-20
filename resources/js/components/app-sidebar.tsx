import { Link, usePage } from '@inertiajs/react';
import { BookOpen, CalendarRange, ClipboardCheck, FolderGit2, GraduationCap, LayoutGrid } from 'lucide-react';
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
import { dashboard } from '@/routes';
import { index as adminDiplomasIndex } from '@/routes/admin/diplomas';
import { index as adminPickupSlotsIndex } from '@/routes/admin/pickup-slots';
import { index as diplomasIndex } from '@/routes/diplomas';
import type { NavItem } from '@/types';

const buildMainNav = (isScolarite: boolean): NavItem[] => [
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
    ...(isScolarite
        ? [
              {
                  title: 'Dossiers à instruire',
                  href: adminDiplomasIndex(),
                  icon: ClipboardCheck,
              } satisfies NavItem,
              {
                  title: 'Créneaux de retrait',
                  href: adminPickupSlotsIndex(),
                  icon: CalendarRange,
              } satisfies NavItem,
          ]
        : []),
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
    const { auth } = usePage().props;
    const mainNavItems = buildMainNav(auth?.isScolarite ?? false);

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
