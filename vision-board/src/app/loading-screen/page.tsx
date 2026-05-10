"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { randomIn } from "@/utils/stable-random";

const MESSAGES = [
  "收集你的梦想碎片…",
  "解读内心的声音…",
  "编织专属愿景画布…",
  "点亮你的生命地图…",
  "愿景正在成形…",
];

function pickParticleColor(i: number) {
  const vars = [
    "--color-gold-light",
    "--color-lavender",
    "--color-sage",
    "--color-rose",
  ];
  return `var(${vars[i % vars.length]})`;
}

function Particle({
  x,
  y,
  size,
  delay,
  duration,
  color,
}: {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: color,
        boxShadow: `0 0 12px ${color}`,
      }}
      initial={{ opacity: 0, scale: 0, y: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0.3],
        y: [-20, -80, -140],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: 1.2,
      }}
    />
  );
}

function StarBurst({ count = 22 }: { count?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: randomIn(i + 1, 0, 100),
        y: randomIn(i + 101, 0, 100),
        size: randomIn(i + 201, 1, 4),
        delay: randomIn(i + 301, 0, 4),
        duration: randomIn(i + 401, 1.6, 3.6),
        color: pickParticleColor(i),
      })),
    [count]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <Particle key={s.id} {...s} />
      ))}
    </div>
  );
}

function LoadingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const backgroundStars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: randomIn(i + 501, 0, 100),
        y: randomIn(i + 601, 0, 100),
        size: randomIn(i + 701, 0.5, 2.5),
        duration: randomIn(i + 801, 1.5, 4.5),
        delay: randomIn(i + 901, 0, 4),
      })),
    []
  );

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 1200);

    let p = 0;
    let step = 0;
    const progressInterval = setInterval(() => {
      p += randomIn(step++, 1, 4);
      if (p >= 100) {
        p = 100;
        clearInterval(progressInterval);
        clearInterval(msgInterval);
        setTimeout(() => {
          router.push(`/result?sessionId=${sessionId}`);
        }, 800);
      }
      setProgress(Math.min(100, p));
    }, 80);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, [router, sessionId]);

  return (
    <div className="min-h-svh bg-dream-gradient relative flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        {backgroundStars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      <StarBurst />

      <motion.div
        className="absolute w-96 h-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--lavender-deep-rgb) / 0.20) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-64 h-64 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--gold-rgb) / 0.20) 0%, transparent 70%)",
        }}
        animate={{ scale: [1.2, 0.9, 1.2], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="relative z-10 flex flex-col items-center px-8 max-w-sm w-full">
        <motion.div
          className="w-32 h-32 rounded-full mb-12 relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, rgb(var(--gold-rgb) / 0.8) 25%, rgb(var(--lavender-rgb) / 0.8) 50%, rgb(var(--sage-rgb) / 0.8) 75%, transparent 100%)",
              filter: "blur(2px)",
            }}
          />
          <motion.div
            className="absolute inset-2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgb(var(--gold-rgb) / 0.35), rgb(var(--dusk-rgb) / 0.9))",
            }}
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-[var(--color-gold-light)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              />
            </svg>
          </div>
        </motion.div>

        <div className="h-8 relative overflow-hidden w-full flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              className="text-white/80 text-lg font-heading absolute"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
            >
              {MESSAGES[msgIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <p className="text-white/30 text-sm mb-10 font-body">为你量身打造专属愿景板</p>

        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, var(--color-lavender-deep), var(--color-gold), var(--color-gold-light))",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring" as const, stiffness: 100, damping: 30 }}
          />
        </div>
        <p className="text-white/20 text-xs mt-3">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}

export default function LoadingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-svh bg-dream-gradient flex items-center justify-center">
          <div className="h-10 w-56 rounded-full skeleton-shimmer opacity-40" />
        </div>
      }
    >
      <LoadingContent />
    </Suspense>
  );
}
