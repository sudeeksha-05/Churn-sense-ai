import { motion } from "framer-motion";
import { Brain, Upload, BarChart3, Shield, ArrowRight, Sparkles, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Upload,
    title: "Upload & Parse",
    description: "Drop any CSV dataset and watch our engine instantly parse, clean, and prepare your customer data.",
    color: "from-blue-50 to-indigo-50",
    iconBg: "from-blue-500 to-indigo-500",
  },
  {
    icon: Brain,
    title: "AI Predictions",
    description: "Dual ML models — Logistic Regression & Random Forest — compete to give you the most accurate churn predictions.",
    color: "from-violet-50 to-purple-50",
    iconBg: "from-violet-500 to-purple-500",
  },
  {
    icon: BarChart3,
    title: "Visual Dashboard",
    description: "Beautiful interactive charts reveal churn trends, risk distribution, and the features driving customer loss.",
    color: "from-cyan-50 to-sky-50",
    iconBg: "from-cyan-500 to-sky-500",
  },
  {
    icon: Shield,
    title: "Retention Plans",
    description: "AI-crafted personalized retention strategies for every at-risk customer, ready to act on immediately.",
    color: "from-emerald-50 to-teal-50",
    iconBg: "from-emerald-500 to-teal-500",
  },
];

const stats = [
  { value: "88%", label: "Model Accuracy", icon: TrendingUp },
  { value: "2", label: "ML Algorithms", icon: Brain },
  { value: "∞", label: "Customers Analyzed", icon: Users },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto space-y-16">

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative text-center space-y-7 py-14"
      >
        {/* Decorative blobs */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(222,80%,70%), hsl(252,80%,75%))" }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
        >
          <Sparkles className="h-3.5 w-3.5 animate-float" />
          AI-Powered Churn Intelligence
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
          Predict Churn.
          <br />
          <span className="text-gradient">Retain What Matters.</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Upload your customer data and let our AI engine surface churn risk, identify key drivers,
          and generate personalized retention strategies — all in seconds.
        </p>

        <div className="flex items-center justify-center gap-4 pt-2">
          <Button
            size="lg"
            onClick={() => navigate("/upload")}
            className="gradient-primary gradient-animate border-0 text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 px-7"
          >
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="border-border/60 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
          >
            View Dashboard
          </Button>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex items-center justify-center gap-10 pt-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-bold text-gradient">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Features */}
      <div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest mb-8"
        >
          Everything you need
        </motion.p>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className={`group rounded-2xl bg-gradient-to-br ${f.color} p-6 border border-white/80 shadow-sm card-hover cursor-default`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${f.iconBg} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-base">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {f.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden p-10 text-center text-white"
        style={{ background: "linear-gradient(135deg, hsl(228,30%,18%), hsl(240,40%,25%))" }}
      >
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(222,80%,50%) 0%, transparent 50%), radial-gradient(circle at 80% 50%, hsl(252,70%,55%) 0%, transparent 50%)" }} />
        <div className="relative z-10 space-y-4">
          <Brain className="h-10 w-10 mx-auto text-white/80 animate-float" />
          <h2 className="text-2xl font-bold">Ready to reduce churn?</h2>
          <p className="text-white/70 max-w-md mx-auto text-sm leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Upload your customer CSV and get AI predictions with personalized retention strategies in under a minute.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/upload")}
            className="bg-white text-foreground hover:bg-white/90 shadow-lg hover:-translate-y-0.5 transition-all duration-300 mt-2"
          >
            Start Analyzing <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>

    </div>
  );
}
