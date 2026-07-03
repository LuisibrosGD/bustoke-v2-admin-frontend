'use client';

import * as React from 'react';
import * as RechartsPrimitive from 'recharts';

import { cn } from '@/lib/utils/style';

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
    theme?: {
      light: string;
      dark: string;
    };
  };
};

const THEMES = { light: '', dark: '.dark' } as const;

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }

  return context;
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(
    ([, itemConfig]) => itemConfig.theme || itemConfig.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;

    return color ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join('\n')}
}
`
          )
          .join('\n'),
      }}
    />
  );
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >['children'];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/60 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border text-xs [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip;
const ChartLegend = RechartsPrimitive.Legend;

function ChartTooltipContent({
  active,
  payload,
  className,
  label,
  hideLabel = false,
  hideIndicator = false,
  indicator = 'dot',
}: {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    name?: string | number;
    value?: string | number;
    color?: string;
    fill?: string;
    payload?: Record<string, unknown>;
  }>;
  className?: string;
  label?: string | number;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: 'line' | 'dot' | 'dashed';
}) {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        'border-border/50 bg-background grid min-w-32 items-start gap-1.5 rounded-lg border px-3 py-2 text-xs shadow-xl',
        className
      )}
    >
      {!hideLabel && label ? (
        <div className="font-medium text-foreground">{label}</div>
      ) : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${item.dataKey || item.name || index}`;
          const itemConfig = config[key];
          const color = item.color || item.fill || itemConfig?.color;

          return (
            <div
              key={key}
              className="flex min-w-0 items-center gap-2 text-muted-foreground"
            >
              {!hideIndicator ? (
                <span
                  className={cn(
                    'shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)',
                    indicator === 'dot' && 'size-2.5 rounded-full',
                    indicator === 'line' && 'h-2.5 w-1',
                    indicator === 'dashed' &&
                      'h-0 w-0 border-[1.5px] border-dashed bg-transparent'
                  )}
                  style={
                    {
                      '--color-bg': color,
                      '--color-border': color,
                    } as React.CSSProperties
                  }
                />
              ) : null}
              <span className="truncate">
                {itemConfig?.label || item.name || key}
              </span>
              <span className="ml-auto font-mono font-medium tabular-nums text-foreground">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChartLegendContent({
  payload,
  className,
}: {
  payload?: Array<{
    value?: string | number;
    color?: string;
    dataKey?: string | number;
  }>;
  className?: string;
}) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      {payload.map((item) => {
        const key = `${item.dataKey || item.value}`;
        const itemConfig = config[key];

        return (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: item.color }}
            />
            <span>{itemConfig?.label || item.value}</span>
          </div>
        );
      })}
    </div>
  );
}

export {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
};
