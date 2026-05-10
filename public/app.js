const state = {
  stylePacks: {},
  models: [],
  selectedStyle: "clean-girl-luxury",
  lastPrompt: ""
};

const elements = {
  rawWish: document.querySelector("#rawWish"),
  visionSummary: document.querySelector("#visionSummary"),
  selectedVisionOptions: document.querySelector("#selectedVisionOptions"),
  goalOutcome: document.querySelector("#goalOutcome"),
  timeframe: document.querySelector("#timeframe"),
  desiredState: document.querySelector("#desiredState"),
  moodPrompt: document.querySelector("#moodPrompt"),
  keywords: document.querySelector("#keywords"),
  sceneKeywords: document.querySelector("#sceneKeywords"),
  avoid: document.querySelector("#avoid"),
  model: document.querySelector("#model"),
  aspectRatio: document.querySelector("#aspectRatio"),
  styleGrid: document.querySelector("#styleGrid"),
  promptPreview: document.querySelector("#promptPreview"),
  imageStage: document.querySelector("#imageStage"),
  generate: document.querySelector("#generate"),
  fillSample: document.querySelector("#fillSample"),
  statusPill: document.querySelector("#statusPill"),
  modelMeta: document.querySelector("#modelMeta"),
  latencyMeta: document.querySelector("#latencyMeta")
};

const sample = {
  rawWish: "我希望不要太网红，更自然一点，也希望有富足感。",
  visionSummary:
    "A disciplined wellness lifestyle with a confident, healthy, glowing future self.",
  selectedVisionOptions:
    "建立稳定、自律、发光的生活节奏\n拥有更富足、更松弛、更高级的日常状态",
  goalOutcome: "build a stable wellness and self-discipline routine within three months",
  timeframe: "3 months",
  desiredState: "confident, glowing, relaxed, self-disciplined, abundant",
  moodPrompt: "bright, clean, elegant, hopeful, abundant",
  keywords: "wellness, self-discipline, soft luxury, morning routine",
  sceneKeywords: "morning sunlight, pilates studio, green smoothie, white bedroom",
  avoid: "too influencer-like, cheap advertisement look, dark mood, cluttered background",
  stylePack: "clean-girl-luxury",
  aspectRatio: "16:9"
};

async function init() {
  const response = await fetch("/api/options");
  const data = await response.json();
  state.stylePacks = data.stylePacks;
  state.models = data.models;
  renderModels();
  renderStyles();
  fillSample();
  updatePromptPreview();
  bindEvents();
}

function renderModels() {
  elements.model.innerHTML = state.models
    .map((model) => `<option value="${model.id}">${model.label}</option>`)
    .join("");
}

function renderStyles() {
  elements.styleGrid.innerHTML = Object.entries(state.stylePacks)
    .map(([id, pack]) => {
      const swatches = pack.swatch
        .map((color) => `<i style="background:${color}"></i>`)
        .join("");
      return `
        <button class="style-card ${id === state.selectedStyle ? "is-active" : ""}" type="button" data-style="${id}">
          <span class="swatches">${swatches}</span>
          <strong>${pack.label}</strong>
          <small>${pack.suitableFor.join(" / ")}</small>
        </button>
      `;
    })
    .join("");
}

function bindEvents() {
  elements.styleGrid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-style]");
    if (!card) return;
    state.selectedStyle = card.dataset.style;
    renderStyles();
    updatePromptPreview();
  });

  elements.fillSample.addEventListener("click", () => {
    fillSample();
    updatePromptPreview();
  });

  elements.generate.addEventListener("click", generateImage);

  [
    elements.rawWish,
    elements.visionSummary,
    elements.selectedVisionOptions,
    elements.goalOutcome,
    elements.timeframe,
    elements.desiredState,
    elements.moodPrompt,
    elements.keywords,
    elements.sceneKeywords,
    elements.avoid,
    elements.model,
    elements.aspectRatio
  ].forEach((input) => {
    input.addEventListener("input", () => {
      state.lastPrompt = "";
      updatePromptPreview();
    });
  });
}

