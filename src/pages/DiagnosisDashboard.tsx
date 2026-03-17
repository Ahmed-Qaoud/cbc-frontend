import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useReportDownload } from "@/hooks/useReportDownload";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  RotateCcw,
  Download,
  ShieldCheck,
  Brain,
  AlertTriangle,
  ChevronRight,
  Stethoscope,
  FlaskConical,
  Heart,
  Star,
  CheckCircle2,
  Salad,
  Droplets,
  Moon,
  Zap,
  Info,
} from "lucide-react";
import type { PredictResponse } from "@/types/api";
import { BloodCellMirror } from "@/components/dashboard/BloodCellMirror";
import { ConfidenceGauge } from "@/components/dashboard/ConfidenceGauge";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────
   Condition Knowledge Base
   Maps a diagnosis label → patient-friendly content
────────────────────────────────────────────── */
interface ConditionContent {
  storyTitle: string;
  storyBody: string;
  cellType: "anemia_iron" | "anemia_b12" | "leukemia" | "thrombocytopenia" | "polycythemia" | "normal" | "generic";
  urgencyLevel: "low" | "medium" | "high" | "critical";
  foods: { emoji: string; name: string; benefit: string }[];
  lifestyle: { emoji: string; tip: string }[];
  specialtyIcon: string;
}

const CONDITION_MAP: Record<string, ConditionContent> = {
  default: {
    storyTitle: "Here's What Your Blood Test Revealed",
    storyBody:
      "Your complete blood count shows some values that differ from the expected healthy range. This means your body may need some extra attention in certain areas. The good news is that most conditions identified through CBC are very manageable with the right care.",
    cellType: "generic",
    urgencyLevel: "medium",
    foods: [
      { emoji: "🥦", name: "Leafy Greens", benefit: "Rich in vitamins & minerals" },
      { emoji: "🫐", name: "Berries", benefit: "Antioxidant support" },
      { emoji: "🐟", name: "Lean Fish", benefit: "Omega-3 & protein" },
      { emoji: "🥚", name: "Eggs", benefit: "Complete protein source" },
    ],
    lifestyle: [
      { emoji: "💧", tip: "Drink 8 glasses of water daily" },
      { emoji: "🏃", tip: "30 minutes of light exercise, 5 days a week" },
      { emoji: "😴", tip: "Aim for 7–9 hours of quality sleep" },
      { emoji: "🧘", tip: "Practice stress-reduction techniques" },
    ],
    specialtyIcon: "🩺",
  },
};

const IRON_DEFICIENCY_CONTENT: ConditionContent = {
  storyTitle: "Your Oxygen Carrier is Running Low",
  storyBody:
    "Your red blood cells, which carry oxygen throughout your body, are smaller and paler than usual. Think of them like tiny delivery trucks — right now, they're half-empty. This is because your body doesn't have enough iron to make a protein called hemoglobin, which fills these 'trucks' with oxygen.",
  cellType: "anemia_iron",
  urgencyLevel: "medium",
  foods: [
    { emoji: "🥩", name: "Red Meat", benefit: "Highest absorbable iron (heme iron)" },
    { emoji: "🫘", name: "Lentils & Beans", benefit: "Plant-based iron powerhouse" },
    { emoji: "🍃", name: "Spinach", benefit: "Iron + Folate combination" },
    { emoji: "🍊", name: "Vitamin C Foods", benefit: "Boosts iron absorption 3×" },
    { emoji: "🥜", name: "Pumpkin Seeds", benefit: "Iron-rich snack" },
    { emoji: "🐠", name: "Sardines", benefit: "Iron + Vitamin B12" },
  ],
  lifestyle: [
    { emoji: "☕", tip: "Avoid tea/coffee within 1 hour of eating iron-rich foods" },
    { emoji: "💧", tip: "Stay well hydrated to support blood volume" },
    { emoji: "😴", tip: "Rest more — your body needs extra energy for recovery" },
    { emoji: "🏃", tip: "Light walking is fine; avoid intense exercise until levels improve" },
  ],
  specialtyIcon: "🩸",
};

