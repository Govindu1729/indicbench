// BenchLM Data API client

const API_BASE = process.env.BENCHLM_API_URL || 'https://data.benchlm.ai/v1';
const API_KEY = process.env.BENCHLM_API_KEY;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

export interface BenchModel {
  id: string;
  key: string;
  name: string;
  organization?: string;
  modelType: string;
  parameterCount?: string;
}

export interface BenchRanking {
  modelKey: string;
  rank: number;
  score: number;
  surface: string;
  benchmark?: string;
}

export interface BenchBenchmark {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
}

export async function fetchBenchModels(): Promise<BenchModel[]> {
  if (!API_KEY) {
    console.warn('BENCHLM_API_KEY not configured');
    return [];
  }

  try {
    const response = await fetch(`${API_BASE}/models`, { headers });
    if (!response.ok) {
      console.error(`BenchLM API error: ${response.status} ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    return data.models || data;
  } catch (error) {
    console.error('Failed to fetch BenchLM models:', error);
    return [];
  }
}

export async function fetchCurrentRankings(limit = 50): Promise<BenchRanking[]> {
  if (!API_KEY) {
    console.warn('BENCHLM_API_KEY not configured');
    return [];
  }

  try {
    const response = await fetch(`${API_BASE}/rankings/current?surface=overall&limit=${limit}`, { headers });
    if (!response.ok) {
      console.error(`BenchLM API error: ${response.status} ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    return data.rankings || data;
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
    const response = await fetch(`${API_BASE}/benchmarks`, { headers });
    if (!response.ok) {
      console.error(`BenchLM API error: ${response.status} ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    return data.benchmarks || data;
  } catch (error) {
    console.error('Failed to fetch BenchLM benchmarks:', error);
    return [];
  }
}

export async function checkUsage() {
  if (!API_KEY) {
    console.warn('BENCHLM_API_KEY not configured');
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}/usage`, { headers });
    if (!response.ok) {
      console.error(`BenchLM API error: ${response.status} ${response.statusText}`);
      return null;
    }
    return response.json();
  } catch (error) {
    console.error('Failed to check BenchLM usage:', error);
    return null;
  }
}
