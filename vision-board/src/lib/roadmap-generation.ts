export type RoadmapAction = {
  id: string;
  text: string;
};

export type RoadmapPhase = {
  id: string;
  label: string;
  timeRange: string;
  milestone: string;
  actions: RoadmapAction[];
};

export type Roadmap = {
  yearlyGoal: string;
  phases: RoadmapPhase[];
};

type GoalInput = {
  title: string;
  description?: string;
  category?: string;
};

function getTimeframeLabel(timeframe: string): string {
  if (timeframe === "3months") return "3个月";
  if (timeframe === "6months") return "6个月";
  if (timeframe === "1year") return "1年";
  return timeframe || "6个月";
}

function getPhaseCount(timeframe: string): number {
  if (timeframe === "3months") return 3;
  if (timeframe === "6months") return 4;
  return 5;
}

export function buildRoadmapPrompt(input: {
  goals: GoalInput[];
  timeframe: string;
  emotion: string;
}): string {
  const timeframeLabel = getTimeframeLabel(input.timeframe);
  const phaseCount = getPhaseCount(input.timeframe);
  const goalsText = input.goals
    .map(
      (g) =>
        `- ${g.title}${g.description ? "：" + g.description : ""}${g.category ? "（" + g.category + "）" : ""}`,
    )
    .join("\n");

  return `你是一个温和的愿景教练。请根据用户的愿景目标和时间范围，生成一份温和、可执行、低压力的目标路线图。

用户目标：
${goalsText}

时间范围：${timeframeLabel}
情绪基调：${input.emotion}

请生成 ${phaseCount} 个阶段的路线图，严格按以下 JSON 格式输出（只输出 JSON，不含其他文字）：

{
  "yearlyGoal": "总体方向（方向性描述，有温度，不写KPI，20字以内）",
  "phases": [
    {
      "id": "phase-1",
      "label": "启动期",
      "timeRange": "第1-4周",
      "milestone": "这个阶段最重要的里程碑（20字以内）",
      "actions": [
        "具体行动1（15字以内，从小事开始）",
        "具体行动2（15字以内）",
        "具体行动3（15字以内）"
      ]
    }
  ]
}

要求：
- yearlyGoal 有方向感和温度，不是KPI
- ${phaseCount} 个阶段合理分配${timeframeLabel}
- 每个阶段3个行动，轻量具体，避免制造焦虑
- 行动从最小可行处开始，一句话说清楚
- 纯中文输出`;
}

export function parseRoadmap(rawJson: string): Roadmap {
  const data = JSON.parse(rawJson) as Record<string, unknown>;
  const phases = Array.isArray(data.phases) ? data.phases : [];

  return {
    yearlyGoal: String(data.yearlyGoal || "向更好的自己靠近"),
    phases: phases.map((phase: Record<string, unknown>, pi: number) => ({
      id: String(phase.id || `phase-${pi + 1}`),
      label: String(phase.label || `第${pi + 1}阶段`),
      timeRange: String(phase.timeRange || ""),
      milestone: String(phase.milestone || ""),
      actions: (Array.isArray(phase.actions) ? phase.actions : []).map(
        (action: unknown, ai: number): RoadmapAction =>
          typeof action === "string"
            ? { id: `${pi}-${ai}`, text: action }
            : {
                id: String((action as RoadmapAction).id || `${pi}-${ai}`),
                text: String((action as RoadmapAction).text || action),
              },
      ),
    })),
  };
}
