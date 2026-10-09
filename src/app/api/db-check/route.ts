import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Detailed database connection check
export async function GET() {
  try {
    // Try basic query
    const category = await db.benchmarkCategory.findFirst();
    
    return NextResponse.json({
      status: 'connected',
      database: {
        provider: 'postgresql',
        connection: 'success'
      },
      data: {
        categories: category ? '✅ Found' : '❌ Empty',
        sample: category ? {
          id: category.id,
          slug: category.slug,
          name: category.name
        } : null
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
