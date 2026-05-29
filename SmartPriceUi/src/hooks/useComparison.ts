import { useMemo, useState } from "react";
import { DAY, STORES } from "../constants/stores";
import { COMPARISON_PRODUCTS } from "../data/comparisonData";
import { fmt } from "../utils/priceUtils";

export interface StoreSnapshot {
  store: string;
  name: string;
  color: string;
  bg: string;
  current: number;
  min: number;
  max: number;
  changePct: number;
  url: string;
}

export interface SavingsSummary {
  cheapest: StoreSnapshot;
  priciest: StoreSnapshot;
  savingsNow: number;
  savingsPct: number;
  maxHistoricSavings: number;
  maxHistoricDate: number;
}

export function useComparison() {
  const product = COMPARISON_PRODUCTS[0];
  const [range, setRange] = useState(90);

  const chartData = useMemo(() => {
    const cutoff = Date.now() - range * DAY;
    const byStore = product.stores.map((s) => ({
      key: s.store,
      points: s.series.filter((p) => p.t >= cutoff),
    }));

    // выровнять по временной шкале onliner как базовой
    const base = byStore[0].points;
    return base.map((pt, i) => {
      const row: Record<string, number> = { t: pt.t };
      for (const s of byStore) {
        row[s.key] = s.points[i]?.price ?? pt.price;
      }
      return row;
    });
  }, [product, range]);

  const snapshots = useMemo<StoreSnapshot[]>(() =>
    product.stores.map((s) => {
      const view = s.series.filter((p) => p.t >= Date.now() - range * DAY);
      const prices = view.map((p) => p.price);
      const current = prices[prices.length - 1];
      const first   = prices[0];
      const min     = Math.min(...prices);
      const max     = Math.max(...prices);
      const cfg     = STORES[s.store];
      return {
        store:     s.store,
        name:      cfg.name,
        color:     cfg.c,
        bg:        cfg.bg,
        current, min, max,
        changePct: ((current - first) / first) * 100,
        url:       s.url,
      };
    }),
  [product, range]);

  const savings = useMemo<SavingsSummary>(() => {
    const sorted  = [...snapshots].sort((a, b) => a.current - b.current);
    const cheapest = sorted[0];
    const priciest = sorted[sorted.length - 1];
    const savingsNow = priciest.current - cheapest.current;
    const savingsPct = (savingsNow / priciest.current) * 100;

    // исторический максимальный разрыв
    let maxGap = 0, maxDate = Date.now();
    const cutoff = Date.now() - range * DAY;
    const series = product.stores.map((s) => s.series.filter((p) => p.t >= cutoff));
    const len = Math.min(...series.map((s) => s.length));
    for (let i = 0; i < len; i++) {
      const prices = series.map((s) => s[i].price);
      const gap = Math.max(...prices) - Math.min(...prices);
      if (gap > maxGap) { maxGap = gap; maxDate = series[0][i].t; }
    }

    return { cheapest, priciest, savingsNow, savingsPct, maxHistoricSavings: maxGap, maxHistoricDate: maxDate };
  }, [snapshots, product, range]);

  const savingsVerdict = useMemo(() => {
    const { cheapest, priciest, savingsNow, savingsPct } = savings;
    if (savingsPct >= 10)
      return `🟢 Разрыв значительный: ${fmt(savingsNow)} Br (${savingsPct.toFixed(1)}%). Берём у ${cheapest.name}.`;
    if (savingsPct >= 4)
      return `🟡 Умеренная экономия: ${fmt(savingsNow)} Br (${savingsPct.toFixed(1)}%). ${cheapest.name} выгоднее.`;
    return `⚪ Цены почти одинаковые — разница ${fmt(savingsNow)} Br. Выбирай по удобству доставки.`;
  }, [savings]);

  return { product, chartData, snapshots, savings, savingsVerdict, range, setRange };
}
