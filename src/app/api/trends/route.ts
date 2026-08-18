import { NextResponse } from "next/server";

interface TrendModel {
  name: string;
  slug: string;
  color: string;
  scores: number[];
}

interface TrendsResponse {
  timepoints: string[];
  models: TrendModel[];
}

// Synthetic, realistic-looking 6-month trend data for top 5 models.
// Scores trend gently upward with small dips for realism.
const TIMEPOINTS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];

const MODELS: TrendModel[] = [
  {
    name: "Claude Opus 4",
    slug: "claude-opus-4",
    color: "#f59e0b", // saffron
    scores: [78, 82, 85, 84, 86, 86.5],
  },
  {
    name: "Gemini 2.5 Pro",
    slug: "gemini-2-5-pro",
    color: "#10b981", // emerald
    scores: [76, 79, 82, 83, 84, 85],
  },
  {
    name: "Claude Sonnet 4",
    slug: "claude-sonnet-4",
    color: "#60a5fa", // blue
    scores: [74, 77, 80, 81, 83, 83.9],
  },
  {
    name: "GPT-4o",
    slug: "gpt-4o",
    color: "#a78bfa", // purple
    scores: [72, 75, 78, 80, 80, 81.5],
  },
  {
    name: "QwQ-32B",
    slug: "qwq-32b",
    color: "#f97316", // orange
    scores: [70, 72, 74, 76, 76, 77],
  },
];

export async function GET(): Promise<NextResponse<TrendsResponse>> {
  const response: TrendsResponse = {
    timepoints: TIMEPOINTS,
    models: MODELS,
  };
  return NextResponse.json(response);
}
