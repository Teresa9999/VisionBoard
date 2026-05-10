export type EmotionKey =
  | "calm"
  | "excited"
  | "lost"
  | "longing"
  | "tired"
  | "curious";

export type EmotionAccent =
  | "sage"
  | "gold"
  | "lavender"
  | "rose"
  | "lavenderDeep"
  | "blush";

export type EmotionOption = {
  key: EmotionKey;
  label: string;
  description: string;
  accent: EmotionAccent;
  glowClass: string;
};

export const EMOTIONS: EmotionOption[] = [
  {
    key: "calm",
    label: "平静",
    description: "内心安宁，想要找到方向",
    accent: "sage",
    glowClass: "glow-sage",
  },
  {
    key: "excited",
    label: "激动",
    description: "能量充沛，渴望出发",
    accent: "gold",
    glowClass: "glow-gold",
  },
  {
    key: "lost",
    label: "迷茫",
    description: "不确定前方，需要指引",
    accent: "lavender",
    glowClass: "glow-lavender",
  },
  {
    key: "longing",
    label: "渴望",
    description: "心里有个声音，想被听见",
    accent: "rose",
    glowClass: "glow-rose",
  },
  {
    key: "tired",
    label: "疲惫",
    description: "需要休息，也需要新的起点",
    accent: "lavenderDeep",
    glowClass: "glow-lavender-deep",
  },
  {
    key: "curious",
    label: "好奇",
    description: "对未知充满兴趣与期待",
    accent: "blush",
    glowClass: "glow-blush",
  },
];

export function emotionAccentToRgbVar(accent: EmotionAccent) {
  switch (accent) {
    case "sage":
      return "--sage-rgb";
    case "gold":
      return "--gold-light-rgb";
    case "lavender":
      return "--lavender-rgb";
    case "rose":
      return "--rose-rgb";
    case "lavenderDeep":
      return "--lavender-deep-rgb";
    case "blush":
      return "--blush-rgb";
  }
}
