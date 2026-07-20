/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Separator,
} from '@/components/ui';
import {
  UploadIcon,
  FileSpreadsheet,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Download,
  Loader2,
} from 'lucide-react';
import { BulkUploadResponse } from '@/types/common.types';
import { toast } from 'sonner';
import { getBulkTemplateAction } from '@/lib/actions/bulk-upload.actions';

export interface BulkColumnSpec {
  /** Nombre exacto de la columna tal como debe aparecer en el Excel */
  name: string;
  /** Valor de ejemplo para esa columna */
  example: string;
  /** Si la columna es obligatoria (por defecto true) */
  required?: boolean;
}

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  endpoint: string;
  templateEndpoint?: string;
  uploadAction: (formData: FormData) => Promise<any>;
  onSuccess?: () => void;
  /** Columnas esperadas en el Excel; si se pasan, se muestra una tabla de ejemplo */
  columns?: BulkColumnSpec[];
}

export function BulkUploadDialog({
  open,
  onOpenChange,
  title,
  description,
  endpoint,
  templateEndpoint,
  uploadAction,
  onSuccess,
  columns,
}: BulkUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [result, setResult] = useState<BulkUploadResponse | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile.type !==
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
        !selectedFile.name.endsWith('.xlsx')
      ) {
        toast.error('Por favor, selecciona un archivo Excel (.xlsx)');
        return;
      }
      setFile(selectedFile);
      setResult(null); // Reset anterior result if any
      setGlobalError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setGlobalError(null);
    const formData = new FormData();
    formData.append('endpoint', endpoint);
    formData.append('file', file);

    try {
      const res = await uploadAction(formData);
      if (res?.data) {
        setResult(res.data);
        if (res.data.errorCount === 0) {
          toast.success('Carga masiva completada exitosamente');
          if (onSuccess) onSuccess();
        } else {
          toast.warning('Carga masiva completada con errores');
          if (onSuccess) onSuccess(); // Optionally refresh list anyway
        }
      } else if (res?.serverError) {
        setGlobalError(res.serverError);
      } else if (res?.validationErrors) {
        setGlobalError('Error de validación al procesar la solicitud');
      }
    } catch {
      setGlobalError('Ocurrió un error inesperado');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    if (!templateEndpoint) return;

    setIsDownloadingTemplate(true);
    try {
      const res = await getBulkTemplateAction(templateEndpoint);
      if (res?.data) {
        const { base64, contentType, filename } = res.data;
        const link = document.createElement('a');
        link.href = `data:${contentType};base64,${base64}`;
        link.download = filename || `plantilla_carga_masiva.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Plantilla descargada correctamente');
      } else {
        toast.error('Error al descargar la plantilla');
      }
    } catch {
      toast.error('Ocurrió un error al descargar la plantilla');
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setResult(null);
    setGlobalError(null);
    setIsUploading(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isUploading) return; // Prevent closing while uploading
    if (!newOpen) resetState();
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-fit">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="flex flex-col gap-6 py-4">
            {globalError && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{globalError}</AlertDescription>
              </Alert>
            )}

            {columns && columns.length > 0 && (
              <div className="rounded-xl border border-muted overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-muted">
                  <FileSpreadsheet className="size-4 text-green-600" />
                  <span className="text-xs font-bold text-foreground">
                    Estructura esperada del Excel
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-muted/20">
                        {columns.map((col) => (
                          <th
                            key={col.name}
                            className="px-3 py-2 text-left font-bold text-foreground whitespace-nowrap border-r border-muted last:border-r-0"
                          >
                            {col.name}
                            {col.required === false && (
                              <span className="ml-1 font-normal text-muted-foreground">(opcional)</span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {columns.map((col) => (
                          <td
                            key={col.name}
                            className="px-3 py-2 text-muted-foreground whitespace-nowrap border-r border-t border-muted last:border-r-0"
                          >
                            {col.example}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="px-4 py-2 text-[10px] text-muted-foreground bg-muted/20 border-t border-muted">
                  La primera fila del archivo debe contener exactamente estos encabezados. Cada fila siguiente es un registro.
                </p>
              </div>
            )}

            {templateEndpoint && (
              <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-primary-700">
                    ¿No tienes la plantilla?
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Descarga el formato Excel oficial para evitar errores.
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white border-primary/20 text-primary-700 hover:bg-primary/10 hover:text-primary-800 hover:border-primary/30 transition-all font-bold gap-2 shrink-0 pr-4"
                  onClick={handleDownloadTemplate}
                  disabled={isDownloadingTemplate}
                >
                  {isDownloadingTemplate ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  Descargar plantilla
                </Button>
              </div>
            )}

            <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-xl p-10 bg-muted/30 hover:bg-muted/50 transition-colors group">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".xlsx"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center cursor-pointer gap-2"
              >
                <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                  <UploadIcon className="size-8" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    Haz clic para seleccionar un archivo
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Solo archivos .xlsx (Excel)
                  </p>
                </div>
              </label>
            </div>

            {file && (
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-xl text-primary-700 min-w-0 overflow-hidden">
                <div className="size-10 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                  <FileSpreadsheet className="size-6 text-green-600" />
                </div>
                <div className="flex-1 min-w-0 max-w-[300px]">
                  <div
                    className="text-sm font-semibold truncate"
                    title={file.name}
                  >
                    {file.name}
                  </div>
                  <p className="text-[10px] text-muted-foreground font-normal">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setGlobalError(null);
                  }}
                  disabled={isUploading}
                  className="size-8 flex items-center justify-center rounded-full hover:bg-primary/10 text-primary-400 hover:text-primary-600 transition-colors"
                >
                  <XCircle className="size-5" />
                </button>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="min-w-[120px]"
              >
                {isUploading ? 'Subiendo...' : 'Iniciar carga'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 py-4">
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-muted min-w-0 overflow-hidden">
              <div className="size-8 bg-white rounded-sm flex items-center justify-center shadow-sm border shrink-0">
                <FileSpreadsheet className="size-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0 max-w-[380px]">
                <h4
                  className="text-sm font-bold text-foreground truncate"
                  title={result.file.originalName}
                >
                  {result.file.originalName}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <User className="size-3" /> {result.file.uploadedBy}
                  </span>
                  <Separator orientation="vertical" className="h-2" />
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="size-3" />{' '}
                    {new Date(result.file.uploadedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/30 p-4 rounded-xl flex flex-col items-center border border-muted/50">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                  Procesados
                </span>
                <span className="text-2xl font-black text-foreground mt-1">
                  {result.totalProcessed}
                </span>
              </div>
              <div className="bg-success-50 p-4 rounded-xl flex flex-col items-center border border-success-200">
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-success-700 font-bold">
                  <CheckCircle2 className="size-3" /> Éxito
                </span>
                <span className="text-2xl font-black text-success-700 mt-1">
                  {result.successCount}
                </span>
              </div>
              <div className="bg-error-50 p-4 rounded-xl flex flex-col items-center border border-error-200">
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-error-700 font-bold">
                  <AlertCircle className="size-3" /> Errores
                </span>
                <span className="text-2xl font-black text-error-700 mt-1">
                  {result.errorCount}
                </span>
              </div>
            </div>

            {result.skippedCount > 0 && (
              <Alert variant="warning">
                <AlertCircle className="size-4" />
                <AlertDescription>
                  Se omitieron{' '}
                  <span className="font-bold">{result.skippedCount}</span>{' '}
                  registros por ser duplicados o por reglas de negocio.
                </AlertDescription>
              </Alert>
            )}

            {result.errors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-foreground">
                    Detalle de errores
                  </h4>
                  <Badge
                    variant="destructive"
                    className="bg-error-500 hover:bg-error-600"
                  >
                    {result.errorCount} errores encontrados
                  </Badge>
                </div>
                <div className="border border-muted rounded-xl divide-y divide-muted max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {result.errors.map((error, idx) => (
                    <div
                      key={idx}
                      className="p-3 text-sm flex gap-4 hover:bg-error-50/50 transition-colors"
                    >
                      <div className="flex flex-col min-w-20">
                        <span className="font-bold text-muted-foreground uppercase text-[10px]">
                          Fila {error.row}
                        </span>
                        {error.column && (
                          <span className="text-[10px] text-error-600 font-bold bg-error-50 px-1 rounded w-fit mt-0.5">
                            {error.column}
                          </span>
                        )}
                      </div>
                      <span className="text-foreground mt-0.5 leading-relaxed">
                        {error.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-2">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="font-bold"
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
