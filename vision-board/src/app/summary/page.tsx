"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { request } from "@/lib/api/request";
import { reportAction } from "@/lib/eazo-bridge";
import {
  SPRING,
  WarmHeader,
  WarmPageShell,
  generateReflectionSummary,
} from "@/features/vision-journey";

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
        const generated = generateReflectionSummary(session.emotion, likedCards.length);
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
    <WarmPageShell className="px-6">
      <WarmHeader title="系统分析" onBack={() => router.back()} />

      <div className="flex-1 overflow-y-auto pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <motion.div
          className="pt-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.1 }}
        >
          <h1 className="mb-2 text-[22px] font-medium leading-[1.6] tracking-[0] text-[#2A2A2A]">
            我看见了你
          </h1>
          <p className="mb-8 text-sm font-light leading-[1.8] text-[#8A8A8A]">
            基于你的直觉选择，这是系统读到的你
          </p>

          {/* AI analysis card */}
          {isLoading ? (
            <div className="mb-6 space-y-3 rounded-[24px] border border-[#F0F0F0] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-shimmer h-4 rounded-full" style={{ width: `${85 - i * 10}%` }} />
              ))}
            </div>
          ) : (
            <motion.div
              className="relative mb-6 overflow-hidden rounded-[24px] border border-[#F0F0F0] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...SPRING, delay: 0.2 }}
            >
              {/* Decorative top border */}
              <div className="absolute left-6 right-6 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#C9A961]/50 to-transparent" />

              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[linear-gradient(90deg,#D4AF37,#C9A961)]">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className="text-sm font-normal text-[#C9A961]">愿景解析</span>
              </div>

              {summary.split("\n\n").map((paragraph, i) => (
                <p
                  key={i}
                  className={`text-base font-light leading-[2] text-[#4A4A4A] ${i > 0 ? "mt-3 text-sm text-[#6A6A6A]" : ""}`}
                >
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
            <p className="mb-3 text-sm font-light text-[#6A6A6A]">有什么想补充的？（可选）</p>

            {isEditing ? (
              <div className="overflow-hidden rounded-[24px] border border-[#C9A961]/40 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
                <textarea
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  placeholder="比如：我最近特别想...或者，有些话我一直没说..."
                  className="min-h-[120px] w-full resize-none bg-transparent p-5 text-base font-light leading-[1.8] text-[#4A4A4A] outline-none placeholder:text-[#ABABAB]"
                  autoFocus
                />
                <div className="flex justify-end px-4 pb-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-sm font-normal text-[#C9A961]"
                  >
                    完成
                  </button>
                </div>
              </div>
            ) : (
              <motion.button
                onClick={() => setIsEditing(true)}
                whileTap={{ scale: 0.98 }}
                className="group w-full rounded-[24px] border border-[#F0F0F0] bg-white/78 p-5 text-left shadow-[0_2px_12px_rgba(0,0,0,0.035)] transition-all duration-200 hover:border-[#C9A961]/40"
              >
                {userText ? (
                  <p className="text-base font-light leading-[1.8] text-[#4A4A4A]">{userText}</p>
                ) : (
                  <p className="text-base font-light text-[#ABABAB]">点击添加你的想法...</p>
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
          className="h-[52px] w-full rounded-2xl bg-[linear-gradient(90deg,#D4AF37,#C9A961)] text-base font-medium text-white shadow-[0_4px_16px_rgba(201,169,97,0.30)] disabled:opacity-50"
        >
          {isContinuing ? "正在整理..." : "这就是我想要的"}
        </motion.button>
      </motion.div>
    </WarmPageShell>
  );
}

export default function SummaryPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh items-center justify-center bg-[linear-gradient(180deg,#FDFDFB_0%,#F9F9F7_100%)]">
        <div className="text-[#8A8A8A]">加载中...</div>
      </div>
    }>
      <SummaryContent />
    </Suspense>
  );
}
