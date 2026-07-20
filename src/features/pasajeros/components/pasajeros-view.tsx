import { PasajerosTable } from './pasajeros-table';

export function PasajerosView() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Pasajeros</h1>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">Pasajeros registrados en el sistema.</p>
      </div>
      <PasajerosTable />
    </div>
  );
}
