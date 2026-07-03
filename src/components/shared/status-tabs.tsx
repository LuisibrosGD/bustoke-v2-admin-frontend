'use client';

import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const tabVariants = cva(
  'pb-3 px-0 font-medium text-sm transition-colors border-b-2 cursor-pointer',
  {
    variants: {
      variant: {
        active: 'text-foreground border-primary relative z-10',
        inactive:
          'text-muted-foreground border-transparent hover:text-foreground hover:border-transparent',
      },
    },
    defaultVariants: {
      variant: 'inactive',
    },
  }
);

interface Tab {
  id: string | number;
  label: string;
  count?: number;
  color?: 'default' | 'error' | 'warning' | 'success';
}

interface StatusTabsProps {
  tabs: Tab[];
  activeTab: string | number;
  onTabChange: (tabId: string | number) => void;
  className?: string;
  fullWidth?: boolean;
}

const colorIndicators: Record<string, string> = {
  default: 'bg-foreground',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  success: 'bg-green-500',
};

export function StatusTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
  fullWidth,
}: StatusTabsProps) {
  return (
    <>
      <style>{`
        .status-tabs-scrollable::-webkit-scrollbar {
          display: none;
        }
        .status-tabs-scrollable {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div
        className={cn(
          'flex gap-6 border-b border-gray-200 max-md:gap-3 max-md:overflow-x-auto status-tabs-scrollable',
          fullWidth && 'w-full',
          className
        )}
        style={{ paddingBottom: '0px' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              tabVariants({
                variant: activeTab === tab.id ? 'active' : 'inactive',
              }),
              'max-md:whitespace-nowrap',
              fullWidth && 'flex-1 justify-center text-center'
            )}
          >
            <div className="flex items-center gap-2 justify-center">
              {tab.color && tab.color !== 'default' && (
                <span
                  className={cn(
                    'size-2 rounded-full',
                    colorIndicators[tab.color]
                  )}
                />
              )}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-xs text-muted-foreground ml-1">
                  {tab.count}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
