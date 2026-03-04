"use client";

import { useMemo } from "react";
import type { SessionWithMetrics } from "@/lib/types";

interface SessionFactorsProps {
  sessions: SessionWithMetrics[];
}

const SCALE_MAX = 5;

function formatMoney(n: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

/** Barra 0–5: para Foco, alto = verde (bom); para Tilt/Álcool/Cansaço, alto = vermelho (ruim) */
function FactorBar({
  value,
  invert = false,
  label,
  icon,
}: {
  value: number;
  invert?: boolean;
  label: string;
  icon: string;
}) {
  const pct = Math.min(100, (value / SCALE_MAX) * 100);
  const isGood = invert ? value <= 2 : value >= 4;
  const isMid = invert ? value <= 4 : value >= 2;
  const barColor = isGood ? "bg-profit" : isMid ? "bg-amber-500" : "bg-loss";
  return (
    <div className="rounded-xl bg-surface-elevated/80 border border-border p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl" aria-hidden>{icon}</span>
        <span className="text-sm font-medium text-gray-300">{label}</span>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-bold text-white">{value.toFixed(1)}</span>
        <span className="text-xs text-gray-500">/ 5</span>
      </div>
      <div className="w-full h-3 bg-surface rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500 rounded-full`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-gray-500">
        <span>0</span>
        <span>5</span>
      </div>
    </div>
  );
}

export default function SessionFactors({ sessions }: SessionFactorsProps) {
  const { averages, byPlayer, insights } = useMemo(() => {
    if (sessions.length === 0) {
      return {
        averages: { Tilt: 0, Foco: 0, Álcool: 0, Cansaço: 0 },
        byPlayer: [] as { jogador: string; Tilt: number; Foco: number; Álcool: number; Cansaço: number }[],
        insights: [] as string[],
      };
    }

    const sum = { Tilt: 0, Foco: 0, Álcool: 0, Cansaço: 0 };
    sessions.forEach((s) => {
      sum.Tilt += s.Tilt;
      sum.Foco += s.Foco;
      sum.Álcool += s.Álcool;
      sum.Cansaço += s.Cansaço;
    });
    const n = sessions.length;
    const averages = {
      Tilt: sum.Tilt / n,
      Foco: sum.Foco / n,
      Álcool: sum.Álcool / n,
      Cansaço: sum.Cansaço / n,
    };

    const playerMap = new Map<
      string,
      { Tilt: number[]; Foco: number[]; Álcool: number[]; Cansaço: number[] }
    >();
    sessions.forEach((s) => {
      if (!s.Jogador) return;
      const o = playerMap.get(s.Jogador) ?? {
        Tilt: [],
        Foco: [],
        Álcool: [],
        Cansaço: [],
      };
      o.Tilt.push(s.Tilt);
      o.Foco.push(s.Foco);
      o.Álcool.push(s.Álcool);
      o.Cansaço.push(s.Cansaço);
      playerMap.set(s.Jogador, o);
    });
    const byPlayer = Array.from(playerMap.entries()).map(([jogador, o]) => ({
      jogador,
      Tilt: o.Tilt.reduce((a, b) => a + b, 0) / o.Tilt.length,
      Foco: o.Foco.reduce((a, b) => a + b, 0) / o.Foco.length,
      Álcool: o.Álcool.reduce((a, b) => a + b, 0) / o.Álcool.length,
      Cansaço: o.Cansaço.reduce((a, b) => a + b, 0) / o.Cansaço.length,
    }));

    const lucrativas = sessions.filter((s) => s["Lucro ou prejuízo"] > 0);
    const prejuizo = sessions.filter((s) => s["Lucro ou prejuízo"] < 0);
    const altoFoco = sessions.filter((s) => s.Foco >= 4);
    const altoTilt = sessions.filter((s) => s.Tilt >= 4);
    const alcoolBaixo = sessions.filter((s) => s.Álcool <= 1);
    const cansacoAlto = sessions.filter((s) => s.Cansaço >= 4);

    const insightsList: string[] = [];

    if (lucrativas.length > 0 && prejuizo.length > 0) {
      const focoLucro =
        lucrativas.reduce((a, s) => a + s.Foco, 0) / lucrativas.length;
      const focoPrej =
        prejuizo.reduce((a, s) => a + s.Foco, 0) / prejuizo.length;
      insightsList.push(
        `Nas sessões lucrativas o Foco médio foi ${focoLucro.toFixed(1)}/5; nas com prejuízo, ${focoPrej.toFixed(1)}/5.`
      );
    }
    if (altoFoco.length >= 2) {
      const reaisHMedio =
        altoFoco.reduce((a, s) => a + s.reaisPerHour, 0) / altoFoco.length;
      insightsList.push(
        `Quando o Foco foi 4 ou mais (${altoFoco.length} sessões), o Reais/h médio foi ${formatMoney(reaisHMedio)}/h.`
      );
    }
    if (altoTilt.length >= 1) {
      const lucroMedioTilt =
        altoTilt.reduce((a, s) => a + s["Lucro ou prejuízo"], 0) / altoTilt.length;
      insightsList.push(
        `Nas ${altoTilt.length} sessão(ões) com Tilt alto (4–5), o lucro médio foi ${formatMoney(lucroMedioTilt)}.`
      );
    }
    if (alcoolBaixo.length >= 2 && sessions.length >= 2) {
      const lucroAlcoolBaixo =
        alcoolBaixo.reduce((a, s) => a + s["Lucro ou prejuízo"], 0) / alcoolBaixo.length;
      insightsList.push(
        `Com Álcool 0–1 (${alcoolBaixo.length} sessões), lucro médio de ${formatMoney(lucroAlcoolBaixo)}.`
      );
    }
    if (cansacoAlto.length >= 1) {
      const reaisHCansaco =
        cansacoAlto.reduce((a, s) => a + s.reaisPerHour, 0) / cansacoAlto.length;
      insightsList.push(
        `Em sessões com Cansaço 4+ (${cansacoAlto.length}), Reais/h médio de ${formatMoney(reaisHCansaco)}/h.`
      );
    }
    if (insightsList.length === 0 && sessions.length > 0) {
      insightsList.push(
        "Acumule mais sessões para ver insights sobre Foco, Tilt, Álcool e Cansaço."
      );
    }

    return { averages, byPlayer, insights: insightsList };
  }, [sessions]);

  if (sessions.length === 0) return null;

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <span aria-hidden>📊</span>
        Fatores da sessão — Tilt, Foco, Álcool e Cansaço
      </h2>

      {/* Médias gerais em 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FactorBar
          value={averages.Tilt}
          invert
          label="Tilt"
          icon="😤"
        />
        <FactorBar
          value={averages.Foco}
          label="Foco"
          icon="🎯"
        />
        <FactorBar
          value={averages.Álcool}
          invert
          label="Álcool"
          icon="🍺"
        />
        <FactorBar
          value={averages.Cansaço}
          invert
          label="Cansaço"
          icon="😴"
        />
      </div>

      {/* Por jogador: mini radares ou barras */}
      {byPlayer.length > 0 && (
        <div className="rounded-xl bg-surface-card border border-border p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Média por jogador (0–5)</h3>
          <div className="overflow-x-auto">
            <div className="flex flex-wrap gap-4 min-w-0">
              {byPlayer.map((p) => (
                <div
                  key={p.jogador}
                  className="flex flex-col gap-1 rounded-lg bg-surface-elevated/60 border border-border/50 p-3 min-w-[140px]"
                >
                  <span className="text-sm font-medium text-white truncate">{p.jogador}</span>
                  <div className="grid grid-cols-4 gap-1 text-center">
                    <div title="Tilt" className="text-[10px] text-gray-500">T</div>
                    <div title="Foco" className="text-[10px] text-gray-500">F</div>
                    <div title="Álcool" className="text-[10px] text-gray-500">A</div>
                    <div title="Cansaço" className="text-[10px] text-gray-500">C</div>
                    <div
                      className={`text-xs font-medium ${p.Tilt >= 4 ? "text-loss" : p.Tilt <= 1 ? "text-profit" : "text-amber-400"}`}
                    >
                      {p.Tilt.toFixed(1)}
                    </div>
                    <div
                      className={`text-xs font-medium ${p.Foco >= 4 ? "text-profit" : p.Foco <= 1 ? "text-amber-400" : "text-gray-400"}`}
                    >
                      {p.Foco.toFixed(1)}
                    </div>
                    <div
                      className={`text-xs font-medium ${p.Álcool >= 4 ? "text-amber-400" : p.Álcool <= 1 ? "text-profit" : "text-gray-400"}`}
                    >
                      {p.Álcool.toFixed(1)}
                    </div>
                    <div
                      className={`text-xs font-medium ${p.Cansaço >= 4 ? "text-amber-400" : p.Cansaço <= 1 ? "text-profit" : "text-gray-400"}`}
                    >
                      {p.Cansaço.toFixed(1)}
                    </div>
                  </div>
                  <div className="flex gap-0.5 mt-1">
                    {[p.Tilt, p.Foco, p.Álcool, p.Cansaço].map((v, i) => (
                      <div
                        key={i}
                        className="h-1.5 flex-1 rounded-full bg-surface overflow-hidden"
                        title={["Tilt", "Foco", "Álcool", "Cansaço"][i]}
                      >
                        <div
                          className="h-full rounded-full bg-neutral/80"
                          style={{ width: `${(v / 5) * 100}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="rounded-xl bg-gradient-to-br from-neutral/10 to-transparent border border-neutral/20 p-5">
        <h3 className="text-sm font-medium text-neutral flex items-center gap-2 mb-3">
          <span aria-hidden>💡</span>
          Insights
        </h3>
        <ul className="space-y-2">
          {insights.map((text, i) => (
            <li key={i} className="text-sm text-gray-300 flex gap-2">
              <span className="text-neutral shrink-0">•</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
