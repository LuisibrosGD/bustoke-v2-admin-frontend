import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui';
import { ComboboxOption } from '@/types/common.types';

type GlobalComboboxProps = {
  items: ComboboxOption[];
  value?: string;
  inputValue?: string;
  onChange: (value: string) => void;
  onInputChange?: (value: string) => void;
  invalid?: boolean;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
};

export function GlobalCombobox({
  id,
  items,
  value,
  inputValue,
  onChange,
  onInputChange,
  invalid,
  disabled,
  placeholder = 'Escribe o selecciona',
}: GlobalComboboxProps) {
  const selectedItem = items.find((item) => item.value === value) || null;

  return (
    <Combobox<ComboboxOption>
      items={items}
      value={selectedItem}
      inputValue={inputValue}
      autoHighlight
      disabled={disabled}
      onValueChange={(value) => {
        const val = value?.value ?? '';
        onChange(val);
      }}
      onInputValueChange={onInputChange}
    >
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        aria-invalid={invalid ? 'true' : 'false'}
        disabled={disabled}
      />
      <ComboboxContent>
        <ComboboxEmpty>No hay resultados.</ComboboxEmpty>
        <ComboboxList>
          {(item: ComboboxOption) => {
            return (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
