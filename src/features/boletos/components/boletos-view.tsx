import { BoletosTable } from './boletos-table';

export function BoletosView() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Boletos</h1>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">Boletos emitidos en el sistema.</p>
      </div>
      <BoletosTable />
    </div>
  );
}
