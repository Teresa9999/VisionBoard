import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(__dirname, "public");

loadEnvFile();

const port = Number(process.env.PORT ?? 3000);

const stylePacks = {
  "clean-girl-luxury": {
    label: "Clean Girl 轻奢显化风",
    suitableFor: ["变美", "健康", "自律", "财富", "旅行"],
    stylePrompt:
      "clean girl aesthetic, soft luxury, cream white and beige palette, glowing skin, white outfits, wellness lifestyle, minimal luxury, Pinterest moodboard, feminine and refined, typography-inspired editorial layout but no readable text",
    moodPrompt:
      "clean, elegant, self-disciplined, glowing, abundant, calm confidence",
    defaultScenes:
      "morning sunlight, white bedroom, pilates studio, skincare table, green smoothie, luxury wellness lifestyle",
    swatch: ["#f6efe6", "#dac8af", "#fffaf3", "#8e735b"]
  },
  "ceo-career-woman": {
    label: "CEO Career Woman 风",
    suitableFor: ["事业", "升职", "创业", "职场成功"],
    stylePrompt:
      "female CEO energy, luxury office, business outfit, laptop, coffee, city view apartment, financial success, black white beige palette, editorial magazine collage, elegant and ambitious",
    moodPrompt:
      "ambitious, focused, powerful, elegant, financially successful",
    defaultScenes:
      "luxury office, city view apartment, laptop, coffee, business outfit, clean desk, financial success atmosphere",
    swatch: ["#f3eee5", "#111111", "#e5d8c6", "#8a7b68"]
  },
  "lucky-girl-romantic": {
    label: "Lucky Girl 浪漫好运风",
    suitableFor: ["爱情", "好运", "疗愈", "幸福生活"],
    stylePrompt:
      "lucky girl syndrome, soft feminine energy, romantic lifestyle, flowers, sunlight, couple moments, champagne beige and blush pink palette, dreamy Pinterest collage, elegant serif typography-inspired layout but no readable text",
    moodPrompt:
      "romantic, lucky, soft, healed, loved, dreamy, emotionally safe",
    defaultScenes:
      "flowers, sunlight, romantic table, soft bedroom, cafe, champagne beige and blush pink details",
    swatch: ["#f8e7e8", "#d8aaa9", "#fff4df", "#9f6d74"]
  },
  "travel-freedom": {
    label: "Travel Freedom 度假自由风",
    suitableFor: ["旅行", "自由生活", "远程办公", "松弛感"],
    stylePrompt:
      "travel freedom, luxury vacation, ocean, island, snowy mountains, airplane window, cruise, resort breakfast, blue white beige palette, cinematic lifestyle collage",
    moodPrompt:
      "free, relaxed, expansive, peaceful, adventurous, effortless",
    defaultScenes:
      "ocean, island, airplane window, cruise, resort breakfast, snowy mountains, remote work by the sea",
    swatch: ["#e6f5fb", "#6fa8c7", "#f3ead8", "#23455f"]
  },
  "old-money-life": {
    label: "Old Money 高级人生风",
    suitableFor: ["高级感", "气质", "财富", "稳定生活"],
    stylePrompt:
      "old money aesthetic, quiet luxury, cream beige navy and gold palette, elegant outfits, tennis, golf, classic jewelry, luxury hotel, refined lifestyle, editorial collage",
    moodPrompt:
      "quiet luxury, refined, stable, wealthy, elegant, timeless",
    defaultScenes:
      "classic jewelry, luxury hotel, tennis court, golf club, elegant outfits, navy and gold details",
    swatch: ["#efe7d6", "#17223b", "#c2a052", "#f9f4e8"]
  }
};

const models = [
  {
    id: "mock",
    label: "Mock Preview",
    provider: "local",
    description: "不用 API Key，返回一张本地 SVG 情绪预览图。"
  },
  {
    id: "openai:gpt-image-2",
    label: "OpenAI GPT Image 2",
    provider: "openai",
    description: "主推荐模型，需要 OPENAI_API_KEY。"
  },
  {
    id: "gemini:gemini-3.1-flash-image-preview",
    label: "Gemini 3.1 Flash Image Preview",
    provider: "gemini",
    description: "速度和多轮改图候选，需要 GEMINI_API_KEY。"
  },
  {
    id: "gemini:gemini-2.5-flash-image",
    label: "Gemini 2.5 Flash Image",
    provider: "gemini",
    description: "低延迟候选，需要 GEMINI_API_KEY。"
  },
  {
    id: "aiping:Doubao-Seedream-4.0",
    label: "AI Ping / Doubao Seedream 4.0",
    provider: "aiping",
    description: "通过 AI Ping OpenAI-compatible 图像接口调用，需要 AIPING_API_KEY。"
  },
  {
    id: "aiping:Doubao-Seedream-5.0-lite",
    label: "AI Ping / Doubao Seedream 5.0 Lite",
    provider: "aiping",
    description: "通过 AI Ping OpenAI-compatible 图像接口调用，需要 AIPING_API_KEY。"
  }
];

