'use client';

import { ChevronRight } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  useSidebar,
} from '@/components/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  children?: NavItem[];
};

export interface NavMainProps {
  items: NavItem[];
}

function NavMain({ items }: NavMainProps) {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();

  const handleNavClick = () => {
    setOpenMobile(false);
  };

  const isActive = (url: string) => {
    if (url === '#') return false;
    if (url === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(url);
  };

  return (
    <SidebarMenu className="gap-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.url);

        if (item.children && item.children.length > 0) {
          const childActive = item.children.some((c) => isActive(c.url));
          return (
            <Collapsible
              key={item.title}
              asChild
              className="group/collapsible"
              defaultOpen={childActive || active}
            >
              <SidebarMenuItem>
                <div className="flex items-center">
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="h-9 flex-1 text-sm group-data-[collapsible=icon]:[&>svg]:size-6! data-[active=true]:!bg-sidebar-primary data-[active=true]:!text-sidebar-primary-foreground data-[active=true]:hover:!bg-sidebar-primary data-[active=true]:hover:!text-sidebar-primary-foreground"
                    data-active={childActive || active}
                  >
                    <Link href={item.url} onClick={handleNavClick}>
                      {Icon && <Icon />}
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex size-8 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-sidebar-accent hover:text-neutral-600 group-data-[collapsible=icon]:hidden"
                    >
                      <ChevronRight className="size-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.children.map((subItem) => {
                      const SubIcon = subItem.icon;
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className="h-8 text-sm group-data-[collapsible=icon]:[&>svg]:size-6! data-[active=true]:!bg-sidebar-primary data-[active=true]:!text-sidebar-primary-foreground data-[active=true]:hover:!bg-sidebar-primary data-[active=true]:hover:!text-sidebar-primary-foreground"
                            data-active={isActive(subItem.url)}
                          >
                            <Link href={subItem.url} onClick={handleNavClick}>
                              {SubIcon && <SubIcon />}
                              <span className="truncate">{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        }

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              tooltip={item.title}
              className="h-9 text-sm group-data-[collapsible=icon]:[&>svg]:size-6! data-[active=true]:!bg-sidebar-primary data-[active=true]:!text-sidebar-primary-foreground data-[active=true]:hover:!bg-sidebar-primary data-[active=true]:hover:!text-sidebar-primary-foreground"
              data-active={active}
            >
              <Link href={item.url} onClick={handleNavClick}>
                {Icon && <Icon />}
                <span className="truncate">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export default NavMain;
