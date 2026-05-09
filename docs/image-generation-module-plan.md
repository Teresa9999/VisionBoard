# 心愿愿景板文生图模块方案

更新时间：2026-05-10

## 1. 模块目标

文生图模块负责把前端收集到的用户心愿、目标拆解结果、偏好风格和展示尺寸，转换为稳定可控的图片生成请求，并返回可在 Web 端直接展示的图片资源。

核心目标：

- 图片质量高：画面完整、情绪准确、风格统一，适合愿景板展示。
- 速度足够快：第一阶段 Demo 中用户等待可控，优先保证首图尽快出现。
- 模块独立：前端只需要调用固定 API，不直接关心模型供应商。
- 可替换模型：后端用 Provider Adapter 封装 OpenAI、Gemini、FLUX 等模型，后续可以按质量、成本、速度切换。
- 可观测：记录每次生成的 prompt、模型、耗时、成本估算、错误原因，便于调参。

## 2. 第一阶段 Demo 范围

第一阶段不追求完整生产架构，先跑通核心体验闭环：

> 用户输入心愿目标 -> 后端拼接生图 prompt -> 调用一个文生图 API -> 前端展示图片。

第一阶段先不做：

- 不做数据库：暂时不保存用户历史和生成记录。
- 不做图片长期存储：先直接返回模型生成的图片结果。
- 不做队列：先用同步接口，前端用 loading 承接等待。
- 不做多模型路由：先接一个最稳定的模型。
- 不做复杂后台：先把接口跑通，后续再补管理和统计能力。

第一阶段链路：

```mermaid
flowchart LR
  A["前端输入心愿"] --> B["POST /api/generate-image"]
  B --> C["Prompt 模板拼接"]
  C --> D["调用文生图 API"]
  D --> E["返回 base64 或临时图片 URL"]
  E --> F["前端展示愿景图"]
```

这个版本的重点是演示产品体验，不是提前把所有后端基础设施搭完。

## 3. 完整版本链路

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

完整版本建议前端不要直接传一段自然语言 prompt，而是传结构化愿景数据。这样后端可以稳定拼装 prompt，减少用户输入随机性。

## 4. 输入数据结构

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

第一阶段也可以先简化为：

```json
{
  "goal": "我想三个月内养成规律健身习惯",
  "style": "真实、明亮、有希望感",
  "aspectRatio": "16:9"
}
```

## 5. 输出数据结构

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

第一阶段也可以先简化为：

```json
{
  "image": "data:image/png;base64,...",
  "prompt": "Create an aspirational vision board image..."
}
```

如果模型返回的是临时 URL，也可以返回：

```json
{
  "imageUrl": "https://temporary-model-url.example/image.png",
  "prompt": "Create an aspirational vision board image..."
}
```

## 6. API 设计

### 第一阶段：`POST /api/generate-image`

同步生成一张图片，前端直接展示。

请求：

```json
{
  "goal": "我想三个月内养成规律健身习惯",
  "style": "cinematic-realistic",
  "aspectRatio": "16:9"
}
```

响应：

```json
{
  "image": "data:image/png;base64,...",
  "prompt": "Create an aspirational vision board image..."
}
```

这个接口是第一阶段最推荐的实现方式。它牺牲了一部分可扩展性，但前后端对接简单，能快速跑通 Demo。

### 后续版本：`POST /api/image-generations`

创建图片生成任务。生产阶段建议异步。

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

### 后续版本：`GET /api/image-generations/:job_id`

查询任务状态。

```json
{
  "job_id": "img_01HX...",
  "status": "processing",
  "progress": 60
}
```

### 后续版本：`POST /api/image-generations/:job_id/regenerate`

基于同一组结构化目标重新生成。前端可以传 `style`、`mood` 或 `avoid` 的轻量修改。

## 7. 技术栈建议

第一阶段推荐：

- Runtime：Node.js + TypeScript
- Web 框架：如果前端是 Next.js，优先直接用 Next.js Route Handler；否则用 Express 写一个最小服务
- 模型 SDK：OpenAI SDK 或 Google GenAI SDK，先选一个
- 存储：第一阶段先不接对象存储，直接把图片结果返回给前端
- 数据库：第一阶段先不接数据库
- 队列：第一阶段先不接队列，前端用 loading 承接等待
- 部署：Vercel / Render / Railway / Fly.io，选择团队最熟悉的

为什么推荐 Node.js：

- 前后端同语言，和前端同学对接快。
- SDK 生态完整，处理 API 网关、上传、鉴权方便。
- 调试成本低，前端调用本地接口最直接。

