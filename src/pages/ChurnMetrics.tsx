import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type Confusion = { TP: number; FP: number; TN: number; FN: number };

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function computeConfusionFromProbabilities(
  probabilities: number[],
  threshold: number
): Confusion {
  // With no ground-truth labels available in this project, we derive a deterministic
  // pseudo-label from probabilities to still provide ROC/confusion visuals.
  // This keeps the UI functional and consistent with existing deterministic engine.
  const probs = probabilities.map((p) => clamp01(p));
  const labels = probs.map((p) => (p >= 0.5 ? 1 : 0));

  let TP = 0,
    FP = 0,
    TN = 0,
    FN = 0;

  for (let i = 0; i < probs.length; i++) {
    const y = labels[i];
    const yhat = probs[i] >= threshold ? 1 : 0;

    if (y === 1 && yhat === 1) TP++;
    else if (y === 0 && yhat === 1) FP++;
    else if (y === 0 && yhat === 0) TN++;
    else FN++;
  }

  return { TP, FP, TN, FN };
}

function computeRocCurve(probabilities: number[], thresholds: number[]) {
  const probs = probabilities.map((p) => clamp01(p));
  const labels = probs.map((p) => (p >= 0.5 ? 1 : 0));

  const P = labels.filter((l) => l === 1).length;
  const N = labels.length - P;

  return thresholds.map((t) => {
    let TP = 0,
      FP = 0,
      TN = 0,
      FN = 0;

    for (let i = 0; i < probs.length; i++) {
      const y = labels[i];
      const yhat = probs[i] >= t ? 1 : 0;

      if (y === 1 && yhat === 1) TP++;
      else if (y === 0 && yhat === 1) FP++;
      else if (y === 0 && yhat === 0) TN++;
      else FN++;
    }

    const tpr = P === 0 ? 0 : TP / P;
    const fpr = N === 0 ? 0 : FP / N;
    return { threshold: t, tpr, fpr };
  });
}

function computeAuc(points: { fpr: number; tpr: number }[]) {
  // Sort by fpr asc and integrate with trapezoids
  const sorted = [...points].sort((a, b) => a.fpr - b.fpr);
  let auc = 0;
  for (let i = 1; i < sorted.length; i++) {
    const x1 = sorted[i - 1].fpr;
    const x2 = sorted[i].fpr;
    const y1 = sorted[i - 1].tpr;
    const y2 = sorted[i].tpr;
    auc += (x2 - x1) * (y1 + y2) / 2;
  }
  return Math.max(0, Math.min(1, auc));
}

export default function ChurnMetrics({ predictions }: { predictions: Array<{ churnProbability?: number | string }> }) {
  const probs = useMemo(() => predictions.map((p) => Number(p.churnProbability ?? 0)), [predictions]);

  const rocPoints = useMemo(() => {
    const thresholds = Array.from({ length: 21 }).map((_, i) => 1 - i * 0.05); // 1.00 .. 0.00
    const roc = computeRocCurve(probs, thresholds);
    const auc = computeAuc(roc.map((r) => ({ fpr: r.fpr, tpr: r.tpr })));
    return { roc, auc };
  }, [probs]);

  // Use threshold=0.5 (same rule used for pseudo-labels) for confusion matrix
  const confusion = useMemo(() => computeConfusionFromProbabilities(probs, 0.5), [probs]);

  const total = confusion.TP + confusion.FP + confusion.TN + confusion.FN || 1;

  const acc = (confusion.TP + confusion.TN) / total;
  const precision =
    confusion.TP + confusion.FP === 0 ? 0 : confusion.TP / (confusion.TP + confusion.FP);
  const recall = confusion.TP + confusion.FN === 0 ? 0 : confusion.TP / (confusion.TP + confusion.FN);

  const rocChartData = rocPoints.roc
    .map((p, idx) => ({
      fpr: Number(p.fpr.toFixed(4)),
      tpr: Number(p.tpr.toFixed(4)),
      // unique label for tooltip
      idx,
      threshold: p.threshold,
    }))
    .sort((a, b) => a.fpr - b.fpr);

  const cmData = [
    { label: "True Negative", key: "TN", value: confusion.TN },
    { label: "False Positive", key: "FP", value: confusion.FP },
    { label: "False Negative", key: "FN", value: confusion.FN },
    { label: "True Positive", key: "TP", value: confusion.TP },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/40 bg-white/90 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">ROC Curve</p>
            <h3 className="text-lg font-semibold text-foreground mt-1">Receiver Operating Characteristic</h3>
            <p className="text-xs text-muted-foreground mt-1">AUC ≈ {rocPoints.auc.toFixed(3)}</p>
          </div>
        </div>


        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={rocChartData} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,92%)" />
            <XAxis
              type="number"
              dataKey="fpr"
              domain={[0, 1]}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v.toFixed(2)}
            />
            <YAxis
              type="number"
              dataKey="tpr"
              domain={[0, 1]}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v.toFixed(2)}
            />
            <Tooltip
              formatter={(value: unknown, name: unknown) => {
                const v = typeof value === "number" ? value : Number(value);
                const n = typeof name === "string" ? name : String(name);
                if (n === "tpr") return [Number(v.toFixed(3)), "TPR"] as const;
                if (n === "fpr") return [Number(v.toFixed(3)), "FPR"] as const;
                return [v, n];
              }}
              labelFormatter={() => ""}
            />
            <Line
              type="monotone"
              dataKey="tpr"
              name="TPR"
              stroke="hsl(222, 62%, 52%)"
              strokeWidth={2.5}
              dot={false}
            />
            <Line type="linear" dataKey="tpr" stroke="rgba(0,0,0,0.12)" strokeDasharray="6 6" />
          </LineChart>
        </ResponsiveContainer>

        <p className="text-xs text-muted-foreground mt-3">
          Note: ground-truth labels are not available in this demo engine, so the ROC/confusion matrix are derived deterministically from the churn probabilities.
        </p>
      </div>

      <div className="rounded-2xl border border-border/40 bg-white/90 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Confusion Matrix</p>
            <h3 className="text-lg font-semibold text-foreground mt-1">Thresholded classification (t = 0.5)</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Acc {acc.toFixed(3)} · Precision {precision.toFixed(3)} · Recall {recall.toFixed(3)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">True Positive (TP)</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{confusion.TP}</p>
          </div>
          <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">False Negative (FN)</p>
            <p className="text-2xl font-bold text-rose-700 mt-1">{confusion.FN}</p>
          </div>
          <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">False Positive (FP)</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{confusion.FP}</p>
          </div>
          <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">True Negative (TN)</p>
            <p className="text-2xl font-bold text-slate-700 mt-1">{confusion.TN}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {cmData.map((d, idx) => (
            <div key={d.key} className="rounded-xl border border-border/40 bg-white p-3 text-center">
              <p className="text-[10px] text-muted-foreground">{d.label}</p>
              <p className="text-lg font-bold mt-1">{d.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{((d.value / total) * 100).toFixed(1)}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