// Map condition strings to content
function getConditionContent(condition: string): ConditionContent {
  const lower = condition.toLowerCase();
  if (lower.includes("iron") || (lower.includes("anemia") && !lower.includes("b12") && !lower.includes("folate") && !lower.includes("pernicious"))) {
    return { ...IRON_DEFICIENCY_CONTENT };
  }
  if (lower.includes("b12") || lower.includes("pernicious") || lower.includes("megaloblastic") || lower.includes("folate")) {
    return {
      storyTitle: "Your Red Blood Cells Are Oversized But Underperforming",
      storyBody:
        "Your red blood cells are larger than normal but fewer in number. This happens when your body lacks Vitamin B12 or Folate — nutrients needed to produce healthy, correctly-sized blood cells. Imagine cells that are bloated but can't do their job properly.",
      cellType: "anemia_b12",
      urgencyLevel: "medium",
      foods: [
        { emoji: "🥩", name: "Lean Meat", benefit: "Excellent B12 source" },
        { emoji: "🥚", name: "Eggs & Dairy", benefit: "B12-rich animal products" },
        { emoji: "🐟", name: "Salmon & Tuna", benefit: "B12 + Folate combo" },
        { emoji: "🥬", name: "Dark Leafy Greens", benefit: "High in Folate" },
        { emoji: "🫘", name: "Legumes", benefit: "Plant-based Folate" },
        { emoji: "🌾", name: "Fortified Cereals", benefit: "Added B12 & Folate" },
      ],
      lifestyle: [
        { emoji: "🙅", tip: "Limit alcohol — it blocks B12 absorption" },
        { emoji: "💊", tip: "Ask your doctor about B12/Folate supplements" },
        { emoji: "😴", tip: "Fatigue is common; prioritize rest" },
        { emoji: "🧠", tip: "B12 affects mood — mental health support is important" },
      ],
      specialtyIcon: "🩸",
    };
  }
  if (lower.includes("leukemia") || lower.includes("lymphoma") || lower.includes("malignant")) {
    return {
      storyTitle: "An Unusual Pattern in Your Blood Cells Was Detected",
      storyBody:
        "The AI detected an abnormal pattern in your white blood cell count that warrants immediate attention from a specialist. This pattern is associated with conditions requiring expert evaluation. Please don't panic — this is a screening tool and a specialist will provide accurate diagnosis.",
      cellType: "leukemia",
      urgencyLevel: "critical",
      foods: [
        { emoji: "🥦", name: "Cruciferous Vegetables", benefit: "Immune-boosting compounds" },
        { emoji: "🍇", name: "Antioxidant-Rich Fruits", benefit: "Cell protection" },
        { emoji: "🧄", name: "Garlic & Onions", benefit: "Natural immune support" },
        { emoji: "🐟", name: "Omega-3 Rich Fish", benefit: "Anti-inflammatory" },
      ],
      lifestyle: [
        { emoji: "🏥", tip: "Book a hematologist appointment immediately" },
        { emoji: "🚫", tip: "Avoid infections — wash hands frequently" },
        { emoji: "😴", tip: "Your body needs maximum rest" },
        { emoji: "💬", tip: "Seek emotional support from family or counselors" },
      ],
      specialtyIcon: "🏥",
    };
  }
  if (lower.includes("thrombocytopenia") || lower.includes("platelet")) {
    return {
      storyTitle: "Your Blood's Clotting Helpers Are Running Short",
      storyBody:
        "Platelets are tiny cells that stop bleeding when you get a cut. Your platelet count is lower than normal, which means your blood may take longer to clot. Think of platelets as your body's repair crew — right now, the crew is understaffed.",
      cellType: "thrombocytopenia",
      urgencyLevel: "high",
      foods: [
        { emoji: "🫐", name: "Papaya & Papaya Leaves", benefit: "Known to boost platelet count" },
        { emoji: "🥝", name: "Kiwi & Citrus", benefit: "Vitamin C supports vessel health" },
        { emoji: "🥬", name: "Leafy Greens", benefit: "Vitamin K for clotting" },
        { emoji: "🐄", name: "Lean Protein", benefit: "Supports cell production" },
      ],
      lifestyle: [
        { emoji: "🩹", tip: "Avoid activities with injury risk (contact sports)" },
        { emoji: "💊", tip: "Avoid NSAIDs like ibuprofen without doctor advice" },
        { emoji: "🦷", tip: "Use soft toothbrush to avoid gum bleeding" },
        { emoji: "💧", tip: "Stay well hydrated — supports bone marrow" },
      ],
      specialtyIcon: "🩸",
    };
  }
  if (lower.includes("polycythemia") || lower.includes("erythrocytosis")) {
    return {
      storyTitle: "Your Blood Has More Red Cells Than Needed",
      storyBody:
        "Your red blood cell count is higher than the healthy range. While it sounds like more is better, having too many red cells makes your blood thicker, which can strain your heart and increase clotting risk. Your doctor can help bring this back to a healthy balance.",
      cellType: "polycythemia",
      urgencyLevel: "high",
      foods: [
        { emoji: "💧", name: "Water & Fluids", benefit: "Keeps blood from thickening" },
        { emoji: "🫚", name: "Omega-3 Foods", benefit: "Anti-clotting benefits" },
        { emoji: "🍰", name: "Low-Iron Diet", benefit: "Limit high-iron red meats" },
        { emoji: "🥗", name: "Plant-Based Foods", benefit: "General cardiovascular health" },
      ],
      lifestyle: [
        { emoji: "🚫", tip: "Avoid smoking — worsens blood thickness" },
        { emoji: "💧", tip: "Drink extra water throughout the day" },
        { emoji: "🧊", tip: "Avoid hot environments that cause dehydration" },
        { emoji: "🏥", tip: "Follow-up with hematologist for phlebotomy discussion" },
      ],
      specialtyIcon: "🩸",
    };
  }
  return CONDITION_MAP.default;
}

