"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { LottiePlayer } from "@/components/media/lottie-player";
import { WarebaseLogo } from "@/components/brand/warebase-logo";
import { SessionLoader } from "@/components/loader/session-loader";
import { WarebaseLoader } from "@/components/loader/warebase-loader";
import shoppingAnimation from "@/assets/lottie/shopping.json";

const loginSchema = z.object({
  email: z.string().email("Enter a valid work email"),
  password: z.string().min(1, "Enter your password"),
});

type LoginValues = z.infer<typeof loginSchema>;

function getSafeRedirect(pathname: string | null) {
  if (!pathname) return "/dashboard";
  if (!pathname.startsWith("/")) return "/dashboard";
  if (pathname.startsWith("//")) return "/dashboard";
  return pathname;
}

type LoginClientPageProps = {
  nextRoute?: string | null;
};

export function LoginClientPage({ nextRoute }: LoginClientPageProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showSessionLoader, setShowSessionLoader] = useState(false);

  const safeNextRoute = getSafeRedirect(nextRoute ?? null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });
      toast.success("Signed in successfully");
      setShowSessionLoader(true);
      setTimeout(() => {
        router.replace(safeNextRoute);
      }, 4600);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in right now");
    }
  });

  return (
    <>
      <AuthShell
      visual={
        <div className="space-y-6 px-2 py-4 text-slate-950">
          <WarebaseLogo />
          <div className="mx-auto aspect-[4/3] max-w-[560px]">
            <LottiePlayer animationData={shoppingAnimation} className="h-full w-full" />
          </div>
        </div>
      }
    >
      <div className="rounded-[1.5rem] border border-border/70 bg-background p-6 shadow-[0_6px_18px_rgba(15,23,42,0.06)] sm:p-8 xl:ml-8">
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Sign in</h1>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="name@company.com"
                className="pl-10"
                {...form.register("email")}
              />
            </div>
            {form.formState.errors.email ? (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="pl-10 pr-12"
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password ? (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-4 text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input type="checkbox" className="h-4 w-4 rounded border-border" />
              Remember me
            </label>
            <a href="/forgot-password" className="font-medium text-primary hover:underline">
              Forgot password?
            </a>
          </div>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <span className="inline-flex items-center justify-center">
                <WarebaseLoader variant="compact" className="warebase-loader--on-dark" />
              </span>
            ) : (
              "Sign in"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <a href="/register" className="font-medium text-primary hover:underline">
              Create an account
            </a>
          </p>
        </form>
      </div>
      </AuthShell>
      <SessionLoader mode="login" visible={showSessionLoader} />
    </>
  );
}
