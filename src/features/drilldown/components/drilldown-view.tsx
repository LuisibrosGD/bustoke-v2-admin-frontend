'use client';

import { AgenciaTableLevel } from './agencia-table-level';

export function DrilldownView() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <div className="mt-3">
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Agencias</h1>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            Empresas de transporte interprovincial registradas en la plataforma.
          </p>
        </div>
      </div>
      <AgenciaTableLevel />
    </div>
  );
}
