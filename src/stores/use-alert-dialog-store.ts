import { create } from 'zustand';

interface AlertDialogProps {
  title?: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  handleConfirm?: () => void;
  handleCancel?: () => void;
}

type AlertDialogState = {
  isOpen: boolean;
  size: 'sm' | 'md' | 'lg';
  unexpectedError?: boolean;
  dialogProps?: AlertDialogProps;
  openDialog: (
    options: Partial<
      Omit<AlertDialogState, 'isOpen' | 'openDialog' | 'closeDialog'>
    >
  ) => void;
  closeDialog: () => void;
};

export const useAlertDialogStore = create<AlertDialogState>((set) => ({
  isOpen: false,
  size: 'md',
  unexpectedError: false,
  dialogProps: undefined,
  openDialog: (options) =>
    set(() => ({
      isOpen: true,
      unexpectedError: options.unexpectedError,
      size: options.size,
      dialogProps: options.dialogProps,
    })),
  closeDialog: () => set({ isOpen: false }),
}));
