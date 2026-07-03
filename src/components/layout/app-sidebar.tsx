'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useUserRole } from '@/hooks';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui';
import { NAV_ITEMS } from '@/lib/constants/paths';
import NavMain, { type NavItem } from './nav-main';
import { LogOut } from 'lucide-react';

const ALL_SECTIONS: { label: string; keys: string[] }[] = [
  { label: '', keys: ['Inicio'] },
  { label: 'Gestión', keys: ['Agencias', 'Terminales', 'Flota', 'Rutas', 'Viajes'] },
  { label: 'Ventas', keys: ['Boletos', 'Pasajeros'] },
  { label: 'Operaciones', keys: ['Manifiesto SUTRAN', 'Reclamos', 'Soporte'] },
  { label: 'Finanzas', keys: ['Comisiones', 'Suscripciones'] },
  { label: '', keys: ['API Keys', 'Reportes', 'Configuración'] },
];

function filterItems(allItems: NavItem[], keys: string[]): NavItem[] {
  return allItems.filter((item) => keys.includes(item.title));
}

export function AppSidebar() {
  const { isAdminAgencia } = useUserRole();

  const sectionMap = useMemo(() => {
    if (!isAdminAgencia) return ALL_SECTIONS;
    return ALL_SECTIONS.map((section) => ({
      ...section,
      keys: section.keys.filter((k) => k !== 'Agencias'),
    })).filter((s) => s.keys.length > 0);
  }, [isAdminAgencia]);

  const allItems = useMemo(() => NAV_ITEMS as NavItem[], []);
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="h-16 border-b border-sidebar-border flex items-center p-2">
        <Link href="/dashboard" className="flex items-center justify-center w-full mt-2">
          {open ? (
            <img src="/icons/bustokelogocompleto.svg" alt="Bustoke" className="h-6 w-auto" />
          ) : (
            <img src="/icons/bustokelogoletra.svg" alt="B" className="size-9" />
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent className="pb-4 overflow-x-hidden">
        {sectionMap.map((section) => {
          const items = filterItems(allItems, section.keys);
          if (items.length === 0) return null;
          return (
            <div key={section.label || section.keys.join('-')}>
              {section.label && open && (
                <SidebarGroupLabel className="px-4 pt-4 pb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  {section.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroup>
                <SidebarGroupContent>
                  <NavMain items={items} />
                </SidebarGroupContent>
              </SidebarGroup>
              {section.label && <SidebarSeparator className="mx-3" />}
            </div>
          );
        })}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Cerrar sesión"
              className="h-9 text-sm group-data-[collapsible=icon]:[&>svg]:size-6! text-neutral-400 hover:text-red-500 hover:bg-red-50 data-[state=open]:bg-red-50 transition-colors"
              onClick={() => {
                import('next-auth/react').then((m) => m.signOut());
              }}
            >
              <LogOut className="size-4" />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
