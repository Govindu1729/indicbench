import { NextRequest, NextResponse } from 'next/server';

// Simple health check to verify environment variables
export async function GET(request: NextRequest) {
  const hasDbUrl = !!process.env.DATABASE_URL;
  const hasApiKey = !!process.env.BENCHLM_API_KEY;
  const hasApiUrl = !!process.env.BENCHLM_API_URL;

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      hasDatabaseUrl: hasDbUrl ? '✅' : '❌',
      hasApiKey: hasApiKey ? '✅' : '❌',
      hasApiUrl: hasApiUrl ? '✅' : '❌',
    },
    vercel: {
      platform: process.env.VERCEL || 'unknown',
      projectUrl: process.env.VERCEL_URL || 'local',
      productionUrl: process.env.NEXT_PUBLIC_VERCEL_URL || 'local',
    }
  });
}
