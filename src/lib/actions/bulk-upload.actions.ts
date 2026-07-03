/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { serverHttpClient } from '../http/server-http-client';
import { BulkUploadResponse } from '@/types/common.types';
import { actionClient } from './safe-action';
import { z } from 'zod';

export const uploadBulkDataAction = actionClient
  .metadata({ actionName: 'uploadBulkDataAction' })
  .schema(z.any())
  .action(async ({ parsedInput: formData }): Promise<BulkUploadResponse> => {
    if (!(formData instanceof FormData)) {
      throw new Error('Expected FormData');
    }

    const endpoint = formData.get('endpoint') as string;
    if (!endpoint) {
      throw new Error('Endpoint is required');
    }

    // Clone FormData to remove endpoint param before sending to our backend if necessary
    // But sending it is usually harmless for Multer unless strict validation is in place
    // Actually, Multer usually ignores extra fields if using upload.single('file')

    try {
      // serverHttpClient requires multipart config
      const { data } = await serverHttpClient.post<BulkUploadResponse>(
        endpoint,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data;
    } catch (error: any) {
      if (error?.isAxiosError && error.response?.data) {
        const responseData = error.response.data;

        // Si el backend nos mandó errores de validación como un 400 (ej. formato de excel inválido o columnas faltantes)
        // los vamos a retornar como si fuera una respuesta estructurada para que la UI los muestre
        if (responseData.errors && Array.isArray(responseData.errors)) {
          return {
            file: {
              resourceId: '',
              originalName: '',
              uploadedAt: '',
              uploadedBy: '',
            },
            totalProcessed: 0,
            successCount: 0,
            skippedCount: 0,
            errorCount: responseData.errors.length,
            errors: responseData.errors,
          } as BulkUploadResponse;
        }

        // Si fue otro error, extraemos el mensaje real
        const backendMessage = responseData.message || responseData.error;
        if (Array.isArray(backendMessage)) {
          throw new Error(backendMessage.join(', '));
        } else if (typeof backendMessage === 'string') {
          throw new Error(backendMessage);
        }
      }
      throw error;
    }
  });

export const getBulkTemplateAction = actionClient
  .metadata({ actionName: 'getBulkTemplateAction' })
  .schema(z.string())
  .action(async ({ parsedInput: endpoint }) => {
    try {
      const { data, headers } = await serverHttpClient.get(endpoint, {
        responseType: 'arraybuffer',
      });

      const base64 = Buffer.from(data, 'binary').toString('base64');
      const contentType =
        headers['content-type'] ||
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      // Extract filename from content-disposition if present
      const contentDisposition = headers['content-disposition'];
      let filename = 'plantilla_carga_masiva.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(.+)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/["']/g, '');
        }
      }

      return {
        base64,
        contentType,
        filename,
      };
    } catch (error: any) {
      console.error('Error downloading template:', error);
      throw new Error('Error al descargar la plantilla');
    }
  });
