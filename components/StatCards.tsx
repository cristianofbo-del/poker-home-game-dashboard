"use client";

import type { PlayerAggregates } from "@/lib/types";
import type { SessionWithMetrics } from "@/lib/types";

interface StatCardsProps {
  aggregates: PlayerAggregates[];
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

export default function StatCards({ aggregates, sessions }: StatCardsProps) {
  if (aggregates.length === 0 && sessions.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface-card border border-border rounded-xl p-5 animate-pulse h-28"
          />
        ))}
      </div>
    );
  }

  // Melhor jogador por ROI (médio no período)
  const byRoi = [...aggregates].filter((a) => a.sessões > 0).sort((a, b) => b.roiMedio - a.roiMedio);
  const bestRoi = byRoi[0];

  // Melhor jogador por ganhos (lucro total no período)
  const byGanhos = [...aggregates].sort((a, b) => b.lucroTotal - a.lucroTotal);
  const bestGanhos = byGanhos[0];

  // Maior ganho em 1 dia (uma sessão) no período filtrado
  const sessoesComGanho = sessions.filter((s) => s["Lucro ou prejuízo"] > 0);
  const maiorGanhoUmDia = sessoesComGanho.length
    ? sessoesComGanho.reduce((best, s) =>
        s["Lucro ou prejuízo"] > best["Lucro ou prejuízo"] ? s : best
      )
    : null;

  // Maior perda em 1 dia (uma sessão) no período filtrado
  const sessoesComPerda = sessions.filter((s) => s["Lucro ou prejuízo"] < 0);
  const maiorPerdaUmDia = sessoesComPerda.length
    ? sessoesComPerda.reduce((worst, s) =>
        s["Lucro ou prejuízo"] < worst["Lucro ou prejuízo"] ? s : worst
      )
    : null;

  const cards = [
    {
      title: "Melhor Jogador ROI",
      value: bestRoi?.jogador ?? "—",
      sub: bestRoi != null ? `${bestRoi.roiMedio.toFixed(0)}% ROI` : "—",
      color: "text-profit",
      bg: "bg-profit-muted border-profit/30",
      showLucroPrejuizo: false,
    },
    {
      title: "Melhor Jogador (Lucro/Prejuízo)",
      value: bestGanhos?.jogador ?? "—",
      sub: bestGanhos ? formatMoney(bestGanhos.lucroTotal) : "—",
      color: bestGanhos && bestGanhos.lucroTotal < 0 ? "text-loss" : "text-profit",
      bg: bestGanhos && bestGanhos.lucroTotal < 0 ? "bg-loss-muted border-loss/30" : "bg-profit-muted border-profit/30",
      showLucroPrejuizo: true,
    },
    {
      title: "Maior Ganho (1 dia)",
      value: maiorGanhoUmDia ? maiorGanhoUmDia.Jogador : "—",
      sub: maiorGanhoUmDia ? formatMoney(maiorGanhoUmDia["Lucro ou prejuízo"]) : "—",
      color: "text-profit",
      bg: "bg-profit-muted border-profit/30",
      showLucroPrejuizo: true,
    },
    {
      title: "Maior Perda (1 dia)",
      value: maiorPerdaUmDia ? maiorPerdaUmDia.Jogador : "—",
      sub: maiorPerdaUmDia ? formatMoney(maiorPerdaUmDia["Lucro ou prejuízo"]) : "—",
      color: "text-loss",
      bg: "bg-loss-muted border-loss/30",
      showLucroPrejuizo: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`rounded-xl border p-5 ${card.bg} transition hover:brightness-110`}
        >
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
            {card.title}
          </p>
          <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
          {card.showLucroPrejuizo && (
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
              Lucro/Prejuízo
            </p>
          )}
          <p className={`text-sm mt-0.5 ${card.showLucroPrejuizo ? "font-semibold " + card.color : "text-gray-400"}`}>
            {card.sub}
          </p>
        </div>
      ))}
    </div>
  );
}
