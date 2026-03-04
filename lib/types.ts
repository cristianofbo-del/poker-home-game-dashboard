export interface SessionRow {
  Data: string;
  Jogador: string;
  "Exposição na sessão": number;
  "Saiu com": number;
  "Lucro ou prejuízo": number;
  "Horas jogadas": number;
  Tilt: number;
  Foco: number;
  Álcool: number;
  Cansaço: number;
}

export interface SessionWithMetrics extends SessionRow {
  bbPerHour: number;
  roiSessao: number;
  reaisPerHour: number;
  isProfit: boolean;
  badgeAlertaTilt: boolean;
  badgeBBAlto: boolean;
}

export interface PlayerAggregates {
  jogador: string;
  lucroTotal: number;
  reaisPerHour: number;
  bbPerHour: number;
  roiMedio: number;
  sessões: number;
  horasTotal: number;
  maiorGanho: number;
  maiorPerda: number;
  exposicaoTotal: number;
}

export interface CorrelationResult {
  coefficient: number;
  label: string;
}

export interface DashboardFilters {
  jogador: string;
  dataInicio: string;
  dataFim: string;
}
