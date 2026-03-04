"use client";

interface CorrItem {
  label: string;
  coefficient: number;
}

interface CorrelationCardsProps {
  alcoholResult: number;
  tiltResult: number;
  alcoholBBh: number;
}

function formatCorr(c: number) {
  const p = (c * 100).toFixed(1);
  return `${Number(p) >= 0 ? "+" : ""}${p}%`;
}

export default function CorrelationCards({
  alcoholResult,
  tiltResult,
  alcoholBBh,
}: CorrelationCardsProps) {
  const items: CorrItem[] = [
    { label: "Álcool x Resultado", coefficient: alcoholResult },
    { label: "Tilt x Resultado", coefficient: tiltResult },
    { label: "Álcool x Reais/h", coefficient: alcoholBBh },
  ];

  return (
    <div className="bg-surface-card border border-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Correlações (Pearson)</h3>
      <div className="space-y-2">
        {items.map((item, i) => {
          const c = item.coefficient;
          const color =
            c > 0.3 ? "text-profit" : c < -0.3 ? "text-loss" : "text-gray-400";
          return (
            <div
              key={i}
              className="flex justify-between items-center py-1 border-b border-border/50 last:border-0"
            >
              <span className="text-sm text-gray-400">{item.label}</span>
              <span className={`text-sm font-medium ${color}`}>
                {formatCorr(c)}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-gray-500 mt-2">
        Valores próximos de ±100% indicam forte correlação positiva/negativa.
      </p>
    </div>
  );
}
