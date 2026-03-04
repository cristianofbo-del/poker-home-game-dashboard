import { NextRequest } from "next/server";
import { getSheetDataFromAppsScript } from "@/lib/apps-script-fetch";
import {
  enrichSession,
  filterByDateRange,
  filterByPlayer,
  aggregateByPlayer,
  correlationAlcoholVsResult,
  correlationTiltVsResult,
  correlationAlcoholVsBBh,
} from "@/lib/calculations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const raw = await getSheetDataFromAppsScript();
    const enriched = raw.map(enrichSession);

    const { searchParams } = new URL(request.url);
    const jogador = searchParams.get("jogador") ?? "";
    const dataInicio = searchParams.get("dataInicio") ?? "";
    const dataFim = searchParams.get("dataFim") ?? "";

    let filtered = filterByDateRange(enriched, dataInicio, dataFim);
    filtered = filterByPlayer(filtered, jogador);

    const aggregates = aggregateByPlayer(filtered);
    const corrAlcohol = correlationAlcoholVsResult(filtered);
    const corrTilt = correlationTiltVsResult(filtered);
    const corrAlcoholBBh = correlationAlcoholVsBBh(filtered);

    return Response.json({
      sessions: filtered,
      aggregates,
      correlations: {
        alcoholResult: corrAlcohol,
        tiltResult: corrTilt,
        alcoholBBh: corrAlcoholBBh,
      },
    });
  } catch (err) {
    console.error("API sessions error:", err);
    return Response.json(
      {
        error: err instanceof Error ? err.message : "Erro ao carregar sessões",
        sessions: [],
        aggregates: [],
        correlations: {},
      },
      { status: 500 }
    );
  }
}
