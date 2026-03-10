import { motion } from "framer-motion";
import { useChurnData } from "@/contexts/ChurnDataContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line, CartesianGrid, Legend,
} from "recharts";

const PIE_COLORS = ["hsl(222, 62%, 55%)", "hsl(355, 78%, 60%)"];
const RISK_COLORS = ["hsl(158, 64%, 45%)", "hsl(35, 90%, 54%)", "hsl(355, 78%, 60%)"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg px-4 py-3 text-sm">
        {label && <p className="font-medium text-foreground mb-1">{label}</p>}
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color || p.fill }} className="font-semibold">
            {p.name || p.dataKey}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
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
          <h2 className="text-xl font-semibold text-foreground">No data yet</h2>
          <p className="text-muted-foreground text-sm mt-1">Upload a CSV file to see your analytics dashboard</p>
        </div>
        <Button onClick={() => navigate("/upload")} className="gradient-primary border-0 text-white shadow-md mt-2">
          Upload Data
        </Button>
      </motion.div>
    );
  }

  const churnPieData = [
    { name: "Non-Churn", value: results.totalCustomers - results.predictedChurn },
    { name: "Churn", value: results.predictedChurn },
  ];

  const riskData = [
    { name: "Low", count: results.predictions.filter(p => p.riskLevel === "Low").length, fill: RISK_COLORS[0] },
    { name: "Medium", count: results.predictions.filter(p => p.riskLevel === "Medium").length, fill: RISK_COLORS[1] },
    { name: "High", count: results.predictions.filter(p => p.riskLevel === "High").length, fill: RISK_COLORS[2] },
  ];

  const trendData = [
    "0-10%","11-20%","21-30%","31-40%","41-50%",
    "51-60%","61-70%","71-80%","81-90%","91-100%"
  ].map((range, i) => {
    const lo = i * 0.1, hi = lo + 0.1;
    return {
      range,
      count: results.predictions.filter(p => p.churnProbability >= lo && p.churnProbability < hi).length,
    };
  });

  const card = "rounded-2xl bg-white/90 border border-border/40 shadow-sm p-6";

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visual breakdown of your churn prediction results</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={card}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">Churn vs Non-Churn</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={churnPieData} cx="50%" cy="50%"
                innerRadius={65} outerRadius={95} dataKey="value"
                paddingAngle={3}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: "hsl(220,15%,70%)" }}
              >
                {churnPieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} stroke="white" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Risk Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={card}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">Risk Level Distribution</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={riskData} barSize={48}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: "'DM Sans'" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fontFamily: "'DM Sans'" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsla(220,20%,95%,0.6)", radius: 8 }} />
              <Bar dataKey="count" radius={[8, 8, 4, 4]}>
                {riskData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Feature Importance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={card}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">Feature Importance</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={results.featureImportance} layout="vertical" barSize={16}>
              <XAxis type="number" tick={{ fontSize: 11, fontFamily: "'DM Sans'" }} domain={[0, 1]} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="feature" tick={{ fontSize: 11, fontFamily: "'DM Sans'" }} width={110} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsla(220,20%,95%,0.6)" }} />
              <Bar dataKey="importance" fill="url(#importanceGrad)" radius={[0, 6, 6, 0]}>
                <defs>
                  <linearGradient id="importanceGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(310, 62%, 52%)" />
                    <stop offset="100%" stopColor="hsl(252,60%,62%)" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Probability Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className={card}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">Churn Probability Distribution</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,92%)" />
              <XAxis dataKey="range" tick={{ fontSize: 9, fontFamily: "'DM Sans'" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: "'DM Sans'" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="count" name="Customers"
                stroke="hsl(222, 62%, 52%)" strokeWidth={2.5}
                dot={{ fill: "hsl(222, 62%, 52%)", r: 4, strokeWidth: 2, stroke: "white" }}
                activeDot={{ r: 6, fill: "hsl(222, 62%, 52%)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

      </div>
    </div>
  );
}
