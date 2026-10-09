import { NextRequest, NextResponse } from 'next/server';
import { fetchBenchModels, fetchCurrentRankings, checkUsage } from '@/lib/benchlm';

// Test endpoint to verify API key is set
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.BENCHLM_API_KEY;
    const apiBaseUrl = process.env.BENCHLM_API_URL;

    // Check if we have 1
    const hasApiKey = !!apiKey && apiKey.length > 0;
    const hasApiUrl = !!apiBaseUrl && apiBaseUrl.length > 0;

    // Fetch data if API key exists
    const models: Awaited<ReturnType<typeof fetchBenchModels>> = [];
    const rankings: Awaited<ReturnType<typeof fetchCurrentRankings>> = [];

    if (hasApiKey) {
      const allModels = await fetchBenchModels(10);
      models = allModels || [];
      const allRankings = await fetchCurrentRankings(10);
      rankings = allRankings || [];
    }

    return NextResponse.json({
      env: {
        apiKey: hasApiKey ? '✅ SET' : '❌ NOT SET',
        apiBaseUrl: hasApiUrl ? `✅ ${apiBaseUrl}` : '❌ NOT SET'
      },
      data: {
        modelsCount: models.length,
        rankingsCount: rankings.length,
        models: models.slice(0, 5),
        rankings: rankings.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('BenchLM debug error:', error);
    return NextResponse.json({
      error: 'Failed to fetch BenchLM data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
