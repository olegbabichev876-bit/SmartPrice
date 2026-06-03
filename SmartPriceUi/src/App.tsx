import { useState } from "react";
import "./styles/tracker.css";
import PriceTracker from "./pages/PriceTracker";
import PriceComparison from "./pages/PriceComparison";

type Tab = "tracker" | "comparison";

const TABS: { key: Tab; label: string }[] = [
  { key: "tracker",    label: "📋 Трекер" },
  { key: "comparison", label: "📊 Сравнение" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("tracker");

  return (
    <>
      {/* Табы всегда видны независимо от состояния страниц */}
      <nav className="app-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? "on" : ""}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="app-content">
        {tab === "tracker"    && <PriceTracker />}
        {tab === "comparison" && <PriceComparison />}
      </div>
    </>
  );
}
