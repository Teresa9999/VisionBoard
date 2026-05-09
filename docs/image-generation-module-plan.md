# 心愿愿景板文生图模块方案

更新时间：2026-05-10

## 1. 模块目标

文生图模块负责把前端收集到的用户心愿、目标拆解结果、偏好风格和展示尺寸，转换为稳定可控的图片生成请求，并返回可在 Web 端直接展示的图片资源。

核心目标：

- 图片质量高：画面完整、情绪准确、风格统一，适合愿景板展示。
- 速度足够快：黑客松 Demo 中用户等待可控，优先保证首图尽快出现。
- 模块独立：前端只需要调用固定 API，不直接关心模型供应商。
- 可替换模型：后端用 Provider Adapter 封装 OpenAI、Gemini、FLUX 等模型，后续可以按质量、成本、速度切换。
- 可观测：记录每次生成的 prompt、模型、耗时、成本估算、错误原因，便于调参。

## 2. 推荐整体链路

```mermaid
flowchart LR
  A["前端问答交互"] --> B["目标拆解结果 JSON"]
  B --> C["文生图模块 API"]
  C --> D["Prompt Compiler"]
  D --> E["Safety / Prompt Policy"]
  E --> F["Image Provider Adapter"]
  F --> G["模型 API"]
  G --> H["图片存储"]
  H --> I["返回 image_url / metadata"]
```

建议前端不要直接传一段自然语言 prompt，而是传结构化愿景数据。这样后端可以稳定拼装 prompt，减少用户输入随机性。

## 3. 输入数据结构

前端建议传：

```json
{
  "user_id": "optional-user-id",
  "goal": {
    "title": "三个月内养成规律健身习惯",
    "category": "health",
    "desired_state": "自信、精力充沛、体态更好",
    "milestones": ["每周健身 3 次", "每天睡够 7 小时", "减少夜宵"],
    "keywords": ["清晨", "健身房", "力量感", "积极"]
  },
  "visual": {
    "style": "cinematic-realistic",
    "mood": "bright, hopeful, energetic",
    "aspect_ratio": "16:9",
    "quality": "medium",
    "avoid": ["文字水印", "夸张肌肉", "杂乱背景"]
  }
}
```

## 4. 输出数据结构

```json
{
  "job_id": "img_01HX...",
  "status": "succeeded",
  "image_url": "https://cdn.example.com/generated/img_01HX.webp",
  "thumbnail_url": "https://cdn.example.com/generated/img_01HX_thumb.webp",
  "provider": "openai",
  "model": "gpt-image-2",
  "size": "1536x1024",
  "format": "webp",
  "latency_ms": 18500,
  "prompt_version": "visionboard_v1"
}
```

## 5. API 设计

### `POST /api/image-generations`

创建图片生成任务。黑客松阶段可以同步等待，生产阶段建议异步。

请求：

```json
{
  "goal": {},
  "visual": {},
  "mode": "preview"
}
```

响应：

```json
{
  "job_id": "img_01HX...",
  "status": "queued"
}
```

### `GET /api/image-generations/:job_id`

查询任务状态。

```json
{
  "job_id": "img_01HX...",
  "status": "processing",
  "progress": 60
}
```

### `POST /api/image-generations/:job_id/regenerate`

基于同一组结构化目标重新生成。前端可以传 `style`、`mood` 或 `avoid` 的轻量修改。

## 6. 技术栈建议

黑客松版本推荐：

- Runtime：Node.js + TypeScript
- Web 框架：Fastify 或 Express
- 模型 SDK：OpenAI SDK / Google GenAI SDK / BFL REST API Adapter
- 存储：Cloudflare R2、AWS S3、Supabase Storage 三选一
- 数据库：Supabase Postgres 或 Neon Postgres
- 队列：黑客松阶段可先不用；生产阶段加 BullMQ + Redis、Cloudflare Queues 或 Vercel Queue 类方案
- 部署：Vercel / Render / Railway / Fly.io，选择团队最熟悉的

为什么推荐 Node.js：

- 前后端同语言，和前端同学对接快。
- SDK 生态完整，处理 API 网关、上传、鉴权方便。
- 黑客松调试成本低，前端调用本地接口最直接。

生产阶段可以演进为：

- API Server：NestJS / Fastify
- Worker：独立 image-worker 服务处理长任务
- DB：Postgres 保存任务和生成记录
- CDN：R2/S3 + CDN 加速图片访问
- Observability：Sentry + OpenTelemetry + provider request id

