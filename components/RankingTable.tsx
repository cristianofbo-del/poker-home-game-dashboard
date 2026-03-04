"use client";

import type { PlayerAggregates } from "@/lib/types";

interface RankingTableProps {
  aggregates: PlayerAggregates[];
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function RankingTable({ aggregates }: RankingTableProps) {
  const byReaisH = [...aggregates].sort((a, b) => b.reaisPerHour - a.reaisPerHour);
  const byLucro = [...aggregates].sort((a, b) => b.lucroTotal - a.lucroTotal);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-surface-card border border-border rounded-xl overflow-hidden">
        <h3 className="text-sm font-semibold text-gray-300 p-4 border-b border-border">
          Ranking por Reais/h
        </h3>
        <ul className="divide-y divide-border">
          {byReaisH.map((a, i) => (
            <li
              key={a.jogador}
              className="flex justify-between items-center px-4 py-2 text-sm"
            >
              <span className="text-gray-400">
                #{i + 1} <span className="text-white font-medium">{a.jogador}</span>
              </span>
              <span
                className={
                  a.reaisPerHour >= 0 ? "text-profit font-medium" : "text-loss font-medium"
                }
              >
                {formatMoney(a.reaisPerHour)}/h
              </span>
            </li>
          ))}
          {byReaisH.length === 0 && (
            <li className="px-4 py-6 text-gray-500 text-sm">Nenhum dado no período.</li>
          )}
        </ul>
      </div>
      <div className="bg-surface-card border border-border rounded-xl overflow-hidden">
        <h3 className="text-sm font-semibold text-gray-300 p-4 border-b border-border">
          Ranking por lucro acumulado
        </h3>
        <ul className="divide-y divide-border">
          {byLucro.map((a, i) => (
            <li
              key={a.jogador}
              className="flex justify-between items-center px-4 py-2 text-sm"
            >
              <span className="text-gray-400">
                #{i + 1} <span className="text-white font-medium">{a.jogador}</span>
              </span>
              <span
                className={
                  a.lucroTotal >= 0 ? "text-profit font-medium" : "text-loss font-medium"
                }
              >
                {formatMoney(a.lucroTotal)}
              </span>
            </li>
          ))}
          {byLucro.length === 0 && (
            <li className="px-4 py-6 text-gray-500 text-sm">Nenhum dado no período.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
