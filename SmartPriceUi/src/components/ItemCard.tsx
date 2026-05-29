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
  const s = calcStats(item.series);
  const store = STORES[item.store];
  const drop = s.changePct <= 0;

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
        <span className={`pt-delta ${drop ? "down" : "up"}`}>
          {drop ? "▼" : "▲"} {Math.abs(s.changePct).toFixed(1)}%
        </span>
      </div>
      <div className="pt-card-title">{item.title}</div>
      <div className="pt-card-bottom">
        <span className="pt-price-sm">
          {fmt(s.current)} <i>Br</i>
        </span>
        <Sparkline series={item.series} color={drop ? "#5BE39A" : "#FF7A6B"} />
      </div>
    </button>
  );
}
