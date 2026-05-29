import type { StoreConfig, StoreKey } from "../types/tracker";

export const STORES: Record<StoreKey, StoreConfig> = {
  onliner: { name: "Onliner", c: "#4C8DFF", bg: "rgba(76,141,255,.14)" },
  "21vek": { name: "21vek", c: "#FF7A3D", bg: "rgba(255,122,61,.14)" },
  kufar:   { name: "Kufar",  c: "#FFC93D", bg: "rgba(255,201,61,.16)" },
};

export const RANGE_OPTIONS = [
  { k: 7,   l: "7д"  },
  { k: 30,  l: "30д" },
  { k: 90,  l: "90д" },
  { k: 999, l: "всё" },
] as const;

export const DAY = 86_400_000;
