// BenchLM Data API client

const API_BASE = process.env.BENCHLM_API_URL || 'https://data.benchlm.ai/v1';
const API_KEY = process.env.BENCHLM_API_KEY;

// Debug: log if API key is present (not the value)
if (typeof API_KEY === 'undefined' || API_KEY === '') {
  console.warn('⚠️ BENCHLM_API_KEY is not set in environment variables!');
}

const headers = {
  Authorization: `Bearer ${API_KEY || ''}`,
  'Content-Type': 'application/json',
};

export interface BenchModel {
  id: string;
  key: string;
  name: string;
  creator?: string;
  url?: string;
  releaseDate?: string;
  parameterCount?: string;
  modelType?: string;
}

export interface BenchRanking {
  rank: number;
  modelKey: string;
  slug: string;
  name: string;
  creator?: string;
  score: number;
  scoreInterval90Lower?: number;
  scoreInterval90Upper?: number;
}

export interface BenchBenchmark {
  id: string;
  key: string;
  name: string;
  description: string;
}

export async function fetchBenchModels(limit = 100): Promise<BenchModel[]> {
  if (!API_KEY) {
    console.warn('BENCHLM_API_KEY not configured');
    return [];
  }

  try {
    const response = await fetch(`${API_BASE}/models?limit=${limit}`, { headers });
    if (!response.ok) {
      console.error(`BenchLM API error: ${response.status} ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Failed to fetch BenchLM models:', error);
    return [];
  }
}

export async function fetchCurrentRankings(limit = 100): Promise<BenchRanking[]> {
  if (!API_KEY) {
    console.warn('BENCHLM_API_KEY not configured');
    return [];
  }

  try {
    const response = await fetch(`${API_BASE}/rankings/current?limit=${limit}`, { headers });
    if (!response.ok) {
      console.error(`BenchLM API error: ${response.status} ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Failed to fetch BenchLM rankings:', error);
    return [];
  }
}

export async function fetchBenchmarks(): Promise<BenchBenchmark[]> {
  if (!API_KEY) {
    console.warn('BENCHLM_API_KEY not configured');
    return [];
  }

  try {
    // BenchLM doesn't have a dedicated benchmarks endpoint, return empty for now
    return [];
  } catch (error) {
    console.error('Failed to fetch BenchLM benchmarks:', error);
    return [];
  }
}

export async function checkUsage() {
  // BenchLM API doesn't have a usage endpoint on free tier
  return {
    tier: 'free',
    note: 'BenchLM free tier provides catalog access'
  };
}