生产阶段可以演进为：

- API Server：NestJS / Fastify
- Worker：独立 image-worker 服务处理长任务
- DB：Postgres 保存任务和生成记录
- CDN：R2/S3 + CDN 加速图片访问
- Observability：Sentry + OpenTelemetry + provider request id

## 8. 模型选择建议

选模型时不要只看“哪一个画质最好”，还要看第一阶段接入是否顺利、生成速度是否稳定、失败时是否好降级。建议按以下维度判断：

- 图片质量：画面是否精致、主体是否清晰、构图是否稳定。
- Prompt 理解：能否准确理解用户心愿、情绪和场景。
- 生成速度：用户点击生成后能否在可接受时间内返回。
- 接入复杂度：SDK、鉴权、返回格式是否容易接。
- 成本：单张图片成本是否适合多次试错。
- 可控性：是否支持尺寸、质量、风格、参考图、局部编辑。

### 模型对比

| 模型 | 适合场景 | 优势 | 劣势 | 第一阶段建议 |
| --- | --- | --- | --- | --- |
| OpenAI `gpt-image-2` | 主链路高质量愿景图 | Prompt 理解强，适合把用户目标转成有情绪的画面；支持质量、尺寸、格式、压缩等参数 | 复杂 prompt 可能慢；可能需要 API 组织验证；成本要关注 | 推荐作为主模型 |
| Google `gemini-2.5-flash-image` | 快速出图、低延迟预览 | 速度和灵活性好，按官方价格 1024px 级图片约 $0.039/张；适合快速试错 | 画面高级感和稳定性需要实测；不同地区和配额可能影响调用 | 可作为速度优先备选 |
| Google `gemini-3.1-flash-image-preview` | 更复杂的多轮改图、参考图融合 | 官方文档显示支持 1K/2K/4K、更多参考图和更强文本渲染能力 | Preview 模型可能变化，配额和稳定性要实测 | 可关注，不作为保守默认 |
| Google Imagen 4 Fast / Standard / Ultra | 追求稳定的专用文生图 | Imagen 4 是专用图像模型，Fast/Standard/Ultra 价格清晰，分别约 $0.02 / $0.04 / $0.06 每张 | 和多轮编辑、复杂上下文联动不如 Gemini 原生图像模型灵活 | 适合作为成本清晰的备选 |
| BFL FLUX.2 [pro] / [max] / [klein] | 摄影感、商业视觉、高级海报 | FLUX.2 覆盖高速到最高质量；[klein] 适合高并发，[pro] 平衡质量和成本，[max] 追求最高质量 | 接入和参数理解成本略高；不同档位需要测试选择 | 第二阶段再接入做 A/B |
| Stability AI Stable Image Core / Ultra | 通用文生图、概念图、营销图 | 生态成熟，Stable Image Core 偏速度和成本，Ultra 偏高质量 | 愿景目标这类抽象语义可能更依赖 prompt 技巧；API 和价格需按账户确认 | 不作为第一阶段首选 |

### 首选：OpenAI `gpt-image-2`

适合第一阶段主链路。OpenAI 官方文档显示 GPT Image 当前包含 `gpt-image-2`，并且 Image API 可以做单次生成和编辑；Responses API 更适合多轮可编辑体验。官方也支持调整尺寸、质量、格式、压缩等输出参数。

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
- 适合愿景板这类“用户目标 + 情绪 + 场景”的非纯视觉需求。

风险：

- 复杂 prompt 可能耗时较长，官方文档提示复杂请求可能到分钟级。
- 可能需要完成 API 组织验证。
- 如果大量并发，成本和速率限制要提前确认。

### 速度备选：Google `gemini-2.5-flash-image`

Google 官方定价文档说明 Gemini 2.5 Flash Image 是原生图像生成模型，优化方向是速度、灵活性和上下文理解。1024px 级输出图片按官方说明约 $0.039/张。

Google 官方图像生成文档也列出了 `gemini-3.1-flash-image-preview`，它支持更高分辨率、更多参考图和更强的文本渲染能力。如果团队已经有 Google API Key，也可以试跑这一版；但因为它是 preview，第一阶段不建议把它作为唯一主模型。

建议用途：

- 作为快速预览模型。
- 当主模型响应慢时，作为降级模型。
- 用于“再生成一张”这类频繁试错场景。

优点：

- 速度和成本更适合多次生成。
- Google GenAI SDK 接入相对直接。
- 对多轮图像编辑和上下文理解支持较好。

风险：

