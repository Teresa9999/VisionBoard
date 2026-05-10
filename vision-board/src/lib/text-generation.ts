import { assertRealAiEnabled } from "@/lib/ai-config";

export type TextGenerationMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type TextGenerationInput = {
  messages: TextGenerationMessage[];
  model?: string;
  temperature?: number;
  responseFormat?: "text" | "json";
};

export type TextGenerationResult = {
  text: string;
  provider: "aiping";
  model: string;
};

export async function generateTextWithAiping(
  input: TextGenerationInput,
): Promise<TextGenerationResult> {
  assertRealAiEnabled();

  if (!process.env.AIPING_API_KEY) {
    throw new Error("Missing AIPING_API_KEY.");
  }

  if (!input.messages.length) {
    throw new Error("messages required.");
  }

  const model = input.model || process.env.AIPING_TEXT_MODEL || "DeepSeek-V3";
  const baseUrl = process.env.AIPING_BASE_URL || "https://aiping.cn/api/v1";
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AIPING_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: input.messages,
      temperature: input.temperature ?? 0.7,
      ...(input.responseFormat === "json"
        ? { response_format: { type: "json_object" } }
        : {}),
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || data.message || "AI Ping text generation failed.");
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("AI Ping response did not include message content.");
  }

  return {
    text,
    provider: "aiping",
    model,
  };
}
