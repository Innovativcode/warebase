"use client";

import { useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LottiePlayer } from "@/components/media/lottie-player";
import { WarebaseLogo } from "@/components/brand/warebase-logo";
import successAnimation from "@/assets/lottie/success.json";

export default function ResetPasswordPage() {
  const [done, setDone] = useState(false);

  return (
    <AuthShell
      visual={
        <div className="space-y-6 px-2 py-4 text-slate-950">
          <WarebaseLogo />
          <div className="mx-auto aspect-[4/3] max-w-[560px]">
            <LottiePlayer animationData={successAnimation} className="h-full w-full" />
          </div>
        </div>
      }
    >
      <div className="rounded-[1.5rem] border border-border/70 bg-background p-6 shadow-[0_6px_18px_rgba(15,23,42,0.06)] sm:p-8 xl:ml-8">
        <div className="space-y-5">
        {done ? (
          <div className="space-y-3">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Password updated</h1>
            <p className="text-sm leading-6 text-muted-foreground">Your password has been updated successfully.</p>
            <Button asChild className="w-full">
              <a href="/login">Sign in</a>
            </Button>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              setDone(true);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" placeholder="Create a new password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" type="password" placeholder="Repeat password" />
            </div>
            <Button type="submit" className="w-full">
              Update password
            </Button>
          </form>
        )}
        </div>
      </div>
    </AuthShell>
  );
}
