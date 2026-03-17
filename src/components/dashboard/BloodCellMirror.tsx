import { motion } from "framer-motion";

type CellType =
  | "anemia_iron"
  | "anemia_b12"
  | "leukemia"
  | "thrombocytopenia"
  | "polycythemia"
  | "normal"
  | "generic";

interface BloodCellMirrorProps {
  cellType: CellType;
  conditionName: string;
}

/* ── SVG Blood Cell Renderers ── */

function HealthyRBCs() {
  const positions = [
    { x: 40, y: 40 }, { x: 100, y: 35 }, { x: 155, y: 45 },
    { x: 60, y: 90 }, { x: 120, y: 95 }, { x: 175, y: 85 },
    { x: 35, y: 135 }, { x: 95, y: 130 }, { x: 155, y: 140 },
  ];
  return (
    <svg viewBox="0 0 210 175" className="w-full h-full">
      {positions.map((p, i) => (
        <g key={i} transform={`translate(${p.x}, ${p.y})`}>
          {/* RBC: biconcave disc viewed from top = ellipse with shadow ring */}
          <ellipse cx={0} cy={0} rx={22} ry={16} fill="#e05c5c" opacity={0.85} />
          <ellipse cx={0} cy={0} rx={14} ry={9} fill="#c94545" opacity={0.5} />
          <ellipse cx={-3} cy={-3} rx={6} ry={4} fill="#f08080" opacity={0.4} />
        </g>
      ))}
    </svg>
  );
}

function IronDeficiencyRBCs() {
  // Smaller, paler cells — microcytosis + hypochromia
  const positions = [
    { x: 35, y: 38 }, { x: 85, y: 32 }, { x: 140, y: 40 }, { x: 185, y: 35 },
    { x: 55, y: 85 }, { x: 110, y: 90 }, { x: 165, y: 80 },
    { x: 30, y: 130 }, { x: 90, y: 135 }, { x: 150, y: 128 }, { x: 195, y: 140 },
  ];
  return (
    <svg viewBox="0 0 225 175" className="w-full h-full">
      {positions.map((p, i) => (
        <g key={i} transform={`translate(${p.x}, ${p.y})`}>
          {/* Smaller (micro) + pale (hypo) RBCs */}
          <ellipse cx={0} cy={0} rx={15} ry={10} fill="#f5c0c0" opacity={0.8} />
          {/* Central pallor — bigger than normal */}
          <ellipse cx={0} cy={0} rx={9} ry={6} fill="#fdeaea" opacity={0.9} />
        </g>
      ))}
    </svg>
  );
}

function B12AnemiaRBCs() {
  // Fewer, larger oval cells — macrocytosis / megaloblastic
  const positions = [
    { x: 55, y: 50 }, { x: 140, y: 45 }, { x: 85, y: 120 }, { x: 165, y: 125 },
  ];
  return (
    <svg viewBox="0 0 210 175" className="w-full h-full">
      {positions.map((p, i) => (
        <g key={i} transform={`translate(${p.x}, ${p.y})`}>
          {/* Macro-oval cells */}
          <ellipse cx={0} cy={0} rx={30} ry={22} fill="#d97c7c" opacity={0.8} />
          <ellipse cx={0} cy={0} rx={18} ry={13} fill="#c95e5e" opacity={0.45} />
          <ellipse cx={-4} cy={-4} rx={8} ry={5} fill="#f0a0a0" opacity={0.4} />
        </g>
      ))}
      {/* Hypersegmented neutrophil hint */}
      <text x="105" y="165" textAnchor="middle" fontSize="9" fill="#999">
        Oversized cells detected
      </text>
    </svg>
  );
}

function LeukemiaWBCs() {
  // Excessive white cells (blasts)
  const positions = [
    { x: 40, y: 40 }, { x: 100, y: 30 }, { x: 160, y: 45 },
    { x: 70, y: 90 }, { x: 130, y: 85 }, { x: 175, y: 100 },
    { x: 40, y: 135 }, { x: 95, y: 130 }, { x: 155, y: 140 },
  ];
  return (
    <svg viewBox="0 0 210 175" className="w-full h-full">
      {positions.map((p, i) => (
        <g key={i} transform={`translate(${p.x}, ${p.y})`}>
          {/* Blast cells — irregular, large */}
          <circle cx={0} cy={0} r={18} fill="#8b5cf6" opacity={0.2} />
          <circle cx={0} cy={0} r={14} fill="#7c3aed" opacity={0.35} />
          {/* Nucleus */}
          <circle cx={0} cy={0} r={9} fill="#6d28d9" opacity={0.6} />
          <circle cx={-2} cy={-2} r={4} fill="#a78bfa" opacity={0.4} />
        </g>
      ))}
    </svg>
  );
}

