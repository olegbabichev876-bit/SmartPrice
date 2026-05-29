import type { TooltipProps } from "recharts";
import type { PricePoint } from "../types/tracker";
import { fmt } from "../utils/priceUtils";

type Props = TooltipProps<number, string>;

export default function ChartTooltip({ active, payload }: Props) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as PricePoint;
  return (
    <div className="pt-tip">
      <div className="pt-tip-date">
        {new Date(d.t).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
      </div>
      <div className="pt-tip-price">
        {fmt(d.price)} <span>Br</span>
      </div>
    </div>
  );
}
