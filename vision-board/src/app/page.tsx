"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { request } from "@/lib/api/request";
import { reportAction } from "@/lib/eazo-bridge";
import {
  EMOTIONS,
  SPRING,
  VisionOrb,
  WarmPageShell,
  emotionAccentToRgbVar,
  type EmotionAccent,
  type EmotionKey,
} from "@/features/vision-journey";

function EmotionGlyph({ accent }: { accent: EmotionAccent }) {
  const rgbVar = emotionAccentToRgbVar(accent);
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-2xl"
      style={{
        background: `linear-gradient(135deg, rgb(var(${rgbVar}) / 0.18), rgb(var(${rgbVar}) / 0.08))`,
        border: `1px solid rgb(var(${rgbVar}) / 0.28)`,
      }}
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke={`rgb(var(${rgbVar}) / 0.95)`}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v3" />
        <path d="M12 19v3" />
        <path d="M2 12h3" />
        <path d="M19 12h3" />
        <path d="M7.5 7.5l2 2" />
        <path d="M14.5 14.5l2 2" />
        <path d="M16.5 7.5l-2 2" />
        <path d="M9.5 14.5l-2 2" />
        <circle cx="12" cy="12" r="3.5" />
      </svg>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 rounded-full bg-white/75 animate-pulse" />
      <span className="h-1.5 w-1.5 rounded-full bg-white/75 animate-pulse [animation-delay:120ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-white/75 animate-pulse [animation-delay:240ms]" />
    </span>
  );
}

export default function EmotionPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<EmotionKey | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setIsLoading(true);

    try {
      const res = await request("/api/session", {
        method: "POST",
        body: JSON.stringify({ emotion: selected }),
      });
      const session = await res.json();

      reportAction({
        content: `用户开始愿景板旅程，情绪状态：${selected}`,
        event_type: "create",
        page: "emotion",
        metadata: {
          type: "start_vision_journey",
          emotion: selected,
          session_id: session.id,
        },
      });

      router.push(`/swipe?sessionId=${session.id}`);
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <WarmPageShell className="px-6">
      <div className="relative z-10 flex min-h-svh flex-col">
        {/* Header */}
        <motion.div
          className="pb-8 pt-14 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.1 }}
        >
          <div className="mb-7 flex justify-center">
            <VisionOrb className="h-24 w-24" imageClassName="h-16 w-16" rays />
          </div>
          <p className="mb-3 text-xs font-normal uppercase tracking-[0.12em] text-[#C9A961]">
            Vision Board
          </p>
          <h1 className="mb-3 text-[26px] font-medium leading-[1.6] tracking-[0] text-[#2A2A2A]">
            此刻，
            <br />
            你在追求什么？
          </h1>
          <p className="text-sm font-light leading-[1.8] text-[#8A8A8A]">
            选择最贴近你内心的状态
            <br />
            这将是你探索旅程的起点
          </p>
        </motion.div>

        {/* Emotion grid */}
        <motion.div
          className="grid flex-1 grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.25 }}
        >
          {EMOTIONS.map((emotion, i) => {
            const rgbVar = emotionAccentToRgbVar(emotion.accent);
            const selectedState = selected === emotion.key;

            return (
              <motion.button
                key={emotion.key}
                onClick={() => setSelected(emotion.key)}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: 0.3 + i * 0.06 }}
                className={
                  "relative min-h-[120px] overflow-hidden rounded-[20px] border bg-white/78 p-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.035)] transition-all duration-300 " +
                  (selectedState
                    ? "scale-[1.02] border-[#C9A961] shadow-[0_4px_18px_rgba(201,169,97,0.15)]"
                    : "border-[#F0F0F0] hover:border-[#E8E8E8]")
                }
                style={{
                  background: selectedState
                    ? `linear-gradient(135deg, rgb(var(${rgbVar}) / 0.16) 0%, rgb(255 255 255 / 0.92) 100%)`
                    : undefined,
                }}
              >
                <AnimatePresence>
                  {selectedState && (
                    <motion.div
                      className="absolute inset-0 rounded-[20px] border border-[#C9A961]/40"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>

                <EmotionGlyph accent={emotion.accent} />

                <p className="mb-1 mt-3 text-lg font-medium leading-[1.6] text-[#2A2A2A]">
                  {emotion.label}
                </p>
                <p className="text-xs font-light leading-[1.8] text-[#6A6A6A]">
                  {emotion.description}
                </p>

                {selectedState && (
                  <motion.div
                    className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#C9A961]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring" as const,
                      stiffness: 400,
                      damping: 20,
                    }}
                  >
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 12 12"
                    >
                      <path
                        d="M10 3L5 8.5 2 5.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="pb-[calc(env(safe-area-inset-bottom)+24px)] pt-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.6 }}
        >
          <motion.button
            onClick={handleContinue}
            disabled={!selected || isLoading}
            whileTap={{ scale: selected ? 0.97 : 1 }}
            className={
              "h-[52px] w-full rounded-2xl text-base font-medium transition-all duration-300 " +
              (selected
                ? "bg-[linear-gradient(90deg,#D4AF37,#C9A961)] text-white shadow-[0_4px_16px_rgba(201,169,97,0.30)]"
                : "cursor-not-allowed border border-[#E8E8E8] bg-white/70 text-[#ABABAB]")
            }
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <span>进入旅程中</span>
                <LoadingDots />
              </span>
            ) : (
              "开始我的愿景旅程 →"
            )}
          </motion.button>
        </motion.div>
      </div>
    </WarmPageShell>
  );
}
