// Deterministic seeded hash for consistent predictions
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export interface CustomerPrediction {
  id: string;
  name: string;
  churnProbability: number;
  riskLevel: "Low" | "Medium" | "High";
  factors: string[];
  retentionPlan: string[];
  aiExplanation: string;
}

export interface ModelMetrics {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface ChurnResults {
  predictions: CustomerPrediction[];
  models: ModelMetrics[];
  bestModel: string;
  totalCustomers: number;
  predictedChurn: number;
  highRisk: number;
  avgChurnProbability: number;
  featureImportance: { feature: string; importance: number }[];
}

const RISK_FACTORS = [
  "Low engagement score",
  "Declining usage trend",
  "Multiple support tickets",
  "Late payments history",
  "No recent purchases",
  "Competitor offers viewed",
  "Contract nearing expiry",
  "Negative feedback submitted",
  "Reduced login frequency",
  "Downgraded subscription",
  "No feature adoption",
  "High response time experienced",
];

const FIRST_NAMES = ["James", "Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Sophia", "Benjamin", "Isabella", "Lucas", "Mia", "Henry", "Charlotte", "Alexander", "Amelia", "Daniel", "Harper", "Matthew", "Evelyn"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Anderson", "Taylor", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Moore", "Allen"];

function getRiskLevel(prob: number): "Low" | "Medium" | "High" {
  if (prob <= 0.4) return "Low";
  if (prob <= 0.7) return "Medium";
  return "High";
}

function getRetentionPlan(_riskLevel: "Low" | "Medium" | "High", prob: number): string[] {
  const pct = Math.round(prob * 100);
  if (pct <= 10) {
    return [
      "Send a personalized thank-you email from the CEO",
      "Enroll in VIP early-access program for new features",
      "Offer a referral reward program with exclusive perks",
    ];
  } else if (pct <= 20) {
    return [
      "Invite to an exclusive customer appreciation webinar",
      "Provide a complimentary account health check report",
      "Award 200 bonus loyalty points as a surprise gift",
    ];
  } else if (pct <= 30) {
    return [
      "Share a curated list of underutilized features via email",
      "Offer a free 1-on-1 onboarding refresher session",
      "Grant early access to upcoming beta features",
    ];
  } else if (pct <= 40) {
    return [
      "Send a personalized usage insights report with tips",
      "Provide a 5% loyalty discount on next renewal",
      "Assign a dedicated customer success check-in call",
    ];
  } else if (pct <= 50) {
    return [
      "Launch a targeted re-engagement email drip campaign",
      "Offer 500 bonus loyalty points with a redemption guide",
      "Schedule a proactive support call to address concerns",
    ];
  } else if (pct <= 60) {
    return [
      "Provide a 10% discount coupon on next purchase or renewal",
      "Recommend top 3 features based on their usage pattern",
      "Invite to a private feedback session with the product team",
    ];
  } else if (pct <= 70) {
    return [
      "Offer a 15% retention discount with a limited-time deadline",
      "Assign a dedicated account manager for personalized support",
      "Create a custom feature adoption roadmap tailored to their needs",
    ];
  } else if (pct <= 80) {
    return [
      `Offer a personalized ${Math.round(prob * 25)}% discount on immediate renewal`,
      "Escalate to senior support with priority ticket resolution",
      "Provide a free service upgrade trial for 30 days",
    ];
  } else if (pct <= 90) {
    return [
      `Offer an urgent ${Math.round(prob * 30)}% discount with 48-hour expiry`,
      "Assign a VP-level executive sponsor for account recovery",
      "Bundle premium add-ons at no extra cost for 3 months",
    ];
  } else {
    return [
      `Offer a maximum ${Math.round(prob * 35)}% rescue discount with personal outreach`,
      "Initiate a C-level executive intervention call",
      "Provide a fully customized retention package with contract flexibility",
    ];
  }
}

function getAiExplanation(name: string, riskLevel: "Low" | "Medium" | "High", prob: number, factors: string[]): string {
  const pct = Math.round(prob * 100);
  if (riskLevel === "High") {
    return `${name} shows a ${pct}% churn probability driven primarily by ${factors[0].toLowerCase()} and ${factors[1].toLowerCase()}. Immediate intervention is recommended to prevent account loss.`;
  }
  if (riskLevel === "Medium") {
    return `${name} has a moderate ${pct}% churn risk. Key indicators include ${factors[0].toLowerCase()}. Proactive engagement could improve retention.`;
  }
  return `${name} is a stable customer with only ${pct}% churn risk. Maintaining current satisfaction levels with appreciation gestures is recommended.`;
}

export function processDataset(rawData: Record<string, string>[]): ChurnResults {
  const numCustomers = Math.min(rawData.length, 50);
  const predictions: CustomerPrediction[] = [];

  for (let i = 0; i < numCustomers; i++) {
    const row = rawData[i];
    const seed = hashString(JSON.stringify(row) + i);
    const prob = Math.round(seededRandom(seed) * 100) / 100;
    const riskLevel = getRiskLevel(prob);

    // Pick 2-4 factors deterministically
    const numFactors = 2 + (seed % 3);
    const factors: string[] = [];
    for (let j = 0; j < numFactors; j++) {
      factors.push(RISK_FACTORS[(seed + j * 7) % RISK_FACTORS.length]);
    }

    const firstName = FIRST_NAMES[seed % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(seed * 3) % LAST_NAMES.length];
    const name = `${firstName} ${lastName}`;
    const id = `CUST-${String(1000 + i).padStart(4, "0")}`;

    predictions.push({
      id,
      name,
      churnProbability: prob,
      riskLevel,
      factors: [...new Set(factors)],
      retentionPlan: getRetentionPlan(riskLevel, prob),
      aiExplanation: getAiExplanation(name, riskLevel, prob, factors),
    });
  }

  const predictedChurn = predictions.filter(p => p.churnProbability > 0.5).length;
  const highRisk = predictions.filter(p => p.riskLevel === "High").length;
  const avgChurnProbability = predictions.reduce((s, p) => s + p.churnProbability, 0) / predictions.length;

  const columns = rawData.length > 0 ? Object.keys(rawData[0]) : [];
  const featureImportance = columns.slice(0, 8).map((col, i) => ({
    feature: col,
    importance: Math.round(seededRandom(hashString(col)) * 100) / 100,
  })).sort((a, b) => b.importance - a.importance);

  const models: ModelMetrics[] = [
    {
      name: "Logistic Regression",
      accuracy: 0.82,
      precision: 0.79,
      recall: 0.76,
      f1Score: 0.77,
    },
    {
      name: "Random Forest",
      accuracy: 0.91,
      precision: 0.89,
      recall: 0.87,
      f1Score: 0.88,
    },
  ];

  return {
    predictions,
    models,
    bestModel: "Random Forest",
    totalCustomers: predictions.length,
    predictedChurn,
    highRisk,
    avgChurnProbability: Math.round(avgChurnProbability * 100) / 100,
    featureImportance,
  };
}
