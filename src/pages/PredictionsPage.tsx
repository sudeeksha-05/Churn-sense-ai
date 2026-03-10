import { motion } from "framer-motion";
import { Users, AlertTriangle, TrendingUp, Activity, Upload, ChevronDown } from "lucide-react";
import { useChurnData } from "@/contexts/ChurnDataContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const riskConfig: Record<string, { classes: string; dot: string }> = {
  Low:    { classes: "bg-emerald-50 text-emerald-700 border-emerald-200",   dot: "bg-emerald-500" },
  Medium: { classes: "bg-amber-50 text-amber-700 border-amber-200",         dot: "bg-amber-500" },
  High:   { classes: "bg-rose-50 text-rose-700 border-rose-200",            dot: "bg-rose-500" },
};

const statConfig = [
  { key: "totalCustomers",     label: "Total Customers",  icon: Users,         color: "text-blue-600",   bg: "bg-blue-50" },
  { key: "predictedChurn",     label: "Predicted Churn",  icon: AlertTriangle, color: "text-rose-600",   bg: "bg-rose-50" },
  { key: "highRisk",           label: "High Risk",        icon: TrendingUp,    color: "text-amber-600",  bg: "bg-amber-50" },
  { key: "avgChurnProbability",label: "Avg Churn Risk",   icon: Activity,      color: "text-violet-600", bg: "bg-violet-50" },
];

export default function PredictionsPage() {
  const { results } = useChurnData();
  const navigate = useNavigate();

  if (!results) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] gap-5"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50">
          <Upload className="h-9 w-9 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">No predictions yet</h2>
          <p className="text-muted-foreground text-sm mt-1">Upload a CSV file to generate AI predictions</p>
        </div>
        <Button onClick={() => navigate("/upload")} className="gradient-primary border-0 text-white shadow-md mt-2">
          Upload Data
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">Predictions</h1>
        <p className="text-muted-foreground text-sm mt-1">AI-generated churn predictions and retention strategies</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {statConfig.map((s, i) => {
          const raw = results[s.key as keyof typeof results] as number;
          const display = s.key === "avgChurnProbability" ? `${Math.round(raw * 100)}%` : raw;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl bg-white/90 border border-border/40 shadow-sm p-5 card-hover"
            >
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${s.bg} mb-3`}>
                <s.icon className={`h-4.5 w-4.5 ${s.color}`} style={{ height: "1.1rem", width: "1.1rem" }} />
              </div>
              <p className="text-2xl font-bold text-foreground">{display}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Model Comparison */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-lg font-semibold text-foreground mb-3">Model Comparison</h2>
        <div className="rounded-2xl border border-border/40 bg-white/90 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold text-xs uppercase tracking-wider">Model</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">Accuracy</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">Precision</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">Recall</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">F1-Score</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.models.map((m) => (
                <TableRow key={m.name} className="hover:bg-primary/3 transition-colors">
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{(m.accuracy * 100).toFixed(0)}%</TableCell>
                  <TableCell>{(m.precision * 100).toFixed(0)}%</TableCell>
                  <TableCell>{(m.recall * 100).toFixed(0)}%</TableCell>
                  <TableCell>{(m.f1Score * 100).toFixed(0)}%</TableCell>
                  <TableCell>
                    {m.name === results.bestModel ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold gradient-primary text-white px-3 py-1 rounded-full">
                        🏆 Best Model
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted text-muted-foreground px-3 py-1 rounded-full">
                        Baseline
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Customer Predictions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Customer Predictions</h2>
          <span className="text-xs text-muted-foreground bg-muted/60 px-3 py-1 rounded-full">
            {results.predictions.length} customers
          </span>
        </div>
        <Accordion type="single" collapsible className="space-y-2">
          {results.predictions.map((p, idx) => {
            const cfg = riskConfig[p.riskLevel];
            const prob = Math.round(p.churnProbability * 100);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.03 }}
              >
                <AccordionItem value={p.id} className="rounded-2xl border border-border/40 bg-white/90 shadow-sm overflow-hidden">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/20 transition-colors [&>svg]:hidden">
                    <div className="flex items-center gap-4 w-full">
                      {/* Avatar */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-primary text-white text-xs font-bold shadow-sm">
                        {p.name.split(" ").map((n: string) => n[0]).join("").slice(0,2)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{p.id}</p>
                      </div>
                      {/* Probability bar */}
                      <div className="hidden sm:flex items-center gap-2 w-32">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${prob}%`,
                              background: prob >= 60 ? "hsl(355,78%,60%)" : prob >= 35 ? "hsl(35,90%,54%)" : "hsl(158,64%,45%)",
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-foreground w-8 text-right">{prob}%</span>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${cfg.classes}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                        {p.riskLevel} Risk
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5">
                    <div className="grid md:grid-cols-3 gap-4 pt-3 border-t border-border/30">
                      {/* AI Analysis */}
                      <div className="md:col-span-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4">
                        <p className="text-xs font-semibold text-blue-700 mb-1.5">🤖 AI Analysis</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{p.aiExplanation}</p>
                      </div>
                      {/* Factors */}
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-2">Top Churn Factors</p>
                        <div className="flex flex-wrap gap-1.5">
                          {p.factors.map((f: string) => (
                            <span key={f} className="text-xs bg-muted/70 text-foreground px-2.5 py-1 rounded-full border border-border/40">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                      {/* Retention Plan */}
                      <div className="md:col-span-2">
                        <p className="text-xs font-semibold text-foreground mb-2">📋 Retention Plan</p>
                        <ol className="space-y-2">
                          {p.retentionPlan.map((r: string, i: number) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full gradient-primary text-[10px] font-bold text-white mt-0.5">
                                {i + 1}
                              </span>
                              {r}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            );
          })}
        </Accordion>
      </motion.div>
    </div>
  );
}
