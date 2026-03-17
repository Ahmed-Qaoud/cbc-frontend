import { motion } from "framer-motion";
import { ShieldCheck, Brain, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfidenceGaugeProps {
  confidence: number; // 0–100
  analysisPath: "ml" | "ontology" | "hybrid";
}

export function ConfidenceGauge({ confidence, analysisPath }: ConfidenceGaugeProps) {
  /* colour zones: red 0-40 | amber 41-69 | green 70-100 */
  const getZone = (v: number) => {
    if (v >= 70) return { label: "High Confidence", color: "#22c55e", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" };
    if (v >= 40) return { label: "Moderate Confidence", color: "#f59e0b", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" };
    return { label: "Low Confidence", color: "#ef4444", bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700" };
  };

  const zone = getZone(confidence);

  const pathBadges: Record<string, { icon: React.ElementType; label: string; sub: string; bg: string; text: string }> = {
    ml: {
      icon: Brain,
      label: "AI Model Analysis",
      sub: "Powered by machine learning",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
    ontology: {
      icon: ShieldCheck,
      label: "Expert-Verified Analysis",
      sub: "Medical ontology reasoning layer",
      bg: "bg-violet-50",
      text: "text-violet-700",
    },
    hybrid: {
      icon: Zap,
      label: "Hybrid AI Analysis",
      sub: "ML + ontology combined",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
    },
  };

  const badge = pathBadges[analysisPath] ?? pathBadges.hybrid;
  const BadgeIcon = badge.icon;

  /* SVG Arc gauge */
  const R = 70;           // arc radius
  const CX = 100;
  const CY = 95;
  const strokeWidth = 14;
  const arcAngle = 200;   // degrees covered by gauge (10 o'clock → 2 o'clock)
  const startAngle = 180 + (360 - arcAngle) / 2; // = 180 + 80 = 260 (deg from 3 o'clock, clockwise)

  function polarToCart(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = (angleDeg - 90) * (Math.PI / 180); // shift so 0° = 12 o'clock
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(startDeg: number, endDeg: number) {
    const s = polarToCart(CX, CY, R, startDeg);
    const e = polarToCart(CX, CY, R, endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const gaugeStart = 170;            // visual start angle (°)
  const gaugeEnd = gaugeStart + arcAngle;
  const valueAngle = gaugeStart + (confidence / 100) * arcAngle;

  /* needle tip */
  const needleTip = polarToCart(CX, CY, R - 5, valueAngle);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full flex flex-col">
      <h3 className="font-bold text-slate-800 mb-1 text-base">📊 Prediction Confidence</h3>
      <p className="text-xs text-slate-400 mb-4">How certain the AI system is about this diagnosis</p>

      {/* SVG Gauge */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <svg viewBox="0 0 200 130" className="w-full max-w-[220px]">
          {/* Background track */}
          <path
            d={arcPath(gaugeStart, gaugeEnd)}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Coloured fill */}
          <motion.path
            d={arcPath(gaugeStart, gaugeStart)}
            fill="none"
            stroke={zone.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            animate={{ d: arcPath(gaugeStart, valueAngle) }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          {/* Zone ticks */}
          {[0, 40, 70, 100].map((v) => {
            const a = gaugeStart + (v / 100) * arcAngle;
            const inner = polarToCart(CX, CY, R - strokeWidth / 2 - 3, a);
            const outer = polarToCart(CX, CY, R + strokeWidth / 2 + 3, a);
            return <line key={v} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#94a3b8" strokeWidth={1.5} />;
          })}
          {/* Needle */}
          <motion.line
            x1={CX} y1={CY}
            x2={polarToCart(CX, CY, R - strokeWidth - 2, gaugeStart).x}
            y2={polarToCart(CX, CY, R - strokeWidth - 2, gaugeStart).y}
            stroke={zone.color}
            strokeWidth={3}
            strokeLinecap="round"
            animate={{
              x2: polarToCart(CX, CY, R - strokeWidth - 2, valueAngle).x,
              y2: polarToCart(CX, CY, R - strokeWidth - 2, valueAngle).y,
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          {/* Centre dot */}
          <circle cx={CX} cy={CY} r={6} fill={zone.color} />
          <circle cx={CX} cy={CY} r={3} fill="white" />

          {/* Value text */}
          <text x={CX} y={CY + 28} textAnchor="middle" fontSize="26" fontWeight="800" fill="#1e293b">
            {Math.round(confidence)}%
          </text>
          <text x={CX} y={CY + 42} textAnchor="middle" fontSize="9" fill="#64748b">
            {zone.label}
          </text>

          {/* Zone labels */}
          <text x={34} y={118} fontSize="8" fill="#ef4444" textAnchor="middle">Low</text>
          <text x={100} y={28} fontSize="8" fill="#f59e0b" textAnchor="middle">Moderate</text>
          <text x={167} y={118} fontSize="8" fill="#22c55e" textAnchor="middle">High</text>
        </svg>

        {/* Traffic light dots */}
        <div className="flex items-center gap-2 mt-1">
          {[
            { color: "bg-rose-400", label: "Low" },
            { color: "bg-amber-400", label: "Moderate" },
            { color: "bg-emerald-400", label: "High" },
          ].map(({ color, label }, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={cn("w-2.5 h-2.5 rounded-full", color)} />
              <span className="text-[10px] text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis path badge */}
      <div className={cn("mt-4 flex items-center gap-3 p-3 rounded-xl border", badge.bg, badge.text === "text-blue-700" ? "border-blue-100" : badge.text === "text-violet-700" ? "border-violet-100" : "border-indigo-100")}>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm")}>
          <BadgeIcon className={cn("w-4 h-4", badge.text)} />
        </div>
        <div>
          <p className={cn("text-xs font-bold", badge.text)}>{badge.label}</p>
          <p className="text-[10px] text-slate-400">{badge.sub}</p>
        </div>
      </div>
    </div>
  );
}
