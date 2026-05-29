import type { HistoryEvent } from "../types/tracker";
import { fmt, fmtDate } from "../utils/priceUtils";

interface Props {
  events: HistoryEvent[];
}

export default function PriceHistory({ events }: Props) {
  return (
    <div className="pt-hist">
      <div className="pt-hist-h">История изменений</div>
      {events.length === 0 && (
        <div className="pt-hist-empty">Пока без значимых изменений.</div>
      )}
      {events.map((e, i) => {
        const drop = e.pct < 0;
        return (
          <div
            className="pt-hist-row"
            key={i}
            style={{ animationDelay: `${i * 35}ms` }}
          >
            <span className="pt-hist-dot" style={{ background: drop ? "#5BE39A" : "#FF7A6B" }} />
            <span className="pt-hist-date">{fmtDate(e.t)}</span>
            <span className="pt-hist-move">
              <s>{fmt(e.from)}</s> → <b>{fmt(e.to)} Br</b>
            </span>
            <span className={`pt-hist-pct ${drop ? "down" : "up"}`}>
              {drop ? "−" : "+"}{Math.abs(e.pct).toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