function ThrombocytopeniaPlatelets() {
  const positions = [
    { x: 60, y: 45 }, { x: 150, y: 40 },
    { x: 95, y: 100 },
    { x: 55, y: 140 }, { x: 160, y: 130 },
  ];
  return (
    <svg viewBox="0 0 210 175" className="w-full h-full">
      {/* Ghost RBCs in background */}
      {[{ x: 40, y: 70 }, { x: 110, y: 65 }, { x: 170, y: 80 }, { x: 80, y: 130 }, { x: 150, y: 135 }].map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx={20} ry={14} fill="#e05c5c" opacity={0.3} />
      ))}
      {/* Sparse platelets */}
      {positions.map((p, i) => (
        <g key={i} transform={`translate(${p.x}, ${p.y})`}>
          <ellipse cx={0} cy={0} rx={8} ry={5} fill="#f59e0b" opacity={0.9} />
          <ellipse cx={0} cy={0} rx={4} ry={2.5} fill="#fcd34d" opacity={0.6} />
        </g>
      ))}
      <text x="105" y="165" textAnchor="middle" fontSize="9" fill="#d97706">Few platelets visible</text>
    </svg>
  );
}

function PolycythemiaRBCs() {
  // Packed, crowded red cells
  const positions = [
    { x: 25, y: 25 }, { x: 65, y: 22 }, { x: 108, y: 20 }, { x: 155, y: 26 }, { x: 190, y: 22 },
    { x: 40, y: 65 }, { x: 80, y: 63 }, { x: 125, y: 60 }, { x: 170, y: 68 },
    { x: 20, y: 105 }, { x: 60, y: 100 }, { x: 103, y: 103 }, { x: 148, y: 100 }, { x: 192, y: 107 },
    { x: 38, y: 145 }, { x: 80, y: 142 }, { x: 125, y: 140 }, { x: 168, y: 147 },
  ];
  return (
    <svg viewBox="0 0 215 175" className="w-full h-full">
      {positions.map((p, i) => (
        <g key={i} transform={`translate(${p.x}, ${p.y})`}>
          <ellipse cx={0} cy={0} rx={18} ry={13} fill="#c0392b" opacity={0.8} />
          <ellipse cx={0} cy={0} rx={10} ry={7} fill="#922b21" opacity={0.5} />
        </g>
      ))}
    </svg>
  );
}

function GenericRBCs() {
  return <HealthyRBCs />;
}

function getCellRenderer(type: CellType) {
  switch (type) {
    case "anemia_iron": return <IronDeficiencyRBCs />;
    case "anemia_b12": return <B12AnemiaRBCs />;
    case "leukemia": return <LeukemiaWBCs />;
    case "thrombocytopenia": return <ThrombocytopeniaPlatelets />;
    case "polycythemia": return <PolycythemiaRBCs />;
    default: return <GenericRBCs />;
  }
}

const CELL_DESCRIPTIONS: Record<CellType, { healthy: string; patient: string }> = {
  anemia_iron: {
    healthy: "Round, plump, richly colored — full of hemoglobin",
    patient: "Smaller & pale — low iron means less hemoglobin",
  },
  anemia_b12: {
    healthy: "Uniform, medium-sized, healthy red cells",
    patient: "Fewer but enlarged oval cells (macrocytes)",
  },
  leukemia: {
    healthy: "Balanced mix: mostly red cells, few white cells",
    patient: "Overrun by large, immature white cells (blasts)",
  },
  thrombocytopenia: {
    healthy: "Plenty of small platelet clusters visible",
    patient: "Very few platelets — clotting is compromised",
  },
  polycythemia: {
    healthy: "Well-spaced red cells with room to flow freely",
    patient: "Overcrowded red cells — blood is too thick",
  },
  normal: {
    healthy: "Healthy, balanced blood composition",
    patient: "Within normal range",
  },
  generic: {
    healthy: "Healthy, balanced blood composition",
    patient: "Abnormal pattern detected",
  },
};

export function BloodCellMirror({ cellType, conditionName }: BloodCellMirrorProps) {
  const desc = CELL_DESCRIPTIONS[cellType] ?? CELL_DESCRIPTIONS.generic;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full">
      <h3 className="font-bold text-slate-800 mb-1 text-base">🔬 Blood Cell Comparison</h3>
      <p className="text-xs text-slate-400 mb-4">Microscopic view — how your cells compare to healthy ones</p>

      <div className="grid grid-cols-2 gap-3">
        {/* Healthy Panel */}
        <div className="text-center">
          <div className="relative bg-slate-900 rounded-xl overflow-hidden border-2 border-emerald-300 mb-2" style={{ aspectRatio: "4/3" }}>
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle, #22c55e 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <div className="p-2 h-full">
              <HealthyRBCs />
            </div>
            <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              ✓ HEALTHY
            </div>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">{desc.healthy}</p>
        </div>

        {/* Patient Panel */}
        <div className="text-center">
          <div className="relative bg-slate-900 rounded-xl overflow-hidden border-2 border-rose-300 mb-2" style={{ aspectRatio: "4/3" }}>
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle, #ef4444 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <div className="p-2 h-full">
              {getCellRenderer(cellType)}
            </div>
            <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              YOUR CELLS
            </div>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">{desc.patient}</p>
        </div>
      </div>

      <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
        <p className="text-xs text-slate-600 text-center font-medium">
          Showing pattern consistent with <span className="text-blue-600 font-bold">{conditionName}</span>
        </p>
      </div>
    </div>
  );
}
