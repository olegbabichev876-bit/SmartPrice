import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid,
} from "recharts";
import type { PricePoint } from "../types/tracker";
import { fmt, fmtDate } from "../utils/priceUtils";
import ChartTooltip from "./ChartTooltip";

interface Props {
  data: PricePoint[];
  target: number;
}

export default function PriceChart({ data, target }: Props) {
  return (
    <div className="pt-chart">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#5BE39A" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#5BE39A" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            stroke="#5c6066"
            width={52}
            tick={{ fontSize: 11, fill: "#7a7f86" }}
            tickLine={false}
            axisLine={false}
            domain={["dataMin - 80", "dataMax + 80"]}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "#3a3e43", strokeDasharray: "4 4" }}
          />
          <ReferenceLine
            y={target}
            stroke="#FFC93D"
            strokeDasharray="5 5"
            label={{ value: "цель", fill: "#FFC93D", fontSize: 11, position: "insideTopLeft" }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#5BE39A"
            strokeWidth={2.2}
            fill="url(#fill)"
            dot={false}
            activeDot={{ r: 4, fill: "#5BE39A", stroke: "#0e0f10", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
