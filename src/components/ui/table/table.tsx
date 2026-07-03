'use client';

import * as React from 'react';

import { cn } from '@/lib/utils/style';

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn(
          'w-full caption-bottom text-sm lg:table-fixed max-lg:table-auto max-lg:w-max max-lg:min-w-full',
          className
        )}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('[&_tr]:border-b', className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'bg-muted/50 border-t font-medium [&>tr]:last:border-b-0',
        className
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b border-neutral-100 transition-colors hover:bg-blue-50/40 data-[state=selected]:bg-blue-50',
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      title={typeof props.children === 'string' ? props.children : undefined}
      className={cn(
        'bg-neutral-50/80 h-11 px-4 max-lg:px-4 text-xs text-neutral-500 text-left align-middle font-semibold whitespace-nowrap overflow-hidden text-ellipsis tracking-wide uppercase [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5',
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      title={typeof props.children === 'string' ? props.children : undefined}
      className={cn(
        'text-neutral-600 text-sm px-4 max-lg:px-4 py-3 max-lg:py-2 align-middle whitespace-nowrap overflow-hidden text-ellipsis [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5',
        className
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('text-muted-foreground mt-4 text-sm', className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
