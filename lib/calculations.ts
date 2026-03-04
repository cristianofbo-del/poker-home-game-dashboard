import type { SessionRow, SessionWithMetrics, PlayerAggregates, CorrelationResult } from "./types";

const BB = 2; // Big Blind = R$2

export function parseNumber(val: unknown): number {
  if (typeof val === "number" && !Number.isNaN(val)) return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^\d,.-]/g, "").replace(",", ".");
    const n = parseFloat(cleaned);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

export function parseSessionRow(row: unknown[]): SessionRow | null {
  if (!Array.isArray(row) || row.length < 10) return null;
  const lucro = parseNumber(row[4]);
  const horas = parseNumber(row[5]);
  return {
    Data: String(row[0] ?? "").trim(),
    Jogador: String(row[1] ?? "").trim(),
    "Exposição na sessão": parseNumber(row[2]),
    "Saiu com": parseNumber(row[3]),
    "Lucro ou prejuízo": lucro,
    "Horas jogadas": horas,
    Tilt: Math.min(5, Math.max(0, parseNumber(row[6]))),
    Foco: Math.min(5, Math.max(0, parseNumber(row[7]))),
    Álcool: Math.min(5, Math.max(0, parseNumber(row[8]))),
    Cansaço: Math.min(5, Math.max(0, parseNumber(row[9]))),
  };
}

export function enrichSession(s: SessionRow): SessionWithMetrics {
  const lucro = s["Lucro ou prejuízo"];
  const horas = s["Horas jogadas"];
  const exposicao = s["Exposição na sessão"] || 1;
  const bbPerHour = horas > 0 ? lucro / BB / horas : 0;
  const roiSessao = exposicao > 0 ? (lucro / exposicao) * 100 : 0;
  const reaisPerHour = horas > 0 ? lucro / horas : 0;
  return {
    ...s,
    bbPerHour,
    roiSessao,
    reaisPerHour,
    isProfit: lucro >= 0,
    badgeAlertaTilt: s.Tilt >= 4 && lucro < 0,
    badgeBBAlto: bbPerHour >= 10,
  };
}

export function aggregateByPlayer(sessions: SessionWithMetrics[]): PlayerAggregates[] {
  const map = new Map<string, SessionWithMetrics[]>();
  for (const s of sessions) {
    if (!s.Jogador) continue;
    const list = map.get(s.Jogador) ?? [];
    list.push(s);
    map.set(s.Jogador, list);
  }
  return Array.from(map.entries()).map(([jogador, list]) => {
    const lucroTotal = list.reduce((a, x) => a + x["Lucro ou prejuízo"], 0);
    const horasTotal = list.reduce((a, x) => a + x["Horas jogadas"], 0);
    const exposicaoTotal = list.reduce((a, x) => a + x["Exposição na sessão"], 0);
    // ROI do jogador: lucro total ÷ capital total investido (exposição total)
    const roiMedio = exposicaoTotal > 0 ? (lucroTotal / exposicaoTotal) * 100 : 0;
    const lucros = list.map((x) => x["Lucro ou prejuízo"]);
    return {
      jogador,
      lucroTotal,
      reaisPerHour: horasTotal > 0 ? lucroTotal / horasTotal : 0,
      bbPerHour: horasTotal > 0 ? lucroTotal / BB / horasTotal : 0,
      roiMedio,
      sessões: list.length,
      horasTotal,
      maiorGanho: Math.max(0, ...lucros),
      maiorPerda: Math.min(0, ...lucros),
      exposicaoTotal,
    };
  });
}

export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;
  const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
  const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
  const sumXY = x.slice(0, n).reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.slice(0, n).reduce((a, b) => a + b * b, 0);
  const sumY2 = y.slice(0, n).reduce((a, b) => a + b * b, 0);
  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return den === 0 ? 0 : num / den;
}

export function correlationAlcoholVsResult(sessions: SessionWithMetrics[]): CorrelationResult {
  const x = sessions.map((s) => s.Álcool);
  const y = sessions.map((s) => s["Lucro ou prejuízo"]);
  return { coefficient: pearsonCorrelation(x, y), label: "Álcool x Resultado" };
}

export function correlationTiltVsResult(sessions: SessionWithMetrics[]): CorrelationResult {
  const x = sessions.map((s) => s.Tilt);
  const y = sessions.map((s) => s["Lucro ou prejuízo"]);
  return { coefficient: pearsonCorrelation(x, y), label: "Tilt x Resultado" };
}

export function correlationAlcoholVsBBh(sessions: SessionWithMetrics[]): CorrelationResult {
  const x = sessions.map((s) => s.Álcool);
  const y = sessions.map((s) => s.bbPerHour);
  return { coefficient: pearsonCorrelation(x, y), label: "Álcool x BB/h" };
}

export function filterByDateRange(
  sessions: SessionWithMetrics[],
  dataInicio: string,
  dataFim: string
): SessionWithMetrics[] {
  if (!dataInicio && !dataFim) return sessions;
  const di = dataInicio ? new Date(dataInicio).getTime() : 0;
  const df = dataFim ? new Date(dataFim).getTime() : Number.MAX_SAFE_INTEGER;
  return sessions.filter((s) => {
    const t = new Date(s.Data).getTime();
    return !Number.isNaN(t) && t >= di && t <= df;
  });
}

export function filterByPlayer(
  sessions: SessionWithMetrics[],
  jogador: string
): SessionWithMetrics[] {
  if (!jogador) return sessions;
  return sessions.filter((s) => s.Jogador === jogador);
}
