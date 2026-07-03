import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxChips,
  ComboboxChipsInput,
  useComboboxAnchor,
  Badge,
} from '@/components/ui';
import { ComboboxOption } from '@/types/common.types';
import { XIcon } from 'lucide-react';

type GlobalComboboxMultipleProps = {
  items: ComboboxOption[];
  value?: string[];
  onChange: (value: string[]) => void;
  invalid?: boolean;
  id?: string;
};

export function GlobalComboboxMultiple({
  id,
  items,
  value = [],
  onChange,
  invalid,
}: GlobalComboboxMultipleProps) {
  const selectedValues = Array.isArray(value) ? value : [];
  const selectedItems = items.filter((item) =>
    selectedValues.includes(item.value)
  );
  const anchorRef = useComboboxAnchor();

  const handleRemoveChip = (itemValue: string) => {
    onChange(selectedValues.filter((v) => v !== itemValue));
  };

  return (
    <div className="w-full">
      <Combobox<ComboboxOption>
        items={items}
        value={null}
        autoHighlight
        onValueChange={(item) => {
          if (item) {
            const newValue = selectedValues.includes(item.value)
              ? selectedValues.filter((v) => v !== item.value)
              : [...selectedValues, item.value];
            onChange(newValue);
          }
        }}
      >
        <ComboboxChips
          ref={anchorRef}
          className="min-h-11 max-h-80 w-full overflow-y-auto"
        >
          {selectedItems.map((item) => (
            <Badge
              key={item.value}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {item.label}
              <button
                onClick={() => handleRemoveChip(item.value)}
                className="ml-1 rounded-full hover:opacity-70 focus:outline-none"
                type="button"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <ComboboxChipsInput
            id={id}
            placeholder={
              selectedItems.length === 0 ? 'Escribe o selecciona' : ''
            }
            aria-invalid={invalid ? 'true' : 'false'}
            className="flex-1"
          />
        </ComboboxChips>
        <ComboboxContent anchor={anchorRef}>
          <ComboboxEmpty>No hay resultados.</ComboboxEmpty>
          <ComboboxList>
            {(item: ComboboxOption) => {
              const isSelected = selectedValues.includes(item.value);
              return (
                <ComboboxItem
                  key={item.value}
                  value={item}
                  className={isSelected ? 'bg-muted text-foreground' : ''}
                >
                  {item.label}
                </ComboboxItem>
              );
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
