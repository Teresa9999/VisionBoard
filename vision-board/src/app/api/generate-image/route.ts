import { NextRequest, NextResponse } from "next/server";
import {
  buildVisionImagePrompt,
  generateVisionImageWithAiping,
  type VisionImageInput,
} from "@/lib/image-generation";
import { isRealAiEnabled } from "@/lib/ai-config";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    if (!isRealAiEnabled()) {
      return NextResponse.json(
        { error: "Real AI is disabled. Set USE_REAL_AI=true to call AI Ping." },
        { status: 503 },
      );
    }

    const input = (await request.json()) as VisionImageInput;
    const prompt = buildVisionImagePrompt(input);
    const startedAt = Date.now();
    const result = await generateVisionImageWithAiping(prompt, input);

    return NextResponse.json({
      ...result,
      prompt,
      latencyMs: Date.now() - startedAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected image generation error." },
      { status: 500 },
    );
  }
}
