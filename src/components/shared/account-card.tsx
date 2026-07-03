'use client';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui';

interface AccountCardProps {
  title: string;
  badge?: string;
  details?: Array<{
    label: string;
    value: string;
  }>;
  actions?: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function AccountCard({
  title,
  badge,
  details,
  actions,
  onEdit,
  onDelete,
  className,
}: AccountCardProps) {
  const hasDetails = details && details.length > 0;
  const hasActions = actions || onEdit || onDelete;

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-4">
        <h3 className="font-semibold text-gray-500">{title}</h3>
        {badge && (
          <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full whitespace-nowrap">
            {badge}
          </span>
        )}
      </div>

      <Separator />

      {/* Content */}
      {hasDetails ? (
        <div className="p-4 flex items-center justify-between gap-4">
          {details && (
            <div className="space-y-1 flex-1">
              {details.map((detail, idx) => (
                <div key={idx} className="text-sm text-muted-foreground">
                  {detail.label}
                  {detail.value && <span className="ml-2">{detail.value}</span>}
                </div>
              ))}
            </div>
          )}

          {hasActions && (
            <div className="flex gap-4 items-center">
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="text-sm text-primary underline font-medium hover:text-primary/80"
                >
                  Eliminar
                </button>
              )}
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="text-sm text-primary underline font-medium hover:text-primary/80"
                >
                  Editar
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        hasActions && (
          <div className="p-6 flex flex-col items-center justify-center gap-3">
            {actions}
          </div>
        )
      )}
    </div>
  );
}
