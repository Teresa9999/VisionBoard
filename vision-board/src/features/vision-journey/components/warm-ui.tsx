import type { ReactNode } from "react";
import Image from "next/image";

export function WarmPageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "relative isolate mx-auto flex min-h-svh w-full max-w-md flex-col overflow-hidden bg-[linear-gradient(180deg,#FDFDFB_0%,#FAF8F2_46%,#F7F5EF_100%)] text-[#2A2A2A] " +
        className
      }
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(var(--gold-rgb)/0.16)_0%,rgb(var(--gold-rgb)/0.06)_38%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute right-4 top-20 -z-10 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgb(var(--gold-light-rgb)/0.20)_0%,transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 left-8 -z-10 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgb(var(--sage-rgb)/0.14)_0%,transparent_72%)] blur-2xl" />
      {children}
    </div>
  );
}

export function WarmHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between pb-4 pt-12">
      {onBack ? (
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E8E8] bg-white/75 shadow-[0_2px_10px_rgba(0,0,0,0.035)] backdrop-blur"
          aria-label="返回"
        >
          <svg
            className="h-5 w-5 text-[#6A6A6A]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      ) : (
        <div className="h-10 w-10" />
      )}

      <div className="text-center">
        <p className="text-xs font-normal tracking-[0.08em] text-[#8A8A8A]">{title}</p>
        {subtitle && <p className="mt-0.5 text-xs font-light text-[#ABABAB]">{subtitle}</p>}
      </div>

      <div className="flex h-10 w-10 items-center justify-end">
        {right ?? (
          <Image
            src="/images/Visionball.png"
            alt=""
            width={40}
            height={40}
            priority
            className="h-8 w-8 object-contain drop-shadow-[0_6px_14px_rgba(201,169,97,0.28)]"
          />
        )}
      </div>
    </div>
  );
}

export function VisionOrb({
  className = "",
  imageClassName = "h-20 w-20",
  rays = false,
}: {
  className?: string;
  imageClassName?: string;
  rays?: boolean;
}) {
  return (
    <div className={"relative flex items-center justify-center " + className}>
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgb(var(--gold-rgb)/0.17)_0%,transparent_68%)] blur-xl" />
      {rays && (
        <>
          <div className="absolute h-px w-48 bg-[linear-gradient(90deg,transparent,rgb(var(--gold-rgb)/0.24),transparent)]" />
          <div className="absolute h-48 w-px bg-[linear-gradient(180deg,transparent,rgb(var(--gold-rgb)/0.18),transparent)]" />
        </>
      )}
      <Image
        src="/images/Visionball.png"
        alt=""
        width={112}
        height={112}
        priority
        className={
          "relative object-contain drop-shadow-[0_10px_24px_rgba(201,169,97,0.32)] " +
          imageClassName
        }
      />
    </div>
  );
}
