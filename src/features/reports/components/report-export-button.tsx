'use client';

import { Button } from '@/components/ui';
import { ArrowDownToLineIcon, Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ReportExportButtonProps {
  exportHref: string;
  fallbackFileName: string;
}

function getFileNameFromDisposition(
  contentDisposition: string | null,
  fallbackFileName: string
) {
  if (!contentDisposition) {
    return fallbackFileName;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  return filenameMatch?.[1] ?? fallbackFileName;
}

async function getErrorMessage(response: Response) {
  const clonedResponse = response.clone();

  try {
    const payload = await response.json();
    return payload?.message ?? payload?.error ?? 'No se pudo generar el Excel.';
  } catch {
    try {
      const text = await clonedResponse.text();
      return text || 'No se pudo generar el Excel.';
    } catch {
      return 'No se pudo generar el Excel.';
    }
  }
}

export function ReportExportButton({
  exportHref,
  fallbackFileName,
}: ReportExportButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      // `exportHref` apunta a nuestra propia API route (/api/reports/[slug]/export),
      // que reenvía la petición al backend server-side con el token de sesión.
      // Así el access token nunca queda expuesto en JS del cliente.
      const response = await fetch(exportHref, {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        toast.error(await getErrorMessage(response));
        return;
      }

      const blob = await response.blob();

      if (!blob.size) {
        toast.error('El Excel se generó vacío. Intenta nuevamente.');
        return;
      }

      const fileName = getFileNameFromDisposition(
        response.headers.get('content-disposition'),
        fallbackFileName
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Excel descargado correctamente.');
    } catch {
      toast.error('Ocurrió un error al descargar el Excel.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button type="button" onClick={handleDownload} disabled={isDownloading}>
      {isDownloading ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <ArrowDownToLineIcon className="size-4" />
      )}
      {isDownloading ? 'Descargando...' : 'Descargar Excel'}
    </Button>
  );
}
