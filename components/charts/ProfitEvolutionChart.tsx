"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { SessionWithMetrics } from "@/lib/types";

interface ProfitEvolutionChartProps {
  sessions: SessionWithMetrics[];
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

const LINE_COLORS: Record<number, string> = {
  0: "#00ff88",
  1: "#3b82f6",
  2: "#a855f7",
  3: "#f59e0b",
  4: "#ec4899",
  5: "#22d3ee",
  6: "#f472b6",
};

export default function ProfitEvolutionChart({ sessions }: ProfitEvolutionChartProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const { data, players } = useMemo(() => {
    const sorted = [...sessions].sort(
      (a, b) => new Date(a.Data).getTime() - new Date(b.Data).getTime()
    );
    const playerSet = new Set(sessions.map((s) => s.Jogador));
    const players = Array.from(playerSet);
    const acumulado: Record<string, number> = {};
    players.forEach((p) => (acumulado[p] = 0));
    const data: { data: string; dataFull: string; [key: string]: number | string }[] = [];
    const seen = new Set<string>();
    for (const s of sorted) {
      acumulado[s.Jogador] = (acumulado[s.Jogador] ?? 0) + s["Lucro ou prejuízo"];
      const dataStr = new Date(s.Data).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      });
      const key = `${s.Data}-${dataStr}`;
      if (!seen.has(key)) {
        seen.add(key);
        const point: { data: string; dataFull: string; [key: string]: number | string } = {
          data: dataStr,
          dataFull: s.Data,
          ...Object.fromEntries(players.map((p) => [p, acumulado[p]])),
        };
        data.push(point);
      } else {
        const last = data[data.length - 1];
        players.forEach((p) => ((last as Record<string, number>)[p] = acumulado[p]));
      }
    }
    return { data, players };
  }, [sessions]);

  const visiblePlayers = selectedPlayer ? [selectedPlayer] : players;

  return (
    <div className="bg-surface-card border border-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-1">
        Evolução Lucro/Prejuízo por jogador
      </h3>
      <p className="text-xs text-gray-500 mb-3">
        Clique em um jogador para ver só a trajetória dele. Clique de novo ou em &quot;Todos&quot; para voltar.
      </p>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4f" />
            <XAxis
              dataKey="data"
              stroke="#6b7280"
              tick={{ fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              stroke="#6b7280"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `R$${v}`}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a2332",
                border: "1px solid #2d3a4f",
                borderRadius: "8px",
              }}
              formatter={(value: number, name: string) => [formatMoney(value), name]}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.dataFull
                  ? new Date(payload[0].payload.dataFull).toLocaleDateString("pt-BR")
                  : ""
              }
            />
            <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="2 2" />
            {visiblePlayers.map((player, i) => {
              const idx = players.indexOf(player);
              const color = LINE_COLORS[idx % 7];
              return (
                <Line
                  key={player}
                  type="monotone"
                  dataKey={player}
                  name={player}
                  stroke={color}
                  strokeWidth={selectedPlayer ? 3 : 2}
                  dot={{ r: selectedPlayer ? 4 : 3, fill: color }}
                  connectNulls
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-border">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Legenda</span>
        <button
          type="button"
          onClick={() => setSelectedPlayer(null)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            selectedPlayer === null
              ? "bg-neutral text-white ring-2 ring-neutral/50"
              : "bg-surface-elevated text-gray-400 hover:text-white border border-border"
          }`}
        >
          <span className="w-3 h-3 rounded-full bg-neutral shrink-0" aria-hidden />
          Todos
        </button>
        {players.map((player, i) => {
          const color = LINE_COLORS[i % 7];
          const isSelected = selectedPlayer === player;
          return (
            <button
              key={player}
              type="button"
              onClick={() => setSelectedPlayer(isSelected ? null : player)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                isSelected
                  ? "text-white ring-2 ring-offset-2 ring-offset-surface-card"
                  : "bg-surface-elevated text-gray-400 hover:text-white border-border"
              }`}
              style={
                isSelected
                  ? { backgroundColor: color, borderColor: color }
                  : undefined
              }
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: color }}
                aria-hidden
              />
              <span>{player}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
