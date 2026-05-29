import type { StoreKey } from "../types/tracker";
import { makeSeries } from "../utils/priceUtils";

export interface ComparisonStore {
  store: StoreKey;
  series: { t: number; price: number }[];
  url: string;
}

export interface ComparisonProduct {
  id: number;
  title: string;
  sub: string;
  stores: ComparisonStore[];
}

export const COMPARISON_PRODUCTS: ComparisonProduct[] = [
  {
    id: 1,
    title: "Samsung Galaxy S24 128GB",
    sub: "Onyx Black",
    stores: [
      { store: "onliner", series: makeSeries(7,   2999, 120), url: "catalog.onliner.by/mobile/samsung/galaxys24" },
      { store: "21vek",   series: makeSeries(42,  3099, 120), url: "21vek.by/mobile/samsung-galaxy-s24" },
      { store: "kufar",   series: makeSeries(88,  2750, 120), url: "kufar.by/item/samsung-galaxy-s24" },
    ],
  },
];
