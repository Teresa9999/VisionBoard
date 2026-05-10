# 心愿愿景板交互流程 PRD

更新时间：2026-05-10

## 1. 背景

心愿愿景板产品希望通过一段轻量、温和、有陪伴感的交互，让用户从模糊的情绪和向往中，逐渐发现自己真正渴望的生活状态，并最终生成一张专属愿景板。

流程不是传统问卷，也不是任务管理工具。它更像一次“被引导的内在探索”：

```text
被唤醒 -> 凭直觉选择 -> 看见自己的偏好 -> 补充个人愿景 -> 确认最终目标 -> 生成专属愿景板
```

产品中的“小精灵 / 愿景向导”承担陪伴、反馈和解释的角色。它不强迫用户设定清晰 KPI，而是帮助用户把模糊感受收束成可视化愿景。

## 2. 产品目标

- 让用户在低压力状态下表达自己的渴望。
- 用滑动卡片收集偏好、生活方式、画面元素和潜在目标方向。
- 用系统总结帮助用户看见自己的关键信息。
- 允许用户补充一句自己的额外愿景。
- 让用户从 AI 生成的目标选项里确认最终方向和时间范围。
- 将用户选择、补充和确认结果转成统一的结构化愿景数据。
- 基于结构化愿景数据分别驱动 AI 总结、目标选项、文生图、目标拆解和小精灵陪伴。
- 输出一张高质感、可保存、可反复打开查看的专属愿景板。

## 3. 页面总览

当前 MVP 流程包含 6 个页面：

1. Page 1：唤醒引导页 `The Awakening`
2. Page 2：愿景探索滑动页 `The Discovery Swipe`
3. Page 3：关键信息总结与补充页 `The Reflection`
4. Page 4：最终目标选择页 `The Direction Choice`
5. Page 5：专属愿景板结果页 `The Ultimate Vision Board`
6. Page 6：目标拆解结果页 `The Goal Roadmap`

```mermaid
flowchart TD
  A["Page 1 The Awakening<br/>唤醒引导，选择情绪氛围"] --> B["Page 2 The Discovery Swipe<br/>滑动卡片，收集目标/元素/生活方式"]
  B --> C["Page 3 The Reflection<br/>展示系统总结，允许用户补充一句话"]
  C --> D["Page 4 The Direction Choice<br/>生成 3 个最终愿景目标，用户选方向和时间"]
  D --> E["生成统一结构化愿景数据<br/>visionSummary / desiredState / sceneKeywords / stylePack"]
  E --> F["并行生成<br/>文生图 + 文生文目标拆解 + 小精灵上下文"]
  F --> G["Page 5 The Ultimate Vision Board<br/>展示专属愿景图"]
  G --> H["Page 6 The Goal Roadmap<br/>展示年度/月度/周目标拆解"]
```

## 4. 核心数据流

```mermaid
flowchart LR
  A["Page 1 情绪氛围"] --> B["Page 2 滑动偏好标签"]
  B --> C["AI 总结用户偏好<br/>Page 3 系统总结"]
  C --> D["用户补充愿景/避免项"]
  D --> E["AI 生成 3 个愿景方向<br/>Page 4 目标选项"]
  E --> F["用户确认方向和时间"]
  F --> G["统一结构化愿景数据"]
  G --> H["文生图 Prompt"]
  G --> I["目标拆解 Prompt"]
  G --> K["小精灵上下文"]
  H --> L["文生图模型"]
  L --> M["Page 5 愿景板结果页"]
  I --> N["文生文目标拆解"]
  N --> O["Page 6 目标路线图"]
```

最终需要生成的统一结构化愿景数据示例：

```json
{
  "rawWish": "用户在流程中的选择和补充信息",
  "visionSummary": "A soft luxury wellness lifestyle with a confident, healthy, glowing future self.",
  "desiredState": "confident, calm, abundant, self-disciplined",
  "keywords": ["wellness", "soft luxury", "self-discipline", "freedom"],
  "sceneKeywords": ["morning sunlight", "pilates studio", "green smoothie", "ocean"],
  "stylePack": "clean-girl-luxury",
  "timeframe": "3 months",
  "focusAreas": ["探索周边的徒步路线", "为自己准备一周的健康早餐", "建立稳定的清晨节奏"],
  "roadmap": {
    "yearlyGoals": [],
    "monthlyMilestones": [],
    "weeklyActionItems": []
  },
  "aspectRatio": "16:9"
}
```

### 4.1 AI 调用点与数据产物

本产品里的 AI 不只用于文生图。AI 应参与“理解用户 -> 收束愿景 -> 生成视觉 -> 拆解行动 -> 陪伴调整”的完整链路。

