import { BoletosTable } from './boletos-table';

export function BoletosView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Boletos</h1>
        <p className="mt-2 text-muted-foreground">Boletos emitidos en el sistema.</p>
      </div>
      <BoletosTable />
    </div>
  );
}
