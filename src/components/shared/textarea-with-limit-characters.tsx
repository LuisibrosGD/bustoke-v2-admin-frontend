import { FormDescription, Textarea } from '../ui';

export function GlobalTextareaWithLimitCharacters({
  maxLength = 255,
  value,
  ...props
}: React.ComponentProps<'textarea'> & { maxLength?: number }) {
  const safeValue = typeof value === 'string' ? value : '';
  const remaining = maxLength - safeValue.length;

  return (
    <div>
      <Textarea
        {...props}
        value={safeValue}
        maxLength={maxLength}
        className="mb-1"
        style={{ minHeight: '120px' }}
      />
      <FormDescription>Quedan {remaining} caracteres</FormDescription>
    </div>
  );
}
