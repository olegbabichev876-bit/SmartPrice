import type { PricePoint } from "../types/tracker";

interface Props {
  series: PricePoint[];
  color: string;
}

export default function Sparkline({ series, color }: Props) {
  const pts = series.filter((_, i) => i % 4 === 0);
  const ys = pts.map((d) => d.price);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const W = 92, H = 30;

  const path = pts
    .map((d, i) => {
      const x = (i / (pts.length - 1)) * W;
      const y = H - ((d.price - min) / (max - min || 1)) * (H - 4) - 2;
      return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={W} height={H} style={{ display: "block" }}>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
