"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, CheckCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { LottiePlayer } from "@/components/media/lottie-player";
import automationAnimation from "@/assets/lottie/automation.json";

const checklist = [
  "Organization created",
  "Primary location configured",
  "First products ready",
  "Team invitations pending",
];

export default function OnboardingCompletionPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <Card className="w-full border border-border bg-background shadow-[0_1px_4px_rgba(15,23,42,0.04)]">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/40 px-2.5 py-1 text-[0.62rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  Step 7 of 7
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[0.62rem] font-medium uppercase tracking-[0.22em] text-emerald-700">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Complete
                </span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.7rem]">Setup complete</h1>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                The setup flow is complete. You can start catalog work, adjust policies, and invite the rest of the team from the dashboard.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button asChild>
                  <Link href="/dashboard">
                    Go to dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="rounded-[1rem] border border-border bg-background p-4">
              <LottiePlayer animationData={automationAnimation} className="h-[250px] w-full" preserveAspectRatio="xMidYMid meet" />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {checklist.map((item) => (
              <div
                key={item}
                className={cn(
                  "flex items-center gap-3 rounded-[0.9rem] border border-border bg-muted/30 px-4 py-3",
                )}
              >
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
