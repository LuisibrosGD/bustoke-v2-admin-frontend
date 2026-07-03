'use client';
interface DataTableEmptyProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function DataTableEmpty({ title, description }: DataTableEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 max-w-xs mx-auto">
      <div className="text-center space-y-1.5">
        <h3 className="text-neutral-800 text-base font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
