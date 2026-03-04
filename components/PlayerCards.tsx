"use client";

import { useMemo } from "react";
import type { SessionWithMetrics } from "@/lib/types";
import type { PlayerAggregates } from "@/lib/types";

interface PlayerCardsProps {
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

/** Iniciais (2 letras) para avatar quando não há foto */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

/** Cor de fundo do avatar baseada no nome (consistente por jogador) */
function getAvatarColor(name: string): string {
  const colors = [
    "from-violet-600 to-purple-700",
    "from-cyan-600 to-blue-700",
    "from-emerald-600 to-teal-700",
    "from-amber-600 to-orange-600",
    "from-rose-600 to-pink-600",
    "from-indigo-600 to-blue-700",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h << 5) - h + name.charCodeAt(i);
  const idx = Math.abs(h) % colors.length;
  return colors[idx];
}

export default function PlayerCards({ aggregates, sessions }: PlayerCardsProps) {
  const byPlayerFactors = useMemo(() => {
    const byPlayer = new Map<
      string,
      { Tilt: number; Foco: number; Álcool: number; Cansaço: number; n: number }
    >();
    sessions.forEach((s) => {
      if (!s.Jogador) return;
      const o = byPlayer.get(s.Jogador) ?? {
        Tilt: 0,
        Foco: 0,
        Álcool: 0,
        Cansaço: 0,
        n: 0,
      };
      o.Tilt += s.Tilt;
      o.Foco += s.Foco;
      o.Álcool += s.Álcool;
      o.Cansaço += s.Cansaço;
      o.n += 1;
      byPlayer.set(s.Jogador, o);
    });
    const result = new Map<
      string,
      { Tilt: number; Foco: number; Álcool: number; Cansaço: number }
    >();
    byPlayer.forEach((o, jogador) => {
      const n = o.n || 1;
      result.set(jogador, {
        Tilt: o.Tilt / n,
        Foco: o.Foco / n,
        Álcool: o.Álcool / n,
        Cansaço: o.Cansaço / n,
      });
    });
    return result;
  }, [sessions]);

  if (aggregates.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <span aria-hidden>👤</span>
        Consolidado por jogador
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {aggregates.map((a) => {
          const factors = byPlayerFactors.get(a.jogador);
          const isProfit = a.lucroTotal >= 0;
          return (
            <div
              key={a.jogador}
              className={`rounded-xl border overflow-hidden ${
                isProfit
                  ? "bg-surface-card border-profit/20"
                  : "bg-surface-card border-loss/20"
              }`}
            >
              {/* Top: avatar + nome */}
              <div className="p-4 flex items-center gap-3 border-b border-border">
                <div
                  className={`w-14 h-14 rounded-full bg-gradient-to-br ${getAvatarColor(a.jogador)} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg`}
                  aria-hidden
                >
                  {getInitials(a.jogador)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{a.jogador}</p>
                  <p className="text-xs text-gray-500">
                    {a.sessões} {a.sessões === 1 ? "sessão" : "sessões"}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Exposição</p>
                    <p className="text-gray-200 font-medium">
                      {formatMoney(a.exposicaoTotal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Lucro/Prejuízo</p>
                    <p
                      className={`font-semibold ${
                        isProfit ? "text-profit" : "text-loss"
                      }`}
                    >
                      {formatMoney(a.lucroTotal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">ROI médio</p>
                    <p
                      className={`font-medium ${
                        a.roiMedio >= 0 ? "text-profit" : "text-loss"
                      }`}
                    >
                      {a.roiMedio.toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Horas</p>
                    <p className="text-gray-200 font-medium">
                      {a.horasTotal.toFixed(1)}h
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs">Reais/h</p>
                    <p
                      className={`font-semibold ${
                        a.reaisPerHour >= 0 ? "text-profit" : "text-loss"
                      }`}
                    >
                      {formatMoney(a.reaisPerHour)}/h
                    </p>
                  </div>
                </div>

                {/* Média 0–5: Tilt, Foco, Álcool, Cansaço */}
                {factors && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                      Média nas sessões (0–5)
                    </p>
                    <div className="flex gap-3">
                      {[
                        { label: "Tilt", value: factors.Tilt, icon: "😤" },
                        { label: "Foco", value: factors.Foco, icon: "🎯" },
                        { label: "Álcool", value: factors.Álcool, icon: "🍺" },
                        { label: "Cansaço", value: factors.Cansaço, icon: "😴" },
                      ].map(({ label, value, icon }) => (
                        <div
                          key={label}
                          className="flex-1 flex flex-col items-center gap-0.5"
                        >
                          <span className="text-xs" aria-hidden>
                            {icon}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {label}
                          </span>
                          <span className="text-xs font-medium text-white">
                            {value.toFixed(1)}
                          </span>
                          <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
                            <div
                              className="h-full bg-neutral rounded-full"
                              style={{ width: `${(value / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
