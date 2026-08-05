"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { WarebaseLoader } from "@/components/loader/warebase-loader";
import { consumeBootIntro } from "@/lib/boot-intro";

const MESSAGES = [
  "Setting up your dashboard…",
  "Loading stock levels…",
  "Syncing shelves…",
  "Balancing the base…",
  "Almost there…",
];

type WarebaseBootScreenProps = {
  duration?: number;
  messageInterval?: number;
  messages?: string[];
};

export function WarebaseBootScreen({
  duration = 2400,
  messageInterval = 700,
  messages = MESSAGES,
}: WarebaseBootScreenProps) {
  const [showIntro, setShowIntro] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setShowIntro(consumeBootIntro());
  }, []);

  useEffect(() => {
    if (!showIntro) {
      return;
    }
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev >= messages.length - 1 ? prev : prev + 1));
    }, messageInterval);
    return () => clearInterval(interval);
  }, [showIntro, messageInterval, messages.length]);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), duration);
    const hideTimer = setTimeout(() => setVisible(false), duration + 700);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={cn(
        "boot-screen fixed inset-0 z-[120] flex items-center justify-center overflow-hidden transition-opacity duration-700 ease-out",
        fading && "opacity-0",
      )}
    >
      <div className="boot-screen__grid" aria-hidden="true" />
      <div className="boot-screen__glow" aria-hidden="true" />

      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="boot-screen__loader">
          <WarebaseLoader variant="compact" />
        </div>

        {showIntro ? (
          <>
            <h1 className="boot-screen__wordmark font-display text-3xl font-medium tracking-tight text-[#151F38] sm:text-4xl">
              Ware<span className="font-bold text-[#E8A23D]">Base</span>
            </h1>

            <p className="boot-screen__tagline font-display text-lg font-medium text-[#22262B] sm:text-xl">
              Every item, <span className="font-bold text-[#E8A23D]">in its place.</span>
            </p>

            <div className="mt-8 flex h-12 items-center justify-center overflow-hidden">
              <p
                key={messageIndex}
                className="boot-screen__message font-mono text-[0.78rem] uppercase tracking-[0.24em] text-[#5B6B79]"
                style={{ animation: "boot-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both" }}
              >
                {messages[messageIndex]}
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
