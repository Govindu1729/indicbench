import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Fetch all models
    const models = await db.aIModel.findMany({
      orderBy: { name: "asc" },
    });

    // Fetch all evaluation results with benchmark and category info
    const results = await db.evaluationResult.findMany({
      include: {
        benchmark: {
          include: {
            category: true,
          },
        },
      },
    });

    // Fetch all categories for reference
    const categories = await db.benchmarkCategory.findMany({
      orderBy: { order: "asc" },
    });

    // Compute scores per model
    const modelsWithScores = models.map((model) => {
      const modelResults = results.filter((r) => r.modelId === model.id);

      // Overall score (average across all benchmarks)
      const overallScore =
        modelResults.length > 0
          ? Math.round(
              (modelResults.reduce((sum, r) => sum + r.score, 0) /
                modelResults.length) *
                100
            ) / 100
          : 0;

      // Per-category scores
      const categoryScores: Record<string, number> = {};
      for (const category of categories) {
        const catResults = modelResults.filter(
          (r) => r.benchmark.category.slug === category.slug
        );
        if (catResults.length > 0) {
          categoryScores[category.slug] =
            Math.round(
              (catResults.reduce((sum, r) => sum + r.score, 0) /
                catResults.length) *
                100
            ) / 100;
        } else {
          categoryScores[category.slug] = 0;
        }
      }

      // Avg latency
      const avgLatencyMs =
        modelResults.length > 0
          ? Math.round(
              modelResults.reduce((sum, r) => sum + (r.latencyMs ?? 0), 0) /
                modelResults.length
            )
          : 0;

      // Avg cost
      const avgCostUsd =
        modelResults.length > 0
          ? Math.round(
              (modelResults.reduce((sum, r) => sum + (r.costUsd ?? 0), 0) /
                modelResults.length) *
                1000
            ) / 1000
          : 0;

      return {
        ...model,
        overallScore,
        categoryScores,
        numResults: modelResults.length,
        avgLatencyMs,
        avgCostUsd,
      };
    });

    // Sort by overall score descending
    const rankedModels = modelsWithScores
      .sort((a, b) => b.overallScore - a.overallScore)
      .map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }));

    return NextResponse.json({
      categories,
      models: rankedModels,
    });
  } catch (error) {
    console.error("Models API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch models data" },
      { status: 500 }
    );
  }
}
