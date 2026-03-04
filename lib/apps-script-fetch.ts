import { parseSessionRow } from "./calculations";
import type { SessionRow } from "./types";

/**
 * Busca os dados da planilha via Apps Script (Web App).
 * Não precisa de conta de serviço: só colar o script na planilha e implantar.
 */
export async function getSheetDataFromAppsScript(): Promise<SessionRow[]> {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url || !url.trim()) {
    throw new Error(
      "APPS_SCRIPT_URL não está definido. Siga o PASSO-A-PASSO.md: cole o código na planilha, implante como Aplicativo da Web e cole a URL no .env"
    );
  }

  const res = await fetch(url.trim(), { cache: "no-store" });
  const json = (await res.json()) as { rows?: unknown[]; error?: string };

  if (!res.ok) {
    throw new Error(json.error || `Erro ao buscar planilha: ${res.status}`);
  }

  const rows = Array.isArray(json.rows) ? json.rows : [];
  const sessions: SessionRow[] = [];

  for (const row of rows) {
    const parsed = parseSessionRow(row);
    if (parsed && parsed.Data && parsed.Jogador) {
      sessions.push(parsed);
    }
  }

  return sessions;
}