| 阶段 | 触发时机 | AI 任务 | 输入 | 输出 | 是否 MVP 必需 |
| --- | --- | --- | --- | --- | --- |
| 偏好总结 | Page 2 完成后进入 Page 3 | 将用户情绪、右滑/左滑偏好总结成人能理解的偏好画像 | `mood`、`atmosphere`、`categorySignals`、`sceneKeywords`、`lifestyleTags`、`desiredStateSignals`、`avoidSignals` | `reflectionSummary`、`inferredKeywords`、`inferredAvoid` | 可先规则模板，建议尽早接 LLM |
| 愿景方向生成 | Page 3 用户确认或补充后 | 生成 3 个高颗粒度愿景方向，不生成任务清单 | `reflectionSummary`、`rawSupplement`、偏好标签、避免项 | `visionOptions`、每个选项的 `rationale`、推荐 `stylePack` | 可先标签组合，正式体验建议接 LLM |
| 结构化愿景归一化 | Page 4 用户选择方向和时间后 | 把用户表达转成稳定 JSON，供图像、路线图和小精灵共用 | Page 1-4 全量数据 | `visionSummary`、`goalOutcome`、`desiredState`、`keywords`、`sceneKeywords`、`stylePack`、`avoid`、`focusAreas` | MVP 必需，可以先半规则半 LLM |
| 文生图 Prompt 生成 | Loading 期间 | 将结构化愿景数据填入固定图片 Prompt 模板 | 统一结构化愿景数据 | 最终图片 Prompt、负向 Prompt、比例参数 | MVP 必需 |
| 目标路线图生成 | Loading 期间或 Page 5 后 | 生成年度/月度/周行动建议，语气温和、可执行、不制造压力 | 统一结构化愿景数据、`timeframe`、`selectedVisionOptions` | `roadmap`、`focusAreas`、weekly action items | 可先模板，建议和图片并行生成 |
| 小精灵陪伴 | Page 5/6 用户打开对话或请求调整 | 根据用户愿景和进度，安慰、解释、降低行动压力、调整目标颗粒度 | 统一结构化愿景数据、roadmap、已完成进度、用户输入 | 对话回复、调整后的 weekly action items、轻量建议 | MVP 可只保留入口，后续接入 |

### 4.2 统一结构化愿景数据

Page 4 之后系统应生成一份“统一结构化愿景数据”，它不是只服务于文生图的 Prompt 输入，而是后续所有 AI 能力的共享上下文。

```mermaid
flowchart TD
  A["Page 1-4 用户输入和选择"] --> B["AI/规则归一化"]
  B --> C["Unified Vision Profile"]
  C --> D["Page 5 文生图"]
  C --> E["Page 6 目标路线图"]
  C --> F["Guide 小精灵对话"]
  C --> G["重新生成/换风格"]
```

统一数据建议至少包含：

| 字段 | 说明 |
| --- | --- |
| `rawWish` | 用户原始表达和关键选择，保留语义来源 |
| `reflectionSummary` | Page 3 展示给用户的偏好总结 |
| `selectedVisionOptions` | 用户最终选择的愿景方向 |
| `visionSummary` | AI 合并后的核心愿景摘要 |
| `desiredState` | 用户想靠近的心理/生活状态 |
| `goalOutcome` | 带时间范围的目标结果表达 |
| `keywords` | 抽象语义关键词 |
| `sceneKeywords` | 可视觉化的具体画面元素 |
| `stylePack` | 推荐审美方向 |
| `avoid` | 用户明确不想要或左滑排除的方向 |
| `focusAreas` | 近期可关注的 1-3 个方向 |
| `roadmap` | 目标拆解结果，可后生成、可刷新 |

## 5. 导航与 Tab 设计

第一版不建议在前置流程中使用传统菜单栏 tab。

原因：

- Page 1-4 是一个逐步收束愿景的线性流程。
- 过早出现 tab 会让用户跳来跳去，削弱沉浸感。
- 用户在生成前不需要“浏览功能”，而是需要被引导完成表达。

推荐信息架构：

```text
Onboarding Flow
Page 1 引导
Page 2 滑动探索
Page 3 总结补充
Page 4 目标选择
↓
Result Workspace
Tab 1 愿景图
Tab 2 目标路线图
Tab 3 小精灵
```

### 前置流程导航

Page 1-4 使用线性导航：

- 顶部或底部展示轻量进度，例如 `1 / 4`。
- 可以使用小光点、进度线或小精灵位置变化表达进度。
- 不使用传统 tab。
- 允许必要的返回上一步，但不鼓励任意跳转。

### 结果页 Tab

Page 5 之后可以使用轻量 tab，因为用户已经拿到结果，此时产品从“生成流程”进入“愿景空间”。

建议结果页 tab：

| Tab | 对应内容 | 说明 |
| --- | --- | --- |
| 愿景图 / Vision | Page 5 | 展示生成图片、保存、重新生成 |
| 目标路线图 / Roadmap | Page 6 | 展示年度/月度/周目标、checkbox、进度条 |
| 小精灵 / Guide | 轻量对话 | 安慰、建议、调整目标、降低行动压力 |

结果页 tab 最多 3 个，不建议继续增加。

## 6. Page 1：唤醒引导页 The Awakening

### 页面目标

建立产品第一印象，用温和、神秘的方式把用户带入探索氛围，同时收集用户最初的情绪和氛围偏好。

### UI 视觉

