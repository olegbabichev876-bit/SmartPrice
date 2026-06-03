import axios from "axios";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const api = axios.create({ baseURL: BASE });

// ── Types matching the backend responses ──────────────────────────────────

export interface ApiItem {
  id: number;
  title: string;
  sub: string;
  url: string;
  targetPrice: number;
  store: "onliner" | "21vek" | "kufar";
  createdAt: string;
  currentPrice: number | null;
}

export interface ApiPricePoint {
  t: number;
  price: number;
}

export interface AddItemPayload {
  url: string;
  title: string;
  sub?: string;
  targetPrice: number;
}

// ── API calls ──────────────────────────────────────────────────────────────

export const itemsApi = {
  getAll:     ()          => api.get<ApiItem[]>("/api/items").then(r => r.data),
  add:        (body: AddItemPayload) => api.post<ApiItem>("/api/items", body).then(r => r.data),
  remove:     (id: number)           => api.delete(`/api/items/${id}`),
  getHistory: (id: number, days = 90) =>
    api.get<ApiPricePoint[]>(`/api/items/${id}/history?days=${days}`).then(r => r.data),
};
