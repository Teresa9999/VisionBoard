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
  {
    id: 1,
    title: "自由旅行",
    subtitle: "随时出发，随心而行",
    category: "自由",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    accent: "sage",
  },
  {
    id: 2,
    title: "深夜阅读",
    subtitle: "在文字里遇见另一个世界",
    category: "内心",
    imageUrl:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80",
    accent: "lavender",
  },
  {
    id: 3,
    title: "独立创业",
    subtitle: "把热爱变成事业",
    category: "成就",
    imageUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80",
    accent: "goldLight",
  },
  {
    id: 4,
    title: "亲近自然",
    subtitle: "山野间的呼吸与静默",
    category: "自然",
    imageUrl:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80",
    accent: "sage",
  },
  {
    id: 5,
    title: "创作艺术",
    subtitle: "用双手表达内心所想",
    category: "创作",
    imageUrl:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80",
    accent: "rose",
  },
  {
    id: 6,
    title: "健康生活",
    subtitle: "充满活力的每一天",
    category: "健康",
    imageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    accent: "sage",
  },
  {
    id: 7,
    title: "深度学习",
    subtitle: "不断成长，永不停歇",
    category: "成长",
    imageUrl:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80",
    accent: "lavender",
  },
  {
    id: 8,
    title: "温暖家园",
    subtitle: "有爱的地方就是家",
    category: "归属",
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
