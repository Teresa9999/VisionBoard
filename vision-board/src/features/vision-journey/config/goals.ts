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
    cardIds: [1, 7, 9], // 旅行自由、海边时光、豪华旅居
    category: "自由",
  },
  {
    id: 2,
    title: "事业腾飞",
    description: "把热爱变成有价值的事业，实现职业突破",
    badge: "业",
    cardIds: [2, 10, 13], // 事业成就、城市夜景、远程办公
    category: "成就",
  },
  {
    id: 3,
    title: "财富积累",
    description: "建立多元收入来源，让财富持续增长",
    badge: "富",
    cardIds: [3, 9, 10], // 财富增长、豪华旅居、城市夜景
    category: "财富",
  },
  {
    id: 4,
    title: "爱与陪伴",
    description: "珍视身边的关系，让生活充满爱与温暖",
    badge: "爱",
    cardIds: [4, 8, 20], // 爱情关系、鲜花日常、温暖归属
    category: "情感",
  },
  {
    id: 5,
    title: "焕发自然光彩",
    description: "从内到外滋养自己，活出健康自信的状态",
    badge: "美",
    cardIds: [5, 11, 12], // 变美健康、清晨自律、健康饮食
    category: "健康",
  },
  {
    id: 6,
    title: "建立自律节奏",
    description: "掌控清晨，稳定作息，让每一天都充实有序",
    badge: "律",
    cardIds: [6, 11, 12], // 晨间咖啡、清晨自律、健康饮食
    category: "自律",
  },
  {
    id: 7,
    title: "持续成长学习",
    description: "选择一个领域深耕，让知识和能力稳步提升",
    badge: "长",
    cardIds: [14, 18, 2], // 深夜阅读、持续成长、事业成就
    category: "成长",
  },
  {
    id: 8,
    title: "找回内心平静",
    description: "放下焦虑，疗愈情绪，轻盈地向前走",
    badge: "愈",
    cardIds: [16, 19, 15], // 内心平静、情绪疗愈、亲近自然
    category: "疗愈",
  },
];
