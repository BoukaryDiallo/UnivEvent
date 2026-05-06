import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    // Check if item has sub-items
                    if (item.items && item.items.length > 0) {
                        return (
                            <SidebarMenuItem key={item.title}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <SidebarMenuButton tooltip={{ children: item.title }}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronDown className="ml-auto" />
                                        </SidebarMenuButton>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="right" align="start">
                                        {item.items.map((subItem) => (
                                            <DropdownMenuItem key={subItem.title} asChild>
                                                <Link href={subItem.href || '#'}>
                                                    {subItem.icon && <subItem.icon className="mr-2 h-4 w-4" />}
                                                    <span>{subItem.title}</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </SidebarMenuItem>
                        );
                    }

                    // Handle regular items without sub-items
                    const href = item.href || '';
                    
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isCurrentUrl(href)}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={href}>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}