"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { randomIn } from "@/utils/stable-random";
import { VisionOrb, WarmPageShell } from "@/features/vision-journey";

const MESSAGES = [
  "收集你的梦想碎片...",
  "解读内心的声音...",
  "编织专属愿景画布...",
  "点亮你的生命地图...",
  "愿景正在成形...",
];

function pickParticleColor(i: number) {
  const vars = [
    "--color-gold",
    "--color-gold-light",
    "--color-sage",
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
        boxShadow: `0 0 10px ${color}`,
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
    <WarmPageShell className="items-center justify-center px-8">
      <div className="absolute inset-0">
        {backgroundStars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-[#D4AF37]"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
            animate={{ opacity: [0.08, 0.28, 0.08] }}
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
            "radial-gradient(circle, rgb(var(--gold-rgb) / 0.12) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-64 h-64 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--sage-rgb) / 0.14) 0%, transparent 70%)",
        }}
        animate={{ scale: [1.2, 0.9, 1.2], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <motion.div
          className="relative mb-12 h-36 w-36"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <VisionOrb className="h-36 w-36" imageClassName="h-24 w-24" rays />
        </motion.div>

        <div className="h-8 relative overflow-hidden w-full flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              className="absolute text-lg font-light text-[#4A4A4A]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
            >
              {MESSAGES[msgIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <p className="mb-10 text-sm font-light text-[#8A8A8A]">为你量身打造专属愿景板</p>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E8E8E8]">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, #D4AF37, #C9A961)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring" as const, stiffness: 100, damping: 30 }}
          />
        </div>
        <p className="mt-3 text-xs font-light text-[#ABABAB]">{Math.round(progress)}%</p>
      </div>
    </WarmPageShell>
  );
}

export default function LoadingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center bg-[linear-gradient(180deg,#FDFDFB_0%,#F9F9F7_100%)]">
          <div className="h-10 w-56 rounded-full skeleton-shimmer" />
        </div>
      }
    >
      <LoadingContent />
    </Suspense>
  );
}
