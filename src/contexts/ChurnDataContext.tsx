import React, { createContext, useContext, useState, ReactNode } from "react";
import { ChurnResults } from "@/lib/churnEngine";

interface ChurnDataContextType {
  rawData: Record<string, string>[] | null;
  setRawData: (data: Record<string, string>[]) => void;
  results: ChurnResults | null;
  setResults: (results: ChurnResults) => void;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
}

const ChurnDataContext = createContext<ChurnDataContextType | undefined>(undefined);

export function ChurnDataProvider({ children }: { children: ReactNode }) {
  const [rawData, setRawData] = useState<Record<string, string>[] | null>(null);
  const [results, setResults] = useState<ChurnResults | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <ChurnDataContext.Provider value={{ rawData, setRawData, results, setResults, isProcessing, setIsProcessing }}>
      {children}
    </ChurnDataContext.Provider>
  );
}

export function useChurnData() {
  const ctx = useContext(ChurnDataContext);
  if (!ctx) throw new Error("useChurnData must be used within ChurnDataProvider");
  return ctx;
}
