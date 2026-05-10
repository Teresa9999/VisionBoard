"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { request } from "@/lib/api/request";
import { reportAction } from "@/lib/eazo-bridge";
import {
  SPRING,
  TIMEFRAME_OPTIONS,
  VisionOrb,
  WarmHeader,
  WarmPageShell,
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
    <WarmPageShell className="px-6">
      <WarmHeader title="目标确认" onBack={() => router.back()} />

      <div className="flex-1 overflow-y-auto pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <motion.div
          className="pt-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.1 }}
        >
          <div className="mb-9 text-center">
            <motion.div
              className="relative mx-auto mb-7 flex h-28 w-28 items-center justify-center"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...SPRING, delay: 0.18 }}
            >
              <VisionOrb className="h-28 w-28" rays />
            </motion.div>
            <h1 className="text-[22px] font-medium leading-[1.6] tracking-[0] text-[#2A2A2A]">
              选择你的方向
            </h1>
            <p className="mx-auto mt-2 max-w-[17rem] text-sm font-light leading-[1.8] text-[#8A8A8A]">
              点击取消不想保留的目标，留下真正有感的愿景线索
            </p>
          </div>

          {isLoading ? (
            <div className="mb-8 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-[24px] border border-[#F0F0F0] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.035)] skeleton-shimmer"
                />
              ))}
            </div>
          ) : (
            <div className="mb-8 space-y-3">
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
                        "w-full text-left rounded-[20px] border p-4 shadow-[0_2px_12px_rgba(0,0,0,0.035)] transition-all duration-300 " +
                        (isSelected
                          ? "border-[#C9A961] bg-white shadow-[0_4px_18px_rgba(201,169,97,0.15)]"
                          : "border-[#F0F0F0] bg-white/72 opacity-75")
                      }
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={
                            "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-base font-medium transition-all duration-300 " +
                            (isSelected
                              ? "bg-[#C9A961]/10 text-[#C9A961]"
                              : "bg-[#F7F7F5] text-[#8A8A8A]")
                          }
                        >
                          {goal.badge}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-base font-medium leading-[1.6] tracking-[0] text-[#2A2A2A]">
                              {goal.title}
                            </h3>
                            <div
                              className={
                                "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-200 " +
                                (isSelected
                                  ? "border-[#C9A961] bg-[#C9A961]"
                                  : "border-[#DADADA] bg-white")
                              }
                            >
                              {isSelected && (
                                <svg
                                  className="h-2.5 w-2.5 text-white"
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
                          <p className="mt-1 text-sm font-light leading-[1.8] text-[#6A6A6A]">
                            {goal.description}
                          </p>
                          <span
                            className={
                              "mt-2 inline-block rounded-full border px-2.5 py-1 text-xs font-normal leading-[1.4] " +
                              (isSelected
                                ? "border-[#C9A961]/30 bg-[#C9A961]/8 text-[#C9A961]"
                                : "border-[#E8E8E8] bg-white/70 text-[#8A8A8A]")
                            }
                          >
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
            <p className="mb-4 text-sm font-light leading-[1.8] text-[#6A6A6A]">
              达成时间
            </p>
            <div className="mb-3 grid grid-cols-3 gap-3">
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
                      "rounded-full border px-2 py-3 text-center shadow-[0_2px_10px_rgba(0,0,0,0.025)] transition-all duration-200 " +
                      (isActive
                        ? "border-[#C9A961] bg-[linear-gradient(90deg,#D4AF37,#C9A961)] text-white shadow-[0_4px_16px_rgba(201,169,97,0.26)]"
                        : "border-[#E8E8E8] bg-white/72 text-[#4A4A4A]")
                    }
                  >
                    <p
                      className={
                        "text-sm font-medium leading-[1.4] " +
                        (isActive ? "text-white" : "text-[#4A4A4A]")
                      }
                    >
                      {t.label}
                    </p>
                    <p
                      className={
                        "mt-0.5 text-[11px] font-light leading-[1.4] " +
                        (isActive ? "text-white/82" : "text-[#ABABAB]")
                      }
                    >
                      {t.sub}
                    </p>
                  </motion.button>
                );
              })}
            </div>

            <div className="relative">
              <input
                type="text"
                value={customTimeframe}
                onChange={(e) => setCustomTimeframe(e.target.value)}
                placeholder="或自定义：毕业前、今年年底、45 天内..."
                maxLength={30}
                className={
                  "w-full rounded-2xl border bg-white/78 px-4 py-3.5 text-sm font-light leading-[1.8] outline-none shadow-[0_2px_12px_rgba(0,0,0,0.035)] transition-all duration-200 placeholder:text-[#ABABAB] " +
                  (customTimeframe
                    ? "border-[#C9A961] text-[#4A4A4A]"
                    : "border-[#E8E8E8] text-[#4A4A4A]")
                }
              />
              {customTimeframe && (
                <button
                  onClick={() => setCustomTimeframe("")}
                  className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-[#F5F5F5]"
                  aria-label="清除自定义时间"
                >
                  <svg className="h-3 w-3 text-[#8A8A8A]" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2}>
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
          className="h-[52px] w-full rounded-2xl bg-[linear-gradient(90deg,#D4AF37,#C9A961)] text-base font-medium text-white shadow-[0_4px_16px_rgba(201,169,97,0.30)] transition disabled:opacity-50"
        >
          {isContinuing
            ? "生成中..."
            : `确定这 ${selectedGoals.length} 个目标，开始生成`}
        </motion.button>
      </motion.div>
    </WarmPageShell>
  );
}

export default function GoalsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-svh flex items-center justify-center bg-[linear-gradient(180deg,#FDFDFB_0%,#F9F9F7_100%)]">
          <div className="h-10 w-56 rounded-full skeleton-shimmer" />
        </div>
      }
    >
      <GoalsContent />
    </Suspense>
  );
}
