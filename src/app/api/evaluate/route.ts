import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import sampleQuestions, {
  getQuestionsByCategory,
} from "@/lib/sample-questions";

interface EvaluateRequestBody {
  model: string;
  benchmarkSlug: string;
  sampleSize?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: EvaluateRequestBody = await request.json();
    const { model, benchmarkSlug, sampleSize } = body;

    if (!model || !benchmarkSlug) {
      return NextResponse.json(
        { error: "Missing required fields: model and benchmarkSlug" },
        { status: 400 }
      );
    }

    // Find the benchmark
    const benchmark = await db.benchmark.findUnique({
      where: { slug: benchmarkSlug },
      include: { category: true },
    });

    if (!benchmark) {
      return NextResponse.json(
        { error: `Benchmark "${benchmarkSlug}" not found` },
        { status: 404 }
      );
    }

    // Find the model
    const aiModel = await db.aIModel.findUnique({
      where: { slug: model },
    });

    if (!aiModel) {
      return NextResponse.json(
        { error: `Model "${model}" not found` },
        { status: 404 }
      );
    }

    // Get sample questions for this benchmark's category
    const categorySlug = benchmark.category.slug;
    const categoryQuestions = getQuestionsByCategory(categorySlug);

    if (categoryQuestions.length === 0) {
      // Fallback to all questions if category has none
      const fallbackQuestions = sampleQuestions.slice(0, sampleSize ?? 5);
      if (fallbackQuestions.length === 0) {
        return NextResponse.json(
          { error: "No sample questions available for evaluation" },
          { status: 400 }
        );
      }
    }

    const numToEval = Math.min(
      sampleSize ?? 5,
      categoryQuestions.length,
      10
    );
    const questionsToEval = categoryQuestions.slice(0, numToEval);

    if (questionsToEval.length === 0) {
      return NextResponse.json(
        { error: "No sample questions available for this category" },
        { status: 400 }
      );
    }

    // NOTE: Live evaluation via z-ai-web-dev-sdk disabled for build compatibility.
    // This SDK is not publicly available on NPM.
    // Mock response for deployment purposes.
    const evalResults: Array<{
      question: string;
      expectedAnswer: string;
      modelAnswer: string;
      isCorrect: boolean;
    }> = [];

    for (const q of questionsToEval) {
      evalResults.push({
        question: q.question,
        expectedAnswer: q.expectedAnswer,
        modelAnswer: "[Evaluation disabled: SDK unavailable]",
        isCorrect: false,
      });
    }

    const numCorrect = 0;
    const numTotal = questionsToEval.length;
    const score = 0;

    const numTotal = questionsToEval.length;
    const score = Math.round((numCorrect / numTotal) * 100);

    return NextResponse.json({
      results: {
        score,
        numCorrect,
        numTotal,
        sampleQuestions: evalResults,
        model: aiModel.name,
        modelSlug: aiModel.slug,
        benchmark: benchmark.name,
        benchmarkSlug: benchmark.slug,
        category: benchmark.category.name,
        categorySlug: benchmark.category.slug,
      },
    });
  } catch (error) {
    console.error("Evaluate API error:", error);
    return NextResponse.json(
      { error: "Failed to run evaluation" },
      { status: 500 }
    );
  }
}
