"use client";

import type { DashboardFilters } from "@/lib/types";

interface FiltersProps {
  filters: DashboardFilters;
  onFiltersChange: (f: DashboardFilters) => void;
  playerOptions: string[];
}

export default function Filters({ filters, onFiltersChange, playerOptions }: FiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-surface-card rounded-xl border border-border">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Jogador</label>
        <select
          value={filters.jogador}
          onChange={(e) => onFiltersChange({ ...filters, jogador: e.target.value })}
          className="bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm min-w-[160px] focus:ring-2 focus:ring-neutral focus:outline-none"
        >
          <option value="">Todos</option>
          {playerOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Data inicial</label>
        <input
          type="date"
          value={filters.dataInicio}
          onChange={(e) => onFiltersChange({ ...filters, dataInicio: e.target.value })}
          className="bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-neutral focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Data final</label>
        <input
          type="date"
          value={filters.dataFim}
          onChange={(e) => onFiltersChange({ ...filters, dataFim: e.target.value })}
          className="bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-neutral focus:outline-none"
        />
      </div>
    </div>
  );
}
