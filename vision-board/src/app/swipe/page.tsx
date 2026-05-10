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
        className="w-full h-full rounded-[2rem] overflow-hidden relative"
        style={{
          boxShadow:
            "0 16px 48px rgb(0 0 0 / 0.40), 0 4px 12px rgb(0 0 0 / 0.20)",
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
        <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--midnight-rgb)/0.90)] via-[rgb(var(--midnight-rgb)/0.20)] to-transparent" />

        {/* Category pill */}
        <div className="absolute top-5 left-5 px-3 py-1 rounded-full glass text-white/80 text-xs font-body tracking-wider">
          {card.category}
        </div>

        {/* LIKE badge */}
        {isTop && (
          <motion.div
            className="absolute top-8 right-6 px-5 py-2 rounded-full border-2 backdrop-blur-sm"
            style={{
              opacity: likeOpacity,
              rotate: -15,
              borderColor: "rgb(var(--sage-rgb) / 0.85)",
              background: "rgb(var(--sage-rgb) / 0.18)",
            }}
          >
            <span
              className="font-heading font-bold text-xl tracking-wider"
              style={{ color: "rgb(var(--sage-rgb) / 0.95)" }}
            >
              喜欢
            </span>
          </motion.div>
        )}

        {/* SKIP badge */}
        {isTop && (
          <motion.div
            className="absolute top-8 left-6 px-5 py-2 rounded-full border-2 backdrop-blur-sm"
            style={{
              opacity: skipOpacity,
              rotate: 15,
              borderColor: "rgb(var(--blush-rgb) / 0.85)",
              background: "rgb(var(--blush-rgb) / 0.18)",
            }}
          >
            <span
              className="font-heading font-bold text-xl tracking-wider"
              style={{ color: "rgb(var(--blush-rgb) / 0.95)" }}
            >
              跳过
            </span>
          </motion.div>
        )}

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div
            className="inline-block w-8 h-1 rounded-full mb-3"
            style={{ backgroundColor: `var(${accentVar})` }}
          />
          <h2 className="font-heading text-3xl font-bold text-white mb-2">
            {card.title}
          </h2>
          <p className="text-white/70 text-base font-body leading-relaxed">
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
        className="w-16 h-16 rounded-full glass flex items-center justify-center"
        style={{ border: "1px solid rgb(var(--blush-rgb) / 0.40)" }}
        aria-label="跳过"
      >
        <svg
          className="w-7 h-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="rgb(var(--blush-rgb) / 0.95)"
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
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, rgb(var(--sage-rgb) / 0.95), rgb(var(--sage-rgb) / 0.70))",
          boxShadow: "0 8px 24px rgb(var(--sage-rgb) / 0.45)",
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
      className="w-12 h-12 text-[var(--color-gold-light)]"
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

function SwipeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);
  const [skipped, setSkipped] = useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const remaining = DISCOVERY_CARDS.slice(currentIndex);
  const progress = currentIndex / DISCOVERY_CARDS.length;

  async function handleSwipe(id: number, isLiked: boolean) {
    if (isTransitioning) return;
    setIsTransitioning(true);

    if (isLiked) {
      setLiked((prev) => [...prev, id]);
    } else {
      setSkipped((prev) => [...prev, id]);
    }

    setCurrentIndex((prev) => prev + 1);
    setIsTransitioning(false);

    if (currentIndex === DISCOVERY_CARDS.length - 1) {
      const finalLiked = isLiked ? [...liked, id] : liked;
      const finalSkipped = isLiked ? skipped : [...skipped, id];

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
          session_id: sessionId,
        },
      });

      router.push(`/summary?sessionId=${sessionId}`);
    }
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

        <div className="text-center">
          <p className="text-[var(--color-gold-light)] text-xs tracking-widest uppercase">
            直觉探索
          </p>
          <p className="text-white/50 text-xs mt-0.5">
            {currentIndex + 1} / {DISCOVERY_CARDS.length}
          </p>
        </div>

        <div className="w-10" />
      </div>

      <div className="mb-6 h-1 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, var(--color-gold), var(--color-gold-light))",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: "spring" as const, stiffness: 200, damping: 30 }}
        />
      </div>

      <p className="text-center text-white/40 text-sm mb-4">
        右滑 <span className="text-[var(--color-sage)]">喜欢</span> · 左滑 <span className="text-[var(--color-blush)]">跳过</span>
      </p>

      <div className="flex-1 relative" style={{ minHeight: 400 }}>
        <AnimatePresence>
          {remaining.length === 0 ? (
            <motion.div
              key="done"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-center text-white/60">
                <div className="mb-4 flex justify-center">
                  <DoneIcon />
                </div>
                <p className="font-heading text-xl">正在分析你的偏好…</p>
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

      <div className="py-8 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <SwipeButtons onSkip={handleSkipButton} onLike={handleLikeButton} />
      </div>
    </div>
  );
}

export default function SwipePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-svh bg-dream-gradient flex items-center justify-center">
          <div className="h-10 w-56 rounded-full skeleton-shimmer opacity-40" />
        </div>
      }
    >
      <SwipeContent />
    </Suspense>
  );
}
