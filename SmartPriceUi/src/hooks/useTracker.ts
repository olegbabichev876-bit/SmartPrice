import { useCallback, useEffect, useMemo, useState } from "react";
import { DAY, STORES } from "../constants/stores";
import type { StoreKey, TrackedItem, ParseState } from "../types/tracker";
import { calcHistory, calcStats, fmt } from "../utils/priceUtils";
import { itemsApi, type ApiItem } from "../api/apiClient";
import { startHub, subscribeToItem, unsubscribeFromItem } from "../api/signalrClient";

// Map API response → internal TrackedItem shape
function mapItem(api: ApiItem): TrackedItem {
  return {
    id:           api.id,
    store:        api.store as StoreKey,
    title:        api.title,
    sub:          api.sub,
    url:          api.url,
    target:       api.targetPrice,
    currentPrice: api.currentPrice ?? undefined,
    series:       [],
  };
}

export function useTracker() {
  const [items, setItems]     = useState<TrackedItem[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [range, setRange]     = useState<number>(90);
  const [link, setLink]       = useState<string>("");
  const [parse, setParse]     = useState<ParseState | null>(null);
  const [loading, setLoading]               = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── Load items list from API ───────────────────────────────────────────
  useEffect(() => {
    itemsApi.getAll().then((data) => {
      const mapped = data.map(mapItem);
      setItems(mapped);
      if (mapped.length > 0) setActiveId(mapped[0].id);
      setLoading(false);
    });
  }, []);

  // ── Load price history when active item or range changes ──────────────
  useEffect(() => {
    if (activeId === null) return;
    const days = range >= 999 ? 365 : range;
    setHistoryLoading(true);
    itemsApi.getHistory(activeId, days).then((history) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === activeId
            ? { ...item, series: history.map((p) => ({ t: p.t, price: Number(p.price) })) }
            : item
        )
      );
      setHistoryLoading(false);
    });
  }, [activeId, range]);

  // ── SignalR: subscribe to active item live updates ────────────────────
  useEffect(() => {
    if (activeId === null) return;
    let prevId: number | null = null;

    startHub().then((hub) => {
      subscribeToItem(activeId);
      prevId = activeId;

      hub.on("PriceUpdated", (data: { itemId: number; price: number; parsedAt: string }) => {
        if (data.itemId !== activeId) return;
        const newPoint = { t: new Date(data.parsedAt).getTime(), price: data.price };
        setItems((prev) =>
          prev.map((item) =>
            item.id === data.itemId
              ? { ...item, series: [...item.series, newPoint] }
              : item
          )
        );
      });
    });

    return () => {
      if (prevId !== null) unsubscribeFromItem(prevId);
    };
  }, [activeId]);

  const active = items.find((i) => i.id === activeId) ?? items[0] ?? null;

  const view = useMemo(() => {
    if (!active?.series.length) return [];
    return active.series.filter((d) => d.t >= Date.now() - range * DAY);
  }, [active?.series, range]);

  const stats = useMemo(() => (view.length ? calcStats(view) : null), [view]);
  const history = useMemo(() => (active ? calcHistory(active.series) : []), [active?.series]);

  // ── Optimistic "track" with parse animation ───────────────────────────
  const track = useCallback(() => {
    if (!link.trim()) return;

    const key: StoreKey = link.includes("21vek")
      ? "21vek"
      : link.includes("kufar")
      ? "kufar"
      : "onliner";

    const steps = [
      `Подключаемся к ${STORES[key].name}…`,
      "Нашли карточку товара…",
      "Считываем цену и наличие…",
    ];

    let step = 0;
    setParse({ step: 0, text: steps[0] });

    const tick = setInterval(async () => {
      step++;
      if (step < steps.length) {
        setParse({ step, text: steps[step] });
      } else {
        clearInterval(tick);
        try {
          const created = await itemsApi.add({
            url:         link,
            title:       "Новый отслеживаемый товар",
            sub:         "только что добавлен",
            targetPrice: 0,
          });
          const newItem = mapItem(created);
          setParse({ step: 3, text: `Готово · товар добавлен` });
          setItems((prev) => [newItem, ...prev]);
          setActiveId(newItem.id);
          setLink("");
          setTimeout(() => setParse(null), 1600);
        } catch {
          setParse({ step: 3, text: "Ошибка при добавлении" });
          setTimeout(() => setParse(null), 2000);
        }
      }
    }, 750);
  }, [link]);

  const removeItem = useCallback(async (id: number) => {
    await itemsApi.remove(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (activeId === id) setActiveId(items.find((i) => i.id !== id)?.id ?? null);
  }, [activeId, items]);

  return {
    items, active, view, stats, history,
    range, setRange,
    link, setLink,
    parse, track,
    loading, historyLoading,
    activeId, setActiveId,
    removeItem,
  };
}
