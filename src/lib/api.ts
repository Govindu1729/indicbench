// IndicBench API fetch helpers — fully typed

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  numBenchmarks?: number;
  topModel?: {
    name: string;
    slug: string;
    provider: string;
    score: number;
  } | null;
  benchmarks?: Benchmark[];
}

export interface Benchmark {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string;
  category?: Category;
  numQuestions: number;
  difficulty: string;
  modelRankings?: ModelRanking[];
}

export interface AIModel {
  id: string;
  slug: string;
  name: string;
  provider: string;
  version?: string | null;
  description?: string | null;
  overallScore?: number;
  categoryScores?: Record<string, number>;
  numResults?: number;
}

export interface ModelRanking {
  rank: number;
  modelId: string;
  modelName: string;
  modelSlug: string;
  provider: string;
  score: number;
  accuracy: number | null;
  f1Score: number | null;
  latencyMs: number | null;
  costUsd: number | null;
  numCorrect?: number | null;
  numTotal?: number | null;
  evaluatedAt?: string;
  version?: string | null;
}

export interface OverallRankingEntry {
  rank: number;
  model: AIModel;
  overallScore: number;
  categoryScores: Record<string, number>;
  numBenchmarks: number;
}

export interface LeaderboardResponse {
  categories: Category[];
  models: AIModel[];
  results: EvaluationResult[];
  overallRanking: OverallRankingEntry[];
}

export interface EvaluationResult {
  id: string;
  modelId: string;
  benchmarkId: string;
  score: number;
  accuracy: number | null;
  f1Score: number | null;
  latencyMs: number | null;
  costUsd: number | null;
  numCorrect: number | null;
  numTotal: number | null;
  model: AIModel;
  benchmark: Benchmark & { category: Category };
}

export interface StatsResponse {
  totals: {
    benchmarks: number;
    models: number;
    evaluations: number;
    questions: number;
  };
  highestScoringModel: {
    name: string;
    slug: string;
    provider: string;
    overallScore: number;
  } | null;
  categories: Category[];
}

export interface BenchmarksResponse {
  categories: (Category & {
    benchmarks: (Benchmark & { modelRankings: ModelRanking[] })[];
  })[];
}

export interface BenchmarkDetailResponse {
  benchmark: Benchmark & { category: Category };
  modelResults: ModelRanking[];
  totalModels: number;
}

export interface ModelsResponse {
  categories: Category[];
  models: (AIModel & {
    rank: number;
    overallScore: number;
    categoryScores: Record<string, number>;
    numResults: number;
    avgLatencyMs?: number;
    avgCostUsd?: number;
  })[];
}

export interface EvaluateRequest {
  model: string;
  benchmarkSlug: string;
  sampleSize?: number;
}

export interface SampleQuestion {
  question: string;
  expectedAnswer: string;
  modelAnswer: string;
  isCorrect: boolean;
}

export interface EvaluateResponse {
  results: {
    score: number;
    numCorrect: number;
    numTotal: number;
    sampleQuestions: SampleQuestion[];
    model: string;
    modelSlug: string;
    benchmark: string;
    benchmarkSlug: string;
    category: string;
    categorySlug: string;
  };
}

const BASE = "";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchLeaderboard(category?: string): Promise<LeaderboardResponse> {
  const params = category ? `?category=${encodeURIComponent(category)}` : "";
  return fetchJson<LeaderboardResponse>(`/api/leaderboard${params}`);
}

export async function fetchBenchmarks(): Promise<BenchmarksResponse> {
  return fetchJson<BenchmarksResponse>("/api/benchmarks");
}

export async function fetchBenchmarkDetail(slug: string): Promise<BenchmarkDetailResponse> {
  return fetchJson<BenchmarkDetailResponse>(`/api/benchmarks/${encodeURIComponent(slug)}`);
}

export async function fetchModels(): Promise<ModelsResponse> {
  return fetchJson<ModelsResponse>("/api/models");
}

export async function fetchStats(): Promise<StatsResponse> {
  return fetchJson<StatsResponse>("/api/stats");
}

export async function runEvaluation(
  model: string,
  benchmarkSlug: string,
  sampleSize?: number
): Promise<EvaluateResponse> {
  const body: EvaluateRequest = { model, benchmarkSlug, ...(sampleSize ? { sampleSize } : {}) };
  return fetchJson<EvaluateResponse>("/api/evaluate", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/* ===== Submit Benchmark (community contribution) ===== */

export interface SubmitBenchmarkPayload {
  name: string;
  description: string;
  category: string;
  difficulty: string;
  numQuestions: number;
  submitterName: string;
  submitterEmail: string;
  sampleQuestions?: string;
}

export interface SubmitBenchmarkResponse {
  success: boolean;
  id: string;
}

export async function submitBenchmark(
  payload: SubmitBenchmarkPayload
): Promise<SubmitBenchmarkResponse> {
  return fetchJson<SubmitBenchmarkResponse>("/api/submit-benchmark", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ===== Performance Trends ===== */

export interface TrendModel {
  name: string;
  slug: string;
  color: string;
  scores: number[];
}

export interface TrendsResponse {
  timepoints: string[];
  models: TrendModel[];
}

export async function fetchTrends(): Promise<TrendsResponse> {
  return fetchJson<TrendsResponse>("/api/trends");
}
