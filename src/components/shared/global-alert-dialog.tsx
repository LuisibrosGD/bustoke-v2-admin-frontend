'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { useAlertDialogStore } from '@/stores/use-alert-dialog-store';

function renderSafeDialogText(input: string) {
  return input
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function UnexpectedErrorContent() {
  const { closeDialog } = useAlertDialogStore();
  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle className="text-center">
          Ocurrió un error inesperado
        </AlertDialogTitle>
        <AlertDialogDescription className="text-balance text-center">
          Intenta nuevamente más tarde.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="grid grid-cols-1 gap-2 mt-4">
        <Button
          type="button"
          size="lg"
          className="col-span-1"
          onClick={closeDialog}
        >
          Cerrar
        </Button>
      </div>
    </>
  );
}

function ConfirmationContent() {
  const { dialogProps } = useAlertDialogStore();
  return (
    <>
      <AlertDialogHeader className="items-center">
        {dialogProps?.title && (
          <AlertDialogTitle className="text-center">
            {renderSafeDialogText(dialogProps.title)}
          </AlertDialogTitle>
        )}
        {dialogProps?.description && (
          <AlertDialogDescription className="text-center text-sm leading-relaxed whitespace-pre-line md:text-balance max-md:text-base max-md:leading-7 max-md:px-1">
            {renderSafeDialogText(dialogProps.description)}
          </AlertDialogDescription>
        )}
      </AlertDialogHeader>
      <div
        className={cn(
          'grid grid-cols-1 gap-2 mt-4',
          (dialogProps?.cancelLabel || dialogProps?.confirmLabel) &&
            'lg:grid-cols-2'
        )}
      >
        {dialogProps?.cancelLabel && (
          <Button
            type="button"
            variant="outline"
            className="col-span-1 max-md:order-2 max-md:text-base max-md:py-6"
            onClick={dialogProps?.handleCancel}
          >
            {dialogProps?.cancelLabel}
          </Button>
        )}
        {dialogProps?.confirmLabel && (
          <Button
            className="col-span-1 max-md:order-1 max-md:text-base max-md:py-6"
            onClick={dialogProps?.handleConfirm}
          >
            {dialogProps?.confirmLabel}
          </Button>
        )}
      </div>
    </>
  );
}

export function GlobalAlertDialog() {
  const { isOpen, closeDialog, unexpectedError, size } = useAlertDialogStore();

  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={closeDialog}>
      <AlertDialogContent className={cn(sizeClasses[size])}>
        {unexpectedError ? <UnexpectedErrorContent /> : <ConfirmationContent />}
      </AlertDialogContent>
    </AlertDialog>
  );
}