## 7. 模型选择建议

### 首选：OpenAI `gpt-image-2`

适合黑客松主链路。OpenAI 官方文档显示 GPT Image 当前包含 `gpt-image-2`，并且 Image API 可以做单次生成和编辑；Responses API 更适合多轮可编辑体验。官方也支持调整尺寸、质量、格式、压缩等输出参数。

推荐配置：

- `model`: `gpt-image-2`
- `quality`: `medium`
- `size`: Web 首屏用 `1536x1024` 或 `1024x1024`
- `format`: `webp` 或 `jpeg`
- `compression`: 70-85

优点：

- 指令跟随和复杂语义理解强，适合“心愿目标 -> 情绪化画面”的场景。
- Prompt 不需要写得像传统扩散模型那么技巧化，结构化描述即可。
- 输出参数简单，后端封装快。

风险：

- 复杂 prompt 可能耗时较长，官方文档提示复杂请求可能到分钟级。
- 可能需要完成 API 组织验证。
- 如果大量并发，成本和速率限制要提前确认。

### 速度/成本备选：Google Gemini 2.5 Flash Image 或 Imagen 4 Fast

Google 官方文档说明 Gemini 2.5 Flash Image 面向速度和效率，适合高吞吐、低延迟任务，生成 1024px 级图片。Imagen 4 Fast 的官方标价为每张 $0.02，标准版 $0.04，Ultra $0.06。

建议用途：

- 作为“快速预览图”模型。
- 用户点“生成最终愿景图”时再切到更高质量模型。

### 高质量备选：Black Forest Labs FLUX.2

BFL 官方定价文档显示 FLUX.2 [pro] 面向生产工作流和快速交付，FLUX.2 [max] 面向最高质量，FLUX.2 [flex] 偏细粒度控制和字体排版。FLUX.2 按输出分辨率的 megapixel 计价。

建议用途：

- 需要偏摄影、商业海报、视觉冲击力时作为候选。
- 做模型 A/B 对比时，把 FLUX.2 [pro] 和 OpenAI `gpt-image-2` 放进同一套 prompt 评测。

### 黑客松最终推荐

先接一个主模型，不要一开始同时接三家。

优先方案：

1. 主模型：OpenAI `gpt-image-2`
2. 输出：`medium + webp + 1536x1024`
3. 降级：如果生成超时或失败，切到 `1024x1024 + low/medium`
4. 有余力再接 Gemini 2.5 Flash Image 做快速预览

## 8. 生图调参策略

不要把“调参”理解成只调模型参数。这个产品最重要的是 prompt 编译和体验策略。

### Prompt Compiler

建议模板：

```text
Create an aspirational vision board image for a user's goal.

Goal:
- Title: {{goal.title}}
- Desired state: {{goal.desired_state}}
- Milestones: {{goal.milestones}}
- Keywords: {{goal.keywords}}

Visual direction:
- Style: {{visual.style}}
- Mood: {{visual.mood}}
- Composition: clean, emotionally uplifting, premium web hero image
- Avoid: {{visual.avoid}}, text, watermark, logo, distorted hands, cluttered background

Output requirements:
- No readable text in the image
- Strong central subject
- Suitable for a modern web vision board product
- High aesthetic quality, realistic lighting, coherent details
```

### 参数优先级

1. 尺寸：先按前端展示区域定，不要盲目追求大图。
2. 质量：Demo 默认 `medium`，用户确认最终图时再用 `high`。
3. 格式：Web 展示优先 `webp` 或 `jpeg`，比 PNG 更适合降低加载延迟。
4. 压缩：70-85 通常比较稳，过低会影响质感。
5. 风格枚举：后端维护固定枚举，不让前端自由传无限风格。

### 建议的风格枚举

```ts
type VisionStyle =
  | "cinematic-realistic"
  | "editorial-collage"
  | "warm-minimal"
  | "futuristic-premium"
  | "soft-illustration"
  | "travel-lifestyle"
  | "career-success";
```

## 9. 性能与用户体验策略

文生图天然不是毫秒级接口，所以前端体验要一起设计。

建议：

- 点击生成后立即返回 `job_id`，前端展示生成中状态。
- 前 1-2 秒展示“正在理解你的目标”，后面展示“正在生成愿景画面”。
- 如果 20 秒内没完成，给用户可继续等待的状态，不要让页面卡死。
- 首图使用 `medium`，允许“再来一张”。
- 预置 3-5 张兜底图，模型失败时仍可完成 Demo。
- 生成成功后图片上传到对象存储，不依赖模型供应商的临时 URL。

