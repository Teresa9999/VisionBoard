"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { request } from "@/lib/api/request";
import { reportAction } from "@/lib/eazo-bridge";

const SPRING = { type: "spring" as const, stiffness: 260, damping: 28 };

// Mock summary generator based on emotion
function generateSummary(emotion: string, likedCount: number): string {
  const summaries: Record<string, string> = {
    calm: `你内心渴望的是一种有节奏感的生活——不急不缓，但充实而有意义。你对"自我成长"和"精神富足"有深切向往，想要在某个领域真正做到深入。那些你滑过的画面，透露出你对自由、创造和内心连接的渴望。`,
    excited: `你的能量里藏着强烈的行动欲——你不只是在做梦，你已经准备好出发了。你的偏好指向突破边界、创造影响力。你渴望的生活充满活力、意义感和值得分享的故事。`,
    lost: `不确定感本身就是一种勇气。你选择的画面告诉我们：你心里其实有方向，只是需要一盏灯来照亮它。你向往的生活，兼具安全感与可能性——既想扎根，又渴望生长。`,
    longing: `你内心有一个声音一直在等待被听见。你向往的不只是某种生活方式，更是一种"成为自己"的感觉。那些吸引你的画面，都在指向同一件事：真实地活着。`,
    tired: `疲惫不是终点，而是转折点。你的选择透露出一种深刻的渴望：想要告别消耗，找到真正让自己充盈的事物。休息、创造、连接——这些才是你的补给站。`,
    curious: `好奇心是你最大的财富。你被各种可能性所吸引，喜欢探索未知。你渴望的生活充满新鲜感、深度体验和持续的学习与成长。`,
  };
  const base = summaries[emotion] || summaries.calm;
  const suffix = likedCount >= 5 ? "你对多个领域都有热情，这是一种珍贵的多元能量。" :
    likedCount >= 3 ? "你的偏好相对聚焦，这帮助你更清楚地看见自己的核心渴望。" :
    "你的选择很谨慎，说明你对「真正想要的」有清晰的判断力。";
  return `${base}\n\n${suffix}`;
}

function SummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [summary, setSummary] = useState("");
  const [userText, setUserText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isContinuing, setIsContinuing] = useState(false);

  useEffect(() => {
    async function loadSession() {
      if (!sessionId) return;
      try {
        const res = await request(`/api/session?sessionId=${sessionId}`);
        const session = await res.json();
        const likedCards = Array.isArray(session.likedCards) ? session.likedCards : [];
        const generated = generateSummary(session.emotion, likedCards.length);
        setSummary(generated);
        if (session.summary) {
          setSummary(session.summary);
          setUserText(session.userSupplement || "");
        } else {
          await request("/api/session", {
            method: "PATCH",
            body: JSON.stringify({ sessionId: parseInt(sessionId), summary: generated }),
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, [sessionId]);

  const handleContinue = async () => {
    setIsContinuing(true);
    try {
      await request("/api/session", {
        method: "PATCH",
        body: JSON.stringify({
          sessionId: parseInt(sessionId!),
          summary,
          userSupplement: userText,
        }),
      });

      reportAction({
        content: `用户查看并确认了愿景分析总结`,
        event_type: "update",
        page: "summary",
        metadata: { type: "confirm_summary", session_id: sessionId },
      });

      router.push(`/goals?sessionId=${sessionId}`);
    } catch {
      setIsContinuing(false);
    }
  };

  return (
    <div className="min-h-svh bg-dream-gradient flex flex-col max-w-md mx-auto w-full px-5">
      {/* Header */}
      <div className="pt-12 pb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full glass flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="text-[var(--color-gold-light)] text-xs tracking-widest uppercase">系统分析</p>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <motion.div
          className="pt-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.1 }}
        >
          <h1 className="font-heading text-3xl font-bold text-white mb-2">
            我看见了你
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mb-8">
            基于你的直觉选择，这是系统读到的你
          </p>

          {/* AI analysis card */}
          {isLoading ? (
            <div className="rounded-[1.5rem] glass p-6 space-y-3 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-shimmer h-4 rounded-full opacity-30" style={{ width: `${85 - i * 10}%` }} />
              ))}
            </div>
          ) : (
            <motion.div
              className="rounded-[1.5rem] glass p-6 mb-6 relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...SPRING, delay: 0.2 }}
            >
              {/* Decorative top border */}
              <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-gold)]/50 to-transparent" />

              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] flex items-center justify-center">
                  <svg className="w-3 h-3 text-[var(--color-dusk)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className="text-[var(--color-gold-light)] text-sm font-body">愿景解析</span>
              </div>

              {summary.split("\n\n").map((paragraph, i) => (
                <p key={i} className={`text-white/85 text-base leading-relaxed font-body ${i > 0 ? "mt-3 text-white/60 text-sm" : ""}`}>
                  {paragraph}
                </p>
              ))}
            </motion.div>
          )}

          {/* User supplement section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.35 }}
          >
            <p className="text-white/60 text-sm mb-3">有什么想补充的？（可选）</p>

            {isEditing ? (
              <div className="rounded-[1.5rem] glass border border-[var(--color-gold)]/30 overflow-hidden">
                <textarea
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  placeholder="比如：我最近特别想……或者，有些话我一直没说……"
                  className="w-full bg-transparent p-5 text-white/80 text-base placeholder-white/30 resize-none outline-none min-h-[120px] font-body"
                  autoFocus
                />
                <div className="flex justify-end px-4 pb-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-[var(--color-gold-light)] text-sm"
                  >
                    完成
                  </button>
                </div>
              </div>
            ) : (
              <motion.button
                onClick={() => setIsEditing(true)}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-[1.5rem] glass border border-white/10 p-5 text-left group transition-all duration-200 hover:border-[var(--color-gold)]/30"
              >
                {userText ? (
                  <p className="text-white/70 text-base font-body">{userText}</p>
                ) : (
                  <p className="text-white/30 text-base font-body">点击添加你的想法…</p>
                )}
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        className="pb-[calc(env(safe-area-inset-bottom)+24px)]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.5 }}
      >
        <motion.button
          onClick={handleContinue}
          disabled={isLoading || isContinuing}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-[9999px] bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-dusk)] text-base font-semibold font-body shadow-[0_8px_32px_rgba(212,168,83,0.4)] disabled:opacity-50"
        >
          {isContinuing ? "正在整理…" : "这就是我想要的 →"}
        </motion.button>
      </motion.div>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-svh bg-dream-gradient flex items-center justify-center">
        <div className="text-white/50">加载中…</div>
      </div>
    }>
      <SummaryContent />
    </Suspense>
  );
}
