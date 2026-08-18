import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Count totals
    const [totalBenchmarks, totalModels, totalEvaluations, categories] =
      await Promise.all([
        db.benchmark.count(),
        db.aIModel.count(),
        db.evaluationResult.count(),
        db.benchmarkCategory.findMany({
          include: {
            benchmarks: true,
          },
          orderBy: { order: "asc" },
        }),
      ]);

    // Total questions (sum of numQuestions across all benchmarks)
    const benchmarks = await db.benchmark.findMany({
      select: { numQuestions: true },
    });
    const totalQuestions = benchmarks.reduce(
      (sum, b) => sum + b.numQuestions,
      0
    );

    // Find the highest scoring model overall
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

    // Compute average score per model
    const modelScoreMap = new Map<
      string,
      { name: string; slug: string; provider: string; totalScore: number; count: number }
    >();

    for (const result of results) {
      const existing = modelScoreMap.get(result.modelId);
      if (existing) {
        existing.totalScore += result.score;
        existing.count += 1;
      } else {
        modelScoreMap.set(result.modelId, {
          name: result.model.name,
          slug: result.model.slug,
          provider: result.model.provider,
          totalScore: result.score,
          count: 1,
        });
      }
    }

    let highestScoringModel: {
      name: string;
      slug: string;
      provider: string;
      overallScore: number;
    } | null = null;

    for (const [, data] of modelScoreMap) {
      const avgScore = data.totalScore / data.count;
      if (
        !highestScoringModel ||
        avgScore > highestScoringModel.overallScore
      ) {
        highestScoringModel = {
          name: data.name,
          slug: data.slug,
          provider: data.provider,
          overallScore: Math.round(avgScore * 100) / 100,
        };
      }
    }

    // Categories with their top model
    const categoriesWithTopModel = categories.map((category) => {
      const categoryBenchmarkIds = new Set(
        category.benchmarks.map((b) => b.id)
      );
      const categoryResults = results.filter((r) =>
        categoryBenchmarkIds.has(r.benchmarkId)
      );

      // Compute average score per model for this category
      const catModelScores = new Map<
        string,
        { name: string; slug: string; provider: string; totalScore: number; count: number }
      >();

      for (const result of categoryResults) {
        const existing = catModelScores.get(result.modelId);
        if (existing) {
          existing.totalScore += result.score;
          existing.count += 1;
        } else {
          catModelScores.set(result.modelId, {
            name: result.model.name,
            slug: result.model.slug,
            provider: result.model.provider,
            totalScore: result.score,
            count: 1,
          });
        }
      }

      let topModel: {
        name: string;
        slug: string;
        provider: string;
        score: number;
      } | null = null;

      for (const [, data] of catModelScores) {
        const avgScore = data.totalScore / data.count;
        if (!topModel || avgScore > topModel.score) {
          topModel = {
            name: data.name,
            slug: data.slug,
            provider: data.provider,
            score: Math.round(avgScore * 100) / 100,
          };
        }
      }

      return {
        id: category.id,
        slug: category.slug,
        name: category.name,
        icon: category.icon,
        color: category.color,
        numBenchmarks: category.benchmarks.length,
        topModel,
      };
    });

    return NextResponse.json({
      totals: {
        benchmarks: totalBenchmarks,
        models: totalModels,
        evaluations: totalEvaluations,
        questions: totalQuestions,
      },
      highestScoringModel,
      categories: categoriesWithTopModel,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats data" },
      { status: 500 }
    );
  }
}
