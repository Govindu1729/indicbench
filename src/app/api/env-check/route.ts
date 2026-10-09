import { NextRequest, NextResponse } from 'next/server';
import { fetchCurrentRankings, fetchBenchModels } from '@/lib/benchlm';

// Test endpoint to check environment variables
export async function GET() {
  return NextResponse.json({
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET',
      BENCHLM_API_KEY: process.env.BENCHLM_API_KEY ? '✅ SET' : '❌ NOT SET',
      BENCHLM_API_URL: process.env.BENCHLM_API_URL || '❌ NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'development'
    }
  });
}