- 极简深色或低饱和度背景。
- 屏幕中央悬浮一个有呼吸感的“发光光球 / 小精灵”。
- 小精灵是后续流程的陪伴角色。
- 小精灵下方浮现打字机文案。

### 交互逻辑

打字机文案示例：

```text
嗨，我是你的愿景向导。
今天感觉有点迷茫吗？
来看看你内心真正渴望什么。
```

用户点击屏幕后：

- 小精灵发光。
- 光球化作光迹。
- 展示情绪/氛围选择。
- 用户选择 2-4 个情绪词后进入 Page 2。

### 需要收集的信息

| 信息 | 示例 | 用途 |
| --- | --- | --- |
| `entryMoodHint` | curious, slightly lost, ready for self-discovery | 轻量上下文 |
| `mood` | 自信、松弛、富足、被爱、自由、治愈 | 进入 `desiredState` / `moodPrompt` |
| `atmosphere` | 明亮、梦幻、高级、轻盈、温暖、神秘 | 控制画面氛围 |

### 页面输出

```json
{
  "entryMoodHint": "curious, slightly lost, ready for self-discovery",
  "mood": ["confident", "abundant", "healing"],
  "atmosphere": ["bright", "soft luxury", "warm"]
}
```

## 7. Page 2：愿景探索滑动页 The Discovery Swipe

### 页面目标

通过极低门槛的直觉交互，捕捉用户潜意识里的渴望，并收集目标类别、画面元素和生活方式偏好。

用户不需要写文字，只需要对一组生活切片卡片做快速判断。滑动行为会被转化成偏好标签。

### UI 视觉

- 屏幕中央是卡片堆叠。
- 卡片展示高质感生活切片。
- 小精灵缩小，悬浮在角落陪伴。
- 用户向右滑表示喜欢，向左滑表示无感。

### 交互逻辑

- 右滑：喜欢，记录正向偏好标签。
- 左滑：无感，记录弱偏好或排除信号。
- 右滑时，小精灵发出温暖闪光，提供正反馈。
- 滑动完成后，系统自动提取用户偏好标签。

### 卡片类型

建议卡片分为 4 类，每类 4-8 张：

| 卡片类型 | 收集内容 | 示例 | 输出字段 |
| --- | --- | --- | --- |
| 目标类别卡 | 用户心愿大方向 | 健康、事业、财富、爱情、旅行、疗愈、学习 | `categorySignals` |
| 画面元素卡 | 生图中可出现的具体元素 | 海边、办公室、鲜花、咖啡、瑜伽垫、飞机窗 | `sceneKeywords` |
| 生活方式卡 | 用户向往的生活方式 | 清晨自律、远程办公、轻奢生活、稳定作息 | `lifestyleTags` |
| 状态价值卡 | 用户想成为怎样的人 | 有掌控感、被爱、自由、专业、稳定、闪闪发光 | `desiredStateSignals` |

### 推荐卡片内容

目标类别：

- 变美和健康
- 事业成功
- 财富增长
- 爱情和关系
- 旅行和自由
- 情绪疗愈
- 学习成长

画面元素：

- 晨光
- 鲜花
- 咖啡
- 飞机窗
- 海边
- 城市夜景
- 瑜伽垫
- 豪华酒店

生活方式：

- 清晨自律生活
- 海边远程办公
- 高级办公室工作
- 稳定健康作息
- 浪漫幸福日常

### 页面输出

```json
{
  "categorySignals": ["health", "beauty", "freedom"],
  "sceneKeywords": ["morning sunlight", "pilates studio", "green smoothie", "ocean"],
  "lifestyleTags": ["morning routine", "wellness lifestyle", "soft luxury"],
  "desiredStateSignals": ["confident", "glowing", "relaxed"],
  "avoidSignals": ["dark mood", "messy lifestyle", "corporate stress"]
}
```

## 8. Page 3：关键信息总结与补充页 The Reflection

### 页面目标

展示系统根据 Page 1 和 Page 2 得出的关键信息总结，让用户确认自己被理解，并允许用户补充一句自己的其他愿景。

这一页的核心是从“滑动选择”变成“具体描述”。它不是最终目标选择页，而是一个补充和校准页。

这一页建议由 AI 生成 `reflectionSummary`。AI 的作用不是评价用户，也不是给建议，而是把离散选择翻译成一段温和、准确、可被用户修正的偏好画像。

### UI 视觉

- 顶部：小精灵停留在页面上方。
- 中部：展示系统总结卡片。
- 下方：提供一个自由输入框。
- 底部：进入下一步按钮。

### 系统总结示例

```text
我看到你被清晨、健康、柔和的高级感吸引。
你似乎并不是单纯想变得更忙，
而是在寻找一种更轻盈、更自律、更有掌控感的生活。
```

### AI 总结要求

- 语气像愿景向导，不像心理测评报告。
- 不使用诊断、评判、命令式语言。
- 必须引用用户明显的偏好信号，例如情绪词、右滑卡片类型、画面元素、生活方式标签。
- 如果偏好信号较少，应表达为“我看到一些可能的方向”，避免过度确定。
- 输出应可被 Page 4 继续使用，而不只是展示文案。
- 需要同时生成可结构化字段，供后续愿景方向和目标拆解使用。