function normalizeList(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== "string") return [];
  return value
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildPrompt(input) {
  const stylePack = stylePacks[input.stylePack] ?? stylePacks["clean-girl-luxury"];
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
${selectedVisionOptions.length ? selectedVisionOptions.join("; ") : "A focused, emotionally resonant personal vision selected by the user."}

Goal outcome:
${input.goalOutcome || "Build a concrete future lifestyle aligned with the user's selected vision direction."}

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
- suitable for a large web vision board card or hero image
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

function sizeFromAspectRatio(aspectRatio) {
  if (aspectRatio === "1:1") return "1024x1024";
  if (aspectRatio === "9:16") return "1024x1536";
  return "1536x1024";
}

function aipingSizeFromAspectRatio(aspectRatio) {
  if (aspectRatio === "1:1") return "2048x2048";
  if (aspectRatio === "9:16") return "1152x2048";
  return "2560x1440";
}

function normalizeBase64Image(value, fallbackMimeType = "image/png") {
  if (!value) return null;
  if (typeof value !== "string") return null;
  if (value.startsWith("data:image/")) return value;
  return `data:${fallbackMimeType};base64,${value}`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function createMockImage(input) {
  const stylePack = stylePacks[input.stylePack] ?? stylePacks["clean-girl-luxury"];
  const [bg, accent, paper, ink] = stylePack.swatch;
  const keywords = normalizeList(input.keywords).slice(0, 5);
  const sceneKeywords = normalizeList(input.sceneKeywords).slice(0, 5);
  const chips = [...keywords, ...sceneKeywords].slice(0, 7);
  const chipSvg = chips
    .map((chip, index) => {
      const x = 86 + (index % 3) * 235;
      const y = 665 + Math.floor(index / 3) * 58;
      return `<text x="${x}" y="${y}" fill="${escapeXml(ink)}" font-size="22" font-family="Georgia, serif" opacity="0.72">${escapeXml(chip)}</text>`;
    })
    .join("");

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${escapeXml(paper)}"/>
      <stop offset="0.55" stop-color="${escapeXml(bg)}"/>
      <stop offset="1" stop-color="${escapeXml(accent)}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="28" flood-color="#1b1714" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="1536" height="1024" fill="url(#bg)"/>
  <circle cx="1260" cy="140" r="230" fill="${escapeXml(accent)}" opacity="0.22"/>
  <circle cx="180" cy="880" r="260" fill="${escapeXml(paper)}" opacity="0.48"/>
  <g filter="url(#shadow)">
    <rect x="96" y="96" width="560" height="520" rx="26" fill="${escapeXml(paper)}" opacity="0.92"/>
    <rect x="704" y="126" width="650" height="380" rx="28" fill="${escapeXml(paper)}" opacity="0.78"/>
    <rect x="746" y="542" width="450" height="260" rx="28" fill="${escapeXml(paper)}" opacity="0.72"/>
  </g>
  <rect x="136" y="136" width="480" height="310" rx="180" fill="${escapeXml(accent)}" opacity="0.38"/>
  <rect x="176" y="178" width="410" height="230" rx="150" fill="${escapeXml(bg)}" opacity="0.54"/>
  <path d="M772 435 C890 300 1015 292 1124 368 C1220 435 1258 360 1332 254" fill="none" stroke="${escapeXml(accent)}" stroke-width="18" opacity="0.38"/>
  <path d="M800 460 C930 350 1014 375 1134 442 C1230 496 1278 448 1346 372" fill="none" stroke="${escapeXml(ink)}" stroke-width="3" opacity="0.42"/>
  <text x="136" y="535" fill="${escapeXml(ink)}" font-size="34" font-family="Georgia, serif" opacity="0.88">${escapeXml(stylePack.label)}</text>
  <text x="746" y="235" fill="${escapeXml(ink)}" font-size="64" font-family="Georgia, serif" opacity="0.86">Vision Preview</text>
  <text x="748" y="305" fill="${escapeXml(ink)}" font-size="28" font-family="Georgia, serif" opacity="0.68">${escapeXml(input.desiredState || "confident, calm, abundant")}</text>
  <text x="746" y="598" fill="${escapeXml(ink)}" font-size="28" font-family="Georgia, serif" opacity="0.72">${escapeXml(input.visionSummary || "A refined aspirational future self.")}</text>
  ${chipSvg}
  <text x="96" y="930" fill="${escapeXml(ink)}" font-size="22" font-family="Georgia, serif" opacity="0.62">Mock image: connect an API key for real image generation</text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

async function generateWithOpenAI(prompt, input) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY. Use Mock Preview or set OPENAI_API_KEY in your environment.");
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-image-2",
      prompt,
      size: sizeFromAspectRatio(input.aspectRatio),
      quality: input.quality || "medium"
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI image generation failed.");
  }

  const base64 = data.data?.[0]?.b64_json;
  if (!base64) throw new Error("OpenAI response did not include image data.");

  return {
    image: `data:image/png;base64,${base64}`,
    provider: "openai",
    model: "gpt-image-2"
  };
}

async function generateWithGemini(prompt, modelId) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY. Use Mock Preview or set GEMINI_API_KEY in your environment.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": process.env.GEMINI_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini image generation failed.");
  }

  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((part) => part.inlineData?.data || part.inline_data?.data);
  const inlineData = imagePart?.inlineData ?? imagePart?.inline_data;
  if (!inlineData?.data) throw new Error("Gemini response did not include image data.");

  return {
    image: `data:${inlineData.mimeType || inlineData.mime_type || "image/png"};base64,${inlineData.data}`,
    provider: "gemini",
    model: modelId
  };
}

