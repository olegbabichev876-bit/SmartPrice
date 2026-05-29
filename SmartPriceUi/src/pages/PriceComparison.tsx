import { RANGE_OPTIONS } from "../constants/stores";
import { useComparison } from "../hooks/useComparison";
import { fmt, fmtDate } from "../utils/priceUtils";
import ComparisonChart from "../components/ComparisonChart";

export default function PriceComparison() {
  const { product, chartData, snapshots, savings, savingsVerdict, range, setRange } = useComparison();

  return (
    <div className="pt-root">
      <div className="cmp-header">
        <div>
          <h2 className="cmp-title">{product.title}</h2>
          <div className="cmp-sub">{product.sub} · сравнение цен по магазинам</div>
        </div>
        <div className="pt-ranges" style={{ marginTop: 0 }}>
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r.k}
              className={range === r.k ? "on" : ""}
              onClick={() => setRange(r.k)}
            >
              {r.l}
            </button>
          ))}
        </div>
      </div>

      {/* карточки магазинов */}
      <div className="cmp-cards">
        {snapshots
          .slice()
          .sort((a, b) => a.current - b.current)
          .map((s, i) => {
            const isCheapest = i === 0;
            const drop = s.changePct <= 0;
            return (
              <div
                key={s.store}
                className={`cmp-card ${isCheapest ? "cheapest" : ""}`}
                style={{ borderColor: isCheapest ? s.color : undefined }}
              >
                {isCheapest && <div className="cmp-best-tag">Выгоднее всего</div>}
                <div className="cmp-card-top">
                  <span className="pt-badge" style={{ color: s.color, background: s.bg }}>{s.name}</span>
                  <span className={`pt-delta ${drop ? "down" : "up"}`}>
                    {drop ? "▼" : "▲"} {Math.abs(s.changePct).toFixed(1)}%
                  </span>
                </div>
                <div className="cmp-price">{fmt(s.current)} <i>Br</i></div>
                <div className="cmp-range-row">
                  <span className="cmp-range-label">мин</span>
                  <span className="cmp-range-val green">{fmt(s.min)}</span>
                  <span className="cmp-range-sep" />
                  <span className="cmp-range-label">макс</span>
                  <span className="cmp-range-val">{fmt(s.max)}</span>
                </div>
                <a className="pt-url" href="#">{s.url} ↗</a>
              </div>
            );
          })}
      </div>

      {/* экономия */}
      <div className="cmp-savings">
        <div className="cmp-savings-main">
          <div className="cmp-savings-label">Экономия прямо сейчас</div>
          <div className="cmp-savings-value">{fmt(savings.savingsNow)} <i>Br</i></div>
          <div className="cmp-savings-pct">
            {savings.cheapest.name} дешевле {savings.priciest.name} на {savings.savingsPct.toFixed(1)}%
          </div>
        </div>
        <div className="cmp-savings-hist">
          <div className="cmp-savings-label">Макс. разрыв за период</div>
          <div className="cmp-savings-value accent">{fmt(savings.maxHistoricSavings)} <i>Br</i></div>
          <div className="cmp-savings-pct">был {fmtDate(savings.maxHistoricDate)}</div>
        </div>
        <div className="cmp-verdict">{savingsVerdict}</div>
      </div>

      {/* график */}
      <ComparisonChart data={chartData} />
    </div>
  );
}