建议 AI 输出：

```json
{
  "reflectionSummary": "我看到你被清晨、健康、柔和的高级感吸引...",
  "inferredKeywords": ["wellness", "soft luxury", "self-discipline"],
  "inferredDesiredState": ["calm", "confident", "abundant"],
  "inferredAvoid": ["too influencer-like", "dark mood"],
  "confidence": "medium"
}
```

### 用户补充问题

```text
还有什么你希望被放进这张愿景图里的愿望吗？
```

示例补充：

```text
我希望不要太网红，更自然一点，也希望有富足感。
```

### 需要收集的信息

| 信息 | 示例 | 用途 |
| --- | --- | --- |
| `reflectionSummary` | 系统总结出的偏好画像 | 生成 Page 4 目标选项 |
| `rawSupplement` | 用户补充的一句话 | 进入 `rawWish` / `keywords` |
| `avoid` | 不想太网红、不想太暗、不想像广告 | 进入 Prompt 避免项 |
| `inferredKeywords` | AI 从选择中推断的关键词 | 进入统一结构化愿景数据 |
| `inferredDesiredState` | AI 推断的理想状态 | 进入 `desiredState` |

### 页面输出

```json
{
  "reflectionSummary": "You are drawn to a soft luxury wellness lifestyle with morning light, calm confidence, and a sense of self-discipline.",
  "rawSupplement": "我希望不要太网红，更自然一点，也希望有富足感。",
  "avoid": ["too influencer-like", "cheap advertisement look"]
}
```

## 9. Page 4：最终目标选择页 The Direction Choice

### 页面目标

AI 根据前面所有信息，生成 3 个最终愿景目标选项。用户可以多选其中最有共鸣的方向，并选择达成目标所需要的时间。

这一页是生成图片前的最终确认页。

这一页的 AI 任务是“收束愿景方向”，不是直接生成图片 Prompt。用户确认方向后，系统再把确认结果归一化成统一结构化愿景数据。

### UI 视觉

- 顶部：小精灵展示简短说明。
- 中部：展示 3 个高颗粒度目标方向条状选项卡。
- 下方：展示 3 个时间预设选项，并提供自定义时间输入框。
- 底部：展示“生成我的专属愿景”按钮。

### AI 目标选项要求

目标选项不应该是细碎任务，而是充满弹性、可想象的人生/年度向往。

示例：

```text
选项 A：找回身体的轻盈感与自然连接
选项 B：建立稳定、自律、发光的生活节奏
选项 C：拥有更富足、更松弛、更高级的日常状态
```

AI 生成目标选项时需要遵守：

- 生成 3 个方向，互相有差异，但都来自用户前面的真实信号。
- 每个方向应是一句话人生/阶段愿景，不要写成 todo。
- 避免空泛口号，例如“成为更好的自己”。
- 避免过度功利或焦虑，例如“30 天彻底逆袭”。
- 可以为每个方向附带一条简短解释，但 UI 默认只展示标题。
- 需要同时输出后续可用的结构化字段，例如 `goalOutcome`、`desiredState`、`stylePack` 建议。

建议 AI 输出：

```json
{
  "visionOptions": [
    {
      "id": "option_a",
      "title": "找回身体的轻盈感与自然连接",
      "rationale": "来自健康、自然、晨光和疗愈相关偏好",
      "goalOutcome": "reconnect with the body and nature within three months",
      "desiredState": ["calm", "healthy", "grounded"],
      "stylePack": "natural-wellness"
    }
  ]
}
```

### 目标选项交互

目标选项建议使用“条状选项卡”，而不是大卡片。

原因：

- 条状选项信息密度更高，适合同时比较 3 个方向。
- 用户可以多选 1-2 个方向，表达复合愿景。
- 后续可以把多选结果合并成更丰富的 `visionSummary`。

交互规则：

- 默认不强制单选。
- 用户至少选择 1 个。
- 建议最多选择 2 个，避免愿景过散。
- 被选中的条状选项高亮。

输出字段：

```json
{
  "selectedVisionOptions": [
    "建立稳定、自律、发光的生活节奏",
    "拥有更富足、更松弛、更高级的日常状态"
  ]
}
```

### 时间选择

用户选择达成这个目标所需要的时间：

- 3 个月
- 6 个月
- 1 年

同时提供自定义输入框：

```text
其他时间：例如 45 天、半年内、毕业前、今年年底
```

时间字段优先级：

```text
customTimeframe > presetTimeframe
```

### 交互逻辑

- 用户选择 1-2 个最终愿景目标。
- 用户选择一个时间预设，或填写自定义时间。
- 用户点击“生成我的专属愿景”。
- 小精灵光芒覆盖全屏，进入 Loading。
- Loading 期间后端先生成统一结构化愿景数据，再分别触发文生图和文生文目标拆解。

### 需要收集的信息

