'use client';

import { useParams, useSelectedLayoutSegment } from 'next/navigation';
import Link from 'next/link';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button/button';
import { ArrowLeft, ClipboardList, Ticket, Users, Armchair, ClipboardCheck, FileSpreadsheet } from 'lucide-react';

interface Tab {
  label: string;
  segment: string | null;
  href: string;
  icon: typeof ClipboardList;
}

const tabs: Tab[] = [
  { label: 'Resumen', segment: null, href: '', icon: ClipboardList },
  { label: 'Boletos', segment: 'boletos', href: '/boletos', icon: Ticket },
  { label: 'Pasajeros', segment: 'pasajeros', href: '/pasajeros', icon: Users },
  { label: 'Asientos', segment: 'asientos', href: '/asientos', icon: Armchair },
  { label: 'Check-in', segment: 'check-in', href: '/check-in', icon: ClipboardCheck },
  { label: 'Manifiesto', segment: 'manifiesto', href: '/manifiesto', icon: FileSpreadsheet },
];

export default function ViajeLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ id: string }>();
  const segment = useSelectedLayoutSegment();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" asChild>
          <Link href="/viajes">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Viaje</h1>
          <p className="text-sm text-muted-foreground">Centro de operaciones del viaje</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-neutral-200">
        {tabs.map((tab) => {
          const isActive = segment === tab.segment;
          const href = tab.href ? `/viajes/${params.id}${tab.href}` : `/viajes/${params.id}`;
          return (
            <Link key={tab.label} href={href}>
              <Button
                variant="ghost"
                className={`relative rounded-none border-b-2 px-4 py-2.5 h-auto text-sm gap-2 ${
                  isActive
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                <tab.icon className="size-4" />
                {tab.label}
              </Button>
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
