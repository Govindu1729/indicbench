import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fetchCurrentRankings, fetchBenchModels } from '@/lib/benchlm';

// Import BenchLM rankings and models into local database
export async function POST(request: NextRequest) {
  try {
    // Fetch from BenchLM API
    const rankings = await fetchCurrentRankings(50);
    const models = await fetchBenchModels();

    console.log(`Fetching ${models.length} models from BenchLM`);
    console.log(`Fetching ${rankings.length} rankings from BenchLM`);

    // Ensure benchmark category exists
    let category = await db.benchmarkCategory.findFirst();
    if (!category) {
      category = await db.benchmarkCategory.create({
        data: {
          slug: 'general',
          name: 'General',
          description: 'General benchmarks',
          icon: '📊',
          color: '#f59e0b',
          order: 0,
        },
      });
      console.log('Created benchmark category:', category.id);
    }

    // Create/update models in database
    const createdModels: any[] = [];
    for (const model of models) {
      try {
        const existing = await db.aIModel.findUnique({
          where: { slug: model.key },
        });

        let dbModel;
        if (existing) {
          dbModel = await db.aIModel.update({
            where: { id: existing.id },
            data: {
              name: model.name,
              provider: model.creator || 'BenchLM',
              version: model.parameterCount || '',
            },
          });
        } else {
          dbModel = await db.aIModel.create({
            data: {
              slug: model.key,
              name: model.name,
              provider: model.creator || 'BenchLM',
              version: model.parameterCount || '',
            },
          });
        }
        createdModels.push(dbModel);
      } catch (e) {
        console.error(`Failed to process model ${model.key}:`, e);
      }
    }

    console.log(`Created/updated ${createdModels.length} models`);

    // Create evaluation results from rankings
    const createdResults: any[] = [];
    for (const ranking of rankings) {
      // Find benchmark - using default or create one
      let benchmark = await db.benchmark.findFirst({
        where: { name: 'BenchAlign Overall' },
      });

      if (!benchmark) {
        benchmark = await db.benchmark.create({
          data: {
            slug: 'benchalign-overall',
            name: 'BenchAlign Overall',
            description: 'Aggregated benchmark scores from BenchLM',
            categoryId: await db.benchmarkCategory.findFirst({ select: { id: true } }).then(r => r?.id) || '',
            numQuestions: 0,
            difficulty: 'mixed',
          },
        });
      }

      // Create/update result
      const result = await db.evaluationResult.upsert({
        where: {
          modelId_benchmarkId: {
            modelId: createdModels.find(m => m.slug === ranking.modelKey)?.id || '',
            benchmarkId: benchmark.id,
          },
        },
        create: {
          modelId: createdModels.find(m => m.slug === ranking.modelKey)?.id || '',
          benchmarkId: benchmark.id,
          score: ranking.score,
          evaluatedAt: new Date(),
        },
        update: {
          score: ranking.score,
          evaluatedAt: new Date(),
        },
      });
      createdResults.push(result);
    }

    return NextResponse.json({
      success: true,
      modelsSynced: createdModels.length,
      resultsSynced: createdResults.length,
    });
  } catch (error) {
    console.error('BenchLM import error:', error);
    return NextResponse.json(
      { error: 'Failed to import BenchLM data' },
      { status: 500 }
    );
  }
}