| 信息 | 示例 | 用途 |
| --- | --- | --- |
| `visionOptions` | 3 个 AI 目标方向 | 供用户选择 |
| `selectedVisionOptions` | 建立稳定、自律、发光的生活节奏；拥有更富足的日常状态 | 进入 `visionSummary` |
| `presetTimeframe` | 3 个月 | 进入 `timeframe` |
| `customTimeframe` | 今年年底 | 覆盖预设时间 |
| `timeframe` | 3 months | 进入 `goalOutcome` / 目标拆解 |
| `goalOutcome` | 建立稳定健康习惯 | 进入 Prompt |
| `desiredState` | 自信、健康、闪闪发光 | 进入 Prompt |
| `stylePack` | clean-girl-luxury | 进入 Prompt |
| `optionRationales` | 每个目标方向的生成依据 | 可用于解释和小精灵对话 |

### 页面输出

```json
{
  "visionOptions": [
    "找回身体的轻盈感与自然连接",
    "建立稳定、自律、发光的生活节奏",
    "拥有更富足、更松弛、更高级的日常状态"
  ],
  "selectedVisionOptions": [
    "建立稳定、自律、发光的生活节奏",
    "拥有更富足、更松弛、更高级的日常状态"
  ],
  "presetTimeframe": "3 months",
  "customTimeframe": "",
  "timeframe": "3 months",
  "goalOutcome": "build a stable wellness and self-discipline routine within three months",
  "desiredState": "confident, healthy, glowing, self-controlled, abundant",
  "stylePack": "clean-girl-luxury"
}
```

## 10. Loading：愿景生成中

### 页面目标

承接用户点击生成后的等待时间，让模型生成过程不显得突兀。

### 交互逻辑

- 小精灵光芒覆盖全屏。
- 显示轻量文案：

```text
我正在把你的向往整理成一张图。
```

或：

```text
正在捕捉你未来生活里的光。
```

### 后端动作

Loading 期间完成：

1. 汇总 Page 1 的情绪氛围。
2. 汇总 Page 2 的偏好标签。
3. 合并 Page 3 的用户补充。
4. 读取 Page 4 的最终目标和时间范围。
5. 调用 AI 或规则服务生成统一结构化愿景数据。
6. 生成最终 `visionSummary`、`goalOutcome`、`desiredState`、`keywords`、`focusAreas`。
7. 选择或确认 `stylePack` 和 `avoid`。
8. 将结构化愿景数据填入固定文生图 Prompt 模板。
9. 调用文生图模型生成愿景图。
10. 调用文生文模型生成目标拆解。
11. 将同一份结构化愿景数据保存为小精灵后续对话上下文。

### AI 处理顺序建议

Loading 阶段不应该把所有 AI 任务串行阻塞在一个接口里。建议拆成可复用的几个任务：

| 任务 | 建议执行方式 | 失败兜底 |
| --- | --- | --- |
| 统一愿景数据归一化 | 先执行，后续任务依赖它 | 使用规则模板拼装基础 JSON |
| 文生图 Prompt 生成 | 依赖统一愿景数据 | 使用固定 Prompt 模板 |
| 目标路线图生成 | 可与图片生成并行 | Page 5 先展示图，Page 6 进入时再补生成 |
| focus areas 生成 | 可来自路线图，也可单独生成 | 从用户选择的目标方向截取 1-3 个 |
| 小精灵上下文生成 | 后台保存，不阻塞首屏 | 首次对话时再实时拼上下文 |

## 11. Page 5：专属愿景板结果页 The Ultimate Vision Board

### 页面目标

这是最终交付页。它不是信息收集页，而是将抽象愿景具象化为高质感画面，并提供不焦虑、方向性的指引。

用户每次打开后，第一眼看到的应该是：

```text
这就是我想要靠近的生活。
```

### UI 视觉

视觉层 `The Why`：

- 占据主导位置的是 AI 生成的专属高质感大图或视频。
- 图片需要契合用户审美和目标。
- 图片应该可以保存为手机壁纸或愿景图。

灵感方向入口 `The Direction`：

- 画面下方或悬浮区域可以展示 1-3 个轻量方向提示。
- 不在这一页做完整目标拆解，完整拆解放到 Page 6。
- 提供“查看目标路线图”入口。

小精灵位置：

- 常驻右下角，作为 FAB。
- 用户可以点击它进行轻量对话。

### 灵感方向提示示例

如果用户大方向是：

```text
找回身体的轻盈感与自然连接
```

近期专注可以是：

- 探索周边的徒步路线
- 为自己准备一周的健康早餐
- 重新建立一个温柔的清晨节奏

如果用户大方向是：

```text
建立稳定、自律、发光的生活节奏
```

近期专注可以是：

- 为每天早晨留出 20 分钟安静时间
- 整理一个让自己想开始的运动空间
- 记录让身体状态变好的微小变化

### 交互逻辑

- 用户查看愿景图。
- 用户可以保存图片。
- 用户可以切换或重新生成风格。
- 用户点击“查看目标路线图”进入 Page 6。
- 用户点击右下角小精灵，进入轻量对话。

小精灵对话示例：

```text
用户：我这周感觉很累，不想动。
小精灵：那我们这周不追求推进，只做一件很轻的事：出门晒十分钟太阳，好吗？
```

