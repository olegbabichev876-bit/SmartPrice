import { useState } from "react";
import "./styles/tracker.css";
import PriceTracker from "./pages/PriceTracker";
import PriceComparison from "./pages/PriceComparison";

type Tab = "tracker" | "comparison";

export default function App() {
  const [tab, setTab] = useState<Tab>("tracker");

  return (
    <>
      <nav className="app-tabs">
        <button className={tab === "tracker"    ? "on" : ""} onClick={() => setTab("tracker")}>
          Трекер
        </button>
        <button className={tab === "comparison" ? "on" : ""} onClick={() => setTab("comparison")}>
          Сравнение
        </button>
      </nav>
      {tab === "tracker"    && <PriceTracker />}
      {tab === "comparison" && <PriceComparison />}
    </>
  );
}
