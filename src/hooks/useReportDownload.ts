import type { PredictResponse } from "@/types/api";

/**
 * Generates a fully-styled printable HTML report and opens it in a new window.
 * The user can then File → Print → Save as PDF (works in every modern browser).
 */
export function useReportDownload() {
  function downloadReport(apiData: PredictResponse, patientLabel = "Patient") {
    const topPred = apiData.top_predictions?.[0] ?? apiData.ontology_support?.[0];
    const conditionName =
      (topPred as any)?.condition ?? "Unknown Condition";
    const confidence =
      (topPred as any)?.probability_percent ??
      (topPred as any)?.score_percent ??
      0;
    const analysisPath = apiData.path ?? "Hybrid Analysis";

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // ── Confirmatory Tests ──
    const rawTests =
      (topPred as any)?.confirmatory_tests ?? apiData.recommended_tests ?? [];
    const tests: { name: string; reason: string }[] = rawTests.map((t: any) =>
      typeof t === "string"
        ? { name: t, reason: "Recommended follow-up test" }
        : { name: t.test ?? t.name, reason: t.reason ?? "Recommended test" }
    );

    // ── Specialties ──
    const specialties: string[] = (topPred as any)?.specialty
      ? [(topPred as any).specialty]
      : apiData.specialty ?? [];

    // ── Ontology rules ──
    const rules: { feature: string; direction: string }[] =
      apiData.ontology_support?.[0]?.matched_rules ?? [];

    // ── Red flags ──
    const redFlags = apiData.red_flags ?? [];

    // ── Urgency colour ──
    const urgencyColor =
      confidence >= 70 ? "#16a34a" : confidence >= 40 ? "#d97706" : "#dc2626";
    const pathColor =
      analysisPath.toLowerCase().includes("ontology") ? "#7c3aed" : "#2563eb";

    // ── Additional predictions ──
    const otherPredictions = (apiData.top_predictions ?? []).slice(1, 4);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CBC Analysis Report – ${conditionName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', Arial, sans-serif;
      color: #1e293b;
      background: #fff;
      font-size: 13px;
      line-height: 1.6;
    }

    /* ── Page Layout ── */
    .page { max-width: 800px; margin: 0 auto; padding: 28px 32px; }

    /* ── Header ── */
    .header {
      background: linear-gradient(135deg, #1d4ed8 0%, #0891b2 100%);
      color: white;
      padding: 24px 28px;
      border-radius: 12px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
    .header .subtitle { font-size: 12px; opacity: 0.85; }
    .header .meta { text-align: right; font-size: 11px; opacity: 0.8; line-height: 1.8; }

    /* ── Diagnosis Banner ── */
    .diagnosis-banner {
      border: 2px solid #bfdbfe;
      background: #eff6ff;
      border-radius: 10px;
      padding: 20px 24px;
      margin-bottom: 20px;
    }
    .diagnosis-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #3b82f6; font-weight: 700; margin-bottom: 6px; }
    .diagnosis-name { font-size: 26px; font-weight: 900; color: #1e293b; }
    .diagnosis-meta { margin-top: 10px; display: flex; gap: 16px; flex-wrap: wrap; }
    .badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700;
    }
    .badge-confidence { background: #dcfce7; color: #15803d; }
    .badge-path { background: #ede9fe; color: #6d28d9; }
    .badge-urgent { background: #fee2e2; color: #b91c1c; }

    /* ── Section ── */
    .section { margin-bottom: 22px; }
    .section-title {
      font-size: 13px; font-weight: 700; color: #374151;
      border-left: 3px solid #3b82f6; padding-left: 10px;
      margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.06em;
    }

    /* ── Confidence Meter ── */
    .meter-wrap { background: #f1f5f9; border-radius: 8px; height: 14px; overflow: hidden; margin: 6px 0; }
    .meter-fill { height: 14px; border-radius: 8px; transition: width 0.3s; }
    .meter-labels { display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-top: 3px; }

    /* ── Two-column grid ── */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    /* ── Cards ── */
    .card {
      border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px;
      background: #f8fafc;
    }
    .card-title { font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 8px; }

    /* ── CBC Rules ── */
    .rule-tag {
      display: inline-block;
      background: #dbeafe; color: #1d4ed8;
      border-radius: 4px; padding: 3px 8px;
      font-size: 11px; font-weight: 600;
      margin: 2px 3px 2px 0;
      text-transform: capitalize;
    }

    /* ── Tests ── */
    .test-row {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 8px 0; border-bottom: 1px solid #f1f5f9;
    }
    .test-row:last-child { border-bottom: none; }
    .test-num {
      width: 22px; height: 22px; border-radius: 50%;
      background: #0891b2; color: white;
      font-size: 11px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .test-name { font-weight: 600; font-size: 12px; }
    .test-reason { font-size: 11px; color: #64748b; margin-top: 1px; }

    /* ── Specialty ── */
    .specialty-card {
      background: linear-gradient(135deg, #eff6ff, #f0fdf4);
      border: 1px solid #bfdbfe; border-radius: 10px;
      padding: 14px 18px; display: flex; align-items: center; gap: 12px;
    }
    .specialty-icon {
      width: 40px; height: 40px; border-radius: 50%;
      background: #2563eb; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; flex-shrink: 0;
    }

    /* ── Other Predictions ── */
    .pred-row {
      display: flex; align-items: center; gap: 10px;
      padding: 6px 0; border-bottom: 1px solid #f1f5f9;
    }
    .pred-row:last-child { border-bottom: none; }
    .pred-rank {
      font-size: 10px; font-weight: 700; width: 20px; color: #94a3b8; text-align: right;
    }
    .pred-name { flex: 1; font-size: 12px; font-weight: 600; }
    .pred-pct { font-size: 11px; font-weight: 700; }

    /* ── Red Flags ── */
    .flag-item {
      display: flex; align-items: flex-start; gap: 8px;
      padding: 6px 10px; background: #fff1f2; border-left: 3px solid #f43f5e;
      border-radius: 4px; margin-bottom: 6px; font-size: 12px; color: #9f1239;
    }

    /* ── Disclaimer ── */
    .disclaimer {
      background: #fffbeb; border: 1px solid #fde68a;
      border-radius: 8px; padding: 12px 16px;
      font-size: 11px; color: #92400e; line-height: 1.6; margin-top: 16px;
    }

    /* ── Footer ── */
    .footer {
      margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0;
      display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;
    }

    /* ── Print ── */
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div>
      <div style="font-size:11px;opacity:0.7;margin-bottom:4px;">🩸 CBC AI Analysis System</div>
      <h1>Diagnostic Report</h1>
      <div class="subtitle">Hybrid AI + Medical Ontology Analysis</div>
    </div>
    <div class="meta">
      <div><strong>Date:</strong> ${dateStr}</div>
      <div><strong>Time:</strong> ${timeStr}</div>
      <div><strong>Patient:</strong> ${patientLabel}</div>
      <div><strong>Report ID:</strong> CBC-${Date.now().toString(36).toUpperCase()}</div>
    </div>
  </div>

  <!-- Diagnosis Banner -->
  <div class="diagnosis-banner">
    <div class="diagnosis-label">Primary Diagnosis</div>
    <div class="diagnosis-name">${conditionName}</div>
    <div class="diagnosis-meta">
      <span class="badge badge-confidence">
        ✓ Confidence: ${Math.round(confidence)}%
      </span>
      <span class="badge badge-path">
        ⚡ ${analysisPath}
      </span>
      ${apiData.urgent_attention ? '<span class="badge badge-urgent">⚠ Urgent Attention Required</span>' : ""}
    </div>
  </div>

  <!-- Confidence Meter -->
  <div class="section">
    <div class="section-title">Prediction Confidence</div>
    <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:11px;font-weight:600;">
      <span>${conditionName}</span>
      <span style="color:${urgencyColor}">${Math.round(confidence)}%</span>
    </div>
    <div class="meter-wrap">
      <div class="meter-fill" style="width:${Math.min(100, confidence)}%;background:${urgencyColor};"></div>
    </div>
    <div class="meter-labels"><span>0% – Low</span><span>50% – Moderate</span><span>100% – High</span></div>
  </div>

  <!-- CBC Pattern + Other Predictions -->
  <div class="grid-2">

    <!-- CBC Pattern -->
    <div class="section">
      <div class="section-title">CBC Pattern Detected</div>
      <div class="card">
        <div class="card-title">Ontology-Matched Rules</div>
        ${
          rules.length > 0
            ? rules
                .map(
                  (r) =>
                    `<span class="rule-tag">${r.feature} ${r.direction}</span>`
                )
                .join("")
            : '<span style="font-size:12px;color:#94a3b8;">Pattern analysis completed</span>'
        }
      </div>
    </div>

    <!-- Other Predictions -->
    ${
      otherPredictions.length > 0
        ? `<div class="section">
      <div class="section-title">Other Possible Conditions</div>
      <div class="card">
        <div class="card-title">Differential Diagnosis</div>
        ${otherPredictions
          .map(
            (p: any, i: number) => `
          <div class="pred-row">
            <span class="pred-rank">#${i + 2}</span>
            <span class="pred-name">${p.condition}</span>
            <span class="pred-pct" style="color:#64748b">${Math.round(p.probability_percent ?? 0)}%</span>
          </div>`
          )
          .join("")}
      </div>
    </div>`
        : ""
    }
  </div>

  <!-- Red Flags -->
  ${
    redFlags.length > 0
      ? `<div class="section">
    <div class="section-title" style="border-left-color:#f43f5e;">Red Flags</div>
    ${redFlags.map((f) => `<div class="flag-item">⚠ ${f}</div>`).join("")}
  </div>`
      : ""
  }

  <!-- Confirmatory Tests -->
  ${
    tests.length > 0
      ? `<div class="section">
    <div class="section-title">Recommended Confirmatory Tests</div>
    <div class="card" style="background:#f0fdfa;border-color:#99f6e4;">
      ${tests
        .map(
          (t, i) => `
        <div class="test-row">
          <div class="test-num">${i + 1}</div>
          <div>
            <div class="test-name">${t.name}</div>
            <div class="test-reason">${t.reason}</div>
          </div>
        </div>`
        )
        .join("")}
    </div>
  </div>`
      : ""
  }

  <!-- Medical Specialty -->
  ${
    specialties.length > 0
      ? `<div class="section">
    <div class="section-title">Recommended Medical Specialist</div>
    ${specialties
      .map(
        (sp) => `
      <div class="specialty-card" style="margin-bottom:8px;">
        <div class="specialty-icon">🩺</div>
        <div>
          <div style="font-weight:700;font-size:14px;">${sp}</div>
          <div style="font-size:11px;color:#64748b;margin-top:2px;">Consult this specialist for further evaluation and treatment planning.</div>
        </div>
      </div>`
      )
      .join("")}
  </div>`
      : ""
  }

  <!-- Disclaimer -->
  <div class="disclaimer">
    <strong>⚠ Important Medical Disclaimer:</strong> ${
      apiData.disclaimer ||
      "This report is generated by an AI-assisted CBC analysis system and is intended for clinical decision support only. It does not replace professional medical judgment. All findings must be evaluated by a qualified healthcare professional in the context of the patient's complete clinical picture."
    }
  </div>

  <!-- Footer -->
  <div class="footer">
    <span>Generated by CBC AI Analysis System — ${dateStr} ${timeStr}</span>
    <span>For medical use only — Not a substitute for professional diagnosis</span>
  </div>

</div>

<script>
  // Auto-trigger print dialog
  window.onload = function() {
    setTimeout(function() { window.print(); }, 400);
  };
<\/script>
</body>
</html>`;

    // Open in a new tab and trigger print
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) {
      alert("Please allow popups for this site to download the report.");
      return;
    }
    win.document.write(html);
    win.document.close();
  }

  return { downloadReport };
}