async function generateWithAipingImage(prompt, input, modelId) {
  if (!process.env.AIPING_API_KEY) {
    throw new Error("Missing AIPING_API_KEY. Use Mock Preview or set AIPING_API_KEY in your environment.");
  }

  const baseUrl = process.env.AIPING_BASE_URL || "https://aiping.cn/api/v1";
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AIPING_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelId,
      prompt,
      size: aipingSizeFromAspectRatio(input.aspectRatio),
      output_format: "png",
      response_format: "b64_json",
      watermark: false,
      extra_body: {
        provider: {
          enable_image_base64: true,
          enable_image_origin_data: true,
          sort: ["output_price", "latency"]
        }
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || data.message || "AI Ping image generation failed.");
  }

  const firstImage =
    data.data?.[0] ?? data.images?.[0] ?? data.output?.[0] ?? data.origin_data?.data?.[0];
  const base64 = firstImage?.b64_json ?? firstImage?.base64 ?? firstImage?.image_base64;
  const imageUrl = firstImage?.url ?? firstImage?.image_url ?? firstImage?.response_url;

  if (base64) {
    return {
      image: normalizeBase64Image(base64),
      provider: "aiping",
      model: modelId
    };
  }

  if (imageUrl) {
    return {
      image: imageUrl,
      provider: "aiping",
      model: modelId
    };
  }

  throw new Error(
    `AI Ping response did not include image data or image URL. Response shape: ${JSON.stringify(
      summarizeResponseShape(data)
    )}`
  );
}

function summarizeResponseShape(value, depth = 0) {
  if (depth > 2) return typeof value;
  if (Array.isArray(value)) {
    return {
      type: "array",
      length: value.length,
      first: value.length ? summarizeResponseShape(value[0], depth + 1) : null
    };
  }
  if (!value || typeof value !== "object") return typeof value;
  return Object.fromEntries(
    Object.entries(value)
      .slice(0, 12)
      .map(([key, child]) => [key, summarizeResponseShape(child, depth + 1)])
  );
}

async function handleGenerate(request, response) {
  const input = await readJsonBody(request);
  const prompt = buildPrompt(input);
  const startedAt = Date.now();
  const modelId = input.model || "mock";

  let result;
  if (modelId === "mock") {
    result = {
      image: createMockImage(input),
      provider: "local",
      model: "mock"
    };
  } else if (modelId === "openai:gpt-image-2") {
    result = await generateWithOpenAI(prompt, input);
  } else if (modelId.startsWith("gemini:")) {
    result = await generateWithGemini(prompt, modelId.replace("gemini:", ""));
  } else if (modelId.startsWith("aiping:")) {
    result = await generateWithAipingImage(prompt, input, modelId.replace("aiping:", ""));
  } else {
    throw new Error(`Unsupported model: ${modelId}`);
  }

  sendJson(response, 200, {
    ...result,
    prompt,
    latencyMs: Date.now() - startedAt,
    stylePack: input.stylePack || "clean-girl-luxury"
  });
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Request body too large."));
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON request body."));
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const content = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentType(filePath)
    });
    response.end(content);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}

function contentType(filePath) {
  const ext = extname(filePath);
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".js") return "text/javascript; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "GET" && url.pathname === "/api/options") {
      sendJson(response, 200, { stylePacks, models });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/generate-image") {
      await handleGenerate(request, response);
      return;
    }

    if (request.method === "GET") {
      await serveStatic(request, response);
      return;
    }

    sendJson(response, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(response, 500, {
      error: error.message || "Unexpected server error"
    });
  }
});

server.listen(port, () => {
  console.log(`Visionboard image generator running at http://localhost:${port}`);
});

function loadEnvFile() {
  const envPath = join(__dirname, ".env");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}
