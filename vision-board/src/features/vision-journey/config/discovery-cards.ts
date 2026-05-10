export type DiscoveryCardAccent =
  | "sage"
  | "lavender"
  | "goldLight"
  | "rose"
  | "blush";

export type DiscoveryCard = {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  imageUrl: string;
  accent: DiscoveryCardAccent;
};

export const DISCOVERY_CARDS: DiscoveryCard[] = [
  // 提示：预置图片素材存放在 public/images/discovery-cards/ 目录下
  // 目标类别卡
  {
    id: 1,
    title: "自由旅行",
    subtitle: "随时出发，随心而行",
    category: "旅行自由",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    accent: "sage",
  },
  {
    id: 2,
    title: "事业腾飞",
    subtitle: "把热爱变成有价值的事业",
    category: "事业成就",
    imageUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80",
    accent: "goldLight",
  },
  {
    id: 3,
    title: "财富自由",
    subtitle: "让钱为你工作",
    category: "财富增长",
    imageUrl:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80",
    accent: "goldLight",
  },
  {
    id: 4,
    title: "爱与陪伴",
    subtitle: "被深深爱着，也深深爱着",
    category: "爱情关系",
    imageUrl:
      "https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=600&q=80",
    accent: "blush",
  },
  {
    id: 5,
    title: "变美蜕变",
    subtitle: "从内到外，焕发自然光彩",
    category: "变美健康",
    imageUrl:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
    accent: "rose",
  },
  // 画面元素卡
  {
    id: 6,
    title: "晨间咖啡",
    subtitle: "一杯咖啡，一段属于自己的时间",
    category: "生活元素",
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
    accent: "goldLight",
  },
  {
    id: 7,
    title: "海边时光",
    subtitle: "听海浪声，感受无边宽阔",
    category: "生活元素",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    accent: "sage",
  },
  {
    id: 8,
    title: "鲜花日常",
    subtitle: "生活里处处都是美",
    category: "生活元素",
    imageUrl:
      "https://images.unsplash.com/photo-1490750967868-88df5691cc8e?w=600&q=80",
    accent: "rose",
  },
  {
    id: 9,
    title: "豪华旅居",
    subtitle: "住进高级感里，享受每一刻",
    category: "生活元素",
    imageUrl:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
    accent: "lavender",
  },
  {
    id: 10,
    title: "城市夜景",
    subtitle: "繁华都市里，找到自己的位置",
    category: "生活元素",
    imageUrl:
      "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&q=80",
    accent: "lavender",
  },
  // 生活方式卡
  {
    id: 11,
    title: "清晨自律",
    subtitle: "掌控清晨，就掌控了一天",
    category: "生活方式",
    imageUrl:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
    accent: "sage",
  },
  {
    id: 12,
    title: "健康饮食",
    subtitle: "用食物滋养身体，活力每一天",
    category: "生活方式",
    imageUrl:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
    accent: "sage",
  },
  {
    id: 13,
    title: "远程办公",
    subtitle: "工作自由，人生自由",
    category: "生活方式",
    imageUrl:
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80",
    accent: "goldLight",
  },
  {
    id: 14,
    title: "深夜阅读",
    subtitle: "在文字里遇见另一个世界",
    category: "生活方式",
    imageUrl:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80",
    accent: "lavender",
  },
  {
    id: 15,
    title: "亲近自然",
    subtitle: "山野间的呼吸与静默",
    category: "生活方式",
    imageUrl:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80",
    accent: "sage",
  },
  // 状态价值卡
  {
    id: 16,
    title: "内心平静",
    subtitle: "不被外界裹挟，做自己的主人",
    category: "内在状态",
    imageUrl:
      "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600&q=80",
    accent: "lavender",
  },
  {
    id: 17,
    title: "闪闪发光",
    subtitle: "自信满满地走进每一个房间",
    category: "内在状态",
    imageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    accent: "rose",
  },
  {
    id: 18,
    title: "持续成长",
    subtitle: "每天比昨天更好一点点",
    category: "内在状态",
    imageUrl:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80",
    accent: "lavender",
  },
  {
    id: 19,
    title: "情绪疗愈",
    subtitle: "放下重担，轻盈地向前走",
    category: "内在状态",
    imageUrl:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
    accent: "blush",
  },
  {
    id: 20,
    title: "温暖归属",
    subtitle: "有爱的地方就是家",
    category: "内在状态",
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    accent: "blush",
  },
];

export function discoveryAccentToCssVar(accent: DiscoveryCardAccent) {
  switch (accent) {
    case "sage":
      return "--color-sage";
    case "lavender":
      return "--color-lavender";
    case "goldLight":
      return "--color-gold-light";
    case "rose":
      return "--color-rose";
    case "blush":
      return "--color-blush";
  }
}
