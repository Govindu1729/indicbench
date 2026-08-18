import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Find the benchmark by slug
    const benchmark = await db.benchmark.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });

    if (!benchmark) {
      return NextResponse.json(
        { error: `Benchmark with slug "${slug}" not found` },
        { status: 404 }
      );
    }

    // Fetch all evaluation results for this benchmark, with model details
    const results = await db.evaluationResult.findMany({
      where: { benchmarkId: benchmark.id },
      include: {
        model: true,
      },
      orderBy: { score: "desc" },
    });

    // Build model results with ranking
    const modelResults = results.map((result, index) => ({
      rank: index + 1,
      modelId: result.model.id,
      modelName: result.model.name,
      modelSlug: result.model.slug,
      provider: result.model.provider,
      version: result.model.version,
      score: result.score,
      accuracy: result.accuracy,
      f1Score: result.f1Score,
      latencyMs: result.latencyMs,
      costUsd: result.costUsd,
      numCorrect: result.numCorrect,
      numTotal: result.numTotal,
      evaluatedAt: result.evaluatedAt,
    }));

    return NextResponse.json({
      benchmark: {
        id: benchmark.id,
        slug: benchmark.slug,
        name: benchmark.name,
        description: benchmark.description,
        numQuestions: benchmark.numQuestions,
        difficulty: benchmark.difficulty,
        category: benchmark.category,
        createdAt: benchmark.createdAt,
        updatedAt: benchmark.updatedAt,
      },
      modelResults,
      totalModels: results.length,
    });
  } catch (error) {
    console.error("Benchmark slug API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch benchmark details" },
      { status: 500 }
    );
  }
}
