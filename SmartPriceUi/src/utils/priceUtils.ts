import type { HistoryEvent, PricePoint, PriceStats } from "../types/tracker";
import { DAY } from "../constants/stores";

export const fmt = (n: number): string =>
  Math.round(n).toLocaleString("ru-RU");

export const fmtDate = (t: number): string =>
  new Date(t).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });

export function makeSeries(seed: number, start: number, days: number): PricePoint[] {
  let s = seed >>> 0;
  const rng = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  const out: PricePoint[] = [];
  let price = start;
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    if (rng() < 0.07)       price *= 1 - (0.03 + rng() * 0.09);
    else if (rng() < 0.04)  price *= 1 + (0.02 + rng() * 0.05);
    else                    price += (rng() - 0.5) * start * 0.008;
    price = Math.min(Math.max(price, start * 0.62), start * 1.08);
    out.push({ t: now - i * DAY, price: Math.round(price / 10) * 10 });
  }
  return out;
}

export function calcStats(series: PricePoint[]): PriceStats {
  const prices = series.map((d) => d.price);
  const current = prices[prices.length - 1];
  const first = prices[0];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const minDate = series.find((d) => d.price === min)!.t;
  const changePct = ((current - first) / first) * 100;
  const daysSinceMin = Math.round((Date.now() - minDate) / DAY);
  return { current, first, min, max, minDate, daysSinceMin, changePct, nearMin: current <= min * 1.03 };
}

export function calcHistory(series: PricePoint[]): HistoryEvent[] {
  const events: HistoryEvent[] = [];
  for (let i = 1; i < series.length; i++) {
    const a = series[i - 1].price, b = series[i].price;
    if (Math.abs(b - a) / a > 0.012) {
      events.push({ t: series[i].t, from: a, to: b, pct: ((b - a) / a) * 100 });
    }
  }
  return events.reverse().slice(0, 9);
}
