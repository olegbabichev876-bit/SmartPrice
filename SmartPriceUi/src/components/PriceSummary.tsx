import type { PriceStats } from "../types/tracker";
import { fmt } from "../utils/priceUtils";

interface Props {
  stats: PriceStats;
}

export default function PriceSummary({ stats: s }: Props) {
  const aboveFloor = (((s.current - s.min) / s.min) * 100).toFixed(1);

  let verdict: React.ReactNode;
  if (s.nearMin) {
    verdict = <>🟢 Цена у исторического минимума за период. <b>Хороший момент для покупки.</b></>;
  } else if (s.changePct <= -5) {
    verdict = <>🟢 Цена снизилась на {Math.abs(s.changePct).toFixed(0)}%. Но до минимума ещё {fmt(s.current - s.min)} Br.</>;
  } else if (s.changePct >= 5) {
    verdict = <>🔴 Цена выросла на {s.changePct.toFixed(0)}% за период. Лучше подождать отката.</>;
  } else {
    verdict = <>🟡 Цена стабильна. Жди акцию — за период падала до {fmt(s.min)} Br.</>;
  }

  return (
    <div className="pt-summary">
      <div className="pt-stat">
        <div className="pt-stat-l">минимум за период</div>
        <div className="pt-stat-v green">{fmt(s.min)} <i>Br</i></div>
        <div className="pt-stat-s">{s.daysSinceMin} дн. назад</div>
      </div>
      <div className="pt-stat">
        <div className="pt-stat-l">максимум</div>
        <div className="pt-stat-v">{fmt(s.max)} <i>Br</i></div>
        <div className="pt-stat-s">{fmt(s.max - s.min)} Br размах</div>
      </div>
      <div className="pt-stat">
        <div className="pt-stat-l">сейчас vs минимум</div>
        <div className="pt-stat-v">+{fmt(s.current - s.min)} <i>Br</i></div>
        <div className="pt-stat-s">{aboveFloor}% над дном</div>
      </div>
      <div className="pt-verdict">{verdict}</div>
    </div>
  );
}