- 第一阶段需要实测画面高级感是否符合产品调性。
- 如果使用 preview 版本，稳定性和配额限制可能变化。

### 成本清晰备选：Google Imagen 4 Fast / Standard / Ultra

Google 官方文档建议 Imagen 4 作为 Imagen 系列的起点，Imagen 4 Ultra 面向更高质量需求。官方价格为 Fast $0.02/张、Standard $0.04/张、Ultra $0.06/张。

建议用途：

- 需要明确单张图片成本时使用。
- 对“纯文生图”质量和稳定性有要求，但不需要复杂多轮编辑时使用。
- Fast 用于预览，Standard/Ultra 用于最终图。

优点：

- 价格清晰，方便控制预算。
- 专用文生图模型，适合稳定生成高质量图片。
- Fast / Standard / Ultra 三档方便按体验和成本取舍。

风险：

- 相比 Gemini 原生图像模型，和上下文、多轮编辑的结合不一定最灵活。
- 如果前端体验强调连续对话式改图，需要额外设计交互流程。

### 高质量备选：Black Forest Labs FLUX.2

BFL 官方定价文档显示 FLUX.2 [pro] 面向生产工作流和快速交付，FLUX.2 [max] 面向最高质量，FLUX.2 [flex] 偏细粒度控制和字体排版。FLUX.2 按输出分辨率的 megapixel 计价。

建议用途：

- 需要偏摄影、商业海报、视觉冲击力时作为候选。
- 做模型 A/B 对比时，把 FLUX.2 [pro] 和 OpenAI `gpt-image-2` 放进同一套 prompt 评测。

优点：

- 摄影感、材质细节、商业视觉表现强。
- FLUX.2 [klein] 适合高频和实时场景，[pro] 适合生产级质量，[max] 适合追求最高质量。
- 对颜色、姿态、构图等控制能力较强。

风险：

- 第一阶段接入和调参成本会高于只接 OpenAI 或 Google。
- 不同档位模型差异明显，需要额外测试才能选定默认模型。

### 其他候选：Stability AI Stable Image Core / Ultra

Stable Image Core 更偏速度和通用生成，Stable Image Ultra 更偏高质量和细节表现。它们适合概念图、营销视觉、风格化图片等场景。

优点：

- 图像生成生态成熟。
- Stable Image Core 可作为成本和速度优先的候选。
- Stable Image Ultra 适合更高质量的视觉稿。

风险：

- 对“心愿目标 -> 情绪化愿景图”这类抽象语义，prompt 需要更仔细设计。
- 不建议第一阶段同时接入，避免增加接口和调参复杂度。

### 第一阶段推荐

先接一个主模型，不要一开始同时接三家。

优先方案：

1. 主模型：OpenAI `gpt-image-2`
2. 输出：`medium + webp + 1536x1024`
3. 降级：如果生成超时或失败，切到 `1024x1024 + low/medium`
4. 如果主模型速度不理想，再接 `gemini-2.5-flash-image` 或 Imagen 4 Fast 做快速预览

如果目标是“最快跑通 Demo”，选择 OpenAI `gpt-image-2`。如果实际测试发现速度或配额不稳定，再换 Google Gemini / Imagen。FLUX.2 和 Stability 更适合作为第二阶段做画质 A/B 测试。

## 9. 生图调参策略

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

## 10. 性能与用户体验策略

文生图天然不是毫秒级接口，所以前端体验要一起设计。

建议：

- 第一阶段可以点击生成后同步等待结果，前端展示 loading 状态。
- 后续版本再改成返回 `job_id`，前端轮询生成状态。
- 前 1-2 秒展示“正在理解你的目标”，后面展示“正在生成愿景画面”。
- 如果 20 秒内没完成，给用户可继续等待的状态，不要让页面卡死。
- 首图使用 `medium`，允许“再来一张”。
- 预置 3-5 张兜底图，模型失败时仍可完成 Demo。
- 第一阶段可以直接展示返回图片；后续版本再上传到对象存储，避免依赖模型供应商的临时 URL。

## 11. Web 端与移动端对比

| 维度 | Web 端 | 移动端 |
| --- | --- | --- |
| 第一阶段实现速度 | 快，前后端联调直接 | 慢，需要 App 工程、打包、真机兼容 |
| 展示效果 | 大屏更适合愿景板、海报、沉浸式交互 | 私密性和随手访问更好，但展示空间小 |
| 调试 | 浏览器 DevTools、接口调试方便 | 真机、模拟器、权限、网络调试更复杂 |
| 分发 | 一个 URL 即可给团队和用户体验 | 安装包/TestFlight/扫码链路更重 |
| 图片生成等待体验 | 可以做大面积 loading、渐进展示 | 等待时用户更容易退出 |
| 后续商业化 | 适合先验证工作流和分享页 | 适合长期打卡、提醒、壁纸、习惯追踪 |

