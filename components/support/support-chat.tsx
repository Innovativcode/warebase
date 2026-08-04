"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { X, ChatCircleDots, PaperPlaneTilt } from "@phosphor-icons/react";
import { WarebaseIcon } from "@/components/brand/warebase-logo";
import { cn } from "@/lib/cn";

type ChatMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
};

type FaqEntry = {
  question: string;
  answer: string;
  keywords: string[];
};

const FAQS: FaqEntry[] = [
  {
    question: "How do I add a product?",
    answer:
      "Open Products from the sidebar, then choose “New product.” Fill in the SKU, name, unit, and reorder thresholds. WareBase auto-generates an EAN-13 barcode for every product, so you can start scanning right away.",
    keywords: ["add product", "new product", "create product", "product"],
  },
  {
    question: "What triggers a low-stock alert?",
    answer:
      "When available stock on a product falls to or below its reorder point, WareBase flags it as low stock and notifies managers. Alerts are re-checked after every stock movement and receipt, and again every five minutes.",
    keywords: ["low stock", "reorder point", "alert", "threshold", "restock"],
  },
  {
    question: "How do I reorder stock?",
    answer:
      "From the Inventory or Products area, find the low item and choose “Restock.” WareBase creates a purchase order. Managers and admins send it straight away; other roles get a pending approval request first.",
    keywords: ["reorder", "restock", "order", "buy", "replenish", "supplier"],
  },
  {
    question: "How do approvals work?",
    answer:
      "Non-approver roles (staff/viewer) submit purchases or restock requests that land in the Approval center. Managers and admins can approve, reject, or request changes — every decision is recorded to the audit trail.",
    keywords: ["approval", "approve", "approvals", "pending", "review"],
  },
  {
    question: "How do I scan a barcode?",
    answer:
      "Open Barcode scanner from the sidebar. Press “Start camera” and point it at an EAN-13 label (or type the number). The product, availability, and per-warehouse stock appear instantly.",
    keywords: ["barcode", "scan", "scanner", "ean", "camera"],
  },
  {
    question: "How do I manage users and roles?",
    answer:
      "Admins and managers can create users from Settings. Managers can grant Staff or Viewer roles; only admins can grant Manager. You cannot demote or disable your own account.",
    keywords: ["user", "users", "role", "team", "member", "access"],
  },
  {
    question: "What is on the dashboard?",
    answer:
      "The dashboard updates live over WebSocket. It shows totals, movement trends, low-stock pressure, the governance queue, and recent movements — refreshed automatically as stock and orders change.",
    keywords: ["dashboard", "realtime", "live", "chart", "summary"],
  },
];

const FALLBACK =
  "I can help with catalog, stock, restocking, approvals, barcodes, and user roles. Try one of the quick topics below or rephrase your question.";

const pickAnswer = (text: string): FaqEntry | null => {
  const query = text.toLowerCase();
  let best: FaqEntry | null = null;
  let bestScore = 0;
  for (const faq of FAQS) {
    const score = faq.keywords.reduce((acc, keyword) => (query.includes(keyword) ? acc + 1 : acc), 0);
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  }
  return bestScore > 0 ? best : null;
};

let idCounter = 0;
const nextId = () => `msg-${Date.now()}-${idCounter++}`;

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextId(),
      role: "bot",
      text: "Hi! I'm the WareBase assistant. Ask me about products, stock, restocking, approvals, or barcodes.",
    },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const timer = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, open]);

  const pushMessage = (role: ChatMessage["role"], text: string) => {
    setMessages((current) => [...current, { id: nextId(), role, text }]);
  };

  const answerQuestion = (question: string, source: "chip" | "input") => {
    pushMessage("user", question);
    const faq = pickAnswer(question);
    const reply = faq?.answer ?? FALLBACK;
    window.setTimeout(() => pushMessage("bot", reply), source === "chip" ? 260 : 480);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) {
      return;
    }
    setInput("");
    answerQuestion(text, "input");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className={cn(
          "fixed bottom-5 right-5 z-[80] flex h-14 w-14 items-center justify-center rounded-full shadow-[0_10px_30px_rgba(21,31,56,0.35)] transition-all duration-300",
          open ? "scale-95" : "hover:scale-105",
        )}
        style={{
          background: "linear-gradient(150deg, #1B2A4A 0%, #151F38 100%)",
        }}
      >
        {open ? (
          <X className="h-6 w-6 text-[#F7F8FA]" weight="bold" />
        ) : (
          <span className="relative flex h-full w-full items-center justify-center">
            <WarebaseIcon className="h-9 w-9" />
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F0B15C] opacity-60" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-[#E8A23D]" />
            </span>
          </span>
        )}
      </button>

      <div
        className={cn(
          "fixed bottom-24 right-5 z-[80] flex w-[min(calc(100vw-2.5rem),380px)] flex-col overflow-hidden rounded-[1.4rem] border border-border/70 bg-card shadow-[0_24px_70px_rgba(15,23,42,0.25)] transition-all duration-300 ease-out",
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
        style={{ height: "min(560px, calc(100vh - 8rem))" }}
      >
        <div
          className="flex items-center gap-3 px-4 py-3.5"
          style={{ background: "linear-gradient(150deg, #1B2A4A 0%, #151F38 100%)" }}
        >
          <WarebaseIcon className="h-9 w-9 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-medium text-[#F7F8FA]">
              Ware<span className="font-bold text-[#F0B15C]">Base</span> support
            </p>
            <p className="text-xs text-[#AEB9C4]">Instant answers, no ticket needed</p>
          </div>
          <ChatCircleDots className="h-5 w-5 text-[#F0B15C]" weight="fill" />
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((message) => (
            <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-[1.1rem] px-3.5 py-2.5 text-sm leading-6",
                  message.role === "user"
                    ? "rounded-br-sm text-white"
                    : "rounded-bl-sm border border-border/70 bg-muted/50 text-foreground",
                )}
                style={
                  message.role === "user"
                    ? { background: "linear-gradient(150deg, #1B2A4A 0%, #151F38 100%)" }
                    : undefined
                }
              >
                {message.text}
              </div>
            </div>
          ))}

          <div className="pt-2">
            <p className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Quick topics
            </p>
            <div className="flex flex-wrap gap-2">
              {FAQS.slice(0, 4).map((faq) => (
                <button
                  key={faq.question}
                  type="button"
                  onClick={() => answerQuestion(faq.question, "chip")}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {faq.question}
                </button>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border/70 bg-background px-3 py-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about stock, approvals, barcodes…"
            className="h-10 flex-1 rounded-[0.9rem] border border-border bg-muted/40 px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50"
            aria-label="Message WareBase support"
          />
          <button
            type="submit"
            aria-label="Send message"
            className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] text-white transition-transform hover:scale-105"
            style={{ background: "linear-gradient(150deg, #1B2A4A 0%, #151F38 100%)" }}
          >
            <PaperPlaneTilt className="h-4 w-4" weight="fill" />
          </button>
        </form>
      </div>
    </>
  );
}
