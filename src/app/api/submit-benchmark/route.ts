import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface SubmitBenchmarkBody {
  name?: unknown;
  description?: unknown;
  category?: unknown;
  difficulty?: unknown;
  numQuestions?: unknown;
  submitterName?: unknown;
  submitterEmail?: unknown;
  sampleQuestions?: unknown;
}

const VALID_CATEGORIES = ["Legal", "Healthcare", "Fintech", "Vernacular", "Education"];
const VALID_DIFFICULTIES = ["Easy", "Medium", "Hard"];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SubmitBenchmarkBody;

    const name = isNonEmptyString(body.name) ? body.name.trim() : "";
    const description = isNonEmptyString(body.description) ? body.description.trim() : "";
    const category = typeof body.category === "string" && VALID_CATEGORIES.includes(body.category) ? body.category : "";
    const difficulty = typeof body.difficulty === "string" && VALID_DIFFICULTIES.includes(body.difficulty) ? body.difficulty : "";
    const submitterName = isNonEmptyString(body.submitterName) ? body.submitterName.trim() : "";
    const submitterEmail = isNonEmptyString(body.submitterEmail) ? body.submitterEmail.trim() : "";

    const numQuestionsRaw = typeof body.numQuestions === "string" ? Number(body.numQuestions) : body.numQuestions;
    const numQuestions =
      typeof numQuestionsRaw === "number" && Number.isFinite(numQuestionsRaw) && numQuestionsRaw > 0
        ? Math.floor(numQuestionsRaw)
        : 0;

    // Validate required fields
    const missing: string[] = [];
    if (!name) missing.push("name");
    if (!description) missing.push("description");
    if (!category) missing.push("category");
    if (!difficulty) missing.push("difficulty");
    if (numQuestions <= 0) missing.push("numQuestions");
    if (!submitterName) missing.push("submitterName");
    if (!submitterEmail) missing.push("submitterEmail");

    // Simple email validation
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitterEmail);
    if (submitterEmail && !emailValid) {
      missing.push("submitterEmail (invalid format)");
    }

    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Missing or invalid fields", fields: missing },
        { status: 400 }
      );
    }

    // Serialize sample questions to JSON string (defaults to "[]")
    let sampleQuestionsJson = "[]";
    if (body.sampleQuestions != null) {
      try {
        if (typeof body.sampleQuestions === "string") {
          // Validate it's parseable JSON, then re-stringify
          const parsed = JSON.parse(body.sampleQuestions);
          sampleQuestionsJson = JSON.stringify(parsed);
        } else {
          sampleQuestionsJson = JSON.stringify(body.sampleQuestions);
        }
      } catch {
        sampleQuestionsJson = "[]";
      }
    }

    const submission = await db.benchmarkSubmission.create({
      data: {
        name,
        description,
        category,
        difficulty,
        numQuestions,
        submitterName,
        submitterEmail,
        sampleQuestions: sampleQuestionsJson,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, id: submission.id });
  } catch (error) {
    console.error("Submit benchmark API error:", error);
    return NextResponse.json(
      { error: "Failed to submit benchmark" },
      { status: 500 }
    );
  }
}
