import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/* CSV helper: escape commas, quotes, newlines by wrapping in double quotes
   and doubling internal double quotes. */
function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  try {
    // Fetch all categories, models, and results — same data shape as /api/leaderboard
    const categories = await db.benchmarkCategory.findMany({
      orderBy: { order: "asc" },
    });

    const models = await db.aIModel.findMany({
      orderBy: { name: "asc" },
    });

    const results = await db.evaluationResult.findMany({
      include: {
        model: true,
        benchmark: {
          include: { category: true },
        },
      },
    });

    // Compute overall score per model (weighted average across all benchmarks)
    const modelScoreMap = new Map<
      string,
      { totalScore: number; count: number; categoryScores: Map<string, { totalScore: number; count: number }> }
    >();

    for (const result of results) {
      const existing = modelScoreMap.get(result.modelId) ?? {
        totalScore: 0,
        count: 0,
        categoryScores: new Map<string, { totalScore: number; count: number }>(),
      };

      existing.totalScore += result.score;
      existing.count += 1;

      const catSlug = result.benchmark.category.slug;
      const catExisting = existing.categoryScores.get(catSlug) ?? { totalScore: 0, count: 0 };
      catExisting.totalScore += result.score;
      catExisting.count += 1;
      existing.categoryScores.set(catSlug, catExisting);

      modelScoreMap.set(result.modelId, existing);
    }

    // Reference categories to ensure consistent CSV column ordering
    const categorySlugs = categories.map((c) => c.slug);

    const overallRanking = models
      .map((model) => {
        const data = modelScoreMap.get(model.id);
        if (!data || data.count === 0) {
          return {
            rank: 0,
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
      .filter((entry) => entry.numBenchmarks > 0)
      .sort((a, b) => b.overallScore - a.overallScore)
      .map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }));

    // Build CSV — fixed column order: Legal, Healthcare, Fintech, Vernacular, Education
    const slugForColumn = (col: string): string => {
      const found = categorySlugs.find((s) => s.toLowerCase() === col.toLowerCase());
      return found ?? col.toLowerCase();
    };

    const headers = [
      "Rank",
      "Model",
      "Provider",
      "Overall Score",
      "Legal",
      "Healthcare",
      "Fintech",
      "Vernacular",
      "Education",
      "Num Benchmarks",
    ];

    const rows = overallRanking.map((entry) => {
      const cs = entry.categoryScores ?? {};
      const legalSlug = slugForColumn("legal");
      const healthcareSlug = slugForColumn("healthcare");
      const fintechSlug = slugForColumn("fintech");
      const vernacularSlug = slugForColumn("vernacular");
      const educationSlug = slugForColumn("education");
      return [
        entry.rank,
        entry.model.name,
        entry.model.provider,
        entry.overallScore.toFixed(2),
        cs[legalSlug] != null ? cs[legalSlug].toFixed(2) : "",
        cs[healthcareSlug] != null ? cs[healthcareSlug].toFixed(2) : "",
        cs[fintechSlug] != null ? cs[fintechSlug].toFixed(2) : "",
        cs[vernacularSlug] != null ? cs[vernacularSlug].toFixed(2) : "",
        cs[educationSlug] != null ? cs[educationSlug].toFixed(2) : "",
        entry.numBenchmarks,
      ].map(csvEscape).join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="indicbench-leaderboard.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Export leaderboard API error:", error);
    return NextResponse.json(
      { error: "Failed to export leaderboard" },
      { status: 500 }
    );
  }
}
