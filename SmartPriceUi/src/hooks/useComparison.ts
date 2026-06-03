import { useEffect, useMemo, useState } from "react";
import { DAY, STORES } from "../constants/stores";
import type { StoreKey } from "../types/tracker";
import { fmt, fmtDate } from "../utils/priceUtils";
import { api } from "../api/apiClient";

interface ApiCompareItem {
  id: number;
  title: string;
  sub: string;
  store: StoreKey;
  url: string;
  targetPrice: number;
  current: number | null;
  min: number | null;
  max: number | null;
  history: { t: number; price: number }[];
}

export interface StoreSnapshot {
  store: StoreKey;
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

const COMPARISON_TITLE = "Samsung Galaxy S24 128GB";

export function useComparison() {
  const [range, setRange]           = useState(90);
  const [rawData, setRawData]       = useState<ApiCompareItem[]>([]);
  const [loading, setLoading]       = useState(true);

  // ── Fetch from API ─────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    api
      .get<ApiCompareItem[]>(`/api/comparison?title=${encodeURIComponent(COMPARISON_TITLE)}&days=${range >= 999 ? 365 : range}`)
      .then((r) => { setRawData(r.data); setLoading(false); });
  }, [range]);

  // ── Build chart data — aligned time series ─────────────────────────────
  const chartData = useMemo(() => {
    if (!rawData.length) return [];
    const cutoff = Date.now() - range * DAY;

    const series = rawData.map((item) => ({
      store: item.store,
      points: item.history.filter((p) => p.t >= cutoff),
    }));

    const base = series[0]?.points ?? [];
    return base.map((pt, i) => {
      const row: Record<string, number> = { t: pt.t };
      for (const s of series) {
        row[s.store] = s.points[i]?.price ?? pt.price;
      }
      return row;
    });
  }, [rawData, range]);

  // ── Per-store snapshots ────────────────────────────────────────────────
  const snapshots = useMemo<StoreSnapshot[]>(() =>
    rawData
      .filter((item) => item.current !== null)
      .map((item) => {
        const points = item.history;
        const prices = points.map((p) => p.price);
        const first  = prices[0] ?? item.current!;
        const cfg    = STORES[item.store];
        return {
          store:     item.store,
          name:      cfg.name,
          color:     cfg.c,
          bg:        cfg.bg,
          current:   item.current!,
          min:       item.min ?? item.current!,
          max:       item.max ?? item.current!,
          changePct: first ? ((item.current! - first) / first) * 100 : 0,
          url:       item.url,
        };
      }),
  [rawData]);

  // ── Savings ────────────────────────────────────────────────────────────
  const savings = useMemo<SavingsSummary | null>(() => {
    if (snapshots.length < 2) return null;
    const sorted   = [...snapshots].sort((a, b) => a.current - b.current);
    const cheapest = sorted[0];
    const priciest = sorted[sorted.length - 1];
    const savingsNow = priciest.current - cheapest.current;
    const savingsPct = (savingsNow / priciest.current) * 100;

    // Исторический максимальный разрыв
    let maxGap = 0, maxDate = Date.now();
    if (chartData.length) {
      const storeKeys = snapshots.map((s) => s.store);
      for (const row of chartData) {
        const vals = storeKeys.map((k) => row[k]).filter(Boolean);
        if (vals.length < 2) continue;
        const gap = Math.max(...vals) - Math.min(...vals);
        if (gap > maxGap) { maxGap = gap; maxDate = row.t; }
      }
    }

    return { cheapest, priciest, savingsNow, savingsPct, maxHistoricSavings: maxGap, maxHistoricDate: maxDate };
  }, [snapshots, chartData]);

  const savingsVerdict = useMemo(() => {
    if (!savings) return "";
    const { cheapest, priciest, savingsNow, savingsPct } = savings;
    if (savingsPct >= 10)
      return `🟢 Разрыв значительный: ${fmt(savingsNow)} Br (${savingsPct.toFixed(1)}%). Берём у ${cheapest.name}.`;
    if (savingsPct >= 4)
      return `🟡 Умеренная экономия: ${fmt(savingsNow)} Br (${savingsPct.toFixed(1)}%). ${cheapest.name} выгоднее.`;
    return `⚪ Цены почти одинаковые — разница ${fmt(savingsNow)} Br. Выбирай по удобству доставки.`;
  }, [savings]);

  const product = { title: COMPARISON_TITLE, sub: rawData[0]?.sub ?? "" };

  return {
    product, chartData, snapshots, savings, savingsVerdict,
    range, setRange, loading,
  };
}
