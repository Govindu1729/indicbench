import { NextRequest, NextResponse } from 'next/server';
import { fetchBenchModels, fetchCurrentRankings, fetchBenchmarks, checkUsage } from '@/lib/benchlm';

// Sync BenchLM data to local database
export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json();

    switch (type) {
      case 'models': {
        const models = await fetchBenchModels();
        // In production, save to DB here
        return NextResponse.json({ models: models.slice(0, 50) });
      }
      case 'rankings': {
        const rankings = await fetchCurrentRankings();
        return NextResponse.json({ rankings: rankings.slice(0, 50) });
      }
      case 'benchmarks': {
        const benchmarks = await fetchBenchmarks();
        return NextResponse.json({ benchmarks: benchmarks.slice(0, 50) });
      }
      case 'usage': {
        const usage = await checkUsage();
        return NextResponse.json(usage);
      }
      default:
        return NextResponse.json({ error: 'Invalid sync type' }, { status: 400 });
    }
  } catch (error) {
    console.error('BenchLM sync error:', error);
    return NextResponse.json({ error: 'Failed to sync BenchLM data' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const usage = await checkUsage();
    const models = await fetchBenchModels();
    const rankings = await fetchCurrentRankings();
    const benchmarks = await fetchBenchmarks();

    return NextResponse.json({
      usage,
      models: models.slice(0, 100),
      rankings: rankings.slice(0, 100),
      benchmarks: benchmarks.slice(0, 100),
    });
  } catch (error) {
    console.error('BenchLM fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch BenchLM data' }, { status: 500 });
  }
}
