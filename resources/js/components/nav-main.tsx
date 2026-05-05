import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import * as React from 'react';
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
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const { props } = usePage();
    const unreadNotifications = (props as any).unreadNotifications || 0;
    const [openItems, setOpenItems] = React.useState<Set<string>>(new Set());

    const toggleItem = (title: string) => {
        setOpenItems((prev) => {
            const newSet = new Set(prev);

            if (newSet.has(title)) {
                newSet.delete(title);
            } else {
                newSet.add(title);
            }

            return newSet;
        });
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        {item.items && item.items.length > 0 ? (
                            <>
                                <SidebarMenuButton
                                    tooltip={{ children: item.title }}
                                    onClick={() => toggleItem(item.title)}
                                    data-state={openItems.has(item.title) ? 'open' : 'closed'}
                                >
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                    <ChevronRight className={`ml-auto h-4 w-4 transition-transform duration-200 ${openItems.has(item.title) ? 'rotate-90' : ''}`} />
                                </SidebarMenuButton>
                                {openItems.has(item.title) && (
                                    <SidebarMenuSub>
                                        {item.items.map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                {subItem.href && (
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={isCurrentUrl(subItem.href)}
                                                    >
                                                        <Link href={subItem.href} prefetch>
                                                            {subItem.icon && <subItem.icon />}
                                                            <span>{subItem.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                )}
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                )}
                            </>
                        ) : (
                            item.href && (
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(item.href)}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        {item.title === 'Notifications' && unreadNotifications > 0 && (
                                            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                                {unreadNotifications}
                                            </span>
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            )
                        )}
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