### 页面输出

```json
{
  "imageUrl": "https://example.com/generated/vision-board.png",
  "selectedVisionOptions": [
    "建立稳定、自律、发光的生活节奏",
    "拥有更富足、更松弛、更高级的日常状态"
  ],
  "timeframe": "3 months",
  "focusAreas": [
    "为每天早晨留出 20 分钟安静时间",
    "整理一个让自己想开始的运动空间",
    "记录让身体状态变好的微小变化"
  ],
  "stylePack": "clean-girl-luxury"
}
```

## 12. Page 6：目标拆解结果页 The Goal Roadmap

### 页面目标

根据 Page 4 的最终目标、时间范围，以及统一结构化愿景数据，生成一个更可执行的目标路线图。

Page 6 是文生文结果页，和 Page 5 的文生图结果页互补：

- Page 5 解决“我想靠近什么样的生活”。
- Page 6 解决“我接下来可以怎么靠近它”。

目标拆解建议由 AI 生成。AI 的作用是把用户确认的愿景方向翻译成温和、可执行、低压力的阶段路线，而不是把愿景变成传统任务管理。

### UI 结构

页面建议分为三层：

1. 年度目标 / 总目标
2. 月度目标 / 里程碑
3. 周目标 / Action Items

可以加入：

- Checkbox：用于周目标 action item。
- 进度条：根据已完成 action item 计算。
- 小精灵提示：用温和语气解释“只需要从一个很小的动作开始”。

### 目标拆解层级

| 层级 | 内容形式 | 颗粒度 | 是否可勾选 |
| --- | --- | --- | --- |
| 年度目标 / 总目标 | 1-3 个方向性目标 | 大方向，接近愿景 | 否 |
| 月度目标 / Milestones | 每月 1-3 个阶段性里程碑 | 中等颗粒度 | 可选 |
| 周目标 / Action Items | 每周 3-5 个轻量行动 | 具体可执行 | 是 |

### AI 目标拆解要求

- 输入必须来自统一结构化愿景数据，而不是只读 Page 4 的目标标题。
- 必须结合 `timeframe`，例如 3 个月、6 个月、1 年对应不同拆解密度。
- 年度/总目标应保持方向性，不写成 KPI。
- 月度目标应是阶段里程碑，不要求每天打卡。
- 周目标必须轻量、具体、可完成，避免制造焦虑。
- 如果用户愿景偏疗愈、休息、关系修复，周目标要更温和，不能强行效率化。
- 输出需要支持后续小精灵调整，例如“帮我把这周目标变轻一点”。
- 失败兜底可以用模板生成，但数据结构要和 AI 输出一致。

建议 AI 输入：

```json
{
  "visionSummary": "A disciplined wellness lifestyle with a confident, healthy, glowing future self.",
  "selectedVisionOptions": ["建立稳定、自律、发光的生活节奏"],
  "goalOutcome": "build a stable wellness and self-discipline routine within three months",
  "timeframe": "3 months",
  "desiredState": "confident, glowing, relaxed, self-disciplined",
  "focusAreas": ["建立稳定清晨节奏", "温和恢复身体能量"],
  "avoid": ["too much pressure", "overly strict discipline"]
}
```

建议 AI 输出：

```json
{
  "roadmap": {
    "yearlyGoals": [],
    "monthlyMilestones": [],
    "weeklyActionItems": []
  },
  "focusAreas": [],
  "guideSuggestion": "这周先从一个很小的动作开始，不需要一次改变全部生活。"
}
```

### 示例结果

```json
{
  "yearlyGoals": [
    {
      "title": "建立稳定、自律、发光的生活节奏",
      "description": "让健康、自我照顾和富足感成为日常生活的一部分。"
    }
  ],
  "monthlyMilestones": [
    {
      "month": "Month 1",
      "title": "重新建立身体和生活秩序",
      "milestones": [
        "稳定每周 2-3 次轻运动",
        "建立一个可持续的清晨例行",
        "减少让自己感到混乱的生活习惯"
      ]
    },
    {
      "month": "Month 2",
      "title": "提升能量和自我照顾质量",
      "milestones": [
        "找到适合自己的运动方式",
        "优化饮食和睡眠节奏",
        "为自己创造更舒适的生活空间"
      ]
    },
    {
      "month": "Month 3",
      "title": "形成稳定而有质感的生活状态",
      "milestones": [
        "让自律变成自然习惯",
        "保持身体轻盈和情绪稳定",
        "持续靠近更自信、更富足的自己"
      ]
    }
  ],
  "weeklyActionItems": [
    {
      "title": "安排一次 30 分钟轻运动",
      "checked": false
    },
    {
      "title": "准备 3 天的健康早餐",
      "checked": false
    },
    {
      "title": "整理一个让自己想开始的运动角落",
      "checked": false
    }
  ],
  "progress": {
    "completed": 0,
    "total": 3,
    "percentage": 0
  }
}
```

### 交互逻辑

- 用户从 Page 5 点击“查看目标路线图”进入。
- 默认展开本周 action items。
- 用户勾选 action item 后，进度条更新。
- 年度和月度目标以 milestone 展示，不做强任务压力。
- 用户可以让小精灵“帮我把这周目标变轻一点”。

