import { STORES } from "../constants/stores";
import type { TrackedItem } from "../types/tracker";
import { calcStats, fmt } from "../utils/priceUtils";
import Sparkline from "./Sparkline";

interface Props {
  item: TrackedItem;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

export default function ItemCard({ item, index, isActive, onClick }: Props) {
  const store = STORES[item.store];
  const hasHistory = item.series.length > 1;

  // Use real stats if series loaded, otherwise fall back to currentPrice from API
  const currentPrice = hasHistory
    ? calcStats(item.series).current
    : (item.currentPrice ?? 0);

  const changePct = hasHistory ? calcStats(item.series).changePct : 0;
  const drop = changePct <= 0;

  return (
    <button
      className={`pt-card ${isActive ? "on" : ""}`}
      style={{ animationDelay: `${index * 55}ms` }}
      onClick={onClick}
    >
      <div className="pt-card-top">
        <span className="pt-badge" style={{ color: store.c, background: store.bg }}>
          {store.name}
        </span>
        {hasHistory && (
          <span className={`pt-delta ${drop ? "down" : "up"}`}>
            {drop ? "▼" : "▲"} {Math.abs(changePct).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="pt-card-title">{item.title}</div>
      <div className="pt-card-bottom">
        <span className="pt-price-sm">
          {currentPrice ? <>{fmt(currentPrice)} <i>Br</i></> : <span style={{ color: "var(--faint)" }}>—</span>}
        </span>
        {hasHistory && (
          <Sparkline series={item.series} color={drop ? "#5BE39A" : "#FF7A6B"} />
        )}
      </div>
    </button>
  );
}
