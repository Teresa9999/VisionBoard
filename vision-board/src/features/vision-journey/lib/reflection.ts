import type { EmotionKey } from "../config/emotions";

const REFLECTION_SUMMARIES: Record<EmotionKey, string> = {
  calm: `你内心渴望的是一种有节奏感的生活——不急不缓，但充实而有意义。你对"自我成长"和"精神富足"有深切向往，想要在某个领域真正做到深入。那些你滑过的画面，透露出你对自由、创造和内心连接的渴望。`,
  excited: `你的能量里藏着强烈的行动欲——你不只是在做梦，你已经准备好出发了。你的偏好指向突破边界、创造影响力。你渴望的生活充满活力、意义感和值得分享的故事。`,
  lost: `不确定感本身就是一种勇气。你选择的画面告诉我们：你心里其实有方向，只是需要一盏灯来照亮它。你向往的生活，兼具安全感与可能性——既想扎根，又渴望生长。`,
  longing: `你内心有一个声音一直在等待被听见。你向往的不只是某种生活方式，更是一种"成为自己"的感觉。那些吸引你的画面，都在指向同一件事：真实地活着。`,
  tired: `疲惫不是终点，而是转折点。你的选择透露出一种深刻的渴望：想要告别消耗，找到真正让自己充盈的事物。休息、创造、连接——这些才是你的补给站。`,
  curious: `好奇心是你最大的财富。你被各种可能性所吸引，喜欢探索未知。你渴望的生活充满新鲜感、深度体验和持续的学习与成长。`,
};

function isEmotionKey(value: string): value is EmotionKey {
  return value in REFLECTION_SUMMARIES;
}

export function generateReflectionSummary(emotion: string, likedCount: number) {
  const base = isEmotionKey(emotion)
    ? REFLECTION_SUMMARIES[emotion]
    : REFLECTION_SUMMARIES.calm;
  const suffix =
    likedCount >= 5
      ? "你对多个领域都有热情，这是一种珍贵的多元能量。"
      : likedCount >= 3
        ? "你的偏好相对聚焦，这帮助你更清楚地看见自己的核心渴望。"
        : "你的选择很谨慎，说明你对「真正想要的」有清晰的判断力。";

  return `${base}\n\n${suffix}`;
}