### 页面输出

```json
{
  "roadmapId": "roadmap_001",
  "yearlyGoals": [],
  "monthlyMilestones": [],
  "weeklyActionItems": [],
  "progress": {
    "completed": 0,
    "total": 3,
    "percentage": 0
  }
}
```

## 13. 从结构化愿景到多 AI 能力的交互设计

这一套产品生成链路不应只理解为“Prompt -> 文生图”。更准确的模型是：

```text
用户选择和补充 -> 统一结构化愿景数据 -> 多个 AI 能力消费同一份上下文
```

生成链路至少分为五块：

1. AI 总结：理解用户偏好，生成 Page 3 的 `reflectionSummary`。
2. AI 愿景方向：生成 Page 4 的 `visionOptions`。
3. 文生图：生成愿景板主视觉。
4. 文生文：生成目标拆解路线图。
5. 小精灵对话：基于用户愿景和进度进行陪伴、解释和轻量调整。

这些能力应该使用同一份用户愿景数据，但交互重点不同。

### AI 总结链路

用户感知：

```text
我做了一些直觉选择 -> 系统看懂了我的偏好
```

后台链路：

```text
Page 1-2 数据 -> 偏好总结 Prompt -> LLM/规则模板 -> Page 3 reflectionSummary
```

交互建议：

- Page 3 的总结要先让用户产生“被理解”的感受。
- AI 总结必须允许用户补充和修正，不要把总结包装成最终结论。
- 如果 LLM 失败，可以用规则模板兜底，但仍应输出同样字段结构。

### AI 愿景方向链路

用户感知：

```text
我确认了系统总结并补充愿望 -> 系统帮我收束成几个可选择的愿景方向
```

后台链路：

```text
Page 1-3 数据 -> 愿景方向 Prompt -> LLM/标签组合 -> Page 4 visionOptions
```

交互建议：

- 目标选项不是任务，而是人生状态或阶段方向。
- 选项应可多选，支持复合愿景。
- AI 需要输出可解释的 `rationale`，但 UI 可以默认隐藏。

### 文生图链路

用户感知：

```text
我选择了自己想要的生活状态 -> 系统帮我生成一张愿景图
```

后台链路：

```text
统一结构化愿景数据 -> 固定生图 Prompt 模板 -> 文生图模型 -> Page 5
```

交互建议：

- 在 Page 4 点击生成后，先进入 Loading。
- Loading 文案偏感性，不要说“正在调用接口”。
- Page 5 首屏先展示图片，文本信息少量露出。
- 图片生成失败时，可展示 Mock/兜底图，并提示稍后重新生成。
- Page 5 提供“换个风格再生成”入口。

### 文生文链路

用户感知：

```text
我看到了愿景图 -> 我想知道接下来可以怎么靠近它
```

后台链路：

```text
统一结构化愿景数据 + 最终目标 + 时间范围 -> 文生文模型 -> 年度/月度/周目标 -> Page 6
```

交互建议：

- 文生文不一定要和图片完全同步展示，可以在 Page 5 后提供入口。
- Page 6 不要做传统待办列表，先呈现温和路线图。
- 年度/月度是 milestone，周目标才是 action item。
- 周目标应该轻量、可完成、可勾选。
- 勾选进度条不要制造压力，文案应强调“靠近一点就很好”。

### 小精灵对话链路

用户感知：

```text
我拿到了愿景图和路线图 -> 我可以让小精灵帮我解释、安慰或调轻一点
```

后台链路：

```text
统一结构化愿景数据 + roadmap + 用户当前进度 + 用户输入 -> 对话模型 -> 轻量陪伴/目标调整
```

交互建议：

- 小精灵不做强监督，不催促用户完成任务。
- 当用户表达疲惫、焦虑、挫败时，优先降低行动压力。
- 小精灵可以把周目标改得更小，但不应擅自改变用户最终愿景。
- 小精灵回复应能引用用户愿景，例如“你想靠近的是更轻盈稳定的生活，所以这周只做一个很小的动作也可以。”

### 多 AI 链路的关系

```mermaid
flowchart TD
  A["Page 1-4 用户愿景数据"] --> B["统一结构化数据"]
  B --> C["Page 3 AI 总结"]
  B --> D["Page 4 AI 目标方向"]
  B --> E["文生图 Prompt"]
  B --> F["文生文 Prompt"]
  B --> G["小精灵上下文"]
  E --> H["Page 5 愿景图"]
  F --> I["Page 6 目标路线图"]
  G --> J["Guide 对话"]
  H --> I
```

建议体验顺序：

1. 先展示图，因为图是情绪奖励。
2. 再展示目标拆解，因为拆解是理性行动。
3. 不要让目标拆解抢走愿景图的情绪冲击。

## 14. 统一结构化愿景数据结构

在 Page 4 用户点击生成后，系统应合并前面所有信息，先生成统一结构化愿景数据。文生图 Prompt、文生文 Prompt 和小精灵上下文都从这份数据派生。

