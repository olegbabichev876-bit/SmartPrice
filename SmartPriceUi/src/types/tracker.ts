export type StoreKey = "onliner" | "21vek" | "kufar";

export interface PricePoint {
  t: number;
  price: number;
}

export interface TrackedItem {
  id: number;
  store: StoreKey;
  title: string;
  sub: string;
  url: string;
  series: PricePoint[];
  target: number;         // targetPrice from API
  currentPrice?: number;  // latest price from API (before series loads)
}

export interface PriceStats {
  current: number;
  first: number;
  min: number;
  max: number;
  minDate: number;
  daysSinceMin: number;
  changePct: number;
  nearMin: boolean;
}

export interface HistoryEvent {
  t: number;
  from: number;
  to: number;
  pct: number;
}

export interface ParseState {
  step: number;
  text: string;
}

export interface StoreConfig {
  name: string;
  c: string;
  bg: string;
}
