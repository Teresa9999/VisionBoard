const state = {
  stylePacks: {},
  models: [],
  selectedStyle: "clean-girl-luxury",
  lastPrompt: ""
};

const elements = {
  rawWish: document.querySelector("#rawWish"),
  visionSummary: document.querySelector("#visionSummary"),
  desiredState: document.querySelector("#desiredState"),
  keywords: document.querySelector("#keywords"),
  sceneKeywords: document.querySelector("#sceneKeywords"),
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
  rawWish: "我想三个月内养成规律健身习惯，也希望整个人状态更好、更自信。",
  visionSummary:
    "A disciplined wellness lifestyle with a confident, healthy, glowing future self.",
  desiredState: "confident, energetic, healthy, self-controlled, elegant",
  keywords: "wellness, self-discipline, glowing skin, morning routine, fitness",
  sceneKeywords: "bright bedroom, pilates studio, green smoothie, morning sunlight",
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
    elements.desiredState,
    elements.keywords,
    elements.sceneKeywords,
    elements.model,
    elements.aspectRatio
  ].forEach((input) => {
    input.addEventListener("input", updatePromptPreview);
  });
}

function fillSample() {
  elements.rawWish.value = sample.rawWish;
  elements.visionSummary.value = sample.visionSummary;
  elements.desiredState.value = sample.desiredState;
  elements.keywords.value = sample.keywords;
  elements.sceneKeywords.value = sample.sceneKeywords;
  elements.aspectRatio.value = sample.aspectRatio;
  state.selectedStyle = sample.stylePack;
  renderStyles();
}

function getPayload() {
  return {
    rawWish: elements.rawWish.value.trim(),
    visionSummary: elements.visionSummary.value.trim(),
    desiredState: elements.desiredState.value.trim(),
    keywords: elements.keywords.value.trim(),
    sceneKeywords: elements.sceneKeywords.value.trim(),
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
${pack.moodPrompt}

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