function fillSample() {
  elements.rawWish.value = sample.rawWish;
  elements.visionSummary.value = sample.visionSummary;
  elements.selectedVisionOptions.value = sample.selectedVisionOptions;
  elements.goalOutcome.value = sample.goalOutcome;
  elements.timeframe.value = sample.timeframe;
  elements.desiredState.value = sample.desiredState;
  elements.moodPrompt.value = sample.moodPrompt;
  elements.keywords.value = sample.keywords;
  elements.sceneKeywords.value = sample.sceneKeywords;
  elements.avoid.value = sample.avoid;
  elements.aspectRatio.value = sample.aspectRatio;
  state.selectedStyle = sample.stylePack;
  renderStyles();
}

function getPayload() {
  return {
    rawWish: elements.rawWish.value.trim(),
    visionSummary: elements.visionSummary.value.trim(),
    selectedVisionOptions: elements.selectedVisionOptions.value.trim(),
    goalOutcome: elements.goalOutcome.value.trim(),
    timeframe: elements.timeframe.value.trim(),
    desiredState: elements.desiredState.value.trim(),
    moodPrompt: elements.moodPrompt.value.trim(),
    keywords: elements.keywords.value.trim(),
    sceneKeywords: elements.sceneKeywords.value.trim(),
    avoid: elements.avoid.value.trim(),
    stylePack: state.selectedStyle,
    model: elements.model.value,
    aspectRatio: elements.aspectRatio.value
  };
}

function buildLocalPreviewPrompt(payload) {
  const pack = state.stylePacks[payload.stylePack];
  return `Create a high-quality aspirational vision board image based on the user's personal wish.

Original user wish:
${payload.rawWish}

Condensed visual vision:
${payload.visionSummary}

User's chosen vision directions:
${payload.selectedVisionOptions}

Goal outcome:
${payload.goalOutcome}

Timeframe:
${payload.timeframe}

Desired future state:
${payload.desiredState}

Core keywords:
${payload.keywords}

Suggested visual scenes and objects:
${payload.sceneKeywords}

Selected style package:
${pack.label}

Visual style:
${pack.stylePrompt}

Mood and emotion:
${payload.moodPrompt || pack.moodPrompt}

Avoid:
- readable text
- watermark
- logo
${payload.avoid
  .split(/[,，\n]/)
  .map((item) => item.trim())
  .filter(Boolean)
  .map((item) => `- ${item}`)
  .join("\n")}

Output:
Generate one polished image in ${payload.aspectRatio} aspect ratio.`;
}

function updatePromptPreview() {
  const payload = getPayload();
  elements.promptPreview.textContent = state.lastPrompt || buildLocalPreviewPrompt(payload);
}

async function generateImage() {
  const payload = getPayload();
  if (!payload.rawWish) {
    setStatus("请输入心愿", true);
    elements.rawWish.focus();
    return;
  }

  setLoading(true);
  setStatus("Generating...");

  try {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "生成失败");

    state.lastPrompt = data.prompt;
    elements.promptPreview.textContent = data.prompt;
    elements.imageStage.innerHTML = `<img src="${data.image}" alt="Generated vision board" />`;
    elements.modelMeta.textContent = `model: ${data.provider}/${data.model}`;
    elements.latencyMeta.textContent = `latency: ${data.latencyMs}ms`;
    setStatus("Done");
  } catch (error) {
    setStatus("生成失败", true);
    elements.imageStage.innerHTML = `
      <div class="empty-state">
        <p>生成失败</p>
        <span>${escapeHtml(error.message)}</span>
      </div>
    `;
  } finally {
    setLoading(false);
  }
}

function setLoading(isLoading) {
  elements.generate.disabled = isLoading;
  elements.generate.textContent = isLoading ? "生成中..." : "生成图片";
}

function setStatus(message, isError = false) {
  elements.statusPill.textContent = message;
  elements.statusPill.style.color = isError ? "#8b1e1e" : "";
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

init().catch((error) => {
  setStatus("启动失败", true);
  elements.promptPreview.textContent = error.message;
});
