import { useMemo, useState } from "react";
import { DAY, STORES } from "../constants/stores";
import { SEED_ITEMS } from "../data/seedItems";
import type { ParseState, StoreKey, TrackedItem } from "../types/tracker";
import { calcHistory, calcStats, fmt, makeSeries } from "../utils/priceUtils";

export function useTracker() {
  const [items, setItems] = useState<TrackedItem[]>(SEED_ITEMS);
  const [activeId, setActiveId] = useState<number>(SEED_ITEMS[0].id);
  const [range, setRange] = useState<number>(90);
  const [link, setLink] = useState<string>("");
  const [parse, setParse] = useState<ParseState | null>(null);

  const active = items.find((i) => i.id === activeId)!;

  const view = useMemo(
    () => active.series.filter((d) => d.t >= Date.now() - range * DAY),
    [active.series, range],
  );

  const stats = useMemo(() => calcStats(view), [view]);
  const history = useMemo(() => calcHistory(active.series), [active.series]);

  function track() {
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

    const tick = setInterval(() => {
      step++;
      if (step < steps.length) {
        setParse({ step, text: steps[step] });
      } else {
        clearInterval(tick);
        const start = 400 + Math.floor(Math.random() * 2600);
        const newItem: TrackedItem = {
          id: Date.now(),
          store: key,
          title: "Новый отслеживаемый товар",
          sub: "только что добавлен",
          url: link.replace(/^https?:\/\//, "").slice(0, 42),
          series: makeSeries(Date.now() % 1000, start, 120),
          target: Math.round(start * 0.85),
        };
        const currentPrice = fmt(newItem.series.at(-1)!.price);
        setParse({ step: 3, text: `Готово · текущая цена ${currentPrice} Br` });
        setItems((prev) => [newItem, ...prev]);
        setActiveId(newItem.id);
        setLink("");
        setTimeout(() => setParse(null), 1600);
      }
    }, 750);
  }

  return {
    items, active, view, stats, history,
    range, setRange,
    link, setLink,
    parse, track,
    activeId, setActiveId,
  };
}
