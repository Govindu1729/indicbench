import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Fetch all categories with their benchmarks
    const categories = await db.benchmarkCategory.findMany({
      include: {
        benchmarks: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    // Fetch all evaluation results with model info
    const results = await db.evaluationResult.findMany({
      include: {
        model: true,
      },
    });

    // Group results by benchmarkId for quick lookup
    const resultsByBenchmark = new Map<string, typeof results>();
    for (const result of results) {
      const existing = resultsByBenchmark.get(result.benchmarkId) ?? [];
      existing.push(result);
      resultsByBenchmark.set(result.benchmarkId, existing);
    }

    // Build the response: benchmarks grouped by category, each with model rankings
    const benchmarksGrouped = categories.map((category) => ({
      ...category,
      benchmarks: category.benchmarks.map((benchmark) => {
        const benchmarkResults = resultsByBenchmark.get(benchmark.id) ?? [];
        const modelRankings = benchmarkResults
          .sort((a, b) => b.score - a.score)
          .map((result, index) => ({
            rank: index + 1,
            modelId: result.model.id,
            modelName: result.model.name,
            modelSlug: result.model.slug,
            provider: result.model.provider,
            score: result.score,
            accuracy: result.accuracy,
            f1Score: result.f1Score,
            latencyMs: result.latencyMs,
            costUsd: result.costUsd,
          }));

        return {
          ...benchmark,
          modelRankings,
        };
      }),
    }));

    return NextResponse.json({
      categories: benchmarksGrouped,
    });
  } catch (error) {
    console.error("Benchmarks API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch benchmarks data" },
      { status: 500 }
    );
  }
}