结论：第一阶段优先 Web 端是正确选择。愿景板本身依赖视觉冲击和交互呈现，Web 更容易做出完整 Demo，也更容易接后端和展示生成结果。移动端适合作为后续版本，重点做提醒、每日回看、壁纸化和轻量分享。

## 12. 第一阶段 Demo 计划

### Step 1：确定最小接口

- 前端只调用一个接口：`POST /api/generate-image`。
- 请求字段只保留 `goal`、`style`、`aspectRatio`。
- 响应字段只保留 `image` 或 `imageUrl`，可附带 `prompt` 用于调试。

### Step 2：跑通固定 Prompt 生图

- 先不接真实用户输入，用一条固定 prompt 调通模型。
- 确认 API Key 可用。
- 确认前端能正确展示图片。
- 记录一次生成大概需要多久。

### Step 3：接入用户目标

- 把用户输入的 `goal` 放进 prompt 模板。
- 使用固定风格枚举，不开放任意复杂 prompt。
- 默认输出 `16:9`，更适合 Web 愿景板展示。

### Step 4：补齐基础体验

- 生成中展示 loading。
- 按钮生成中禁用，避免重复请求。
- 生图失败时给出友好提示。
- 准备 2-3 张本地兜底图，保证演示链路不断。

### Step 5：Prompt 调优

- 准备 5 个典型心愿测试：健身、学习、职业、旅行、情绪疗愈。
- 每个心愿生成 1-2 次，看画面是否稳定、干净、有愿景感。
- 根据结果调整模板里的风格、构图和负向要求。

### Step 6：演示路径固定

- 固定一条最稳定的演示输入。
- 固定一个默认风格。
- 检查投屏尺寸下图片是否清晰。
- 准备一句技术说明：后端将用户目标转换成视觉 prompt，并调用文生图模型生成愿景图。

## 13. 后续开发计划

### Day 1：模块骨架

- 定义完整前后端接口协议。
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
- 准备演示路径：输入心愿 -> 拆解目标 -> 生成图片 -> 展示愿景板。

## 14. 最小可行版本

第一阶段 MVP 只需要：

- 一个生成接口
- 一个 prompt 模板
- 一个模型调用
- 一个 loading 状态
- 一个兜底图策略

第一阶段不建议做：

- 对象存储
- 数据库任务表
- 异步队列
- 多模型复杂路由
- 用户自定义任意 prompt
- 模型微调
- 图片编辑器
- 移动端 App
- 复杂支付或积分系统

## 15. 数据表草案（后续版本）

第一阶段不需要数据库。后续如果要保存历史记录、分享链接或统计生成次数，可以再加任务表：

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

## 16. Provider Adapter 接口（后续版本）

第一阶段可以先把模型调用写在一个服务函数里。等需要切换模型或做多模型路由时，再抽象 Provider Adapter：

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

## 17. 风险与应对

| 风险 | 应对 |
| --- | --- |
| 生图慢 | 第一阶段用前端 loading 承接，后续再改异步任务；首图 medium，格式用 webp/jpeg |
| Prompt 不稳定 | 固定模板、结构化输入、风格枚举、回归样例 |
| 模型失败 | 重试一次、降级小尺寸、兜底图 |
| 成本不可控 | 限制每用户生成次数、记录模型和质量、默认 medium |
| 图片不符合愿望 | 增加目标拆解字段，prompt 中强调 desired_state 和 milestones |
| 出现文字乱码 | prompt 明确 no readable text，UI 文案由前端叠加，不让模型生成文字 |

## 18. 参考资料

- OpenAI Image Generation 官方文档：https://developers.openai.com/api/docs/guides/image-generation
- OpenAI GPT Image 2 模型页：https://developers.openai.com/api/docs/models/gpt-image-2
- Google Gemini Image Generation 官方文档：https://ai.google.dev/gemini-api/docs/image-generation
- Google Gemini API Pricing 官方文档：https://ai.google.dev/gemini-api/docs/pricing
- Black Forest Labs FLUX.2 官方文档：https://docs.bfl.ai/flux_2/flux2_overview
- Black Forest Labs FLUX Pricing 官方文档：https://docs.bfl.ai/quick_start/pricing
- Stability AI API Pricing Update：https://stability.ai/api-pricing-update-25
