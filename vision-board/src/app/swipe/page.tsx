"use client";

import { useState, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  PanInfo,
} from "framer-motion";
import { request } from "@/lib/api/request";
import { reportAction } from "@/lib/eazo-bridge";
import {
  DISCOVERY_CARDS,
  WarmHeader,
  WarmPageShell,
  discoveryAccentToCssVar,
  type DiscoveryCard as DiscoveryCardData,
} from "@/features/vision-journey";

function SwipeCard({
  card,
  onSwipe,
  isTop,
  index,
}: {
  card: DiscoveryCardData;
  onSwipe: (id: number, liked: boolean) => void;
  isTop: boolean;
  index: number;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);
  const opacity = useTransform(x, [-150, 0, 150], [0.6, 1, 0.6]);

  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const skipOpacity = useTransform(x, [-80, 0], [1, 0]);

  const isDragging = useRef(false);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      isDragging.current = false;
      const threshold = 100;
      if (info.offset.x > threshold) {
        onSwipe(card.id, true);
      } else if (info.offset.x < -threshold) {
        onSwipe(card.id, false);
      }
    },
    [card.id, onSwipe]
  );

  if (!isTop && index > 2) return null;

  const stackOffset = index * 6;
  const stackScale = 1 - index * 0.04;
  const stackOpacity = 1 - index * 0.15;

  const accentVar = discoveryAccentToCssVar(card.accent);

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : stackOffset * 0.8,
        opacity: isTop ? opacity : stackOpacity,
        scale: isTop ? 1 : stackScale,
        y: isTop ? 0 : stackOffset,
        zIndex: 10 - index,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragStart={() => {
        isDragging.current = true;
      }}
      onDragEnd={handleDragEnd}
    >
      <div
        className="relative h-full w-full overflow-hidden rounded-[32px] border border-white bg-white"
        style={{
          boxShadow:
            "0 18px 44px rgb(42 42 42 / 0.12), 0 4px 16px rgb(201 169 97 / 0.10)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.imageUrl}
          alt={card.title}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/8 to-transparent" />

        {/* Category pill */}
        <div className="absolute left-5 top-5 rounded-full border border-white/70 bg-white/78 px-3 py-1 text-xs font-normal tracking-[0.05em] text-[#6A6A6A] shadow-[0_2px_10px_rgba(0,0,0,0.06)] backdrop-blur">
          {card.category}
        </div>

        {/* LIKE badge */}
        {isTop && (
          <motion.div
            className="absolute right-6 top-8 rounded-full border px-5 py-2 backdrop-blur-sm"
            style={{
              opacity: likeOpacity,
              rotate: -15,
              borderColor: "rgb(var(--gold-rgb) / 0.85)",
              background: "rgb(255 255 255 / 0.82)",
            }}
          >
            <span
              className="text-xl font-medium tracking-[0.05em]"
              style={{ color: "rgb(var(--gold-rgb) / 0.95)" }}
            >
              喜欢
            </span>
          </motion.div>
        )}

        {/* SKIP badge */}
        {isTop && (
          <motion.div
            className="absolute left-6 top-8 rounded-full border px-5 py-2 backdrop-blur-sm"
            style={{
              opacity: skipOpacity,
              rotate: 15,
              borderColor: "rgb(218 218 218 / 0.95)",
              background: "rgb(255 255 255 / 0.78)",
            }}
          >
            <span
              className="text-xl font-medium tracking-[0.05em]"
              style={{ color: "#8A8A8A" }}
            >
              跳过
            </span>
          </motion.div>
        )}

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div
            className="mb-3 inline-block h-1 w-8 rounded-full"
            style={{ backgroundColor: `var(${accentVar})` }}
          />
          <h2 className="mb-2 text-[28px] font-medium leading-[1.35] text-white drop-shadow-sm">
            {card.title}
          </h2>
          <p className="text-base font-light leading-relaxed text-white/82">
            {card.subtitle}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function SwipeButtons({
  onSkip,
  onLike,
}: {
  onSkip: () => void;
  onLike: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-8">
      <motion.button
        onClick={onSkip}
        whileTap={{ scale: 0.9 }}
        className="flex h-16 w-16 items-center justify-center rounded-full border border-[#E8E8E8] bg-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.05)]"
        aria-label="跳过"
      >
        <svg
          className="w-7 h-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#8A8A8A"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </motion.button>

      <motion.button
        onClick={onLike}
        whileTap={{ scale: 0.9 }}
        className="flex h-20 w-20 items-center justify-center rounded-full"
        style={{
          background: "linear-gradient(135deg, #D4AF37, #C9A961)",
          boxShadow: "0 8px 24px rgb(var(--gold-rgb) / 0.32)",
        }}
        aria-label="喜欢"
      >
        <svg
          className="w-8 h-8 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </motion.button>
    </div>
  );
}

function DoneIcon() {
  return (
    <svg
      className="h-12 w-12 text-[#C9A961]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />
      <path d="M19 13l0.8 2.2L22 16l-2.2 0.8L19 19l-0.8-2.2L16 16l2.2-0.8L19 13z" />
      <path d="M4 13l0.8 2.2L7 16l-2.2 0.8L4 19l-0.8-2.2L1 16l2.2-0.8L4 13z" />
    </svg>
  );
}

const REQUIRED_SWIPES = 8;

function SwipeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);
  const [skipped, setSkipped] = useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const remaining = DISCOVERY_CARDS.slice(currentIndex);
  const swipedCount = currentIndex;
  const canContinue = swipedCount >= REQUIRED_SWIPES;
  const allDone = remaining.length === 0;
  const progress = swipedCount / DISCOVERY_CARDS.length;

  async function navigateToSummary(finalLiked: number[], finalSkipped: number[]) {
    setIsSaving(true);
    try {
      await request("/api/session", {
        method: "PATCH",
        body: JSON.stringify({
          sessionId: parseInt(sessionId!),
          likedCards: finalLiked,
          skippedCards: finalSkipped,
        }),
      });
    } catch {
      // ignore
    }

    reportAction({
      content: `用户完成直觉滑卡，喜欢了 ${finalLiked.length} 张卡片`,
      event_type: "update",
      page: "swipe",
      metadata: {
        type: "complete_swipe",
        liked_count: finalLiked.length,
        swiped_count: finalLiked.length + finalSkipped.length,
        session_id: sessionId,
      },
    });

    router.push(`/summary?sessionId=${sessionId}`);
  }

  async function handleSwipe(id: number, isLiked: boolean) {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const newLiked = isLiked ? [...liked, id] : liked;
    const newSkipped = isLiked ? skipped : [...skipped, id];

    if (isLiked) {
      setLiked(newLiked);
    } else {
      setSkipped(newSkipped);
    }

    setCurrentIndex((prev) => prev + 1);
    setIsTransitioning(false);

    // Auto-proceed when all 20 cards are swiped
    if (currentIndex === DISCOVERY_CARDS.length - 1) {
      await navigateToSummary(newLiked, newSkipped);
    }
  }

  async function handleContinue() {
    await navigateToSummary(liked, skipped);
  }

  function handleLikeButton() {
    if (currentIndex < DISCOVERY_CARDS.length) {
      handleSwipe(DISCOVERY_CARDS[currentIndex].id, true);
    }
  }

  function handleSkipButton() {
    if (currentIndex < DISCOVERY_CARDS.length) {
      handleSwipe(DISCOVERY_CARDS[currentIndex].id, false);
    }
  }

  return (
    <WarmPageShell className="px-6">
      <WarmHeader
        title="直觉探索"
        subtitle={`${swipedCount} / ${DISCOVERY_CARDS.length}`}
        onBack={() => router.back()}
      />

      <div className="mb-6 h-1 overflow-hidden rounded-full bg-[#E8E8E8]">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #D4AF37, #C9A961)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: "spring" as const, stiffness: 200, damping: 30 }}
        />
      </div>

      <p className="mb-4 text-center text-sm font-light text-[#8A8A8A]">
        右滑 <span className="text-[#C9A961]">喜欢</span> · 左滑 <span className="text-[#6A6A6A]">跳过</span>
      </p>

      <div className="flex-1 relative" style={{ minHeight: 400 }}>
        <AnimatePresence>
          {allDone ? (
            <motion.div
              key="done"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-center text-[#6A6A6A]">
                <div className="mb-4 flex justify-center">
                  <DoneIcon />
                </div>
                <p className="text-xl font-light">正在分析你的偏好...</p>
              </div>
            </motion.div>
          ) : (
            remaining.slice(0, 3).map((card, i) => (
              <SwipeCard
                key={card.id}
                card={card}
                onSwipe={handleSwipe}
                isTop={i === 0}
                index={i}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-4 py-6 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <AnimatePresence>
          {canContinue && !allDone && (
            <motion.button
              key="continue-btn"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={handleContinue}
              disabled={isSaving}
              className="h-[52px] w-full rounded-2xl text-base font-medium tracking-wide text-white disabled:opacity-60"
              style={{
                background: "linear-gradient(90deg, #D4AF37, #C9A961)",
                boxShadow: "0 4px 16px rgb(var(--gold-rgb) / 0.30)",
              }}
            >
              {isSaving ? "正在生成..." : "继续"}
            </motion.button>
          )}
        </AnimatePresence>

        {!allDone && (
          <SwipeButtons onSkip={handleSkipButton} onLike={handleLikeButton} />
        )}
      </div>
    </WarmPageShell>
  );
}

export default function SwipePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center bg-[linear-gradient(180deg,#FDFDFB_0%,#F9F9F7_100%)]">
          <div className="h-10 w-56 rounded-full skeleton-shimmer" />
        </div>
      }
    >
      <SwipeContent />
    </Suspense>
  );
}
