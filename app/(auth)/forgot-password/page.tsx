"use client";

import { useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LottiePlayer } from "@/components/media/lottie-player";
import { WarebaseLogo } from "@/components/brand/warebase-logo";
import spinnerAnimation from "@/assets/lottie/spinner.json";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <AuthShell
      visual={
        <div className="space-y-6 px-2 py-4 text-slate-950">
          <WarebaseLogo />
          <div className="mx-auto aspect-[4/3] max-w-[560px]">
            <LottiePlayer animationData={spinnerAnimation} className="h-full w-full" />
          </div>
        </div>
      }
    >
      <div className="rounded-[1.5rem] border border-border/70 bg-background p-6 shadow-[0_6px_18px_rgba(15,23,42,0.06)] sm:p-8 xl:ml-8">
        <div className="space-y-5">
        {sent ? (
          <div className="space-y-3">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Check your email</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              If the address is registered, a reset link has been sent.
            </p>
            <Button asChild variant="outline" className="w-full">
              <a href="/login">Back to sign in</a>
            </Button>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              setSent(true);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" placeholder="you@company.com" />
            </div>
            <Button type="submit" className="w-full">
              Send reset link
            </Button>
          </form>
        )}
        </div>
      </div>
    </AuthShell>
  );
}
