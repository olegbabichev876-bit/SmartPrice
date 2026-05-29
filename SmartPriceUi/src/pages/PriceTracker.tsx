import { RANGE_OPTIONS, STORES } from "../constants/stores";
import { useTracker } from "../hooks/useTracker";
import { fmt } from "../utils/priceUtils";
import ItemCard from "../components/ItemCard";
import ParseBanner from "../components/ParseBanner";
import PriceChart from "../components/PriceChart";
import PriceHistory from "../components/PriceHistory";
import PriceSummary from "../components/PriceSummary";

export default function PriceTracker() {
  const {
    items, active, view, stats, history,
    range, setRange,
    link, setLink,
    parse, track,
    activeId, setActiveId,
  } = useTracker();

  const store = STORES[active.store];

  return (
    <div className="pt-root">
      <header className="pt-head">
        <div className="pt-brand">
          <div className="pt-logo">↓</div>
          <div>
            <div className="pt-name">Smart<span>Price</span></div>
            <div className="pt-tag">трекер цен · Беларусь</div>
          </div>
        </div>
        <div className={`pt-add ${parse ? "busy" : ""}`}>
          <span className="pt-add-icon">⌕</span>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && track()}
            placeholder="Вставь ссылку на товар: onliner.by / 21vek.by / kufar.by"
          />
          <button onClick={track} disabled={!!parse}>Отслеживать</button>
        </div>
      </header>

      {parse && <ParseBanner state={parse} />}

      <div className="pt-grid">
        <aside className="pt-list">
          <div className="pt-list-h">Отслеживаю · {items.length}</div>
          {items.map((item, idx) => (
            <ItemCard
              key={item.id}
              item={item}
              index={idx}
              isActive={item.id === activeId}
              onClick={() => setActiveId(item.id)}
            />
          ))}
        </aside>

        <main className="pt-detail">
          <div className="pt-detail-head">
            <div>
              <span className="pt-badge" style={{ color: store.c, background: store.bg }}>
                {store.name}
              </span>
              <h2>{active.title}</h2>
              <a className="pt-url" href="#">{active.url} ↗</a>
            </div>
            <div className="pt-now">
              <div className="pt-now-price">{fmt(stats.current)} <i>Br</i></div>
              <div className={`pt-now-delta ${stats.changePct <= 0 ? "down" : "up"}`}>
                {stats.changePct <= 0 ? "↓" : "↑"} {fmt(Math.abs(stats.current - stats.first))} Br
                ({Math.abs(stats.changePct).toFixed(1)}%) за период
              </div>
            </div>
          </div>

          <div className="pt-ranges">
            {RANGE_OPTIONS.map((r) => (
              <button
                key={r.k}
                className={range === r.k ? "on" : ""}
                onClick={() => setRange(r.k)}
              >
                {r.l}
              </button>
            ))}
            <div className="pt-target-pill" style={{ marginLeft: "auto" }}>
              цель: {fmt(active.target)} Br
              {stats.current <= active.target && <b> · достигнута!</b>}
            </div>
          </div>

          <PriceChart data={view} target={active.target} />
          <PriceSummary stats={stats} />
          <PriceHistory events={history} />
        </main>
      </div>
    </div>
  );
}
