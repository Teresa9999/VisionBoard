"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { request } from "@/lib/api/request";
import { reportAction } from "@/lib/eazo-bridge";
import { VisionOrb, WarmPageShell } from "@/features/vision-journey";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 32 };

type Goal = { id?: number; title: string; description: string; category: string };
type GeneratedVisionImage = {
  image: string;
  provider: string;
  model: string;
  latencyMs: number;
};

const VISION_IMAGES = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    label: "旅行",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80",
    label: "创业",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80",
    label: "自然",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80",
    label: "创作",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80",
    label: "阅读",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
    label: "健康",
  },
];

const TABS = [
  { id: "vision", label: "愿景图" },
  { id: "roadmap", label: "目标路线" },
  { id: "spirit", label: "小精灵" },
];

function GoalDot() {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{
        background: "linear-gradient(135deg, #D4AF37, #C9A961)",
      }}
    />
  );
}

function VisionBoardTab({
  goals,
  generatedImage,
  isGeneratingImage,
  generationError,
}: {
  goals: Goal[];
  generatedImage: GeneratedVisionImage | null;
  isGeneratingImage: boolean;
  generationError: string | null;
}) {
  const displayImages = VISION_IMAGES.slice(0, Math.min(goals.length + 2, 6));
  const heroImage = generatedImage?.image ?? displayImages[0].url;

  return (
    <div className="px-5 pb-8">
      <motion.div
        className="py-6 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
      >
        <p className="mb-2 text-xs font-normal uppercase tracking-[0.08em] text-[#C9A961]">
          Your Vision
        </p>
        <h2 className="mb-1 text-[22px] font-medium leading-[1.6] text-[#2A2A2A]">
          你的专属愿景板
        </h2>
        <p className="text-sm font-light leading-[1.8] text-[#8A8A8A]">
          这些画面，是你内心深处的渴望
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <motion.div
          className="col-span-2 rounded-[1.5rem] overflow-hidden relative"
          style={{ height: 200 }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING, delay: 0.1 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={generatedImage ? "Generated vision board" : displayImages[0].label}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dusk)]/60 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <span className="rounded-full border border-white/70 bg-white/78 px-3 py-1 text-sm font-light text-[#4A4A4A] shadow-[0_2px_10px_rgba(0,0,0,0.06)] backdrop-blur">
              {goals[0]?.title || "我的梦想"}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <span className="rounded-full border border-white/70 bg-white/78 px-3 py-1 text-xs font-light text-[#6A6A6A] shadow-[0_2px_10px_rgba(0,0,0,0.06)] backdrop-blur">
              {isGeneratingImage
                ? "AI 生成中"
                : generatedImage
                  ? `${generatedImage.provider}/${generatedImage.model}`
                  : generationError
                    ? "已使用默认图"
                    : "默认预览"}
            </span>
          </div>
        </motion.div>

        {displayImages.slice(1).map((img, i) => (
          <motion.div
            key={img.id}
            className="rounded-[1.25rem] overflow-hidden relative"
            style={{ height: 130 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SPRING, delay: 0.15 + i * 0.08 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dusk)]/50 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className="text-white/80 text-xs font-body">
                {goals[i + 1]?.title || img.label}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {generatedImage && (
        <p className="text-[var(--color-text-muted)] text-xs mb-5 text-center font-body">
          AI Ping 生成耗时 {(generatedImage.latencyMs / 1000).toFixed(1)}s
        </p>
      )}

      <motion.div
        className="rounded-[24px] border border-[#F0F0F0] bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.5 }}
      >
        <p className="mb-3 text-sm font-light text-[#6A6A6A]">
          你的核心愿景
        </p>
        <div className="flex flex-wrap gap-2">
          {goals.map((g) => (
            <span
              key={g.title}
              className="px-3 py-1.5 rounded-full text-sm font-body inline-flex items-center gap-2"
              style={{
                background: "rgb(var(--gold-rgb)/0.08)",
                border: "1px solid rgb(var(--gold-rgb)/0.22)",
                color: "#4A4A4A",
              }}
            >
              <GoalDot />
              {g.title}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function RoadmapTab({ goals, timeframe }: { goals: Goal[]; timeframe: string }) {
  const timeframeLabel =
    timeframe === "3months" ? "3 个月" : timeframe === "6months" ? "6 个月" : "1 年";

  const phases =
    goals.length <= 2
      ? [
          { phase: "第一阶段", label: "启动", goals: goals.slice(0, 1) },
          { phase: "第二阶段", label: "深化", goals: goals.slice(1) },
        ]
      : [
          { phase: "第一阶段", label: "启动期", goals: goals.slice(0, 1) },
          { phase: "第二阶段", label: "成长期", goals: goals.slice(1, 3) },
          { phase: "第三阶段", label: "突破期", goals: goals.slice(3) },
        ].filter((p) => p.goals.length > 0);

  return (
    <div className="px-5 pb-8">
      <motion.div
        className="py-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
      >
        <p className="mb-2 text-xs font-normal uppercase tracking-[0.08em] text-[#C9A961]">
          Roadmap
        </p>
        <h2 className="mb-1 text-[22px] font-medium leading-[1.6] text-[#2A2A2A]">
          {timeframeLabel}目标路线图
        </h2>
        <p className="text-sm font-light leading-[1.8] text-[#8A8A8A]">
          每一步都是通向愿景的里程碑
        </p>
      </motion.div>

      <div className="relative">
        <div className="absolute bottom-0 left-6 top-0 w-px bg-gradient-to-b from-[#C9A961]/70 via-[#E8E8E8] to-transparent" />

        <div className="space-y-6">
          {phases.map((phase, phaseIdx) => (
            <motion.div
              key={phase.phase}
              className="relative pl-16"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: 0.1 + phaseIdx * 0.12 }}
            >
              <div
                className="absolute left-4 top-3 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{
                  background: "var(--color-cream)",
                  borderColor: "var(--color-gold)",
                  boxShadow: "0 0 10px rgb(var(--gold-rgb) / 0.40)",
                }}
              >
                <div className="w-2 h-2 rounded-full bg-[var(--color-gold)]" />
              </div>

              <p className="mb-3 text-xs font-normal uppercase tracking-[0.05em] text-[#C9A961]">
                {phase.phase} · {phase.label}
              </p>

              <div className="space-y-3">
                {phase.goals.map((goal) => (
                  <div key={goal.title} className="rounded-[20px] border border-[#F0F0F0] bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.035)]">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <GoalDot />
                      </div>
                      <div>
                        <h3 className="mb-1 text-base font-medium leading-[1.6] text-[#2A2A2A]">
                          {goal.title}
                        </h3>
                        <p className="text-sm font-light leading-[1.8] text-[#6A6A6A]">
                          {goal.description}
                        </p>
                        <span className="mt-2 inline-block rounded-full border border-[#C9A961]/22 bg-[#C9A961]/8 px-2 py-0.5 text-xs text-[#C9A961]">
                          {goal.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          <motion.div
            className="relative pl-16"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SPRING, delay: 0.5 }}
          >
            <div
              className="absolute left-3 top-0 w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-gold), var(--color-gold-light))",
                boxShadow: "0 0 16px rgb(var(--gold-rgb) / 0.50)",
              }}
            >
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div className="pt-1">
              <p className="text-sm font-light italic leading-[1.8] text-[#8A8A8A]">
                {timeframeLabel}后，那个更好的你，
                <br />正在等待你的到来。
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function SpiritTab() {
  return (
    <div className="px-5 pb-8 flex flex-col items-center">
      <motion.div
        className="py-8 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
      >
        <p className="mb-2 text-xs font-normal uppercase tracking-[0.08em] text-[#C9A961]">
          AI Spirit
        </p>
        <h2 className="mb-1 text-[22px] font-medium leading-[1.6] text-[#2A2A2A]">
          你的小精灵
        </h2>
        <p className="text-sm font-light text-[#8A8A8A]">专属于你的愿景陪伴者</p>
      </motion.div>

      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING, delay: 0.1 }}
      >
        <div
          className="relative overflow-hidden rounded-[28px] border border-[#F0F0F0] bg-white p-8 text-center shadow-[0_2px_16px_rgba(0,0,0,0.05)]"
          style={{
            background:
              "linear-gradient(145deg, rgb(255 255 255 / 0.96) 0%, rgb(var(--gold-rgb) / 0.08) 100%)",
          }}
        >
          <div className="absolute left-0 top-0 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C9A961]/10" />
          <div className="absolute bottom-0 right-0 h-24 w-24 translate-x-1/2 translate-y-1/2 rounded-full bg-[#D4AF37]/10" />

          <motion.div
            className="relative z-10 mb-6 flex justify-center"
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="relative flex h-28 w-28 items-center justify-center">
              <VisionOrb className="h-28 w-28" imageClassName="h-20 w-20" />
              {[0, 72, 144, 216, 288].map((angle, i) => (
                <motion.div
                  key={i}
                  className="absolute h-1.5 w-1.5 rounded-full bg-[#C9A961]"
                  style={{
                    top: `${50 - 55 * Math.cos((angle * Math.PI) / 180)}%`,
                    left: `${50 + 55 * Math.sin((angle * Math.PI) / 180)}%`,
                  }}
                  animate={{ scale: [0.5, 1.2, 0.5], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>

          <h3 className="mb-2 text-xl font-medium leading-[1.6] text-[#2A2A2A]">
            小精灵正在孵化中...
          </h3>
          <p className="mb-6 text-sm font-light leading-[1.8] text-[#6A6A6A]">
            你的专属愿景陪伴者即将诞生
            <br />
            它将帮你记录进展、提供鼓励，
            <br />
            在迷茫时为你指引方向
          </p>

          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
            style={{
              background: "rgb(var(--gold-rgb) / 0.08)",
              border: "1px solid rgb(var(--gold-rgb) / 0.22)",
              color: "#C9A961",
            }}
          >
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9A961]/70 animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9A961]/70 animate-pulse [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9A961]/70 animate-pulse [animation-delay:240ms]" />
            </span>
            孵化进度 42%
          </div>
        </div>
      </motion.div>

      <motion.p
        className="mt-6 text-center text-xs text-[#8A8A8A]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        敬请期待
      </motion.p>
    </div>
  );
}

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [activeTab, setActiveTab] = useState("vision");
  const [session, setSession] = useState<{
    goals: Goal[];
    timeframe: string;
    emotion: string;
    summary?: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedImage, setGeneratedImage] = useState<GeneratedVisionImage | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      if (!sessionId) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await request(`/api/session?sessionId=${sessionId}`);
        const data = await res.json();
        const loadedSession = {
          goals: Array.isArray(data.goals) ? (data.goals as Goal[]) : [],
          timeframe: data.timeframe || "6months",
          emotion: data.emotion || "calm",
          summary: data.summary || null,
        };
        setSession(loadedSession);
        setIsLoading(false);

        setIsGeneratingImage(true);
        setGenerationError(null);
        try {
          const imageRes = await request("/api/generate-image", {
            method: "POST",
            body: JSON.stringify({
              rawWish: loadedSession.summary || "用户希望创建一张能代表理想生活状态的愿景图。",
              visionSummary:
                loadedSession.summary ||
                "A refined personal vision board representing the user's desired future life.",
              selectedVisionOptions: loadedSession.goals.map((goal) => goal.title),
              goalOutcome: loadedSession.goals
                .map((goal) => `${goal.title}: ${goal.description}`)
                .join("\n"),
              timeframe: loadedSession.timeframe,
              desiredState: "confident, calm, abundant, fulfilled, self-directed",
              keywords: loadedSession.goals.map((goal) => goal.category),
              goals: loadedSession.goals,
              stylePack: "clean-girl-luxury",
              model: "aiping:Doubao-Seedream-4.0",
              aspectRatio: "16:9",
            }),
          });
          const imageData = await imageRes.json();
          if (!imageRes.ok) throw new Error(imageData.error || "生成愿景图失败");
          setGeneratedImage(imageData as GeneratedVisionImage);
        } catch (error) {
          setGenerationError(error instanceof Error ? error.message : "生成愿景图失败");
        } finally {
          setIsGeneratingImage(false);
        }

        reportAction({
          content: `用户查看了愿景板结果页`,
          event_type: "navigate",
          page: "result",
          metadata: { type: "view_result", session_id: sessionId },
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, [sessionId]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "我的心愿愿景板",
          text: "我刚刚创建了自己的专属愿景板，发现了真正渴望的生活。",
          url: window.location.href,
        })
        .catch(() => {});
    }
  };

  return (
    <WarmPageShell>
      <div className="relative overflow-hidden px-6" style={{ height: 212 }}>
        <div className="relative z-10 flex h-full flex-col items-center justify-center pt-8">
          <VisionOrb className="mb-4 h-20 w-20" imageClassName="h-14 w-14" />
          <motion.p
            className="mb-2 text-xs font-normal uppercase tracking-[0.08em] text-[#C9A961]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Your Vision
          </motion.p>
          <motion.h1
            className="text-center text-[24px] font-medium leading-[1.6] text-[#2A2A2A]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            愿景板已生成
          </motion.h1>
        </div>
      </div>

      <div
        className="sticky top-0 z-20 px-6 pb-0 pt-1 backdrop-blur"
        style={{
          background: "rgb(253 253 251 / 0.88)",
          borderBottom: "1px solid #F0F0F0",
        }}
      >
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={
                "flex-1 py-4 text-sm font-body font-medium relative transition-colors duration-200 " +
                (activeTab === tab.id
                  ? "text-[#C9A961]"
                  : "text-[#8A8A8A]")
              }
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                  style={{ background: "var(--color-gold)" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="px-5 py-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-[1.5rem] skeleton-shimmer" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: "spring" as const, stiffness: 320, damping: 32 }}
            >
              {activeTab === "vision" && (
                <VisionBoardTab
                  goals={session?.goals ?? []}
                  generatedImage={generatedImage}
                  isGeneratingImage={isGeneratingImage}
                  generationError={generationError}
                />
              )}
              {activeTab === "roadmap" && (
                <RoadmapTab
                  goals={session?.goals ?? []}
                  timeframe={session?.timeframe ?? "6months"}
                />
              )}
              {activeTab === "spirit" && <SpiritTab />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <div
        className="flex gap-3 px-6 py-4 pb-[calc(env(safe-area-inset-bottom)+16px)]"
        style={{
          background: "rgb(253 253 251 / 0.90)",
          borderTop: "1px solid #F0F0F0",
        }}
      >
        <motion.button
          onClick={() => router.push("/")}
          whileTap={{ scale: 0.96 }}
          className="flex-1 rounded-2xl border py-3.5 text-sm font-normal text-[#4A4A4A]"
          style={{ borderColor: "#E8E8E8", background: "rgb(255 255 255 / 0.72)" }}
        >
          重新开始
        </motion.button>
        <motion.button
          onClick={handleShare}
          whileTap={{ scale: 0.96 }}
          className="flex-1 rounded-2xl py-3.5 text-sm font-medium text-white"
          style={{
            background: "linear-gradient(90deg, #D4AF37, #C9A961)",
            boxShadow: "0 4px 16px rgb(var(--gold-rgb) / 0.30)",
          }}
        >
          分享愿景板
        </motion.button>
      </div>
    </WarmPageShell>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-svh flex items-center justify-center"
          style={{ background: "linear-gradient(180deg,#FDFDFB 0%,#F9F9F7 100%)" }}
        >
          <div className="text-[#8A8A8A]">生成中...</div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
