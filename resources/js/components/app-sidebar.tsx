// React & Inertia
import { Link } from '@inertiajs/react';

// UI Components
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

// Custom Components
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

// Icons - Lucide React
import {
    BookOpen,
    Building2,
    ChevronDown,
    FolderGit2,
    GraduationCap,
    LayoutGrid,
    Users,
    Vote,
    Trophy,
    Radio,
    List,
    FileText,
} from 'lucide-react';

// Routes
import { dashboard, roles } from '@/routes';
import votes, { elections as votesElections } from '@/routes/votes';
import candidatures from '@/routes/candidatures';
import resultats from '@/routes/resultats';
import elections from '@/routes/elections';
import ufr from '@/routes/ufr';
import departement from '@/routes/departement';
import filiere from '@/routes/filiere';
import etudiants from '@/routes/etudiants';
import live from '@/routes/votes/live';

// Utils & Types
import { cn } from '@/lib/utils';
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
                                        <GraduationCap className="mr-2 h-4 w-4" />
                                        Étudiants
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <Vote className="h-4 w-4" />
                                    <span>Gestion des Élections</span>
                                    <ChevronDown className="ml-auto h-4 w-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent sideOffset={12} align="start">
                                <DropdownMenuItem asChild>
                                    <Link href={elections.index.url()} className="w-full">
                                        <List className="mr-2 h-4 w-4" />
                                        Élections
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    
                                    <Link href={candidatures.index.url()} className="w-full">
                                        <Users className="mr-2 h-4 w-4" />
                                        Candidatures
                                    </Link>
                                </DropdownMenuItem>
                               
                                <DropdownMenuItem asChild>
                                    <Link href={votes.index.url()} className="w-full">
                                        <List className="mr-2 h-4 w-4" />
                                        Historique des votes
                                    </Link>
                                </DropdownMenuItem>
                                 <DropdownMenuItem asChild>
                                    <Link href={resultats.index.url()} className="w-full">
                                        <Trophy className="mr-2 h-4 w-4" />
                                        Résultats
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <Link href="/espace-elections" className="w-full">
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        Espace Élections
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
