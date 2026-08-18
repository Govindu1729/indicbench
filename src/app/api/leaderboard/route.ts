import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get("category");

    // Fetch all categories with their benchmarks
    const categories = await db.benchmarkCategory.findMany({
      include: {
        benchmarks: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    // Fetch all models
    const models = await db.aIModel.findMany({
      orderBy: { name: "asc" },
    });

    // Fetch all evaluation results with relations
    const results = await db.evaluationResult.findMany({
      include: {
        model: true,
        benchmark: {
          include: {
            category: true,
          },
        },
      },
    });

    // Filter by category if specified
    let filteredResults = results;
    let filteredCategories = categories;

    if (categoryFilter) {
      const targetCategory = categories.find(
        (c) => c.slug === categoryFilter || c.name.toLowerCase() === categoryFilter.toLowerCase()
      );
      if (targetCategory) {
        filteredCategories = [targetCategory];
        const categoryBenchmarkIds = new Set(
          targetCategory.benchmarks.map((b) => b.id)
        );
        filteredResults = results.filter((r) =>
          categoryBenchmarkIds.has(r.benchmarkId)
        );
      }
    }

    // Compute overall score per model (weighted average across all benchmarks)
    const modelScoreMap = new Map<
      string,
      { totalScore: number; count: number; categoryScores: Map<string, { totalScore: number; count: number }> }
    >();

    for (const result of filteredResults) {
      const existing = modelScoreMap.get(result.modelId) ?? {
        totalScore: 0,
        count: 0,
        categoryScores: new Map<string, { totalScore: number; count: number }>(),
      };

      existing.totalScore += result.score;
      existing.count += 1;

      // Per-category score
      const catSlug = result.benchmark.category.slug;
      const catExisting = existing.categoryScores.get(catSlug) ?? {
        totalScore: 0,
        count: 0,
      };
      catExisting.totalScore += result.score;
      catExisting.count += 1;
      existing.categoryScores.set(catSlug, catExisting);

      modelScoreMap.set(result.modelId, existing);
    }

    // Build overall ranking
    const overallRanking = models
      .map((model) => {
        const data = modelScoreMap.get(model.id);
        if (!data || data.count === 0) {
          return {
            model,
            overallScore: 0,
            categoryScores: {} as Record<string, number>,
            numBenchmarks: 0,
          };
        }
        const overallScore = data.totalScore / data.count;
        const categoryScores: Record<string, number> = {};
        for (const [catSlug, catData] of data.categoryScores) {
          categoryScores[catSlug] = catData.totalScore / catData.count;
        }
        return {
          model,
          overallScore: Math.round(overallScore * 100) / 100,
          categoryScores,
          numBenchmarks: data.count,
        };
      })
      .sort((a, b) => b.overallScore - a.overallScore)
      .map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }));

    return NextResponse.json({
      categories: filteredCategories,
      models,
      results: filteredResults,
      overallRanking,
    });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard data" },
      { status: 500 }
    );
  }
}
