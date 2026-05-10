"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { request } from "@/lib/api/request";
import { reportAction } from "@/lib/eazo-bridge";
import { randomIn } from "@/utils/stable-random";
import {
  EMOTIONS,
  SPRING,
  emotionAccentToRgbVar,
  type EmotionAccent,
  type EmotionKey,
} from "@/features/vision-journey";

function EmotionGlyph({ accent }: { accent: EmotionAccent }) {
  const rgbVar = emotionAccentToRgbVar(accent);
  return (
    <div
      className="w-10 h-10 rounded-2xl flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, rgb(var(${rgbVar}) / 0.30), rgb(var(${rgbVar}) / 0.10))`,
        border: `1px solid rgb(var(${rgbVar}) / 0.35)`,
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
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dusk)]/70 animate-pulse" />
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dusk)]/70 animate-pulse [animation-delay:120ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dusk)]/70 animate-pulse [animation-delay:240ms]" />
    </span>
  );
}

function StarField() {
  const stars = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: randomIn(i + 1, 0, 100),
    y: randomIn(i + 101, 0, 100),
    size: randomIn(i + 201, 1, 3),
    duration: randomIn(i + 301, 2, 5),
    delay: randomIn(i + 401, 0, 4),
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white star-particle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            "--duration": `${s.duration}s`,
            "--delay": `${s.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
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
    <div className="min-h-svh bg-dream-gradient relative overflow-hidden flex flex-col">
      <StarField />

      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-glow-purple opacity-60 pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-glow-gold opacity-40 pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-svh max-w-md mx-auto w-full px-5">
        {/* Header */}
        <motion.div
          className="pt-16 pb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.1 }}
        >
          <p className="text-[var(--color-gold-light)] text-sm tracking-[0.25em] uppercase font-body mb-4">
            Vision Board
          </p>
          <h1 className="font-heading text-4xl font-bold text-white leading-tight mb-3">
            此刻，
            <br />
            你在追求什么？
          </h1>
          <p className="text-[var(--color-text-muted)] text-base leading-relaxed">
            选择最贴近你内心的状态
            <br />
            这将是你探索旅程的起点
          </p>
        </motion.div>

        {/* Emotion grid */}
        <motion.div
          className="grid grid-cols-2 gap-3 flex-1"
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
                  "relative overflow-hidden rounded-[1.5rem] p-4 text-left border transition-all duration-300 min-h-[120px] " +
                  (selectedState
                    ? `${emotion.glowClass} border-white/15 scale-105`
                    : "border-white/10 hover:border-white/15")
                }
                style={{
                  background: `linear-gradient(135deg, rgb(var(${rgbVar}) / 0.22) 0%, rgb(var(${rgbVar}) / 0.08) 100%)`,
                  borderColor: `rgb(var(${rgbVar}) / ${selectedState ? 0.55 : 0.35})`,
                }}
              >
                <AnimatePresence>
                  {selectedState && (
                    <motion.div
                      className="absolute inset-0 rounded-[1.5rem] border-2 border-white/25"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>

                <EmotionGlyph accent={emotion.accent} />

                <p className="text-white font-heading text-xl font-semibold mt-3 mb-1">
                  {emotion.label}
                </p>
                <p className="text-white/60 text-xs leading-relaxed font-body">
                  {emotion.description}
                </p>

                {selectedState && (
                  <motion.div
                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring" as const,
                      stiffness: 400,
                      damping: 20,
                    }}
                  >
                    <svg
                      className="w-3 h-3 text-[var(--color-dusk)]"
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
          className="pt-6 pb-[calc(env(safe-area-inset-bottom)+24px)]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.6 }}
        >
          <motion.button
            onClick={handleContinue}
            disabled={!selected || isLoading}
            whileTap={{ scale: selected ? 0.97 : 1 }}
            className={
              "w-full py-4 rounded-[9999px] text-base font-semibold font-body transition-all duration-300 " +
              (selected
                ? "bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-dusk)] shadow-[0_8px_32px_rgb(var(--gold-rgb)/0.4)]"
                : "bg-white/10 text-white/30 cursor-not-allowed")
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
    </div>
  );
}
