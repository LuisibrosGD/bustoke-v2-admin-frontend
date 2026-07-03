import { TriangleAlertIcon } from 'lucide-react';

export function EmptyFieldAlert({
  propertyValue,
  children,
}: {
  propertyValue: string | number | boolean | undefined | null;
  children?: React.ReactNode;
}) {
  if (propertyValue) {
    return children ?? propertyValue;
  }

  return (
    <div className="inline-flex items-center gap-1 text-destructive ine-clamp-1">
      <TriangleAlertIcon className="size-3.5" />
      Falta
    </div>
  );
}
