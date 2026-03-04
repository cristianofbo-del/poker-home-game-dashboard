"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { PlayerAggregates } from "@/lib/types";

interface BBhBarChartProps {
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

export default function BBhBarChart({ aggregates }: BBhBarChartProps) {
  const data = aggregates
    .map((a) => ({ jogador: a.jogador, reaisPerHour: a.reaisPerHour }))
    .sort((a, b) => b.reaisPerHour - a.reaisPerHour);

  return (
    <div className="bg-surface-card border border-border rounded-xl p-4 h-[280px]">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Reais/h por jogador</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} layout="vertical" margin={{ left: 60, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4f" horizontal={false} />
          <XAxis
            type="number"
            stroke="#6b7280"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `${formatMoney(v)}/h`}
          />
          <YAxis
            type="category"
            dataKey="jogador"
            stroke="#6b7280"
            tick={{ fontSize: 11 }}
            width={55}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a2332",
              border: "1px solid #2d3a4f",
              borderRadius: "8px",
            }}
            formatter={(value: number) => [`${formatMoney(value)}/h`, "Reais/h"]}
          />
          <ReferenceLine x={0} stroke="#6b7280" />
          <Bar
            dataKey="reaisPerHour"
            fill="#3b82f6"
            radius={[0, 4, 4, 0]}
            name="Reais/h"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
