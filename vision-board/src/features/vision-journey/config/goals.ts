export type VisionGoal = {
  id: number;
  title: string;
  description: string;
  badge: string;
  cardIds: number[];
  category: string;
};

export type TimeframeOption = {
  key: "3months" | "6months" | "1year";
  label: string;
  sub: string;
};

export const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { key: "3months", label: "3 个月", sub: "快速起步" },
  { key: "6months", label: "6 个月", sub: "稳步推进" },
  { key: "1year", label: "1 年", sub: "深度蜕变" },
];

export const VISION_GOALS: VisionGoal[] = [
  {
    id: 1,
    title: "开启一段旅程",
    description: "计划并完成一次独立旅行，打开新的视野",
    badge: "旅",
    cardIds: [1],
    category: "自由",
  },
  {
    id: 2,
    title: "建立阅读习惯",
    description: "每天阅读 30 分钟，用知识滋养内心",
    badge: "读",
    cardIds: [2],
    category: "成长",
  },
  {
    id: 3,
    title: "探索副业可能",
    description: "利用专长开始一个小项目，测试创业想法",
    badge: "启",
    cardIds: [3],
    category: "成就",
  },
  {
    id: 4,
    title: "回归自然怀抱",
    description: "每月至少一次户外探索，与自然重新连接",
    badge: "野",
    cardIds: [4],
    category: "自然",
  },
  {
    id: 5,
    title: "开始一个创作项目",
    description: "用你喜欢的媒介表达内心，持续创作",
    badge: "创",
    cardIds: [5],
    category: "创作",
  },
  {
    id: 6,
    title: "升级健康状态",
    description: "建立稳定的运动和饮食习惯，精力充沛",
    badge: "健",
    cardIds: [6],
    category: "健康",
  },
  {
    id: 7,
    title: "深耕一项技能",
    description: "选择一个领域持续学习，成为真正的行家",
    badge: "深",
    cardIds: [7],
    category: "成长",
  },
  {
    id: 8,
    title: "打造温暖空间",
    description: "改善生活环境，让家成为真正的避风港",
    badge: "家",
    cardIds: [8],
    category: "归属",
  },
];
