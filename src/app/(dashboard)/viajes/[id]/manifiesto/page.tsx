'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FileSpreadsheet, Download, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Badge } from '@/components/ui/badge/badge';
import { Button } from '@/components/ui/button/button';
import { Skeleton } from '@/components/ui';
import { viajeRepository, rutaRepository, busRepository, terminalRepository, boletoRepository, pasajeroRepository, asientoRepository, agenciaRepository } from '@/infrastructure/repositories';
import type { Agencia, Viaje, Bus, Terminal } from '@/infrastructure/domain/types';

const estadoViajeVariant: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
  programado: 'info',
  en_curso: 'warning',
  finalizado: 'success',
  cancelado: 'danger',
};

const estadoViajeLabel: Record<string, string> = {
  programado: 'Programado',
  en_curso: 'En curso',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

export default function ManifiestoViajePage() {
  const params = useParams<{ id: string }>();
  const [viaje, setViaje] = useState<Viaje | null>(null);
  const [bus, setBus] = useState<Bus | null>(null);
  const [terminalOrigen, setTerminalOrigen] = useState<Terminal | null>(null);
  const [terminalDestino, setTerminalDestino] = useState<Terminal | null>(null);
  const [agencia, setAgencia] = useState<Agencia | null>(null);
  const [pasajerosManifiesto, setPasajerosManifiesto] = useState<{ item: number; nombres: string; documento: string; asiento: string; tipoAsiento: string; boleto: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const v = await viajeRepository.getById(params.id);
        if (!v) { setLoading(false); return; }
        setViaje(v);
        const [r, b, boletos, asientos, pasajerosDelViaje] = await Promise.all([
          rutaRepository.getById(v.idRuta),
          busRepository.getById(v.idBus),
          boletoRepository.getByViaje(v.id),
          asientoRepository.listByBus(v.idBus),
          pasajeroRepository.getByViaje(v.id),
        ]);
        if (b) {
          setBus(b);
          agenciaRepository.getById(b.idAgencia).then(setAgencia).catch(() => setAgencia(null));
        }
        if (r) {
          const [tO, tD] = await Promise.all([
            terminalRepository.getById(r.idTerminalOrigen),
            terminalRepository.getById(r.idTerminalDestino),
          ]);
          if (tO) setTerminalOrigen(tO);
          if (tD) setTerminalDestino(tD);
        }
        const aMap = new Map(asientos.map((a) => [a.id, a]));
        const pMap = new Map(pasajerosDelViaje.map((p) => [p.id, p]));
        setPasajerosManifiesto(boletos.map((boleto, idx) => {
          const p = pMap.get(boleto.idPasajero);
          const a = aMap.get(boleto.idAsiento);
          return {
            item: idx + 1,
            nombres: p ? `${p.nombres} ${p.apellidoPaterno} ${p.apellidoMaterno}` : '—',
            documento: p?.numeroDocumento ?? '—',
            asiento: a?.numeroAsiento ?? '—',
            tipoAsiento: a?.tipoServicio ?? '—',
            boleto: boleto.codigoQr,
          };
        }));
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) return <div className="p-6 space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>;

  const fechaHoraSalida = viaje ? new Date(viaje.fechaHoraSalida).toLocaleString('es-PE') : '';
  const fechaHoraLlegada = viaje ? new Date(viaje.fechaHoraLlegada).toLocaleString('es-PE') : '';

  const handleExportPdf = () => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text('Manifiesto de Pasajeros', 14, 16);

    doc.setFontSize(9);
    const info = [
      [`Empresa: ${agencia?.razonSocial ?? '—'}`, `RUC: ${agencia?.ruc ?? '—'}`],
      [`Ruta: ${terminalOrigen?.nombre ?? '—'} → ${terminalDestino?.nombre ?? '—'}`, `Bus: ${bus?.placa ?? '—'}`],
      [`Fecha/Hora salida: ${fechaHoraSalida}`, `Llegada estimada: ${fechaHoraLlegada}`],
      [`Rampa: ${viaje?.rampaEmbarque ?? '—'}`, `Estado: ${estadoViajeLabel[viaje?.estado ?? ''] ?? '—'}`],
    ];
    let y = 24;
    info.forEach(([left, right]) => {
      doc.text(left, 14, y);
      doc.text(right, 110, y);
      y += 6;
    });

    autoTable(doc, {
      startY: y + 2,
      head: [['N°', 'Pasajero', 'Documento', 'Asiento', 'Tipo', 'Boleto']],
      body: pasajerosManifiesto.map((p) => [p.item, p.nombres, p.documento, p.asiento, p.tipoAsiento, p.boleto]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 41, 59] },
    });

    doc.save(`manifiesto-viaje-${params.id}.pdf`);
  };

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #manifiesto-print, #manifiesto-print * { visibility: visible; }
          #manifiesto-print { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    <div className="space-y-6">
      <div id="manifiesto-print" className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="size-5 text-red-600" />
            <h2 className="text-base font-semibold text-neutral-900">Manifiesto de Pasajeros</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="size-4 mr-1.5" />
              Imprimir
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPdf}>
              <Download className="size-4 mr-1.5" />
              Exportar PDF
            </Button>
          </div>
        </div>

        <div className="border-2 border-neutral-200 rounded-lg">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 p-5 bg-neutral-50/50 border-b border-neutral-200 text-sm">
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wider mb-0.5">Empresa</p>
              <p className="font-semibold text-neutral-900">{agencia?.razonSocial ?? '—'}</p>
              <p className="text-xs text-neutral-500">RUC: {agencia?.ruc ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wider mb-0.5">Ruta</p>
              <p className="font-semibold text-neutral-900">
                {terminalOrigen?.nombre ?? '—'} → {terminalDestino?.nombre ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wider mb-0.5">Bus</p>
              <p className="font-semibold text-neutral-900">{bus?.placa ?? '—'}</p>
              <p className="text-xs text-neutral-500">{bus?.cantidadPisos} piso(s)</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wider mb-0.5">Fecha / Hora</p>
              <p className="font-semibold text-neutral-900">{fechaHoraSalida}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wider mb-0.5">Terminal Origen</p>
              <p className="font-semibold text-neutral-900">{terminalOrigen?.nombre ?? '—'}</p>
              <p className="text-xs text-neutral-500">{terminalOrigen?.direccion}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wider mb-0.5">Terminal Destino</p>
              <p className="font-semibold text-neutral-900">{terminalDestino?.nombre ?? '—'}</p>
              <p className="text-xs text-neutral-500">{terminalDestino?.direccion}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wider mb-0.5">Rampa</p>
              <p className="font-semibold text-neutral-900">{viaje?.rampaEmbarque ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wider mb-0.5">Estado</p>
              <div className="mt-0.5">
                <Badge variant={estadoViajeVariant[viaje?.estado ?? '']}>
                  {estadoViajeLabel[viaje?.estado ?? ''] ?? '—'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="text-left px-5 py-3 font-medium text-neutral-500 w-10">N°</th>
                  <th className="text-left px-5 py-3 font-medium text-neutral-500">Pasajero</th>
                  <th className="text-left px-5 py-3 font-medium text-neutral-500">Documento</th>
                  <th className="text-left px-5 py-3 font-medium text-neutral-500">Asiento</th>
                  <th className="text-left px-5 py-3 font-medium text-neutral-500">Tipo</th>
                  <th className="text-left px-5 py-3 font-medium text-neutral-500">Boleto</th>
                </tr>
              </thead>
              <tbody>
                {pasajerosManifiesto.map((p) => (
                  <tr key={p.item} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors">
                    <td className="px-5 py-3 text-neutral-500">{p.item}</td>
                    <td className="px-5 py-3 font-medium text-neutral-900">{p.nombres}</td>
                    <td className="px-5 py-3 text-neutral-600 font-mono">{p.documento}</td>
                    <td className="px-5 py-3 text-neutral-900">{p.asiento}</td>
                    <td className="px-5 py-3">
                      <Badge variant="neutral">{p.tipoAsiento}</Badge>
                    </td>
                    <td className="px-5 py-3 text-neutral-600 font-mono text-xs">{p.boleto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-neutral-200 px-5 py-4 flex items-center justify-between bg-neutral-50/50">
            <div className="text-sm text-neutral-600">
              Total pasajeros: <span className="font-bold text-neutral-900">{pasajerosManifiesto.length}</span>
              <span className="mx-2 text-neutral-300">|</span>
              Hora salida: <span className="font-medium text-neutral-900">{fechaHoraSalida}</span>
              <span className="mx-2 text-neutral-300">|</span>
              Llegada estimada: <span className="font-medium text-neutral-900">{fechaHoraLlegada}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
