export type VisionImageGoal = {
  title: string;
  description?: string;
  category?: string;
};

export type VisionImageInput = {
  rawWish?: string;
  visionSummary?: string;
  selectedVisionOptions?: string[] | string;
  goalOutcome?: string;
  timeframe?: string;
  desiredState?: string;
  moodPrompt?: string;
  keywords?: string[] | string;
  sceneKeywords?: string[] | string;
  avoid?: string[] | string;
  stylePack?: string;
  aspectRatio?: string;
  model?: string;
  goals?: VisionImageGoal[];
};

const stylePacks = {
  "clean-girl-luxury": {
    label: "Clean Girl 轻奢显化风",
    stylePrompt:
      "clean girl aesthetic, soft luxury, cream white and beige palette, glowing skin, white outfits, wellness lifestyle, minimal luxury, Pinterest moodboard, feminine and refined, typography-inspired editorial layout but no readable text",
    moodPrompt:
      "clean, elegant, self-disciplined, glowing, abundant, calm confidence",
    defaultScenes:
      "morning sunlight, white bedroom, pilates studio, skincare table, green smoothie, luxury wellness lifestyle",
  },
  "old-money-life": {
    label: "Old Money 高级人生风",
    stylePrompt:
      "old money aesthetic, quiet luxury, cream beige navy and gold palette, elegant outfits, classic jewelry, luxury hotel, refined lifestyle, editorial collage",
    moodPrompt: "quiet luxury, refined, stable, wealthy, elegant, timeless",
    defaultScenes:
      "classic jewelry, luxury hotel, elegant outfits, refined home, navy and gold details",
  },
};

function normalizeList(value: unknown) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value !== "string") return [];
  return value
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeBase64Image(value: unknown, fallbackMimeType = "image/png") {
  if (!value || typeof value !== "string") return null;
  if (value.startsWith("data:image/")) return value;
  return `data:${fallbackMimeType};base64,${value}`;
}

function aipingSizeFromAspectRatio(aspectRatio?: string) {
  if (aspectRatio === "1:1") return "2048x2048";
  if (aspectRatio === "9:16") return "1152x2048";
  return "2560x1440";
}

export function buildVisionImagePrompt(input: VisionImageInput) {
  const stylePack =
    stylePacks[input.stylePack as keyof typeof stylePacks] ?? stylePacks["clean-girl-luxury"];
  const goals = input.goals ?? [];
  const goalLines = goals
    .map((goal) => {
      const detail = [goal.description, goal.category].filter(Boolean).join(" / ");
      return detail ? `${goal.title}: ${detail}` : goal.title;
    })
    .join("\n");
  const keywords = normalizeList(input.keywords);
  const sceneKeywords = normalizeList(input.sceneKeywords);
  const selectedVisionOptions = normalizeList(input.selectedVisionOptions);
  const avoid = normalizeList(input.avoid);
  const moodPrompt = input.moodPrompt || stylePack.moodPrompt;

  return `
Create a high-quality aspirational vision board image based on the user's personal wish.

The image should visualize the user's ideal future state, not the current struggle.
It should feel like a premium Pinterest-style vision board image, with clear lifestyle aspiration and emotional direction.

Original user wish:
${input.rawWish || "The user wants to create a better, more intentional future life."}

Condensed visual vision:
${input.visionSummary || "A refined aspirational lifestyle vision representing the user's ideal future self."}

User's chosen vision directions:
${selectedVisionOptions.length ? selectedVisionOptions.join("; ") : goalLines || "A focused, emotionally resonant personal vision selected by the user."}

Goal outcome:
${input.goalOutcome || goalLines || "Build a concrete future lifestyle aligned with the user's selected vision direction."}

Timeframe:
${input.timeframe || "not specified"}

Desired future state:
${input.desiredState || "confident, calm, abundant, healthy, emotionally fulfilled"}

Core keywords:
${keywords.length ? keywords.join(", ") : "personal growth, ideal future self, aspirational lifestyle"}

Suggested visual scenes and objects:
${sceneKeywords.length ? sceneKeywords.join(", ") : stylePack.defaultScenes}

Selected style package:
${stylePack.label}

Visual style:
${stylePack.stylePrompt}

Mood and emotion:
${moodPrompt}

Default style scenes:
${stylePack.defaultScenes}

Composition requirements:
- premium aspirational lifestyle image
- clear visual hierarchy
- strong central theme
- refined Pinterest moodboard feeling
- elegant editorial composition
- clean and beautiful color palette
- suitable for a large mobile vision board card
- visually rich but not messy
- no readable text; any typography should be abstract or implied only

Avoid:
- readable text
- watermark
- logo
- UI elements
- distorted faces
- distorted hands
- low-quality stock photo feeling
- messy collage
- cheap advertisement look
- dark or depressing mood
- cluttered background
${avoid.map((item) => `- ${item}`).join("\n")}

Output:
Generate one polished image in ${input.aspectRatio || "16:9"} aspect ratio.
`.trim();
}

export async function generateVisionImageWithAiping(prompt: string, input: VisionImageInput) {
  if (!process.env.AIPING_API_KEY) {
    throw new Error("Missing AIPING_API_KEY.");
  }

  const model = (input.model || "aiping:Doubao-Seedream-4.0").replace("aiping:", "");
  const baseUrl = process.env.AIPING_BASE_URL || "https://aiping.cn/api/v1";
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AIPING_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      size: aipingSizeFromAspectRatio(input.aspectRatio),
      output_format: "png",
      response_format: "b64_json",
      watermark: false,
      extra_body: {
        provider: {
          enable_image_base64: true,
          enable_image_origin_data: true,
          sort: ["output_price", "latency"],
        },
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || data.message || "AI Ping image generation failed.");
  }

  const firstImage =
    data.data?.[0] ?? data.images?.[0] ?? data.output?.[0] ?? data.origin_data?.data?.[0];
  const image =
    normalizeBase64Image(firstImage?.b64_json) ??
    normalizeBase64Image(firstImage?.base64) ??
    normalizeBase64Image(firstImage?.image_base64) ??
    firstImage?.url ??
    firstImage?.image_url ??
    firstImage?.response_url;

  if (!image) {
    throw new Error("AI Ping response did not include image data or image URL.");
  }

  return {
    image,
    provider: "aiping",
    model,
  };
}
