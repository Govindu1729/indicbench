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

    // Run live evaluation using z-ai-web-dev-sdk
    let numCorrect = 0;
    const evalResults: Array<{
      question: string;
      expectedAnswer: string;
      modelAnswer: string;
      isCorrect: boolean;
    }> = [];

    // Dynamically import z-ai-web-dev-sdk (backend only)
    const ZaiModule = await import("z-ai-web-dev-sdk") as any;
    const zai = new ZaiModule.default();

    for (const q of questionsToEval) {
      try {
        const prompt = `You are an expert on Indian affairs. Answer the following question concisely and accurately.\n\nQuestion: ${q.question}\n\nProvide a brief, factual answer:`;

        const completion = await zai.chat.completions.create({
          model: aiModel.slug,
          messages: [
            {
              role: "system",
              content:
                "You are an expert on Indian law, governance, healthcare, finance, education, and culture. Provide concise, accurate answers.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.1,
          max_tokens: 200,
        });

        const modelAnswer =
          completion.choices?.[0]?.message?.content?.trim() ?? "";

        // Simple correctness check: if the expected answer appears in the model answer (case-insensitive)
        const isCorrect =
          modelAnswer
            .toLowerCase()
            .includes(q.expectedAnswer.toLowerCase()) ||
          q.expectedAnswer
            .toLowerCase()
            .split(/[,;]/)
            .some(
              (part) =>
                part.trim().length > 2 &&
                modelAnswer.toLowerCase().includes(part.trim().toLowerCase())
            );

        if (isCorrect) numCorrect++;

        evalResults.push({
          question: q.question,
          expectedAnswer: q.expectedAnswer,
          modelAnswer,
          isCorrect,
        });
      } catch (llmError) {
        console.error("LLM call error:", llmError);
        evalResults.push({
          question: q.question,
          expectedAnswer: q.expectedAnswer,
          modelAnswer: "[Error: LLM call failed]",
          isCorrect: false,
        });
      }
    }

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
