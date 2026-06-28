import { useMemo } from "react";
import ChurnMetrics from "./ChurnMetrics";

type PredictionLike = { churnProbability?: number | string };

export default function RocAndConfusionSection({
  predictions,
}: {
  predictions: PredictionLike[] | null | undefined;
}) {
  const safePredictions = useMemo(() => predictions ?? [], [predictions]);
  return <ChurnMetrics predictions={safePredictions} />;
}

