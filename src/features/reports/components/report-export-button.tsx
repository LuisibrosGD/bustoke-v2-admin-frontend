'use client';

import { Button } from '@/components/ui';
import { ENV_URL_API } from '@/lib/constants/environments';
import { ArrowDownToLineIcon, Loader2Icon } from 'lucide-react';
import { useSession } from 'next-auth/react';
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

function getBackendExportUrl(exportHref: string) {
  const url = new URL(exportHref, window.location.origin);
  const backendPath = url.pathname.replace(/^\/api/, '') + '/excel';

  return `${ENV_URL_API}${backendPath}${url.search}`;
}

export function ReportExportButton({
  exportHref,
  fallbackFileName,
}: ReportExportButtonProps) {
  const { data: session } = useSession();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    const accessToken = session?.user?.accessToken;

    if (!accessToken) {
      toast.error('Tu sesión expiró. Vuelve a iniciar sesión.');
      return;
    }

    setIsDownloading(true);

    try {
      const response = await fetch(getBackendExportUrl(exportHref), {
        method: 'GET',
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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
