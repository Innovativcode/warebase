"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { WarebaseLoader } from "@/components/loader/warebase-loader";

type SessionLoaderProps = {
  mode: "login" | "register";
  visible: boolean;
};

const LOGIN_MESSAGES = [
  "Authenticating your session…",
  "Loading your dashboard…",
  "Syncing stock levels…",
  "Connecting to warehouse…",
  "Almost there…",
];

const REGISTER_MESSAGES = [
  "Creating your account…",
  "Setting up your dashboard…",
  "Preparing your workspace…",
  "Configuring inventory base…",
  "Almost ready…",
];

export function SessionLoader({ mode, visible }: SessionLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const messages = mode === "register" ? REGISTER_MESSAGES : LOGIN_MESSAGES;

  useEffect(() => {
    if (!visible) {
      setMessageIndex(0);
      setFading(false);
      return;
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev >= messages.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [visible, messages.length]);

  useEffect(() => {
    if (!visible) return;
    const fadeTimer = setTimeout(() => setFading(true), 5000);
    return () => clearTimeout(fadeTimer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[130] flex items-center justify-center overflow-hidden transition-opacity duration-700 ease-out",
        fading ? "opacity-0" : "opacity-100",
      )}
      style={{ background: "linear-gradient(160deg, #ffffff 0%, #f8f9fb 100%)" }}
    >
      <div className="boot-screen__grid" aria-hidden="true" />
      <div className="boot-screen__glow" aria-hidden="true" />

      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="boot-screen__loader">
          <WarebaseLoader />
        </div>

        <h1 className="boot-screen__wordmark font-display text-3xl font-medium tracking-tight text-[#151F38] sm:text-4xl">
          Ware<span className="font-bold text-[#E8A23D]">Base</span>
        </h1>

        <div className="mt-8 flex h-12 items-center justify-center overflow-hidden">
          <p
            key={messageIndex}
            className="font-mono text-[0.78rem] uppercase tracking-[0.24em] text-[#5B6B79]"
            style={{ animation: "boot-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both" }}
          >
            {messages[messageIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
