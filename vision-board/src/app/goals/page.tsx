"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { request } from "@/lib/api/request";
import { reportAction } from "@/lib/eazo-bridge";
import {
  SPRING,
  TIMEFRAME_OPTIONS,
  generateGoalOptions,
  type VisionGoal,
} from "@/features/vision-journey";

function GoalsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [goals, setGoals] = useState<VisionGoal[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<number[]>([]);
  const [timeframe, setTimeframe] = useState("6months");
  const [customTimeframe, setCustomTimeframe] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isContinuing, setIsContinuing] = useState(false);

  useEffect(() => {
    async function loadSession() {
      if (!sessionId) return;
      try {
        const res = await request(`/api/session?sessionId=${sessionId}`);
        const session = await res.json();
        const likedCards = Array.isArray(session.likedCards) ? session.likedCards : [];
        const generated = generateGoalOptions(likedCards);
        setGoals(generated);
        setSelectedGoals(generated.map((g) => g.id));
        if (session.timeframe) setTimeframe(session.timeframe);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, [sessionId]);

  const toggleGoal = (id: number) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    const finalGoals = goals
      .filter((g) => selectedGoals.includes(g.id))
      .map(({ id, title, description, category }) => ({ id, title, description, category }));

    setIsContinuing(true);

    const finalTimeframe = customTimeframe.trim() || timeframe;

    try {
      await request("/api/session", {
        method: "PATCH",
        body: JSON.stringify({
          sessionId: parseInt(sessionId!),
          goals: finalGoals,
          timeframe: finalTimeframe,
          status: "completed",
        }),
      });

      reportAction({
        content: `用户确认了 ${finalGoals.length} 个目标，时间框架：${finalTimeframe}`,
        event_type: "update",
        page: "goals",
        metadata: { type: "confirm_goals", goal_count: finalGoals.length, timeframe: finalTimeframe },
      });

      router.push(`/loading-screen?sessionId=${sessionId}`);
    } catch {
      setIsContinuing(false);
    }
  };

  return (
    <div className="min-h-svh bg-dream-gradient flex flex-col max-w-md mx-auto w-full px-5">
      <div className="pt-12 pb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full glass flex items-center justify-center"
          aria-label="返回"
        >
          <svg
            className="w-5 h-5 text-white/70"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <p className="text-[var(--color-gold-light)] text-xs tracking-widest uppercase">
          目标确认
        </p>
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
            这些，是你的目标
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mb-8">
            点击取消你不想要的，留下真正心动的
          </p>

          {isLoading ? (
            <div className="space-y-3 mb-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-[1.5rem] skeleton-shimmer opacity-30"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3 mb-8">
              <AnimatePresence>
                {goals.map((goal, i) => {
                  const isSelected = selectedGoals.includes(goal.id);
                  return (
                    <motion.button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...SPRING, delay: 0.2 + i * 0.08 }}
                      whileTap={{ scale: 0.98 }}
                      className={
                        "w-full text-left rounded-[1.5rem] p-5 transition-all duration-300 " +
                        (isSelected
                          ? "glass border border-[var(--color-gold)]/40 shadow-[0_4px_20px_rgb(var(--gold-rgb)/0.15)]"
                          : "bg-white/5 border border-white/8 opacity-50")
                      }
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={
                            "w-12 h-12 rounded-2xl flex items-center justify-center text-base font-heading font-semibold flex-shrink-0 " +
                            (isSelected
                              ? "bg-gradient-to-br from-[rgb(var(--gold-rgb)/0.25)] to-[rgb(var(--gold-rgb)/0.10)]"
                              : "bg-white/10")
                          }
                        >
                          <span className="text-white/85">{goal.badge}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-white font-heading text-lg font-semibold">
                              {goal.title}
                            </h3>
                            <div
                              className={
                                "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 " +
                                (isSelected
                                  ? "border-[var(--color-gold)] bg-[var(--color-gold)]"
                                  : "border-white/30")
                              }
                            >
                              {isSelected && (
                                <svg
                                  className="w-2.5 h-2.5 text-[var(--color-dusk)]"
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
                              )}
                            </div>
                          </div>
                          <p className="text-white/50 text-sm mt-1 font-body leading-relaxed">
                            {goal.description}
                          </p>
                          <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-white/8 text-white/40">
                            {goal.category}
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.5 }}
            className="mb-6"
          >
            <p className="text-white/60 text-sm mb-4">计划在多久内实现？</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {TIMEFRAME_OPTIONS.map((t) => {
                const isActive = !customTimeframe && timeframe === t.key;
                return (
                  <motion.button
                    key={t.key}
                    onClick={() => {
                      setTimeframe(t.key);
                      setCustomTimeframe("");
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={
                      "rounded-2xl py-3 px-2 text-center transition-all duration-200 " +
                      (isActive
                        ? "bg-gradient-to-b from-[rgb(var(--gold-rgb)/0.25)] to-[rgb(var(--gold-rgb)/0.10)] border border-[rgb(var(--gold-rgb)/0.60)]"
                        : "glass border border-white/10")
                    }
                  >
                    <p
                      className={
                        "font-heading text-base font-semibold " +
                        (isActive ? "text-[var(--color-gold-light)]" : "text-white/70")
                      }
                    >
                      {t.label}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5">{t.sub}</p>
                  </motion.button>
                );
              })}
            </div>

            <div className="relative">
              <input
                type="text"
                value={customTimeframe}
                onChange={(e) => setCustomTimeframe(e.target.value)}
                placeholder="或自定义：毕业前、今年年底、45 天内…"
                maxLength={30}
                className={
                  "w-full rounded-2xl py-3.5 px-4 text-sm font-body bg-white/5 outline-none transition-all duration-200 placeholder:text-white/25 " +
                  (customTimeframe
                    ? "border border-[rgb(var(--gold-rgb)/0.60)] text-[var(--color-gold-light)]"
                    : "border border-white/10 text-white/80")
                }
              />
              {customTimeframe && (
                <button
                  onClick={() => setCustomTimeframe("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center"
                  aria-label="清除自定义时间"
                >
                  <svg className="w-3 h-3 text-white/50" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 2l8 8M10 2l-8 8" />
                  </svg>
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="pb-[calc(env(safe-area-inset-bottom)+24px)]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.7 }}
      >
        <motion.button
          onClick={handleContinue}
          disabled={selectedGoals.length === 0 || isContinuing}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-[9999px] bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-dusk)] text-base font-semibold font-body shadow-[0_8px_32px_rgb(var(--gold-rgb)/0.4)] disabled:opacity-50"
        >
          {isContinuing
            ? "生成中…"
            : `确定这 ${selectedGoals.length} 个目标，开始编织 →`}
        </motion.button>
      </motion.div>
    </div>
  );
}

export default function GoalsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-svh bg-dream-gradient flex items-center justify-center">
          <div className="h-10 w-56 rounded-full skeleton-shimmer opacity-40" />
        </div>
      }
    >
      <GoalsContent />
    </Suspense>
  );
}
