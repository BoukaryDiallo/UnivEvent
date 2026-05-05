import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();
<<<<<<< HEAD
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
=======
>>>>>>> upstream/main

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href}>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}