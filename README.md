# VisionBoard

VisionBoard 是一个“心愿探索 -> 结构化愿景 -> AI 愿景图 -> 目标路线图”的原型项目。它通过轻量的引导和滑动选择，帮助用户把模糊的生活向往收束成可视化愿景，并生成一张可保存、可反复查看的专属愿景板。

当前仓库包含两个可运行入口：

- 根目录：一个最小文生图调试 Demo，用于快速测试 Prompt、模型供应商和图片生成效果。
- `vision-board/`：一个基于 Next.js 的完整愿景探索流程 Demo，包含唤醒页、滑动探索、总结补充、目标选择、结果页和图片生成 API。

## 产品流程

```text
唤醒引导 -> 滑动探索 -> 偏好总结 -> 目标确认 -> 生成愿景图 -> 目标路线图
```

核心设计不是让用户填写传统问卷，而是通过低压力的选择和补充，让系统逐步生成一份统一的愿景数据：

- `rawWish`：用户原始表达和补充
- `visionSummary`：系统总结出的愿景摘要
- `desiredState`：用户想靠近的心理和生活状态
- `sceneKeywords`：可被图像模型理解的画面元素
- `stylePack`：愿景图审美风格包
- `timeframe`：目标时间范围
- `roadmap`：后续目标拆解结果

## 技术栈

根目录 Demo：

- Node.js
- 原生 Web 前端
- 自定义 `server.mjs`
- Mock / OpenAI / Gemini / AI Ping 图片生成适配

`vision-board/` Next.js Demo：

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Drizzle ORM + PostgreSQL 结构预留
- Eazo SDK 集成预留
- AI Ping 图片生成 API

## 快速开始

### 1. 运行根目录文生图 Demo

```bash
npm install
cp .env.example .env
npm run dev
```

打开：

```text
http://localhost:3000
```

默认可以使用 Mock Preview，不配置 API Key 也能查看界面和调试流程。要调用真实模型，在 `.env` 中填写对应密钥。

### 2. 运行 Next.js 愿景流程 Demo

```bash
cd vision-board
npm install
cp .env.example .env
npm run dev
```

打开：

```text
http://localhost:3000
```

如果 3000 端口已被根目录 Demo 占用，Next.js 会提示使用其他端口，按终端输出访问即可。

## 环境变量

根目录 Demo 使用：

| 变量 | 说明 |
| --- | --- |
| `PORT` | 本地服务端口，默认 `3000` |
| `OPENAI_API_KEY` | OpenAI 图片模型 API Key |
| `GEMINI_API_KEY` | Gemini 图片模型 API Key |
| `AIPING_API_KEY` | AI Ping API Key |
| `AIPING_BASE_URL` | AI Ping API 地址，默认 `https://aiping.cn/api/v1` |

`vision-board/` 使用：

| 变量 | 说明 |
| --- | --- |
| `LOCAL_DEMO` | 本地演示模式，建议保持 `true` |
| `NEXT_PUBLIC_LOCAL_DEMO` | 浏览器侧本地演示开关，建议保持 `true` |
| `AIPING_API_KEY` | 服务端调用 AI Ping 图片生成接口 |
| `AIPING_BASE_URL` | AI Ping API 地址 |
| `EAZO_PRIVATE_KEY` | Eazo 托管模式下用于解密用户会话 |
| `EAZO_APP_ID` | Eazo 应用 ID |
| `DATABASE_URL` | PostgreSQL 连接串 |
| `CRON_SECRET` | Vercel Cron 调用鉴权密钥 |

## 图片生成

当前图片生成链路采用后端封装方式，前端不直接暴露模型密钥。

`vision-board/` 中的接口：

```text
POST /api/generate-image
```

请求示例：

```json
{
  "rawWish": "我希望三个月内建立更稳定、更自律的生活节奏。",
  "visionSummary": "A disciplined wellness lifestyle with a confident, healthy, glowing future self.",
  "selectedVisionOptions": ["建立稳定、自律、发光的生活节奏"],
  "goalOutcome": "build a stable wellness and self-discipline routine within three months",
  "timeframe": "3 months",
  "desiredState": "confident, calm, abundant, self-disciplined",
  "keywords": ["wellness", "self-discipline", "soft luxury"],
  "sceneKeywords": ["morning sunlight", "pilates studio", "green smoothie"],
  "stylePack": "clean-girl-luxury",
  "aspectRatio": "16:9"
}
```

响应会返回图片数据、实际使用的 Prompt、模型信息和生成耗时。

## 目录结构

```text
.
├── docs/
│   ├── image-generation-module-plan.md
│   ├── image-generation-prompt-template.md
│   └── visionboard-info-collection-prd.md
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── server.mjs
└── vision-board/
    ├── src/app/
    ├── src/features/vision-journey/
    ├── src/lib/image-generation.ts
    ├── src/lib/db/
    └── src/lib/mcp/
```

## 关键文档

- [心愿愿景板交互流程 PRD](docs/visionboard-info-collection-prd.md)
- [文生图模块方案](docs/image-generation-module-plan.md)
- [文生图 Prompt 模板](docs/image-generation-prompt-template.md)
- [Vision Journey Feature](vision-board/src/features/vision-journey/README.md)

## 常用命令

根目录：

```bash
npm run dev
```

`vision-board/`：

```bash
npm run dev
npm run build
npm run lint
npm run db:generate
npm run db:migrate
```

## 部署说明

根目录 Demo 可以作为简单 Node 服务部署。`vision-board/` 建议部署到 Vercel，并将项目根目录设置为 `vision-board`。

Vercel 至少需要配置：

```text
LOCAL_DEMO=true
NEXT_PUBLIC_LOCAL_DEMO=true
AIPING_API_KEY=your_aiping_key
AIPING_BASE_URL=https://aiping.cn/api/v1
```

如果启用 Eazo 托管、数据库或定时任务，再补充 `EAZO_PRIVATE_KEY`、`EAZO_APP_ID`、`DATABASE_URL` 和 `CRON_SECRET`。

## 当前状态

项目仍处于原型和 MVP 阶段。当前重点是跑通完整体验闭环：

```text
用户输入和选择 -> 统一愿景数据 -> Prompt Builder -> 图片生成 -> 愿景结果展示
```

后续可以继续补齐：

- 图片生成任务队列和状态查询
- 图片长期存储和历史记录
- 更完整的模型路由与降级策略
- 目标路线图的 LLM 生成
- 小精灵对话陪伴和目标调整
- 生产环境鉴权、计费和观测能力