/* ──────────────────────────────────────────────
   Helpers
────────────────────────────────────────────── */
function getAnalysisPath(apiData: PredictResponse) {
  const path = apiData.path?.toLowerCase() ?? "";
  if (path.includes("ontology")) return "ontology";
  if (path.includes("ml") || path.includes("ai") || path.includes("model")) return "ml";
  return "hybrid";
}

function getTopCondition(apiData: PredictResponse) {
  if (apiData.top_predictions?.length > 0) return apiData.top_predictions[0];
  if (apiData.ontology_support?.length > 0) {
    const top = apiData.ontology_support[0];
    return {
      condition: top.condition,
      probability: (top.score ?? 0) / 100,
      probability_percent: top.score_percent ?? 0,
      confirmatory_tests: top.confirmatory_tests ?? [],
      specialty: top.specialty ?? null,
      rank: 1,
    };
  }
  return null;
}

/* ──────────────────────────────────────────────
   Main Component
────────────────────────────────────────────── */
export default function DiagnosisDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [apiData, setApiData] = useState<PredictResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"story" | "food" | "lifestyle" | "next">("story");
  const { downloadReport } = useReportDownload();
  const handleDownload = useCallback(() => {
    if (apiData) downloadReport(apiData);
  }, [apiData, downloadReport]);

  useEffect(() => {
    const data = location.state?.analysisResult as PredictResponse | undefined;
    if (!data) {
      navigate("/analyze");
      return;
    }
    setApiData(data);
  }, [location.state, navigate]);

  if (!apiData) return null;

  const topCondition = getTopCondition(apiData);
  const conditionName = topCondition?.condition ?? "Unknown Condition";
  const confidence = topCondition?.probability_percent ?? 0;
  const analysisPath = getAnalysisPath(apiData);
  const content = getConditionContent(conditionName);

  // Confirmatory tests from the top prediction or global list
  const tests: { name: string; reason: string; priority?: number }[] = [];
  const rawTests = topCondition?.confirmatory_tests ?? apiData.recommended_tests ?? [];
  rawTests.forEach((t) => {
    if (typeof t === "string") tests.push({ name: t, reason: "Recommended follow-up test" });
    else tests.push({ name: t.test, reason: t.reason, priority: t.priority });
  });

  const specialties: string[] = topCondition?.specialty
    ? [topCondition.specialty as string]
    : apiData.specialty ?? [];

  const urgencyColors = {
    low: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
    medium: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", badge: "bg-sky-100 text-sky-700" },
    high: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-700" },
    critical: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", badge: "bg-rose-100 text-rose-700" },
  };
  const uc = urgencyColors[content.urgencyLevel];

  const tabs = [
    { id: "story" as const, label: "What Happened?", icon: Brain },
    { id: "food" as const, label: "What to Eat", icon: Salad },
    { id: "lifestyle" as const, label: "Lifestyle Tips", icon: Heart },
    { id: "next" as const, label: "Next Steps", icon: ChevronRight },
  ];

  return (
    <Layout>
      <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #f0f7ff 0%, #e8f4fd 40%, #f5f0ff 100%)" }}>
        <section className="px-4 py-10 md:px-8 md:py-14">
          <div className="max-w-5xl mx-auto">

            {/* ── Nav Bar ── */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/results" state={location.state}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Clinical Results
                </Link>
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/analyze"><RotateCcw className="w-4 h-4 mr-1" />New Analysis</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-1" />Save Report
                </Button>
              </div>
            </motion.div>

            {/* ── Hero Diagnosis Banner ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={cn("rounded-3xl p-8 md:p-10 border-2 mb-8 relative overflow-hidden", uc.bg, uc.border)}
            >
              {/* background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
                style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
              <div className="relative z-10">
                <div className="flex flex-wrap items-start gap-4 mb-4">
                  <span className="text-4xl">{content.specialtyIcon}</span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={cn("text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide", uc.badge)}>
                        AI Diagnosis
                      </span>
                      {apiData.urgent_attention && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-700 uppercase tracking-wide flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Urgent Attention
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 leading-tight">
                      {conditionName}
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">
                      Based on your Complete Blood Count (CBC) Analysis
                    </p>
                  </div>
                </div>

                {/* Red flags */}
                {apiData.red_flags?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {apiData.red_flags.map((flag, i) => (
                      <span key={i} className="text-xs px-3 py-1 bg-rose-100 text-rose-700 rounded-full font-medium">
                        ⚠ {flag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* ── Confidence Gauge + Blood Cell Mirror (side by side on desktop) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                <ConfidenceGauge confidence={confidence} analysisPath={analysisPath} />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <BloodCellMirror cellType={content.cellType} conditionName={conditionName} />
              </motion.div>
            </div>

            {/* ── Tab Navigation ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className="flex gap-1 bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 border border-slate-100 shadow-sm mb-6 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-1 justify-center",
                        isActive
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* ── Tab Content ── */}
              <AnimatePresence mode="wait">
                {activeTab === "story" && (
                  <StoryTab key="story" content={content} conditionName={conditionName} apiData={apiData} />
                )}
                {activeTab === "food" && (
                  <FoodTab key="food" content={content} />
                )}
                {activeTab === "lifestyle" && (
                  <LifestyleTab key="lifestyle" content={content} />
                )}
                {activeTab === "next" && (
                  <NextStepsTab key="next" tests={tests} specialties={specialties} apiData={apiData} onDownload={handleDownload} />
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── Disclaimer ── */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-8 p-4 bg-white/60 border border-slate-200 rounded-2xl flex items-start gap-3 text-xs text-slate-500">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
              <p className="leading-relaxed">
                {apiData.disclaimer || "This dashboard is for patient education only and is generated by an AI system. It does not replace professional medical advice. Please consult your doctor before making any health decisions."}
              </p>
            </motion.div>

          </div>
        </section>
      </div>
    </Layout>
  );
}

/* ──────────────────────────────────────────────
   Story Tab
────────────────────────────────────────────── */
function StoryTab({ content, conditionName, apiData }: { content: ConditionContent; conditionName: string; apiData: PredictResponse }) {
  const keyFeatures: string[] = [];
  apiData.ontology_support?.[0]?.matched_rules?.forEach((r) => {
    keyFeatures.push(`${r.feature} is ${r.direction}`);
  });

  return (
    <motion.div key="story" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="space-y-5">
      {/* Story card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">📖</span> {content.storyTitle}
        </h2>
        <p className="text-slate-600 leading-relaxed text-base">{content.storyBody}</p>
      </div>

      {/* CBC Pattern */}
      {keyFeatures.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-500" />
            What the AI Saw in Your CBC
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {keyFeatures.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                <span className="text-sm font-medium text-slate-700 capitalize">{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How common is this? */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
          <Star className="w-4 h-4 text-indigo-500" />
          Good to Know
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          <strong>{conditionName}</strong> is one of the most studied blood conditions. With the right medical care and lifestyle adjustments, most patients see significant improvement. You're already on the right track by getting this analysis done.
        </p>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Food Tab
────────────────────────────────────────────── */
function FoodTab({ content }: { content: ConditionContent }) {
  return (
    <motion.div key="food" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="space-y-5">
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
          <span className="text-2xl">🍽️</span> What to Eat
        </h2>
        <p className="text-slate-500 text-sm mb-5">Foods that support your recovery and improve your blood health</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {content.foods.map((food, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 text-center hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-2">{food.emoji}</div>
              <p className="font-semibold text-slate-800 text-sm">{food.name}</p>
              <p className="text-xs text-slate-500 mt-1 leading-tight">{food.benefit}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
        <span className="text-xl shrink-0">💡</span>
        <div>
          <p className="font-semibold text-amber-800 text-sm">Pro Tip</p>
          <p className="text-amber-700 text-sm mt-0.5">Pair iron-rich foods with Vitamin C for up to 3× better absorption. Try spinach salad with lemon dressing!</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Lifestyle Tab
────────────────────────────────────────────── */
// Lifestyle icons kept for future tooltip use
const _LIFESTYLE_ICONS: Record<string, unknown> = { Droplets, Moon, Zap, Heart };
function LifestyleTab({ content }: { content: ConditionContent }) {
  return (
    <motion.div key="lifestyle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="space-y-4">
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
          <span className="text-2xl">🌿</span> Lifestyle Recommendations
        </h2>
        <p className="text-slate-500 text-sm mb-5">Small daily habits that make a big difference in your recovery</p>
        <div className="space-y-3">
          {content.lifestyle.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-blue-50 rounded-xl border border-slate-100 hover:border-blue-100 transition-all cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0 shadow-sm">
                {item.emoji}
              </div>
              <p className="text-slate-700 font-medium text-sm">{item.tip}</p>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Next Steps Tab
────────────────────────────────────────────── */
function NextStepsTab({
  tests,
  specialties,
  apiData,
  onDownload,
}: {
  tests: { name: string; reason: string; priority?: number }[];
  specialties: string[];
  apiData: PredictResponse;
  onDownload: () => void;
}) {
  return (
    <motion.div key="next" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="space-y-5">
      {/* Specialties */}
      {specialties.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-500" />
            Recommended Specialist
          </h2>
          <p className="text-slate-500 text-sm mb-4">These medical specialists are best equipped to guide your treatment</p>
          <div className="flex flex-wrap gap-3">
            {specialties.map((sp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-5 py-3 cursor-pointer transition-colors shadow-md hover:shadow-lg"
              >
                <Stethoscope className="w-5 h-5" />
                <span className="font-semibold">{sp}</span>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tests */}
      {tests.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-teal-500" />
            Confirmatory Tests
          </h2>
          <p className="text-slate-500 text-sm mb-4">Tests the system recommends to confirm the diagnosis</p>
          <div className="space-y-3">
            {tests.map((test, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 p-4 bg-teal-50 border border-teal-100 rounded-xl hover:shadow-sm transition-shadow"
              >
                <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-sm shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm">{test.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{test.reason}</p>
                </div>
                {test.priority === 1 && (
                  <span className="text-xs bg-rose-100 text-rose-600 font-semibold px-2 py-0.5 rounded-full shrink-0">Priority</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button className="flex items-center justify-center gap-3 bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-400 text-blue-700 rounded-2xl px-5 py-4 font-semibold transition-all shadow-sm hover:shadow-md">
          <ShieldCheck className="w-5 h-5" />
          Get a Second Opinion
        </button>
        <button
          onClick={onDownload}
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-2xl px-5 py-4 font-semibold transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          <Download className="w-5 h-5" />
          Download Full Report
        </button>
      </div>
    </motion.div>
  );
}