## 10. Web 端与移动端对比

| 维度 | Web 端 | 移动端 |
| --- | --- | --- |
| 黑客松实现速度 | 快，前后端联调直接 | 慢，需要 App 工程、打包、真机兼容 |
| 展示效果 | 大屏更适合愿景板、海报、沉浸式交互 | 私密性和随手访问更好，但展示空间小 |
| 调试 | 浏览器 DevTools、接口调试方便 | 真机、模拟器、权限、网络调试更复杂 |
| 分发 | 一个 URL 即可给评委体验 | 安装包/TestFlight/扫码链路更重 |
| 图片生成等待体验 | 可以做大面积 loading、渐进展示 | 等待时用户更容易退出 |
| 后续商业化 | 适合先验证工作流和分享页 | 适合长期打卡、提醒、壁纸、习惯追踪 |

结论：黑客松阶段优先 Web 端是正确选择。愿景板本身依赖视觉冲击和交互呈现，Web 更容易做出完整 Demo，也更容易接后端和展示生成结果。移动端适合作为后续版本，重点做提醒、每日回看、壁纸化和轻量分享。

## 11. 开发计划

### Day 1：模块骨架

- 定义前后端接口协议。
- 实现 `POST /api/image-generations` 和 `GET /api/image-generations/:id`。
- 实现 Prompt Compiler v1。
- 接入一个主模型。
- 本地保存生成记录。

### Day 2：体验闭环

- 图片上传对象存储。
- 前端轮询任务状态。
- 加入失败重试和超时降级。
- 增加 3-5 个风格 preset。
- 记录耗时、模型、prompt version。

### Day 3：Demo 打磨

- 加入兜底图。
- 对 10-20 个典型愿望做 prompt 回归测试。
- 选出最稳定的默认风格。
- 准备评委演示路径：输入心愿 -> 拆解目标 -> 生成图片 -> 展示愿景板。

## 12. 最小可行版本

MVP 只需要：

- 一个生成接口
- 一个查询接口
- 一个模型 Provider
- 一个 prompt 模板
- 一个对象存储
- 一个任务表
- 一个兜底图策略

不建议 MVP 做：

- 多模型复杂路由
- 用户自定义任意 prompt
- 模型微调
- 图片编辑器
- 移动端 App
- 复杂支付或积分系统

## 13. 数据表草案

```sql
create table image_generation_jobs (
  id text primary key,
  user_id text,
  status text not null,
  provider text not null,
  model text not null,
  prompt_version text not null,
  prompt text not null,
  input_json jsonb not null,
  image_url text,
  thumbnail_url text,
  error_code text,
  error_message text,
  latency_ms integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## 14. Provider Adapter 接口

```ts
export interface ImageGenerationInput {
  prompt: string;
  aspectRatio: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
  quality: "low" | "medium" | "high";
  format: "webp" | "jpeg" | "png";
  seed?: number;
}

export interface ImageGenerationOutput {
  bytes: Buffer;
  mimeType: string;
  provider: string;
  model: string;
  rawMetadata?: unknown;
}

export interface ImageProvider {
  generate(input: ImageGenerationInput): Promise<ImageGenerationOutput>;
}
```

## 15. 风险与应对

| 风险 | 应对 |
| --- | --- |
| 生图慢 | 异步任务、前端 loading、首图 medium、格式用 webp/jpeg |
| Prompt 不稳定 | 固定模板、结构化输入、风格枚举、回归样例 |
| 模型失败 | 重试一次、降级小尺寸、兜底图 |
| 成本不可控 | 限制每用户生成次数、记录模型和质量、默认 medium |
| 图片不符合愿望 | 增加目标拆解字段，prompt 中强调 desired_state 和 milestones |
| 出现文字乱码 | prompt 明确 no readable text，UI 文案由前端叠加，不让模型生成文字 |

## 16. 参考资料

- OpenAI Image Generation 官方文档：https://developers.openai.com/api/docs/guides/image-generation
- Google Gemini Image Generation 官方文档：https://ai.google.dev/gemini-api/docs/image-generation
- Google Gemini API Pricing 官方文档：https://ai.google.dev/gemini-api/docs/pricing
- Black Forest Labs FLUX Pricing 官方文档：https://docs.bfl.ai/quick_start/pricing
- Black Forest Labs FLUX1.1 Ultra 官方文档：https://docs.us.bfl.ai/flux_models/flux_1_1_pro_ultra_raw
