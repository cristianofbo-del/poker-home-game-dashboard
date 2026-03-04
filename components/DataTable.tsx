"use client";

import { useState, useMemo } from "react";
import type { SessionWithMetrics } from "@/lib/types";

interface DataTableProps {
  sessions: SessionWithMetrics[];
}

type SortKey =
  | "Data"
  | "Jogador"
  | "Exposição na sessão"
  | "Lucro ou prejuízo"
  | "reaisPerHour"
  | "roiSessao"
  | "Horas jogadas";

function formatMoney(n: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(s: string) {
  try {
    return new Date(s).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return s;
  }
}

/** Interpretação curta do resultado da sessão (zero a zero incluído). */
function interpretacao(s: SessionWithMetrics): string {
  const lucro = s["Lucro ou prejuízo"];
  const roi = s.roiSessao;
  if (lucro === 0) return "Zero a zero";
  if (lucro > 0) {
    if (roi >= 50) return "Ótima sessão";
    if (roi >= 20) return "Boa sessão";
    return "Lucro";
  }
  if (roi <= -50) return "Sessão difícil";
  if (roi <= -20) return "Prejuízo relevante";
  return "Prejuízo";
}

export default function DataTable({ sessions }: DataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("Data");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...sessions].sort((a, b) => {
      let va: number | string = (a as Record<string, unknown>)[sortKey] as number | string;
      let vb: number | string = (b as Record<string, unknown>)[sortKey] as number | string;
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [sessions, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const headers: { key: SortKey; label: string }[] = [
    { key: "Data", label: "Data" },
    { key: "Jogador", label: "Jogador" },
    { key: "Exposição na sessão", label: "Exposição" },
    { key: "Lucro ou prejuízo", label: "Lucro" },
    { key: "reaisPerHour", label: "Reais/h" },
    { key: "roiSessao", label: "ROI %" },
    { key: "Horas jogadas", label: "Horas" },
  ];

  return (
    <div className="bg-surface-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-elevated/50">
              {headers.map(({ key, label }) => (
                <th
                  key={key}
                  className="text-left py-3 px-4 font-medium text-gray-400 cursor-pointer hover:text-white select-none"
                  onClick={() => toggleSort(key)}
                >
                  {label} {sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
              ))}
              <th className="text-left py-3 px-4 font-medium text-gray-400">Interpretação</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-border/50 hover:bg-surface-elevated/30 ${
                  row["Lucro ou prejuízo"] > 0
                    ? "bg-profit-muted/20"
                    : row["Lucro ou prejuízo"] < 0
                      ? "bg-loss-muted/20"
                      : "bg-surface-elevated/20"
                }`}
              >
                <td className="py-2 px-4 text-gray-300">{formatDate(row.Data)}</td>
                <td className="py-2 px-4 font-medium">{row.Jogador}</td>
                <td className="py-2 px-4 text-gray-300">
                  {formatMoney(row["Exposição na sessão"])}
                </td>
                <td
                  className={`py-2 px-4 font-semibold ${
                    row["Lucro ou prejuízo"] > 0
                      ? "text-profit"
                      : row["Lucro ou prejuízo"] < 0
                        ? "text-loss"
                        : "text-gray-400"
                  }`}
                >
                  {formatMoney(row["Lucro ou prejuízo"])}
                </td>
                <td className="py-2 px-4">
                  <span
                    className={
                      row.reaisPerHour > 0
                        ? "text-profit"
                        : row.reaisPerHour < 0
                          ? "text-loss"
                          : "text-gray-400"
                    }
                  >
                    {formatMoney(row.reaisPerHour)}/h
                  </span>
                </td>
                <td className="py-2 px-4 text-gray-300">{row.roiSessao.toFixed(1)}%</td>
                <td className="py-2 px-4 text-gray-300">{row["Horas jogadas"].toFixed(1)}h</td>
                <td className="py-2 px-4 text-gray-300 italic">
                  {interpretacao(row)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
