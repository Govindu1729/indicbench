import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Test database connection
export async function GET() {
  try {
    // Try to query any table
    const category = await db.benchmarkCategory.findFirst();
    const model = await db.aIModel.findFirst();
    const benchmark = await db.benchmark.findFirst();

    return NextResponse.json({
      status: 'connected',
      tables: {
        categories: category ? '✅' : '❌',
        models: model ? '✅' : '❌',
        benchmarks: benchmark ? '✅' : '❌'
      },
      sample: {
        category: category?.slug || null,
        model: model?.name || null
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
