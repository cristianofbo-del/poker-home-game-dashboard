"use client";

import { useState, useEffect, useCallback } from "react";
import Filters from "@/components/Filters";
import StatCards from "@/components/StatCards";
import DataTable from "@/components/DataTable";
import ProfitEvolutionChart from "@/components/charts/ProfitEvolutionChart";
import BBhBarChart from "@/components/charts/BBhBarChart";
import RankingTable from "@/components/RankingTable";
import PlayerCards from "@/components/PlayerCards";
import SessionFactors from "@/components/SessionFactors";
import type { DashboardFilters } from "@/lib/types";
import type { SessionWithMetrics, PlayerAggregates } from "@/lib/types";

interface ApiResponse {
  sessions?: SessionWithMetrics[];
  aggregates?: PlayerAggregates[];
  error?: string;
}

const defaultFilters: DashboardFilters = {
  jogador: "",
  dataInicio: "",
  dataFim: "",
};

export default function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [sessions, setSessions] = useState<SessionWithMetrics[]>([]);
  const [aggregates, setAggregates] = useState<PlayerAggregates[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.jogador) params.set("jogador", filters.jogador);
      if (filters.dataInicio) params.set("dataInicio", filters.dataInicio);
      if (filters.dataFim) params.set("dataFim", filters.dataFim);
      const res = await fetch(`/api/sessions?${params}`);
      const json: ApiResponse = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao carregar");
      setSessions(json.sessions ?? []);
      setAggregates(json.aggregates ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar dados");
      setSessions([]);
      setAggregates([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const playerOptions = Array.from(
    new Set([...aggregates.map((a) => a.jogador), ...sessions.map((s) => s.Jogador)])
  ).filter(Boolean).sort();

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-surface-card/50 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">Poker Home Game</h1>
            <p className="text-sm text-gray-400">Cash Game 1/2 — Análise por sessão</p>
          </div>
          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-neutral text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Carregando…" : "Atualizar"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <Filters
          filters={filters}
          onFiltersChange={setFilters}
          playerOptions={playerOptions}
        />

        {error && (
          <div className="rounded-xl border border-loss/50 bg-loss-muted p-4 text-loss">
            {error}. Siga o PASSO-A-PASSO.md e confira a URL no .env.
          </div>
        )}

        {loading && sessions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Carregando dados…</div>
        ) : (
          <>
            <StatCards aggregates={aggregates} sessions={sessions} />

            <div className="grid grid-cols-1 gap-6">
              <ProfitEvolutionChart sessions={sessions} />
              <BBhBarChart aggregates={aggregates} />
            </div>

            <RankingTable aggregates={aggregates} />

            <PlayerCards aggregates={aggregates} sessions={sessions} />

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Sessões</h2>
              <DataTable sessions={sessions} />
            </section>

            <SessionFactors sessions={sessions} />
          </>
        )}
      </main>
    </div>
  );
}
