import { PasajerosTable } from './pasajeros-table';

export function PasajerosView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Pasajeros</h1>
        <p className="mt-2 text-muted-foreground">Pasajeros registrados en el sistema.</p>
      </div>
      <PasajerosTable />
    </div>
  );
}
