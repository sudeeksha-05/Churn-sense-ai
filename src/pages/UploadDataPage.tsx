import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import { Upload, FileSpreadsheet, CheckCircle2, Loader2, ArrowRight, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useChurnData } from "@/contexts/ChurnDataContext";
import { processDataset } from "@/lib/churnEngine";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const STEPS = ["Upload CSV", "Preview Data", "Processing", "Complete"] as const;

const processingSteps = [
  { label: "Handling missing values...", icon: "🔍" },
  { label: "Encoding categorical variables...", icon: "🔤" },
  { label: "Scaling numerical features...", icon: "📐" },
  { label: "Training Logistic Regression...", icon: "📈" },
  { label: "Training Random Forest...", icon: "🌲" },
  { label: "Evaluating models...", icon: "⚖️" },
  { label: "Selecting best model (Random Forest)...", icon: "🏆" },
  { label: "Generating predictions...", icon: "✨" },
];

export default function UploadDataPage() {
  const navigate = useNavigate();
  const { setRawData, setResults } = useChurnData();
  const [step, setStep] = useState(0);
  const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [processingStep, setProcessingStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setParsedData(result.data as Record<string, string>[]);
        setStep(1);
      },
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const startProcessing = async () => {
    setStep(2);
    for (let i = 0; i < processingSteps.length; i++) {
      setProcessingStep(i);
      await new Promise((r) => setTimeout(r, 650));
    }
    setRawData(parsedData);
    setResults(processDataset(parsedData));
    setStep(3);
  };

  const columns = parsedData.length > 0 ? Object.keys(parsedData[0]) : [];
  const previewRows = parsedData.slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">Upload Dataset</h1>
        <p className="text-muted-foreground mt-1 text-sm">Import your customer CSV to begin AI analysis</p>
      </motion.div>

      {/* Stepper */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-center gap-1"
      >
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
              i < step ? "gradient-primary text-white shadow-sm" :
              i === step ? "bg-primary/10 text-primary border border-primary/30" :
              "bg-muted text-muted-foreground"
            }`}>
              {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : (
                <span className={`h-4 w-4 flex items-center justify-center rounded-full text-[10px] font-bold ${
                  i === step ? "bg-primary text-white" : "bg-muted-foreground/30 text-muted-foreground"
                }`}>{i + 1}</span>
              )}
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-6 h-0.5 rounded-full transition-all duration-500 ${i < step ? "gradient-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </motion.div>

      {/* Steps */}
      <AnimatePresence mode="wait">

        {/* Step 0: Upload */}
        {step === 0 && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className={`relative rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden
              ${isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border/60 bg-white/80 hover:border-primary/50 hover:bg-primary/3"}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("csv-input")?.click()}
          >
            <div className="p-16 text-center space-y-5">
              <div className="relative inline-block">
                <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl animate-float" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary shadow-lg mx-auto">
                  <CloudUpload className="h-10 w-10 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Drop your CSV file here</h2>
                <p className="text-muted-foreground text-sm mt-1.5">or <span className="text-primary font-medium underline underline-offset-2">click to browse</span></p>
              </div>
              <div className="inline-flex items-center gap-2 bg-muted/60 rounded-full px-4 py-2 text-xs text-muted-foreground">
                <FileSpreadsheet className="h-3.5 w-3.5" /> Accepts .csv files only
              </div>
            </div>
            <input id="csv-input" type="file" accept=".csv" className="hidden" onChange={handleInputChange} />
          </motion.div>
        )}

        {/* Step 1: Preview */}
        {step === 1 && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-4 rounded-2xl bg-white/90 border border-border/50 p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{fileName}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  <span className="text-primary font-medium">{parsedData.length}</span> rows ·{" "}
                  <span className="text-primary font-medium">{columns.length}</span> columns detected
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            </div>

            <div className="rounded-2xl border border-border/50 bg-white/90 overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-border/40 bg-muted/30">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Data Preview (first 5 rows)</p>
              </div>
              <div className="overflow-auto max-h-56">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      {columns.map((col) => (
                        <TableHead key={col} className="whitespace-nowrap text-xs font-semibold">{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row, i) => (
                      <TableRow key={i} className="hover:bg-primary/3 transition-colors">
                        {columns.map((col) => (
                          <TableCell key={col} className="text-xs whitespace-nowrap">{row[col]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={() => setStep(0)} className="text-sm">
                ← Change File
              </Button>
              <Button
                onClick={startProcessing}
                className="gradient-primary border-0 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                Train AI Models <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Processing */}
        {step === 2 && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="rounded-3xl bg-white/90 border border-border/50 shadow-sm p-10 text-center space-y-8"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 rounded-full bg-primary/15 blur-2xl animate-float" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary shadow-lg mx-auto">
                <Loader2 className="h-10 w-10 text-white animate-spin" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground">Training AI Models</h2>
              <p className="text-muted-foreground text-sm mt-1.5">Please wait while we process your data...</p>
            </div>

            {/* Progress bar */}
            <div className="max-w-sm mx-auto">
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full gradient-primary rounded-full"
                  animate={{ width: `${((processingStep + 1) / processingSteps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{Math.round(((processingStep + 1) / processingSteps.length) * 100)}% complete</p>
            </div>

            <div className="max-w-xs mx-auto space-y-2.5">
              {processingSteps.map((ps, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: i <= processingStep ? 1 : 0.3 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <div className="w-6 h-6 flex items-center justify-center rounded-full shrink-0 text-xs">
                    {i < processingStep ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : i === processingStep ? (
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/20" />
                    )}
                  </div>
                  <span className={i <= processingStep ? "text-foreground" : "text-muted-foreground"}>
                    {ps.icon} {ps.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="rounded-3xl bg-white/90 border border-border/50 shadow-sm p-12 text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
              className="relative inline-block"
            >
              <div className="absolute inset-0 rounded-full bg-emerald-200 blur-2xl opacity-60 animate-float" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl mx-auto">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
            </motion.div>

            <div>
              <h2 className="text-3xl font-bold text-foreground">All Done! 🎉</h2>
              <p className="text-muted-foreground mt-2">Random Forest selected as best model</p>
              <div className="inline-flex items-center gap-2 mt-3 bg-emerald-50 text-emerald-700 text-sm px-4 py-1.5 rounded-full border border-emerald-200">
                F1-Score: <span className="font-bold">0.88</span> · Accuracy: <span className="font-bold">86%</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <Button
                onClick={() => navigate("/predictions")}
                className="gradient-primary border-0 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 px-6"
              >
                View Predictions <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard")} className="px-6">
                Dashboard
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