```json
{
  "rawWish": "我希望不要太网红，更自然一点，也希望有富足感。",
  "reflectionSummary": "我看到你被清晨、健康、柔和的高级感吸引...",
  "visionSummary": "A disciplined wellness lifestyle with a confident, healthy, glowing future self.",
  "selectedVisionOptions": [
    "建立稳定、自律、发光的生活节奏",
    "拥有更富足、更松弛、更高级的日常状态"
  ],
  "goalOutcome": "build a stable wellness and self-discipline routine within three months",
  "timeframe": "3 months",
  "desiredState": "confident, glowing, relaxed, self-disciplined, abundant",
  "keywords": ["wellness", "self-discipline", "soft luxury", "morning routine"],
  "sceneKeywords": ["morning sunlight", "pilates studio", "green smoothie", "white bedroom"],
  "stylePack": "clean-girl-luxury",
  "moodPrompt": "bright, clean, elegant, hopeful, abundant",
  "avoid": ["readable text", "logo", "dark mood", "messy collage", "too influencer-like"],
  "focusAreas": ["建立稳定清晨节奏", "温和恢复身体能量", "创造更有质感的日常环境"],
  "roadmap": null,
  "guideContext": {
    "tone": "warm, gentle, non-judgmental",
    "supportStrategy": "reduce pressure and suggest tiny actions when user feels tired"
  },
  "aspectRatio": "16:9"
}
```

## 15. Prompt 字段映射

| Prompt 字段 | 来源 | 说明 |
| --- | --- | --- |
| `rawWish` | Page 3 用户补充 + 前面选择结果 | 保留用户自己的愿望表达 |
| `selectedVisionOptions` | Page 4 用户多选的条状目标选项 | 作为最终愿景方向基础 |
| `reflectionSummary` | Page 3 AI 总结 | 展示给用户，也作为后续 AI 的理解基础 |
| `visionSummary` | Page 4 目标选项合并总结 | 最重要字段，决定愿景主题和后续 AI 上下文 |
| `goalOutcome` | Page 4 最终目标和时间范围 | 让目标更具体 |
| `timeframe` | Page 4 时间选择 | 用于目标总结，不一定直接影响画面 |
| `desiredState` | Page 1 情绪词 + Page 2 状态卡 + Page 4 AI 总结 | 决定图片情绪核心 |
| `keywords` | Page 1 + Page 2 + Page 3 | 抽象关键词，如 self-discipline、freedom、abundance |
| `sceneKeywords` | Page 2 画面元素卡 | 决定图片里出现的具体元素 |
| `stylePack` | Page 2 风格信号 + Page 4 推荐 | 决定整体审美 |
| `moodPrompt` | Page 1 情绪氛围 | 控制画面氛围 |
| `avoid` | Page 2 左滑卡片 + Page 3 用户修正 + 默认规则 | 避免用户不喜欢的方向 |
| `focusAreas` | 统一愿景数据 / Page 6 目标拆解 | 用于 Page 5 结果页轻量提示 |
| `roadmap` | Page 6 文生文结果 | 文生文目标拆解结果 |
| `guideContext` | 统一愿景数据 + 用户进度 | 小精灵对话使用的长期上下文 |
| `aspectRatio` | 系统默认 | Web 端可用 `16:9`，手机壁纸可用 `9:16` |

## 16. MVP 建议

第一版最小可行方案：

- Page 1：小精灵引导 + 多选情绪词。
- Page 2：滑动选择目标类别、画面元素、生活方式。
- Page 3：展示 AI/规则生成的系统总结，允许用户补充一句话。
- Page 4：AI/规则生成 3 个最终愿景目标，用户多选 1-2 个并选时间。
- Loading：后端生成统一结构化愿景数据，并分别派生文生图 Prompt、路线图 Prompt 和小精灵上下文。
- Page 5：展示生成图 + 3 个近期专注领域。
- Page 6：展示年度/月度/周目标拆解，周目标支持 checkbox 和进度条。

其中：

- Page 3 的系统总结可以先用规则模板生成，但字段结构要按 LLM 输出设计，后续可无缝替换。
- Page 4 的目标选项可以先用标签组合生成，后续再接 LLM。
- 统一结构化愿景数据是 MVP 必须沉淀的核心数据，不应只存在于文生图 Prompt 字符串里。
- Page 6 的目标拆解可以先用模板生成，后续再接 LLM。
- 文生图 Prompt 使用固定模板。
- 小精灵聊天可以先不做，只保留入口。

## 17. 后续扩展

- 引入 LLM 生成更细腻的系统总结和目标选项。
- 引入 LLM 统一归一化 Page 1-4 数据，生成稳定的 `Unified Vision Profile`。
- Page 2 卡片根据用户前几次滑动动态调整。
- Page 5 支持重新生成、保存壁纸、分享。
- Page 6 支持每周刷新行动项。
- 小精灵支持轻量对话和情绪陪伴。
- 小精灵支持基于用户反馈调整 weekly action items，例如“这周太累了，帮我变轻一点”。
- 结果页的 focus areas 后续可转成行动建议，但不做强任务管理。
