import { NextRequest, NextResponse } from "next/server";
import { isRealAiEnabled } from "@/lib/ai-config";
import {
  generateTextWithAiping,
  type TextGenerationInput,
} from "@/lib/text-generation";

export const runtime = "nodejs";
export const maxDuration = 60;

export function GET() {
  return NextResponse.json({
    name: "Vision Board AI text generation API",
    method: "POST",
    status: isRealAiEnabled() ? "real-ai-enabled" : "real-ai-disabled",
    requiredEnv: ["USE_REAL_AI=true", "AIPING_API_KEY"],
    exampleBody: {
      responseFormat: "json",
      messages: [
        {
          role: "system",
          content: "You are a concise product assistant. Return JSON only.",
        },
        {
          role: "user",
          content:
            "Summarize this vision preference in Chinese JSON: mood=calm, liked=morning sunlight,pilates,ocean, avoid=dark mood.",
        },
      ],
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!isRealAiEnabled()) {
      return NextResponse.json(
        { error: "Real AI is disabled. Set USE_REAL_AI=true to call AI Ping." },
        { status: 503 },
      );
    }

    const input = (await request.json()) as TextGenerationInput;
    const startedAt = Date.now();
    const result = await generateTextWithAiping(input);

    return NextResponse.json({
      ...result,
      latencyMs: Date.now() - startedAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected text generation error." },
      { status: 500 },
    );
  }
}
