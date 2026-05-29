import type { TrackedItem } from "../types/tracker";
import { makeSeries } from "../utils/priceUtils";

export const SEED_ITEMS: TrackedItem[] = [
  {
    id: 1,
    store: "onliner",
    title: "Samsung Galaxy S24 128GB",
    sub: "Onyx Black",
    url: "catalog.onliner.by/mobile/samsung/galaxys24",
    series: makeSeries(7, 2999, 120),
    target: 2500,
  },
  {
    id: 2,
    store: "21vek",
    title: "Робот-пылесос Roborock Q7 Max",
    sub: "белый",
    url: "21vek.by/robot_vacuums/roborock-q7-max",
    series: makeSeries(23, 1499, 120),
    target: 1150,
  },
  {
    id: 3,
    store: "kufar",
    title: "Велосипед Stels Navigator 700",
    sub: '27.5", б/у',
    url: "kufar.by/item/stels-navigator-700",
    series: makeSeries(51, 899, 120),
    target: 700,
  },
];
