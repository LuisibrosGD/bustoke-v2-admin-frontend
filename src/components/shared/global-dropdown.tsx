'use client';

import { ReactNode } from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { ListFilterIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DropdownItemType =
  | 'action'
  | 'checkbox'
  | 'radio'
  | 'separator'
  | 'label';

export interface GlobalDropdownItem {
  type?: DropdownItemType;
  label?: string;
  value?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
}

interface GlobalDropdownProps {
  items: GlobalDropdownItem[];
  trigger?: ReactNode;
  triggerLabel?: string;
  triggerIcon?: ReactNode;
  triggerClassName?: string;
  align?: 'start' | 'center' | 'end';
  contentClassName?: string;
  radioValue?: string;
  onRadioChange?: (value: string) => void;
  selectedCount?: number;
}

export function GlobalDropdown({
  items,
  trigger,
  triggerLabel = 'Filtros',
  triggerIcon = <ListFilterIcon />,
  triggerClassName,
  align = 'end',
  contentClassName = 'w-56',
  radioValue,
  onRadioChange,
  selectedCount,
}: GlobalDropdownProps) {
  const renderItem = (item: GlobalDropdownItem, index: number) => {
    const {
      type = 'action',
      label,
      checked,
      onCheckedChange,
      onClick,
      disabled,
      className,
      icon,
    } = item;

    switch (type) {
      case 'checkbox':
        return (
          <DropdownMenuCheckboxItem
            key={index}
            className={cn('capitalize', className)}
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
          >
            {label}
          </DropdownMenuCheckboxItem>
        );
      case 'radio':
        return (
          <DropdownMenuRadioItem
            key={index}
            value={item.value || ''}
            className={cn('capitalize', className)}
            disabled={disabled}
          >
            {label}
          </DropdownMenuRadioItem>
        );
      case 'separator':
        return <DropdownMenuSeparator key={index} />;
      case 'label':
        return <DropdownMenuLabel key={index}>{label}</DropdownMenuLabel>;
      default:
        return (
          <DropdownMenuItem
            key={index}
            className={cn('capitalize', className)}
            onClick={onClick}
            disabled={disabled}
          >
            {icon && <span className="mr-2">{icon}</span>}
            {label}
          </DropdownMenuItem>
        );
    }
  };

  const hasRadios = items.some((item) => item.type === 'radio');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="outline" className={cn('gap-2', triggerClassName)}>
            {triggerIcon}
            <span className="hidden lg:inline">{triggerLabel}</span>
            {selectedCount !== undefined && selectedCount > 0 && (
              <span className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium leading-none">
                {selectedCount}
              </span>
            )}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={contentClassName}>
        {hasRadios ? (
          <DropdownMenuRadioGroup
            value={radioValue}
            onValueChange={onRadioChange}
          >
            {items.map(renderItem)}
          </DropdownMenuRadioGroup>
        ) : (
          items.map(renderItem)
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
