'use client';
'use no memo';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  PaginationState,
  RowSelectionState,
  OnChangeFn,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { cn } from '@/lib/utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className?: string;
  emptyElement?: React.ReactNode;
  pagination?: PaginationState;
  pageCount?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  enableRowSelection?: boolean;
  getRowId?: (row: TData) => string;
  meta?: Record<string, unknown>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  className,
  emptyElement,
  pagination,
  pageCount,
  onPaginationChange,
  rowSelection,
  onRowSelectionChange,
  enableRowSelection,
  getRowId,
  meta,
}: DataTableProps<TData, TValue>) {
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    getRowId,
    state: {
      ...(pagination && { pagination }),
      ...(rowSelection && { rowSelection }),
    },
    onPaginationChange: (updater) => {
      if (onPaginationChange && pagination) {
        const nextPagination =
          typeof updater === 'function' ? updater(pagination) : updater;
        onPaginationChange(nextPagination);
      }
    },
    ...(onRowSelectionChange && { onRowSelectionChange }),
    ...(enableRowSelection !== undefined && { enableRowSelection }),
    ...(meta && { meta }),
  });

  const mobileFlushActionsCell =
    meta && 'mobileFlushActionsCell' in meta
      ? Boolean(meta.mobileFlushActionsCell)
      : false;

  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm', className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={
                      mobileFlushActionsCell && cell.column.id === 'actions'
                        ? 'max-lg:p-0'
                        : undefined
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyElement}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}