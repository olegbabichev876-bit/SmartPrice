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
    loading, historyLoading,
    activeId, setActiveId,
  } = useTracker();

  // Пока список товаров грузится — спиннер на всю панель
  if (loading) {
    return (
      <div className="pt-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <span className="pt-spin" style={{ width: 28, height: 28, borderWidth: 3 }} />
      </div>
    );
  }

  const store = active ? STORES[active.store] : null;

  // Текущая цена — из загруженной истории или из поля currentPrice
  const displayPrice = stats?.current ?? active?.currentPrice ?? null;

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
        {/* ── список ── */}
        <aside className="pt-list">
          <div className="pt-list-h">
            Отслеживаю · {items.length}
          </div>

          {items.length === 0 ? (
            <div style={{ color: "var(--faint)", fontSize: 13, padding: "12px 2px" }}>
              Добавь первый товар — вставь ссылку выше.
            </div>
          ) : (
            items.map((item, idx) => (
              <ItemCard
                key={item.id}
                item={item}
                index={idx}
                isActive={item.id === activeId}
                onClick={() => setActiveId(item.id)}
              />
            ))
          )}
        </aside>

        {/* ── детальная панель ── */}
        <main className="pt-detail">
          {!active ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--mut)" }}>
              Выбери товар из списка
            </div>
          ) : (
            <>
              <div className="pt-detail-head">
                <div>
                  {store && (
                    <span className="pt-badge" style={{ color: store.c, background: store.bg }}>
                      {store.name}
                    </span>
                  )}
                  <h2>{active.title}</h2>
                  <a className="pt-url" href={`https://${active.url}`} target="_blank" rel="noreferrer">
                    {active.url} ↗
                  </a>
                </div>
                <div className="pt-now">
                  {displayPrice !== null ? (
                    <>
                      <div className="pt-now-price">{fmt(displayPrice)} <i>Br</i></div>
                      {stats && (
                        <div className={`pt-now-delta ${stats.changePct <= 0 ? "down" : "up"}`}>
                          {stats.changePct <= 0 ? "↓" : "↑"} {fmt(Math.abs(stats.current - stats.first))} Br
                          ({Math.abs(stats.changePct).toFixed(1)}%) за период
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="pt-now-price" style={{ color: "var(--faint)" }}>—</div>
                  )}
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
                  {stats && stats.current <= active.target && <b> · достигнута!</b>}
                </div>
              </div>

              {/* График или скелетон */}
              {historyLoading ? (
                <div className="pt-chart" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 250 }}>
                  <span className="pt-spin" style={{ width: 22, height: 22, borderWidth: 2 }} />
                </div>
              ) : view.length > 0 ? (
                <PriceChart data={view} target={active.target} />
              ) : (
                <div className="pt-chart" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 250, color: "var(--faint)", fontSize: 13 }}>
                  Нет данных за выбранный период
                </div>
              )}

              {stats && <PriceSummary stats={stats} />}
              {!historyLoading && <PriceHistory events={history} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
