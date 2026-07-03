'use client';

import { DataTableHeader, Separator } from '@/components/ui';
import { BlockMessageErrorPage } from '@/components/shared';

export function BlockTable({
  errorOnLoad,
  title,
  badgeLabel,
  children,
  onRetry,
}: {
  errorOnLoad?: boolean;
  title?: string;
  badgeLabel?: string;
  children?: React.ReactNode;
  onRetry?: () => void;
}) {
  if (errorOnLoad) {
    return (
      <section className="border rounded-lg">
        <DataTableHeader title={title} badgeLabel={badgeLabel} />
        <Separator />
        <BlockMessageErrorPage onRetry={onRetry} />
      </section>
    );
  }

  return (
    <section className="border rounded-lg">
      <DataTableHeader title={title} badgeLabel={badgeLabel} />
      {children}
    </section>
  );
}
