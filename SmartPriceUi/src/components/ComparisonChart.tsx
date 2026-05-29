import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { STORES } from "../constants/stores";
import type { StoreKey } from "../types/tracker";
import { fmt, fmtDate } from "../utils/priceUtils";

interface ChartRow extends Record<string, number> {
  t: number;
}

interface TipProps {
  active?: boolean;
  payload?: { dataKey: string; value: number; color: string }[];
  label?: number;
}

function ComparisonTooltip({ active, payload, label }: TipProps) {
  if (!active || !payload?.length || !label) return null;
  const sorted = [...payload].sort((a, b) => a.value - b.value);
  return (
    <div className="cmp-tip">
      <div className="cmp-tip-date">
        {new Date(label).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
      </div>
      {sorted.map((p) => (
        <div key={p.dataKey} className="cmp-tip-row">
          <span className="cmp-tip-dot" style={{ background: p.color }} />
          <span className="cmp-tip-name">{STORES[p.dataKey as StoreKey]?.name ?? p.dataKey}</span>
          <span className="cmp-tip-price">{fmt(p.value)} Br</span>
        </div>
      ))}
      {sorted.length > 1 && (
        <div className="cmp-tip-diff">
          экономия: {fmt(sorted[sorted.length - 1].value - sorted[0].value)} Br
        </div>
      )}
    </div>
  );
}

interface Props {
  data: ChartRow[];
}

const STORE_KEYS: StoreKey[] = ["onliner", "21vek", "kufar"];

export default function ComparisonChart({ data }: Props) {
  return (
    <div className="cmp-chart">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#23262a" vertical={false} />
          <XAxis
            dataKey="t"
            tickFormatter={fmtDate}
            stroke="#5c6066"
            tick={{ fontSize: 11, fill: "#7a7f86" }}
            minTickGap={40}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(v) => fmt(v)}
            width={56}
            tick={{ fontSize: 11, fill: "#7a7f86" }}
            tickLine={false}
            axisLine={false}
            domain={["dataMin - 100", "dataMax + 100"]}
          />
          <Tooltip content={<ComparisonTooltip />} cursor={{ stroke: "#3a3e43", strokeDasharray: "4 4" }} />
          <Legend
            formatter={(value) => STORES[value as StoreKey]?.name ?? value}
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
          />
          {STORE_KEYS.map((key) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={STORES[key].c}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: "#0e0f10", strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
