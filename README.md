# VisionBoard

一个用于测试“心愿目标 -> Prompt 模板 -> 文生图模型 -> 愿景图”的最小 Demo。

## 本地运行

```bash
npm run dev
```

打开：

```text
http://localhost:3000
```

默认使用 `Mock Preview`，不需要 API Key。要测试真实模型，可以在环境变量里配置：

```bash
OPENAI_API_KEY=你的_key npm run dev
GEMINI_API_KEY=你的_key npm run dev
```

也可以复制 `.env.example` 为 `.env` 后填写：

```bash
cp .env.example .env
```

如果使用 AI Ping，在 `.env` 中填写：

```bash
AIPING_API_KEY=
AIPING_BASE_URL=https://aiping.cn/api/v1
```

当前支持：

- Mock Preview
- OpenAI `gpt-image-2`
- Gemini `gemini-3.1-flash-image-preview`
- Gemini `gemini-2.5-flash-image`
- AI Ping / Doubao Seedream 4.0
- AI Ping / Doubao Seedream 5.0 Lite

## 文档

- [文生图模块方案](docs/image-generation-module-plan.md)
- [Prompt 模板](docs/image-generation-prompt-template.md)
