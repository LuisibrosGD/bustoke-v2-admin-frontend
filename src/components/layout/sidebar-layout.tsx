'use client';

import { SidebarProvider } from '../ui';
import { AppSidebar } from './app-sidebar';
import { DashboardHeader } from './dashboard-header';
import { useIsMobile } from '@/hooks/use-mobile';

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '280px',
          '--sidebar-width-icon': '72px',
          '--header-height': '64px',
        } as React.CSSProperties
      }
      defaultOpen={!isMobile}
    >
      <div className="flex min-h-dvh w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
